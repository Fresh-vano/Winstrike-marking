FROM node:18

WORKDIR /app

# Копируем package.json и package-lock.json, если есть, для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости проекта
RUN npm install

# Устанавливаем expo-cli глобально
RUN npm install -g expo-cli

# Копируем все файлы проекта
COPY . .

# Устанавливаем совместимые версии зависимостей для Expo, чтобы избежать ошибок совместимости
RUN npx expo install react-native-safe-area-context@4.10.5 react-native-screens@3.31.1 react-native-svg@15.2.0

# Открываем порты для Expo и запускаем приложение
EXPOSE 8081

# Запуск Expo в веб-режиме
CMD ["npx", "expo", "start", "--web", "--non-interactive"]
