import torch
import pickle
import numpy as np
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

class AttrDict(dict):
    def __init__(self, *args, **kwargs):
        super(AttrDict, self).__init__(*args, **kwargs)
        self.__dict__ = self

class BeamEntry:
    def __init__(self):
        self.prTotal = 0 
        self.prNonBlank = 0 
        self.prBlank = 0 
        self.prText = 1 
        self.lmApplied = False 
        self.labeling = () 

class BeamState:
    def __init__(self):
        self.entries = {}

    def norm(self):
        "Нормализовать вероятность LM по длине"
        for (k, _) in self.entries.items():
            labelingLen = len(self.entries[k].labeling)
            self.entries[k].prText = self.entries[k].prText ** (1.0 / (labelingLen if labelingLen else 1.0))

    def sort(self):
        beams = [v for (_, v) in self.entries.items()]
        sortedBeams = sorted(beams, reverse=True, key=lambda x: x.prTotal * x.prText)
        return [x.labeling for x in sortedBeams]

    def wordsearch(self, classes, ignore_idx, beamWidth, dict_list):
        "Поиск слов среди лучших"
        beams = [v for (_, v) in self.entries.items()]
        sortedBeams = sorted(beams, reverse=True, key=lambda x: x.prTotal * x.prText)[:beamWidth]

        for j, candidate in enumerate(sortedBeams):
            idx_list = candidate.labeling
            text = ''
            for i, l in enumerate(idx_list):
                if l not in ignore_idx and (not (i > 0 and idx_list[i - 1] == idx_list[i])):  # удаление повторяющихся символов и пустых знаков
                    text += classes[l]

            if j == 0:
                best_text = text
            if text in dict_list:
                print('найден текст: ', text)
                best_text = text
                break
            else:
                print('не в списке: ', text)
        return best_text

# Применение языковой модели (LM) 
def applyLM(parentBeam, childBeam, classes, lm):
    "Вычислить вероятность LM на основе биграмной вероятности последних двух символов"
    if lm and not childBeam.lmApplied:
        c1 = classes[parentBeam.labeling[-1] if parentBeam.labeling else classes.index(' ')] # первый символ
        c2 = classes[childBeam.labeling[-1]] # второй символ
        lmFactor = 0.01 # влияние языковой модели
        bigramProb = lm.getCharBigram(c1, c2) ** lmFactor # вероятность последования первого и второго символов
        childBeam.prText = parentBeam.prText * bigramProb # вероятность последования символов
        childBeam.lmApplied = True # LM применяется только один раз 

def addBeam(beamState, labeling):
    "Добавить пучок, если он еще не существует"
    if labeling not in beamState.entries:
        beamState.entries[labeling] = BeamEntry()

# Бим-поиск по матрице

