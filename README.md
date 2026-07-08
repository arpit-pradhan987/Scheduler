# FocusFlow - Productivity Dashboard

A comprehensive all-in-one productivity hub designed to help you manage your time, tasks, goals, and motivation. FocusFlow combines task management, daily planning, goal setting, the Pomodoro technique, and motivational quotes to keep you focused and productive.

## 🎯 Features

### 1. **Tasks & Todos**

Manage your daily tasks with a simple checklist interface. Mark tasks as complete, delete them, and keep track of pending items. Your tasks are automatically saved to your browser's local storage.

- Add new tasks
- Mark tasks as complete/incomplete
- Delete tasks
- View pending task count on dashboard

### 2. **Daily Goals**

Set up to 5 major daily objectives to maintain focus. This feature keeps you aligned with what matters most for the day.

- Set up to 5 daily goals
- Mark goals as complete
- Undo completed goals
- Delete goals
- Goal counter to track progress

### 3. **Daily Planner**

Schedule your day hour by hour from 8:00 AM to 8:00 PM. Plan your activities, meetings, and breaks throughout the day.

- Hourly time slots (08:00 - 20:00)
- Quick text entry for each hour
- Clear all entries at once
- Auto-save functionality

### 4. **Pomodoro Timer**

Boost productivity using the Pomodoro Technique - alternate between focused work (25 minutes) and short breaks (5 minutes).

- 25-minute work sessions
- 5-minute break sessions
- Play/Pause/Reset controls
- Auto-switch between work and break modes
- Live timer display with mode indicator
- Real-time title updates showing remaining time

### 5. **Motivation**

Get inspired with motivational quotes. The feature pulls quotes from external sources with a reliable local fallback.

- Random motivational quotes
- Load new quotes with "Another One" button
- Smooth fade animation between quotes
- Graceful fallback to built-in quotes if API unavailable
- Quote author attribution

## 🎨 Features & UI

### Always-On Widgets

- **Clock:** Real-time display of current time and date
- **Weather:** Current weather for Ranchi, India (updated hourly)
- **User Greeting:** Personalized greeting with your username
- **Theme Toggle:** Switch between light and dark modes

### Authentication

- User registration with password protection
- Secure login/logout
- Per-user data isolation
- Local storage with JSON serialization

### Design

- Modern glass-morphism UI with Tailwind CSS
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Dark mode support
- FontAwesome icons

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No installation required

### Usage

1. Open `index.html` in your web browser
2. Create an account with a username and password
3. Log in with your credentials
4. Start using the dashboard features
5. All data is saved automatically to your browser

### Local Development

```bash
# If you want to serve locally
python -m http.server 8000

# Then open http://127.0.0.1:8000/Scheduler/index.html
```

## 📁 File Structure

```
Scheduler/
├── index.html      # Main HTML structure
├── script.js       # All JavaScript functionality
└── README.md       # This file
```

## 💾 Data Storage

- All user data is stored in browser's **localStorage**
- Data persists across sessions
- Data is stored in JSON format under the key `focusflow_db`
- No server or backend required

## 🔧 Technical Stack

- **HTML5** - Semantic markup
- **CSS3** - Tailwind CSS (via CDN)
- **JavaScript (Vanilla)** - No frameworks
- **FontAwesome** - Icons library
- **Open-Meteo API** - Weather data (free, no API key required)
- **Quotable.io API** - Motivational quotes (optional, has fallback)

## 🌈 Theme System

- Light mode (default)
- Dark mode with theme toggle
- Smooth transitions between themes
- User preference persists across sessions

## 📝 Notes

- All features work offline (motivational quotes use local fallback)
- No personal data is sent to external servers (only weather and quotes)
- Perfect for personal productivity tracking
- Works great on mobile, tablet, and desktop

## 🎓 How to Use Each Feature

### Add a Todo

1. Click "Tasks & Todos" card
2. Type your task in the input field
3. Click "Add" or press Enter

### Set Daily Goals

1. Click "Daily Goals" card
2. Type your major goal
3. Click "Set Goal" (max 5 goals)
4. Mark as complete when done

### Plan Your Day

1. Click "Daily Planner" card
2. Click on any hour slot
3. Type your activity
4. Changes auto-save

### Use Pomodoro Timer

1. Click "Pomodoro Timer" card
2. Choose "Work (25m)" or "Break (5m)"
3. Click the play button to start
4. Timer will auto-switch between modes

### Get Motivated

1. Click "Motivation" card
2. Read the inspirational quote
3. Click "Another One" for more quotes

## 🙏 Credits

- Icons: [FontAwesome](https://fontawesome.com/)
- Styling: [Tailwind CSS](https://tailwindcss.com/)
- Weather API: [Open-Meteo](https://open-meteo.com/)
- Quotes API: [Quotable.io](https://quotable.io/)

## 📄 License

Open source - Feel free to use and modify for your personal productivity needs.
