# app.py
from flask import Flask, jsonify, request, abort, send_file
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, extract
from flask_migrate import Migrate
from config import Config
from models import db, Detail, Recognition
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
from flask_cors import CORS
from sqlalchemy.orm import joinedload
from fuzzywuzzy import fuzz
import os
import uuid
import base64
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from neural.detect_neural import detect_and_draw_boxes

app = Flask(__name__)
app.config.from_object(Config) 
db.init_app(app)
migrate = Migrate(app, db)
CORS(app)

INPUT_FOLDER = 'static/input'
OUTPUT_FOLDER = 'static/output'
os.makedirs(INPUT_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def process_image(image_path, output_path):
    return detect_and_draw_boxes(image_path, output_path)

# Добавление новой загрузки
@app.route('/api/upload', methods=['POST'])
def upload_photos():
    data = request.json
    images = data.get('images', [])
    created_ids = []

    for img in images:
        # Генерируем уникальное имя для исходного изображения
        img_id = str(uuid.uuid4())
        input_path = f"static/input/{img_id}.png"
        output_path = f"static/output/{img_id}.png"

        # Декодируем и сохраняем исходное изображение
        img_data = base64.b64decode(img['base64'])
        with open(input_path, "wb") as f:
            f.write(img_data)

        # Отправляем изображение на нейросеть и получаем результат
        recognized_text = process_image(input_path, output_path)
        print(recognized_text['default'][0])

        # Ищем совпадения в таблице Detail по распознанному тексту
        # matching_detail = (
        #     db.session.query(Detail)
        #     .filter(fuzz.ratio(Detail.part_number, recognized_text) > 80)
        #     .all()
        # )
        matching_detail = (
            db.session.query(Detail)
            .filter(Detail.part_number.ilike(f"%{recognized_text['default'][0]}%"))
            .first()
        )

        # Сохраняем распознанное изображение и создаем новую запись Recognition
        with open(output_path, "wb") as f:
            f.write(img_data)

        # Проверка, найдено ли совпадение
        if matching_detail:
            # Совпадение найдено, сохраняем с detail_id
            recognition = Recognition(
                image_path=input_path,
                recognized_image_path=output_path,
                detail_id=matching_detail.id,
                is_correct=True,
                recognized_text=recognized_text['default'][0]
            )
        else:
            # Совпадение не найдено, сохраняем без detail_id и с is_correct=False
            recognition = Recognition(
                image_path=input_path,
                is_correct=False,
                recognized_text=recognized_text['default'][0]
            )
        
        # Добавляем запись и сохраняем в БД
        db.session.add(recognition)
        db.session.commit()
        created_ids.append({
            'id': recognition.id,
            'requires_manual_intervention': not matching_detail  # Отмечаем необходимость ручного вмешательства
        })

    return jsonify({'created_ids': created_ids}), 201

@app.route('/api/history', methods=['GET'])
def get_history():
    recognitions = Recognition.query.order_by(Recognition.created_at.desc()).all()
    history = []
    
    for recognition in recognitions:
        history.append({
            'id': recognition.id,
            'image_path': recognition.image_path,
            'recognized_image_path': recognition.recognized_image_path,
            'detail_id': recognition.detail_id,
            'is_correct': recognition.is_correct,
            'correct_part_number': recognition.correct_part_number,
            'correct_order_number': recognition.correct_order_number,
            'created_at': recognition.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'recognized_text': recognition.recognized_text,
        })
    
    return jsonify(history)

# Маршрут для получения данных об одном элементе с агрегированными данными из Recognition и Details
@app.route('/api/history/<int:recognition_id>', methods=['GET'])
def get_history_detail(recognition_id):
    # Используем joinedload для загрузки связанной записи из таблицы Details
    recognition = Recognition.query.options(joinedload(Recognition.detail)).filter_by(id=recognition_id).first()

    if not recognition:
        abort(404, description="Recognition not found")

    # Формируем результат с данными из обеих таблиц
    result = {
        'id': recognition.id,
        'image_path': recognition.image_path,
        'recognized_image_path': recognition.recognized_image_path,
        'is_correct': recognition.is_correct,
        'correct_part_number': recognition.correct_part_number,
        'correct_order_number': recognition.correct_order_number,
        'created_at': recognition.created_at.strftime('%Y-%m-%d %H:%M:%S'),  # Форматирование даты
        'recognized_text': recognition.recognized_text
    }

    # Добавляем данные из detail, только если распознавание верное
    if recognition.is_correct and recognition.detail:
        result['detail'] = {
            'id': recognition.detail.id,
            'part_number': recognition.detail.part_number,
            'order_number': recognition.detail.order_number,
            'name': recognition.detail.name,
            'order_id': recognition.detail.order_id,
            'station_block': recognition.detail.station_block,
        }
    else:
        result['detail'] = None  # Пустое значение, если распознавание неверно

    return jsonify(result)

@app.route('/api/history/<int:recognition_id>', methods=['PUT'])
def update_recognition_detail(recognition_id):
    data = request.json
    recognition = Recognition.query.get(recognition_id)

    if not recognition:
        abort(404, description="Recognition not found")

    # Обновляем данные
    recognition.correct_part_number = data.get('correct_part_number')
    recognition.correct_order_number = data.get('correct_order_number')

    db.session.commit()

    return jsonify({
        'id': recognition.id,
        'correct_part_number': recognition.correct_part_number,
        'correct_order_number': recognition.correct_order_number,
        'is_correct': recognition.is_correct,
    })

@app.route('/api/stats', methods=['GET'])
def fetch_stats():
    # Общее количество записей в таблице Recognition
    total_uploads = db.session.query(func.count(Recognition.id)).scalar()

    # Количество правильно и неправильно распознанных записей
    total_true = db.session.query(func.count(Recognition.id)).filter(Recognition.is_correct == True).scalar()
    total_false = db.session.query(func.count(Recognition.id)).filter(Recognition.is_correct == False).scalar()

    # Распределение по station_block
    station_distribution = db.session.query(
        Detail.station_block,
        func.count(Detail.id)
    ).join(Recognition, Recognition.detail_id == Detail.id).group_by(Detail.station_block).all()

    # Анализ по времени за текущую неделю
    today = datetime.now()
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=6)

    # Получение количества записей по дням
    daily_counts_raw = db.session.query(
        func.date_trunc('day', Recognition.created_at).label('day'),
        func.count(Recognition.id)
    ).filter(Recognition.created_at >= start_of_week).group_by('day').order_by('day').all()

    # Преобразуем результат в словарь с датами и их количеством
    daily_counts_dict = {day.date(): count for day, count in daily_counts_raw}

    # Генерируем список всех дней недели и добавляем 0 для отсутствующих дат
    analysis_over_time = []
    for i in range(7):
        current_day = (start_of_week + timedelta(days=i)).date()
        count = daily_counts_dict.get(current_day, 0)
        analysis_over_time.append({
            'date': current_day.strftime('%m-%d'),
            'count': count
        })

    # Форматируем результат для station_distribution
    result_distribution = {station: count for station, count in station_distribution}

    # Возвращаем ответ
    return jsonify({
        'total_uploads': total_uploads,
        'total_true': total_true,
        'total_false': total_false,
        'result_distribution': result_distribution,
        'analysis_over_time': analysis_over_time,
    })

@app.route('/api/photo', methods=['GET'])
def get_photo():
    # Получаем путь к изображению из параметров запроса
    image_path = request.args.get('path')
    
    # Проверяем, что путь к изображению существует
    if not image_path or not os.path.exists(image_path):
        return jsonify({'error': 'Image not found'}), 404
    
    # Отправляем изображение клиенту
    return send_file(image_path, mimetype='image/png')

@app.route('/api/details', methods=['POST'])
def add_detail():
    data = request.json
    new_detail = Detail(
        part_number=data.get('part_number'),
        order_number=data.get('order_number'),
        name=data.get('name'),
        order_id=data.get('order_id'),
        station_block=data.get('station_block')
    )
    db.session.add(new_detail)
    db.session.commit()
    return jsonify({"message": "Detail added successfully", "detail_id": new_detail.id}), 201

if __name__ == '__main__':
    app.run(debug=True)