def ctcBeamSearch(mat, classes, ignore_idx, lm, beamWidth=25, dict_list=[]):
    "Бим-поиск, описанный в статьях Ванга и Грэйвса"

    blankIdx = 0
    maxT, maxC = mat.shape

    last = BeamState()
    labeling = ()
    last.entries[labeling] = BeamEntry()
    last.entries[labeling].prBlank = 1
    last.entries[labeling].prTotal = 1

    # Пройти по всем шагам времени
    for t in range(maxT):
        curr = BeamState()

        bestLabelings = last.sort()[0:beamWidth]

        for labeling in bestLabelings:

            # Вероятность путей, окончивающихся не пустым знаком
            prNonBlank = 0
            if labeling:
                # Вероятность путей, заканчивающихся повторяющимся последним символом
                prNonBlank = last.entries[labeling].prNonBlank * mat[t, labeling[-1]]

            # Вероятность путей, окончивающихся пустым знаком
            prBlank = (last.entries[labeling].prTotal) * mat[t, blankIdx]

            addBeam(curr, labeling)

            # Заполнение данных
            curr.entries[labeling].labeling = labeling
            curr.entries[labeling].prNonBlank += prNonBlank
            curr.entries[labeling].prBlank += prBlank
            curr.entries[labeling].prTotal += prBlank + prNonBlank
            curr.entries[labeling].prText = last.entries[labeling].prText # метка не изменилась, поэтому вероятность LM не изменилась
            curr.entries[labeling].lmApplied = True # LM уже была применена на предыдущем шаге для этой метки

            # Расширение текущего обозначения
            for c in range(maxC - 1):
                # Добавление нового символа к текущему обозначению 
                newLabeling = labeling + (c,)

                # Если новое обозначение содержит повторяющийся символ в конце, рассматриваются только пути, окончившиеся пустым знаком
                if labeling and labeling[-1] == c:
                    prNonBlank = mat[t, c] * last.entries[labeling].prBlank
                else:
                    prNonBlank = mat[t, c] * last.entries[labeling].prTotal

                addBeam(curr, newLabeling)

                # Заполнение данных
                curr.entries[newLabeling].labeling = newLabeling
                curr.entries[newLabeling].prNonBlank += prNonBlank
                curr.entries[newLabeling].prTotal += prNonBlank

        # Установка нового состояния 
        last = curr

    # Нормализация вероятностей LM 
    last.norm()

    if dict_list == []:
        bestLabeling = last.sort()[0] # получить наиболее вероятное обозначение
        res = ''
        for i, l in enumerate(bestLabeling):
            if l not in ignore_idx and (not (i > 0 and bestLabeling[i - 1] == bestLabeling[i])):  # удаление повторяющихся символов и пустых знаков
                res += classes[l]
    else:
        res = last.wordsearch(classes, ignore_idx, beamWidth, dict_list)

    return res

# Функция для поиска последовательных элементов
def consecutive(data, mode='first', stepsize=1):
    "Найти последовательные элементы в данных"
    group = np.split(data, np.where(np.diff(data) != stepsize)[0] + 1)
    group = [item for item in group if len(item) > 0]

    if mode == 'first':
        result = [l[0] for l in group]
    elif mode == 'last':
        result = [l[-1] for l in group]
    return result

# Сегментация слов по матрице
def word_segmentation(mat, separator_idx={'th': [1, 2], 'en': [3, 4]}, separator_idx_list=[1, 2, 3, 4]):
    "Сегментация слов по матрице с использованием указанных разделителей"
    result = []
    sep_list = []
    start_idx = 0
    for sep_idx in separator_idx_list:
        if sep_idx % 2 == 0:
            mode = 'first'
        else:
            mode = 'last'
        a = consecutive(np.argwhere(mat == sep_idx).flatten(), mode)
        new_sep = [[item, sep_idx] for item in a]
        sep_list += new_sep
    sep_list = sorted(sep_list, key=lambda x: x[0])

    for sep in sep_list:
        for lang in separator_idx.keys():
            if sep[1] == separator_idx[lang][0]: 
                sep_lang = lang
                sep_start_idx = sep[0]
            elif sep[1] == separator_idx[lang][1]: 
                if sep_lang == lang: 
                    new_sep_pair = [lang, [sep_start_idx + 1, sep[0] - 1]]
                    if sep_start_idx > start_idx:
                        result.append(['', [start_idx, sep_start_idx - 1]])
                    start_idx = sep[0] + 1
                    result.append(new_sep_pair)
                else: 
                    sep_lang = ''

    if start_idx <= len(mat) - 1:
        result.append(['', [start_idx, len(mat) - 1]])
    return result

