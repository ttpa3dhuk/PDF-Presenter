# CueDeck

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![macOS](https://img.shields.io/badge/macOS-Apple%20Silicon%20%7C%20Intel-black?logo=apple&logoColor=white)](https://github.com/ttpa3dhuk/PDF-Presenter/releases/latest)
[![Windows](https://img.shields.io/badge/Windows-10%2F11-0078D6?logo=windows&logoColor=white)](https://github.com/ttpa3dhuk/PDF-Presenter/releases/latest)
[![Built with Electron](https://img.shields.io/badge/Electron-33-9feaf9?logo=electron&logoColor=black)](https://electronjs.org)

**CueDeck — инструмент оператора презентаций на живых мероприятиях.**  
Собираешь плейлист всех спикеров заранее, ведёшь мероприятие с одного рабочего места: персональные таймеры с тремя режимами, заметки на суфлёр в реальном времени, блэкаут, три независимых окна (оператор / суфлёр / аудитория).

[🇷🇺 Читать на русском](#-русский) · [🇬🇧 Read in English](#-english)

---

<!-- Add screenshot: docs/screenshot.png (1920×1080 or similar, showing operator + audience windows) -->
> 📸 *Screenshot coming soon — [contribute one!](https://github.com/ttpa3dhuk/PDF-Presenter/issues)*

---

## 🇷🇺 Русский

### 💡 Зачем это нужно

Стандартная ситуация на мероприятии: у каждого спикера свой PDF или PPTX, переключать надо быстро, таймер нужен каждому свой, заметки — тебе, а не залу. PowerPoint Presenter View — только для `.pptx`. PDF Reader — вообще без таймера и заметок.

CueDeck закрывает этот пробел. Собираешь плейлист заранее, запускаешь — и ведёшь весь день на одном инструменте.

---

### ⬇️ Скачать

Последняя версия: **[GitHub Releases →](https://github.com/ttpa3dhuk/PDF-Presenter/releases/latest)**

| Платформа | Файл |
|-----------|------|
| macOS Apple Silicon (M1/M2/M3) | `CueDeck-<version>-arm64.dmg` |
| macOS Intel | `CueDeck-<version>.dmg` |
| Windows 10/11 (x64) | `CueDeck-<version>-win.zip` |

---

### 🛠 Установка

#### macOS

1. Открой DMG, перетащи `CueDeck.app` в Applications.
2. **Первый запуск:** правый клик → `Open` → `Open` в диалоге.  
   *(При двойном клике macOS блокирует приложения без code signing — это норма для beta.)*
3. Дальше открывается двойным кликом как обычно.

**Если macOS пишет «приложение повреждено»** — это Gatekeeper-карантин. Сними его в терминале:
```bash
xattr -cr "/Applications/CueDeck.app"
```

#### Windows

1. Распакуй ZIP в любую папку (например, `C:\Program Files\CueDeck\`).
2. Запусти `CueDeck.exe`.
3. SmartScreen предупредит → `More info` → `Run anyway`.

#### PPTX-поддержка

PPTX, PPT, ODP и Keynote **конвертируются в PDF** при открытии через LibreOffice. Это одноразовая операция — результат кешируется, повторно конвертировать не нужно.

> ⚠️ **Важно понимать:**
> - Файл конвертируется в PDF — **редактирование слайдов недоступно**
> - **Анимации и переходы не воспроизводятся** — каждый анимированный шаг фиксируется как отдельный статичный слайд (если LibreOffice его развернул) или теряется
> - Внешний вид слайдов может незначительно отличаться от оригинала — особенно нестандартные шрифты и сложные эффекты
>
> CueDeck — инструмент для **показа готовых материалов**, не для редактирования презентаций.

Для конвертации нужен **LibreOffice** (бесплатно):

- **Mac:** `brew install --cask libreoffice` или [libreoffice.org](https://www.libreoffice.org/download/download-libreoffice/)
- **Windows:** установщик с [libreoffice.org](https://www.libreoffice.org/download/download-libreoffice/)

PDF и картинки работают сразу, без зависимостей.

---

### ✨ Возможности

- 📋 **Плейлист спикеров** — собираешь всю программу мероприятия заранее, drag-and-drop сортировка, переключение в один клик
- ⏱ **Таймер — три режима:**
  - **Обратный отсчёт** — задаёшь длительность на спикера, цвет меняется зелёный → жёлтый → красный
  - **Секундомер** — считает вверх от нуля
  - **Текущее время** — часы в реальном времени
- 🔢 **Пресеты и коррекция на ходу** — быстрый выбор длительности из пресетов; прямо во время выступления можно добавить или убрать время без остановки
- 📍 **Позиция и масштаб таймера** — выбираешь угол экрана суфлёра (четыре варианта), регулируешь размер
- 🖥 **Три независимых окна** — оператор (твой ноут), суфлёр клиента (внешний дисплей), аудитория (проектор)
- 📄 **Форматы** — PDF, PPTX, PPT, ODP, Keynote, PNG/JPG/WebP/GIF/BMP
- 📝 **Заметки оператора → суфлёр** — пишешь текст в окне оператора, он мгновенно появляется на экране суфлёра. Прямой канал связи со спикером без слов
- ⬛ **Blackout / Key Visual** — нажал `B`: аудитория видит заставку (если загружена) или чёрный фон. Переключаешь слайды — аудитория ничего не видит
- 💾 **Проекты** — сохраняй настроенный плейлист как `.pdpres`, открывай перед следующим мероприятием
- 🔔 **Авто-обновления** — раз в сутки проверяет новую версию на GitHub

---

### ⌨️ Горячие клавиши

| Клавиша | Действие |
|---------|----------|
| `←` / `→` | Предыдущий / следующий слайд |
| `Space` | Следующий слайд |
| `B` | Blackout |
| `T` | Старт / пауза таймера |
| `Shift+T` | Сбросить таймер |
| `Cmd+O` | Открыть PDF / PPTX |
| `Cmd+N` | Новый проект |
| `Cmd+Shift+O` | Открыть проект |
| `Cmd+S` | Сохранить проект |
| `Cmd+,` | Настройка экранов |

---

### 🖥 Раскладки экранов

| Конфигурация | Окна |
|--------------|------|
| 1 экран | Оператор (подготовка / прогон) |
| 2 экрана (ноут + проектор) | Оператор + аудитория |
| 3 экрана (+ суфлёр) | Оператор + суфлёр + аудитория |

Раскладка определяется автоматически по числу подключённых дисплеев. Поменять — `Cmd+,`.

**Что видит каждое окно:**
- **Оператор** — полный интерфейс: плейлист, слайды, таймер, управление, заметки
- **Суфлёр** — текущий слайд + крупный таймер в выбранном углу + заметки от оператора (мгновенно)
- **Аудитория** — только слайд, без служебной информации. При блэкауте: Key Visual или чёрный фон

---

### 🔧 Сборка из исходников

```bash
git clone https://github.com/ttpa3dhuk/PDF-Presenter.git
cd PDF-Presenter
npm install
npm run dev           # dev-режим с HMR
npm run package:mac   # сборка .dmg для Mac
npm run package:win   # сборка .zip для Windows
```

---

## 🇬🇧 English

### 💡 Why

Every event has the same problem: each speaker brings a different format — PDF, PPTX, images. You need to switch fast, run individual timers, and keep notes visible to you — not the audience. PowerPoint Presenter View only works with `.pptx`. PDF readers have no timer, no notes.

CueDeck fills the gap. Build a speaker playlist in advance, run it — and operate the whole day in one tool.

---

### ⬇️ Download

Latest release: **[GitHub Releases →](https://github.com/ttpa3dhuk/PDF-Presenter/releases/latest)**

| Platform | File |
|----------|------|
| macOS Apple Silicon (M1/M2/M3) | `CueDeck-<version>-arm64.dmg` |
| macOS Intel | `CueDeck-<version>.dmg` |
| Windows 10/11 (x64) | `CueDeck-<version>-win.zip` |

---

### 🛠 Installation

#### macOS

1. Open the DMG, drag `CueDeck.app` to Applications.
2. **First launch:** right-click → `Open` → `Open` in the dialog.  
   *(macOS blocks unsigned apps on double-click — expected for beta.)*
3. After that, double-click works as normal.

**If macOS says "app is damaged"** — that's Gatekeeper quarantine. Remove it in Terminal:
```bash
xattr -cr "/Applications/CueDeck.app"
```

#### Windows

1. Unzip to any folder (e.g. `C:\Program Files\CueDeck\`).
2. Run `CueDeck.exe`.
3. SmartScreen will warn you → `More info` → `Run anyway`.

#### PPTX support

PPTX, PPT, ODP and Keynote files are **converted to PDF** on open via LibreOffice. This is a one-time operation — the result is cached, no re-conversion on subsequent opens.

> ⚠️ **Important limitations:**
> - The file is converted to PDF — **slide editing is not available**
> - **Animations and transitions are not played** — each animated step is either rendered as a separate static slide (if LibreOffice expanded it) or lost entirely
> - Slide appearance may differ slightly from the original — especially custom fonts and complex effects
>
> CueDeck is a tool for **presenting finished materials**, not editing presentations.

Converting PowerPoint files requires **LibreOffice** (free):

- **Mac:** `brew install --cask libreoffice` or [libreoffice.org](https://www.libreoffice.org/download/download-libreoffice/)
- **Windows:** installer from [libreoffice.org](https://www.libreoffice.org/download/download-libreoffice/)

PDF and image files work immediately without any dependencies.

---

### ✨ Features

- 📋 **Speaker playlist** — build the full event program in advance, drag-and-drop reordering, one-click switching
- ⏱ **Timer — three modes:**
  - **Countdown** — set a duration per speaker, color shifts green → yellow → red
  - **Stopwatch** — counts up from zero
  - **Clock** — live current time display
- 🔢 **Presets & on-the-fly adjustment** — pick duration from presets; add or subtract time mid-presentation without stopping the timer
- 📍 **Timer position & scale** — choose which corner of the confidence monitor to display the timer (four options), adjust size
- 🖥 **Three independent windows** — operator (your laptop), confidence monitor (external display), audience (projector)
- 📄 **File formats** — PDF, PPTX, PPT, ODP, Keynote, PNG/JPG/WebP/GIF/BMP
- 📝 **Operator notes → confidence monitor** — type in the operator window, text appears instantly on the speaker's screen. Silent communication channel during the presentation
- ⬛ **Blackout / Key Visual** — press `B`: audience sees your Key Visual image (if loaded) or a black screen. Switch slides freely — the audience sees nothing
- 💾 **Projects** — save your configured playlist as `.pdpres`, reopen before the next event
- 🔔 **Auto-update check** — checks GitHub once a day for a new version

---

### ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` / `→` | Previous / next slide |
| `Space` | Next slide |
| `B` | Blackout |
| `T` | Start / pause timer |
| `Shift+T` | Reset timer |
| `Cmd+O` | Open PDF / PPTX |
| `Cmd+N` | New project |
| `Cmd+Shift+O` | Open project |
| `Cmd+S` | Save project |
| `Cmd+,` | Screen settings |

---

### 🖥 Screen Layouts

| Configuration | Windows |
|---------------|---------|
| 1 display | Operator only (prep / rehearsal) |
| 2 displays (laptop + projector) | Operator + audience |
| 3 displays (+ confidence monitor) | Operator + speaker + audience |

Layout is detected automatically based on connected displays. Override via `Cmd+,`.

**What each window shows:**
- **Operator** — full interface: playlist, slides, timer controls, notes editor
- **Confidence monitor (speaker)** — current slide + large timer in the chosen corner + operator notes (instant)
- **Audience** — slide only, no operator UI. During blackout: Key Visual image or black screen

---

### 🔧 Build from Source

```bash
git clone https://github.com/ttpa3dhuk/PDF-Presenter.git
cd PDF-Presenter
npm install
npm run dev           # dev mode with HMR
npm run package:mac   # build .dmg for Mac
npm run package:win   # build .zip for Windows
```

---

## 📄 License

[MIT](LICENSE) © 2026 [Azat Khusaenov](https://github.com/ttpa3dhuk)
