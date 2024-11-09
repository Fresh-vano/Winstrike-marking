FROM python:3.10

WORKDIR /app 
COPY . /app

RUN apt-get update && apt-get install -y libpq-dev \
    libgl1-mesa-glx \
    libglib2.0-0

RUN pip install -r requirements.txt

ENV FLASK_APP=app.py

CMD ["flask", "run", "--host=0.0.0.0"]
