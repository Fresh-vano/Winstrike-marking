import os

import cv2
import numpy as np
from ultralytics import YOLO

import easyocr

import time


INPUT_PATH = r"..\..\..\train_atom\train\imgs"
OUTPUT_PATH = r"..\..\..\output_imgs"

YOLO_MODEL_PATH = r"..\models\yolov11.pt"
OCR_MODEL_PARAMS = {
    "lang_list": ['en', 'ru'],
    "gpu": True
}


YOLO_MODEL = YOLO(YOLO_MODEL_PATH)
OCR_MODEL = easyocr.Reader(**OCR_MODEL_PARAMS)

# Функция для детекции и отрисовки рамок


def detect_and_draw_boxes(image_path: str, yolo_model, save_path):

    # Загружаем изображение
    image = cv2.imread(image_path)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Выполняем детекцию
    results = yolo_model(image_rgb)

    # Копируем изображение для отрисовки
    image_copy = image_rgb.copy()

    text_imgs = []

    i = 1

    # Проходимся по результатам детекции
    for result in results[0].boxes.data:
        x_min, y_min, x_max, y_max, confidence, class_id = result[:6].int(
        ).tolist()

        # сохраняем изображение с текстом
        text_imgs.append(image_copy[y_min:y_max, x_min:x_max])

        # Рисуем прямоугольник
        cv2.rectangle(image_copy, (x_min, y_min),
                      (x_max, y_max), (0, 255, 0), 2)

    cv2.imwrite(os.path.join(
        save_path, image_path.split("\\")[-1]), image_copy)

    transformed_images = transform_images(text_imgs)

    text_result_dict = {}

    for key, value in transformed_images.items():
        text_result = []

        for detected_contour_text in ocr_detect(OCR_MODEL, text_imgs):
            for text_detect in detected_contour_text:
                text_result.append(text_detect[1])

        text_result_dict[key] = text_result

    return text_result_dict


def ocr_detect(ocr_model: easyocr.Reader, imgs_list):
    """  """
    results = []
    for img in imgs_list:
        results.append(ocr_model.readtext(img))

    return results


def transform_images(images_list: list):
    transformed_images = {
        "left": [],
        "right": [],
        "default": [],
        "vertical": []
    }

    for image in images_list:
        transformed_images["default"].append(image)

        # Поворот на 90 градусов влево с изменением размерности
        left_img = np.transpose(image.copy(), (1, 0, 2))
        left_img = cv2.flip(left_img, 0)
        transformed_images["left"].append(left_img)

        # Поворот на 90 градусов влево с изменением размерности
        right_img = np.transpose(image.copy(), (1, 0, 2))
        right_img = cv2.flip(right_img, 1)
        transformed_images["right"].append(right_img)

        # Горизонтальное отражение
        vertical_rgb = cv2.flip(image.copy(), 0)
        transformed_images["vertical"].append(vertical_rgb)

    return transformed_images


if __name__ == "__main__":
    print(detect_and_draw_boxes(
        r"..\..\train_atom\save_imgs\458.jpg", YOLO_MODEL, OUTPUT_PATH))
