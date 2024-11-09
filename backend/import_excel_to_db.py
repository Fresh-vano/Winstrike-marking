import pandas as pd
from models import db, Detail
from flask import Flask

app = Flask(__name__)
db.init_app(app)

# Конфигурация для подключения к базе данных
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:11111111@localhost:5432/postgres'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Функция для импорта данных из Excel в базу данных
def import_excel_to_db(file_path):
    # Чтение Excel файла
    df = pd.read_excel(file_path, engine='openpyxl')

    # Переименование столбцов для соответствия именам в базе данных
    df.columns = ['part_number', 'order_number', 'name', 'order_id', 'station_block']

    with app.app_context():
        # Перебор строк и добавление каждой записи в базу данных
        for _, row in df.iterrows():
            order_id = str(row['order_id']).replace('"', '').strip()

            detail = Detail(
                part_number=row['part_number'],
                order_number=row['order_number'],
                name=row['name'],
                order_id=order_id,
                station_block=row['station_block']
            )

            db.session.add(detail)

        # Сохранение всех добавленных записей
        db.session.commit()

    print("Данные успешно импортированы в базу данных.")

# Укажите путь к вашему файлу Excel
file_path = "E:/Модели/ДеталиПоПлануДляРазрешенныхЗаказов.xlsx"  # Замените на путь к вашему файлу
import_excel_to_db(file_path)
