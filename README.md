# PDF Presenter

PowerPoint Presenter View для PDF, PPTX и картинок. Для техдиров и event-инженеров: плейлист спикеров с индивидуальными таймерами, заметками и переключением между файлами в один клик.

**Платформы:** macOS (Apple Silicon + Intel), Windows 10/11 (x64).

## Скачать

Последняя версия: [GitHub Releases](https://github.com/azatlife/PDF-Presenter/releases/latest)

- **Mac (Apple Silicon, M1/M2/M3):** `PDF Presenter-<version>-arm64.dmg`
- **Mac (Intel):** `PDF Presenter-<version>.dmg`
- **Windows:** `PDF Presenter-<version>-win.zip`

## Установка

### macOS
1. Открой DMG, перетащи `PDF Presenter.app` в Applications.
2. **Первый запуск:** правый клик по иконке → `Open` → `Open` в диалоге.
   (При двойном клике macOS заблокирует приложение, потому что оно без code signing — это норма для beta.)
3. Дальше открывается двойным кликом как обычное приложение.

### Windows
1. Распакуй ZIP в любую папку (например, `C:\Program Files\PDF Presenter\`).
2. Запусти `PDF Presenter.exe`.
3. SmartScreen скажет «Windows protected your PC» → `More info` → `Run anyway`.

### PPTX поддержка
Для конвертации PowerPoint презентаций нужен **LibreOffice** (бесплатный):

- **Mac:** `brew install --cask libreoffice` или скачать с [libreoffice.org](https://www.libreoffice.org/download/download-libreoffice/)
- **Windows:** скачать установщик с [libreoffice.org](https://www.libreoffice.org/download/download-libreoffice/)

PDF и картинки работают сразу без зависимостей.

## Основные возможности

- **Плейлист спикеров** — собираешь программу мероприятия заранее, drag-and-drop сортировка
- **Per-speaker таймер** — каждому спикеру индивидуальная длительность, обратный отсчёт с цветовой индикацией
- **Режим докладчика** — отдельные окна для оператора (твой ноут), суфлёра клиента (внешний дисплей) и аудитории (проектор)
- **Поддерживаемые форматы** — PDF, PPTX, PPT, ODP, Keynote (через LibreOffice), PNG/JPG/WebP/GIF/BMP
- **Заметки к слайдам** — пишешь в реальном времени, сохраняются в sidecar JSON рядом с файлом
- **Blackout / Key Visual** — затемнение или показ собственной заставки 16:9 во время пауз
- **Проекты** — сохраняй настроенный плейлист как файл `.pdpres`, открывай повторно перед следующим мероприятием

## Горячие клавиши

| Клавиша | Действие |
|---------|----------|
| `←` / `→` | Предыдущий / следующий слайд |
| `Space` | Следующий слайд |
| `B` | Blackout (показать заставку или чёрный экран) |
| `T` | Старт / пауза таймера |
| `Shift+T` | Сбросить таймер |
| `Cmd+O` | Открыть отдельный PDF / PPTX |
| `Cmd+N` | Новый проект |
| `Cmd+Shift+O` | Открыть проект |
| `Cmd+S` | Сохранить проект |
| `Cmd+,` | Настройка экранов |

## Раскладки экранов

| Конфигурация | Окна |
|--------------|------|
| 1 экран | Только оператор (для подготовки/прогона) |
| 2 экрана (ноут + проектор) | Оператор + аудитория |
| 3 экрана (+ суфлёр) | Оператор + суфлёр клиента + аудитория |

Раскладка определяется автоматически по количеству подключённых дисплеев. Поменять — `Cmd+,`.

## Сборка из исходников

```bash
git clone https://github.com/azatlife/PDF-Presenter.git
cd PDF-Presenter
npm install
npm run dev          # запуск в dev-режиме с HMR
npm run package:mac  # сборка .dmg + .zip для Mac
npm run package:win  # сборка .zip для Windows (требует wine, скачается автоматически)
```

## Обновления

Приложение раз в сутки проверяет наличие новой версии на GitHub. Если есть новее — показывает баннер с ссылкой на страницу скачивания. Установка вручную: скачать новую версию, переустановить.

## Лицензия

[MIT](LICENSE) © 2026 Azat Khusaenov