# Конвертер меток CTC
class CTCLabelConverter(object):
    "Конвертация между текстовыми метками и индексами меток"

    def __init__(self, character, separator_list={}, dict_pathlist={}):
        "Инициализация конвертера с набором символов и разделителей"
        dict_character = list(character)

        self.dict = {}
        # Присвоение индексов каждому символу 
        for i, char in enumerate(dict_character):
            self.dict[char] = i + 1

        # Добавление пустого символа в начало списка символов
        self.character = ['[blank]'] + dict_character
        self.separator_list = separator_list

        separator_char = []
        for lang, sep in separator_list.items():
            separator_char += sep

        # Игнорируемые индексы, включая пустой символ и символы-разделители
        self.ignore_idx = [0] + [i + 1 for i, item in enumerate(separator_char)]

        dict_list = {}
        for lang, dict_path in dict_pathlist.items():
            with open(dict_path, "rb") as input_file:
                word_count = pickle.load(input_file)
            dict_list[lang] = word_count
        self.dict_list = dict_list

    def encode(self, text, batch_max_length=25):
        "Конвертировать текстовую метку в индекс метки"
        length = [len(s) for s in text]
        text = ''.join(text)
        text = [self.dict[char] for char in text]

        return (torch.IntTensor(text), torch.IntTensor(length))

    def decode_greedy(self, text_index, length):
        "Конвертировать индекс метки в текстовую метку с использованием жадного алгоритма"
        texts = []
        index = 0
        for l in length:
            t = text_index[index:index + l]

            char_list = []
            for i in range(l):
                if t[i] not in self.ignore_idx and (not (i > 0 and t[i - 1] == t[i])):  # удаление повторяющихся символов и пустых знаков (и разделителей)
                    char_list.append(self.character[t[i]])
            text = ''.join(char_list)

            texts.append(text)
            index += l
        return texts

    def decode_beamsearch(self, mat, beamWidth=5):
        "Конвертировать индекс метки в текстовую метку с использованием бим-поиска"
        texts = []

        for i in range(mat.shape[0]):
            t = ctcBeamSearch(mat[i], self.character, self.ignore_idx, None, beamWidth=beamWidth)
            texts.append(t)
        return texts

    def decode_wordbeamsearch(self, mat, beamWidth=5):
        "Конвертировать индекс метки в текстовую метку с использованием поиска по словам"
        texts = []
        argmax = np.argmax(mat, axis=2)
        for i in range(mat.shape[0]):
            words = word_segmentation(argmax[i])
            string = ''
            for word in words:
                matrix = mat[i, word[1][0]:word[1][1] + 1, :]
                if word[0] == '':
                    dict_list = []
                else:
                    dict_list = self.dict_list[word[0]]
                t = ctcBeamSearch(matrix, self.character, self.ignore_idx, None, beamWidth=beamWidth, dict_list=dict_list)
                string += t
            texts.append(string)
        return texts

class AttnLabelConverter(object):
    "Конвертация между текстовыми метками и индексами меток для Attention модели"

    def __init__(self, character):
        "Инициализация конвертера с набором символов"
        list_token = ['[GO]', '[s]']
        list_character = list(character)
        self.character = list_token + list_character

        self.dict = {}
        for i, char in enumerate(self.character):
            self.dict[char] = i

    def encode(self, text, batch_max_length=25):
        "Конвертировать текстовую метку в индекс метки"
        length = [len(s) + 1 for s in text]  
        batch_max_length += 1
        batch_text = torch.LongTensor(len(text), batch_max_length + 1).fill_(0)
        for i, t in enumerate(text):
            text = list(t)
            text.append('[s]')
            text = [self.dict[char] for char in text]
            batch_text[i][1:1 + len(text)] = torch.LongTensor(text)  
        return (batch_text.to(device), torch.IntTensor(length).to(device))

    def decode(self, text_index, length):
        texts = []
        for index, l in enumerate(length):
            text = ''.join([self.character[i] for i in text_index[index, :]])
            texts.append(text)
        return texts

# Среднее значение для вычисления ошибки

class Averager(object):
    "Вычисление среднего значения для torch.Tensor, используемого для усреднения ошибки."

    def __init__(self):
        self.reset()

    def add(self, v):
        "Добавить значение для вычисления среднего."
        count = v.data.numel()
        v = v.data.sum()
        self.n_count += count
        self.sum += v

    def reset(self):
        "Сбросить значения."
        self.n_count = 0
        self.sum = 0

    def val(self):
        "Получить текущее среднее значение."
        res = 0
        if self.n_count != 0:
            res = self.sum / float(self.n_count)
        return res