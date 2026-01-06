# Smart Home - Архітектура Проєкту

## 📁 Структура Проєкту

```
Smart_Home/
├── css/                          # Стилі (модульна архітектура)
│   ├── styles.css               # Головний файл з імпортами
│   ├── base.css                 # Базові стилі, змінні, reset
│   ├── component-action.css     # Форми, кнопки, результати
│   ├── component-accordion.css  # Розгортаний список компонентів
│   ├── stats-dashboard.css      # Панель статистики
│   ├── event-log.css            # Журнал подій
│   ├── toast.css                # Спливаючі повідомлення
│   ├── animations.css           # Keyframe анімації
│   ├── responsive.css           # Медіа-запити
│   ├── global.header-nav.css    # Стилі шапки
│   ├── global.footer.css        # Стилі футера
│   └── header-background.css    # Фонові стилі для header
│
├── js/                          # JavaScript модулі
│   ├── index.js                 # Точка входу
│   ├── header-nav.js            # Логіка навігації
│   ├── index.components-manager.js  # UI менеджер компонентів
│   │
│   ├── models/                  # Моделі даних (ООП)
│   │   └── component.model.js   # Класи: Component, Light, Thermostat,
│   │                            #        SmartLock, Camera, Television
│   │
│   ├── services/                # Бізнес-логіка
│   │   └── smart-home-service.js  # SmartHomeService (CRUD, persistence)
│   │
│   └── handlers/                # Обробники подій
│       ├── smart-home-handlers.js  # Handlers для UI -> Service
│       └── component-select.js     # Робота з dropdown списками
│
├── img/                         # Зображення
│   └── header/
│       └── index-background-smart-home.jfif
│
├── index.html                   # Головна сторінка
├── global.header-nav.partial.html    # Partial: шапка (з inline SVG логотипом)
├── global.footer.partial.html        # Partial: футер
├── index.components-manager.partial.html  # Partial: UI компонентів
├── .gitignore                   # Git ignore файл
└── LICENSE
```

## 🏗️ Архітектурні Шари

### 1. **Models (Моделі)** - `js/models/`

Об'єктно-орієнтовані класи, що представляють компоненти розумного будинку.

**Базовий клас:** `Component`

- Властивості: `id`, `name`, `type`, `status`, `createdAt`, `lastUpdated`
- Методи: `turnOn()`, `turnOff()`, `getInfo()`, `getActions()`

**Підкласи з розширеними можливостями:**

- **`Light`** - керування яскравістю (0-100%)
- **`Thermostat`** - керування температурою (16-30°C)
- **`SmartLock`** - блокування/розблокування
- **`Camera`** - запис відео
- **`Television`** ⭐ (розширений компонент):
  - Гучність (0-100), mute/unmute
  - 10 каналів (перемикання +/-, прямий вибір)
  - Джерела сигналу: TV, HDMI1, HDMI2, USB
  - Список каналів

### 2. **Services (Сервіси)** - `js/services/`

Бізнес-логіка та управління станом.

**`SmartHomeService`:**

- **CRUD операції:** створення, видалення, отримання списку компонентів
- **Виконання дій:** executeAction() з підтримкою всіх команд
- **Персистентність:** localStorage (auto-save/load)
- **Статистика:** total, online/offline, розподіл по типам
- **Event Log:** журнал останніх 50 подій

### 3. **Handlers (Обробники)** - `js/handlers/`

Тонкий шар між UI та Service.

**`smart-home-handlers.js`:**

- `handleCreateComponent()` - створення компонента
- `handleDeleteComponent()` - видалення
- `handleComponentAction()` - виконання дій
- `handleGetStats()` - статистика
- `handleGetComponents()` - отримання списку компонентів
- `handleGetEventLog()` - журнал подій
- `handleReset()` - скидання системи
- **Валідація типів:** `isTypeAllowedForName()` - перевірка відповідності назви та типу
- **Автовизначення:** `detectTypeFromName()` - визначення типу за ключовими словами

**`component-select.js`:**

- `updateSelectOptions()` - оновлення випадаючого списку компонентів
- `getSelectedComponent()` - отримання обраного компонента
- `clearSelectValue()` - очищення вибору

### 4. **UI Manager** - `js/index.components-manager.js`

Керування DOM та користувацьким інтерфейсом.

**Основні функції:**

- Рендеринг акордеону з компонентами
- Динамічна генерація елементів управління на основі `getActions()`
- Групування дій (Power, Lock, Recording, Volume, Channel, Input)
- Toast-повідомлення про успіх/помилку (з іконками: ✓, ✕, ℹ, ✨, 🗑️, 🔄)
- Оновлення статусу в реальному часі
- Автоматичне оновлення статистики (auto-refresh) при відкритій панелі
- Кешування DOM елементів для оптимізації продуктивності

