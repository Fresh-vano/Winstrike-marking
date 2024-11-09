from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta

db = SQLAlchemy()

class Detail(db.Model):
    __tablename__ = 'details'

    id = db.Column(db.Integer, primary_key=True)
    part_number = db.Column(db.String(50), nullable=False)  # "ДетальАртикул"
    order_number = db.Column(db.String(50), nullable=False)    # "ПорядковыйНомер"
    name = db.Column(db.String(255), nullable=False)        # "ДетальНаименование"
    order_id = db.Column(db.String(50), nullable=False)     # "ЗаказНомер"
    station_block = db.Column(db.String(255), nullable=False)  # "СтанцияБлок"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Время создания записи

    def __init__(self, part_number, order_number, name, order_id, station_block):
        self.part_number = part_number
        self.order_number = order_number
        self.name = name
        self.order_id = order_id
        self.station_block = station_block
        self.created_at = datetime.utcnow() + timedelta(hours=3)

class Recognition(db.Model):
    __tablename__ = 'recognitions'

    id = db.Column(db.Integer, primary_key=True)
    image_path = db.Column(db.String(255), nullable=False)  # Путь к исходному фото
    recognized_image_path = db.Column(db.String(255), nullable=True)  # Путь к распознанному фото
    detail_id = db.Column(db.Integer, db.ForeignKey('details.id'), nullable=True)  # Внешний ключ к таблице details
    is_correct = db.Column(db.Boolean, nullable=False)  # Правильность распознавания
    correct_part_number = db.Column(db.String(50), nullable=True)  # Верный артикул (если ошибка)
    correct_order_number = db.Column(db.Integer, nullable=True)  # Верный порядковый номер (если ошибка)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Время создания записи
    recognition_duration = db.Column(db.Float, nullable=True)  # Длительность распознавания в секундах
    recognized_part_number = db.Column(db.String(50), nullable=True) #Распознаный текст ДетальАртикул
    recognized_order_number = db.Column(db.String(50), nullable=True) #Распознаный текст ПорядковыйНомер
    # Связь с таблицей details
    detail = db.relationship('Detail', backref=db.backref('recognitions', lazy=True))

    def __init__(self, image_path, recognized_image_path=None, detail_id=None, is_correct=False, recognized_part_number=None, recognized_order_number=None, correct_part_number=None, correct_order_number=None, recognition_duration=None):
        self.image_path = image_path
        self.recognized_image_path = recognized_image_path
        self.detail_id = detail_id
        self.is_correct = is_correct
        self.recognized_part_number = recognized_part_number
        self.recognized_order_number = recognized_order_number
        self.correct_part_number = correct_part_number
        self.correct_order_number = correct_order_number
        self.recognition_duration = recognition_duration
        self.created_at = datetime.utcnow() + timedelta(hours=3)

class CorrectResult(db.Model):
    __tablename__ = 'correctResult'

    id = db.Column(db.Integer, primary_key=True)
    predicted_text = db.Column(db.String(255), nullable=True)
    true_text = db.Column(db.String(50), nullable=True)

    def __init__(self, predicted_text, true_text):
        self.predicted_text = predicted_text
        self.true_text = true_text