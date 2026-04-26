# VideoHub Player

Универсальный видеоплеер для просмотра видео из VK, YouTube и MP4 источников.

![VideoHub Player](https://img.shields.io/badge/Video-Player-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)

## 🎯 Особенности

- **VK Видео** - поддержка видео из ВКонтакте через официальный iframe
- **YouTube** - воспроизведение видео с YouTube (включая Shorts)
- **MP4** - прямые ссылки на видео файлы
- **Поделиться** - копирование ссылок и шаринг в соцсетях
- **Адаптивность** - работает на всех устройствах
- **Без регистрации** - полностью бесплатный доступ

## 🚀 Быстрый старт

### Локальный запуск

1. Клонируйте репозиторий:
```bash
git clone https://github.com/yourusername/videohub-player.git
cd videohub-player
```

2. Откройте `index.html` в браузере или используйте локальный сервер:
```bash
# С помощью Python
python -m http.server 8000

# С помощью Node.js
npx serve
```

3. Перейдите по адресу `http://localhost:8000`

### GitHub Pages

Проект можно развернуть на GitHub Pages:

1. Зайдите в настройки репозитория
2. Выберите раздел "Pages"
3. Укажите ветку `main` и папку `/root`
4. Сохраните и дождитесь развёртывания

## 📋 Структура проекта

```
videohub-player/
├── index.html          # Главная страница (лендинг)
├── player.html         # Страница плеера
├── css/
│   ├── style.css       # Основные стили
│   └── player.css      # Стили плеера
├── js/
│   ├── main.js         # Скрипты лендинга
│   └── player.js       # Логика плеера
├── docs/
│   ├── usage.html      # Руководство по использованию
│   ├── faq.html        # FAQ
│   ├── terms.html      # Условия использования
│   └── privacy.html    # Политика конфиденциальности
└── README.md           # Этот файл
```

## 🔗 Форматы ссылок

### VK Видео
```
https://vk.com/video-223245678_456239329
https://vk.com/clip-123456_789012
https://m.vk.com/video-111111_222222
```

### YouTube
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
https://youtube.com/embed/dQw4w9WgXcQ
https://youtube.com/shorts/dQw4w9WgXcQ
```

### MP4
```
https://example.com/video.mp4
https://cdn.example.com/files/movie.mp4
```

## 📤 Поделиться видео

После загрузки видео вы можете:

1. **Скопировать ссылку** - нажмите кнопку "Копировать ссылку"
2. **Поделиться в соцсетях** - VK, Telegram, WhatsApp
3. **Отправить ссылку с хэшем**:
   ```
   https://yoursite.com/player.html#video-youtube-dQw4w9WgXcQ
   ```

## ⚙️ API и технологии

- **VK Bridge SDK** - для интеграции с VK
- **YouTube IFrame API** - для воспроизведения YouTube
- **HTML5 Video** - для MP4 файлов
- **Vanilla JS** - без фреймворков
- **CSS3** - современные стили

## 🌐 Браузеры

Поддерживаются все современные браузеры:

- ✅ Google Chrome
- ✅ Mozilla Firefox
- ✅ Safari
- ✅ Microsoft Edge
- ✅ Opera

## 📱 Мобильные устройства

Плеер полностью адаптивен и работает на:

- iOS (Safari, Chrome)
- Android (Chrome, Firefox)
- Планшетах всех размеров

## 🛠 Разработка

### Вклад в проект

1. Fork репозиторий
2. Создайте ветку (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

### Сообщение об ошибках

Создайте Issue в разделе Issues с описанием проблемы:
- Шаги для воспроизведения
- Ожидаемое поведение
- Фактическое поведение
- Скриншоты (если применимо)

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. Подробнее см. в файле [LICENSE](LICENSE).

## 📞 Контакты

- **GitHub Issues** - для вопросов и багов
- **Email** - your.email@example.com

## 🙏 Благодарности

- [VK](https://vk.com/) - за платформу и API
- [YouTube](https://youtube.com/) - за видеохостинг
- Всем контрибьюторам проекта!

## 📈 Roadmap

- [ ] Поддержка других видеохостингов (Rutube, Vimeo)
- [ ] Плейлисты
- [ ] Тёмная тема (уже есть!)
- [ ] Расширенные настройки плеера
- [ ] Субтитры
- [ ] Выбор качества видео

---

**VideoHub Player** © 2024. Создано с ❤️ для удобного просмотра видео.