### 5. **CSS Modules** - `css/`

Модульна структура стилів для кращої читабельності.

**Розділення за функціональністю:**

- **base.css** - змінні, reset, базова типографіка
- **component-action.css** - форми, кнопки, стилі кнопок за типами
- **component-accordion.css** - розгортаний список з анімацією
- **stats-dashboard.css** - градієнт, сітка статистики
- **event-log.css** - стилі журналу подій, scrollbar
- **toast.css** - спливаючі сповіщення
- **animations.css** - @keyframes (fadeIn, slideIn, fadeOut)
- **responsive.css** - @media queries для мобільних

## 🔄 Потік Даних

```
┌─────────────────┐
│   User Action   │
│   (Click btn)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  UI Manager     │◄──────┐
│ (components-    │       │
│  manager.js)    │       │
└────────┬────────┘       │
         │                │
         ▼                │
┌─────────────────┐       │
│   Handlers      │       │
│ (smart-home-    │       │
│  handlers.js)   │       │
└────────┬────────┘       │
         │                │
         ▼                │
┌─────────────────┐       │
│   Service       │       │
│ (smart-home-    │       │
│  service.js)    │       │
└────────┬────────┘       │
         │                │
         ▼                │
┌─────────────────┐       │
│    Models       │       │
│ (component.     │       │
│  model.js)      │       │
└────────┬────────┘       │
         │                │
         ▼                │
┌─────────────────┐       │
│  localStorage   │       │
│   (persist)     │       │
└─────────────────┘       │
                          │
    ┌─────────────────────┘
    │ Update UI
    │ (toast, status)
```

## 🎯 Ключові Принципи ООП

### 1. **Інкапсуляція**

- Приватні дані в класах (`#createFromData`)
- Публічні методи для взаємодії (`getInfo()`, `getActions()`)

### 2. **Наслідування**

```javascript
Component (базовий)
  ├── Light extends Component
  ├── Thermostat extends Component
  ├── SmartLock extends Component
  ├── Camera extends Component
  └── Television extends Component (розширений)
```

### 3. **Поліморфізм**

- `getActions()` - кожен підклас повертає свій набір дій
- `getInfo()` - перевизначається для додавання специфічних властивостей

### 4. **Абстракція**

- Service приховує деталі роботи з localStorage
- Handlers абстрагують UI від бізнес-логіки

## 📊 Функціональність

### ✅ Виконані вимоги:

1. **5 типів компонентів** (Light, Thermostat, SmartLock, Camera, Television)
2. **Web-інтерфейс** з роботою через DOM API
3. **Конфігурація:** додавання/видалення з вибором типу
4. **Управління:** on/off/toggle + специфічні команди для кожного типу
5. **Додатковий функціонал:**
   - Статистика (total, online/offline, розподіл по типам) з auto-refresh
   - Event Log (журнал останніх 50 подій)
   - Reset (повне очищення даних)
   - Валідація створення компонентів (тип повинен відповідати назві)
   - Автоматичне визначення типу за ключовими словами в назві
   - Toast-повідомлення з різними іконками для різних типів подій
6. **ООП:** повна підтримка наслідування, інкапсуляції, поліморфізму
7. **Розширений компонент (Television):**
   - 13 різних команд управління
   - Гучність з mute/unmute
   - 10 каналів з різними режимами перемикання
   - 4 джерела входу (TV, HDMI1/2, USB)

## 🚀 Технології

- **Vanilla JavaScript** (ES6+ modules)
- **CSS3** (CSS Variables, Flexbox, Grid, Animations)
- **HTML5** (Semantic markup)
- **HTMX** (для динамічного завантаження partials)
- **localStorage** (персистентність даних)

## 📝 Використання

1. Відкрити `index.html` у браузері
2. Ввести назву компонента та вибрати тип
3. Натиснути "Create Component"
4. Натиснути "Get List Of Components" для перегляду
5. Розгорнути панель компонента для керування

## 🎨 UI/UX Features

- **Акордеон** - плавне розгортання панелей управління
- **Toast-повідомлення** - feedback про успішність операцій з іконками
- **Динамічні елементи** - кнопки/слайдери генеруються на основі моделі
- **Inline-оновлення** - статус змінюється без перезавантаження списку
- **Responsive** - адаптивний дизайн для мобільних пристроїв
- **Анімації** - fadeIn, slideIn для плавної появи елементів
- **Inline SVG** - логотип та favicon використовують inline SVG (data URI)
- **Auto-refresh** - статистика автоматично оновлюється при відкритій панелі
