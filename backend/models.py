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
    detail_id = db.Column(db.Integer, db.ForeignKey('details.id'), nullable=False)  # Внешний ключ к таблице details
    is_correct = db.Column(db.Boolean, nullable=False)  # Правильность распознавания
    correct_part_number = db.Column(db.String(50), nullable=True)  # Верный артикул (если ошибка)
    correct_order_number = db.Column(db.Integer, nullable=True)  # Верный порядковый номер (если ошибка)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Время создания записи

    # Связь с таблицей details
    detail = db.relationship('Detail', backref=db.backref('recognitions', lazy=True))

    def __init__(self, image_path, detail_id, is_correct):
        self.image_path = image_path
        self.detail_id = detail_id
        self.is_correct = is_correct
        self.created_at = datetime.utcnow() + timedelta(hours=3)