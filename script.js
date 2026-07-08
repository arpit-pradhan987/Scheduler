

/**
 * Core State & Storage Management
 */
const DB_KEY = 'focusflow_db';

const fallbackQuotes = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "It's hard to beat a person who never gives up.", author: "Babe Ruth" },
    { text: "Everything you can imagine is real.", author: "Pablo Picasso" },
    { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
    { text: "Continuous improvement is better than delayed perfection.", author: "Mark Twain" }
];

const defaultUserData = {
    todos: [],       // { id, text, completed }
    goals: [],       // { id, text, completed }
    planner: {},     // { "09:00": "Task" }
    theme: 'light'   // 'light' | 'dark'
};

// Initialize DB if not exists
function getDB() {
    const db = localStorage.getItem(DB_KEY);
    return db ? JSON.parse(db) : { users: {}, currentUser: null };
}

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

let appDB = getDB();
let currentUserData = null;

/**
 * Authentication Logic
 */
const authView = document.getElementById('auth-view');
const mainApp = document.getElementById('main-app');

// Toggle forms
document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
});
document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
});

// Register
document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('reg-username').value.trim();
    const pass = document.getElementById('reg-password').value;

    if (appDB.users[user]) {
        showToast("Username already exists", "error");
        return;
    }

    // Create user
    appDB.users[user] = { password: pass, data: JSON.parse(JSON.stringify(defaultUserData)) };
    appDB.currentUser = user;
    saveDB(appDB);

    document.getElementById('reg-username').value = '';
    document.getElementById('reg-password').value = '';

    showToast("Account created successfully!", "success");
    loadApp();
});

// Login
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('login-username').value.trim();
    const pass = document.getElementById('login-password').value;

    if (appDB.users[user] && appDB.users[user].password === pass) {
        appDB.currentUser = user;
        saveDB(appDB);
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        showToast("Logged in successfully", "success");
        loadApp();
    } else {
        showToast("Invalid credentials", "error");
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    appDB.currentUser = null;
    saveDB(appDB);

    // reset UI state
    mainApp.classList.add('hidden');
    authView.classList.remove('hidden');
    closeFeature(); // Ensure dashboard is default on next login

    // Reset background if theme was dark
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');

    showToast("Logged out", "success");
});


/**
 * Application Initialization
 */
function loadApp() {
    if (!appDB.currentUser || !appDB.users[appDB.currentUser]) return;

    currentUserData = appDB.users[appDB.currentUser].data;

    authView.classList.add('hidden');
    mainApp.classList.remove('hidden');
    mainApp.classList.add('flex');

    document.getElementById('user-greeting').textContent = appDB.currentUser;

    // Apply Theme
    applyTheme(currentUserData.theme);

    // Initialize Features
    initWidgets();
    renderTodos();
    renderGoals();
    renderPlanner();
    updateTodoCount();
}

// Check login state on page load (defer to ensure all declarations are processed)
setTimeout(() => {
    if (appDB.currentUser) {
        loadApp();
    }
}, 0);

function syncData() {
    appDB.users[appDB.currentUser].data = currentUserData;
    saveDB(appDB);
}

/**
 * Navigation & View Management
 */
function openFeature(featureName) {
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('feature-view').classList.remove('hidden');

    // Hide all feature content blocks
    document.querySelectorAll('.feature-content').forEach(el => el.classList.add('hidden'));

    // Show target
    document.getElementById(`feat-${featureName}`).classList.remove('hidden');

    // Set title
    const titles = {
        todo: "Tasks & Todos",
        goals: "Daily Goals",
        planner: "Daily Planner",
        pomodoro: "Pomodoro Timer",
        motivation: "Motivation"
    };
    document.getElementById('feature-title').textContent = titles[featureName];

    // Specific feature triggers
    if (featureName === 'motivation' && document.getElementById('quote-author').textContent === '- Author') {
        getQuote();
    }
}

function closeFeature() {
    document.getElementById('feature-view').classList.add('hidden');
    document.getElementById('dashboard-view').classList.remove('hidden');
    updateTodoCount(); // Refresh dash numbers
}

/**
 * Theme Management
 */
function applyTheme(theme) {
    const html = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
        html.classList.add('dark');
        body.classList.remove('light');
        body.classList.add('dark');
    } else {
        html.classList.remove('dark');
        body.classList.remove('dark');
        body.classList.add('light');
    }
    currentUserData.theme = theme;
    syncData();
}

document.getElementById('theme-toggle').addEventListener('click', () => {
    const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(newTheme);
});

/**
 * Always-On Widgets (Clock & Weather)
 */
function initWidgets() {
    // Clock
    function updateClock() {
        const now = new Date();
        document.getElementById('widget-time').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        document.getElementById('widget-date').textContent = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Weather (Using Open-Meteo for Ranchi, India without API Key)
    async function fetchWeather() {
        try {
            // Lat: 23.3441, Lon: 85.3096 (Ranchi)
            const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=23.3441&longitude=85.3096&current_weather=true');
            const data = await res.json();

            if (data && data.current_weather) {
                const temp = Math.round(data.current_weather.temperature);
                const code = data.current_weather.weathercode;

                document.getElementById('widget-weather-temp').textContent = `${temp}°C`;

                // Map WMO Weather code to FontAwesome icons
                const iconEl = document.getElementById('widget-weather-icon');
                iconEl.className = 'fa-solid text-lg '; // reset

                if (code === 0) { iconEl.classList.add('fa-sun', 'text-yellow-500'); } // Clear
                else if (code >= 1 && code <= 3) { iconEl.classList.add('fa-cloud-sun', 'text-yellow-500'); } // Partly cloudy
                else if (code >= 45 && code <= 48) { iconEl.classList.add('fa-smog', 'text-gray-400'); } // Fog
                else if (code >= 51 && code <= 67) { iconEl.classList.add('fa-cloud-rain', 'text-blue-400'); } // Rain/Drizzle
                else if (code >= 71 && code <= 82) { iconEl.classList.add('fa-snowflake', 'text-blue-200'); } // Snow
                else if (code >= 95) { iconEl.classList.add('fa-cloud-bolt', 'text-yellow-600'); } // Thunderstorm
                else { iconEl.classList.add('fa-cloud', 'text-gray-400'); }
            }
        } catch (e) {
            console.error("Weather fetch failed", e);
            document.getElementById('widget-weather-temp').textContent = '--°C';
        }
    }
    fetchWeather();
    // Refresh weather every hour
    setInterval(fetchWeather, 3600000);
}

/**
 * Feature 1: Todo List
 */
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const todoEmpty = document.getElementById('todo-empty');

todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (text) {
        currentUserData.todos.push({ id: Date.now().toString(), text, completed: false });
        syncData();
        todoInput.value = '';
        renderTodos();
    }
});

function renderTodos() {
    todoList.innerHTML = '';
    if (currentUserData.todos.length === 0) {
        todoEmpty.classList.remove('hidden');
    } else {
        todoEmpty.classList.add('hidden');
        currentUserData.todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `flex items-center justify-between p-3 rounded-lg border ${todo.completed ? 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700' : 'bg-white border-gray-200 shadow-sm dark:bg-darkCard dark:border-gray-600'} transition-all`;

            li.innerHTML = `
                        <div class="flex items-center gap-3 overflow-hidden">
                            <button onclick="toggleTodo('${todo.id}')" class="flex-shrink-0 w-6 h-6 rounded border flex items-center justify-center transition-colors ${todo.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-400 text-transparent hover:border-blue-500'}">
                                <i class="fa-solid fa-check text-xs"></i>
                            </button>
                            <span class="truncate ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}">${escapeHTML(todo.text)}</span>
                        </div>
                        <button onclick="deleteTodo('${todo.id}')" class="text-gray-400 hover:text-red-500 transition-colors px-2">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    `;
            todoList.appendChild(li);
        });
    }
}

window.toggleTodo = (id) => {
    const todo = currentUserData.todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        syncData();
        renderTodos();
    }
}
window.deleteTodo = (id) => {
    currentUserData.todos = currentUserData.todos.filter(t => t.id !== id);
    syncData();
    renderTodos();
}
function updateTodoCount() {
    if (!currentUserData) return;
    const pending = currentUserData.todos.filter(t => !t.completed).length;
    document.getElementById('todo-count').textContent = pending;
}


/**
 * Feature 2: Daily Goals
 */
const goalForm = document.getElementById('goal-form');
const goalInput = document.getElementById('goal-input');
const goalList = document.getElementById('goal-list');

goalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (currentUserData.goals.length >= 5) {
        showToast("Maximum 5 goals allowed to keep focus.", "error");
        return;
    }
    const text = goalInput.value.trim();
    if (text) {
        currentUserData.goals.push({ id: Date.now().toString(), text, completed: false });
        syncData();
        goalInput.value = '';
        renderGoals();
    }
});

function renderGoals() {
    goalList.innerHTML = '';
    currentUserData.goals.forEach((goal, idx) => {
        const div = document.createElement('div');
        div.className = `flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border ${goal.completed ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-900/30' : 'bg-white border-orange-200 shadow-sm dark:bg-darkCard dark:border-gray-600'} transition-all gap-4`;

        div.innerHTML = `
                    <div class="flex items-start sm:items-center gap-3 overflow-hidden flex-grow">
                        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center text-sm">
                            ${idx + 1}
                        </div>
                        <span class="font-medium text-lg ${goal.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'} break-words">${escapeHTML(goal.text)}</span>
                    </div>
                    <div class="flex items-center gap-2 sm:ml-auto pl-11 sm:pl-0">
                        <button onclick="toggleGoal('${goal.id}')" class="px-4 py-1.5 rounded text-sm font-medium transition-colors ${goal.completed ? 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300' : 'bg-orange-500 text-white hover:bg-orange-600'}">
                            ${goal.completed ? 'Undo' : 'Complete'}
                        </button>
                        <button onclick="deleteGoal('${goal.id}')" class="w-8 h-8 flex items-center justify-center rounded text-gray-400 hover:bg-red-100 hover:text-red-500 transition-colors">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                `;
        goalList.appendChild(div);
    });
    if (currentUserData.goals.length === 0) {
        goalList.innerHTML = '<p class="text-center text-gray-400 py-6">No major goals set for today.</p>';
    }
}

window.toggleGoal = (id) => {
    const goal = currentUserData.goals.find(g => g.id === id);
    if (goal) { goal.completed = !goal.completed; syncData(); renderGoals(); }
}
window.deleteGoal = (id) => {
    currentUserData.goals = currentUserData.goals.filter(g => g.id !== id);
    syncData(); renderGoals();
}

/**
 * Feature 3: Daily Planner
 */
const plannerList = document.getElementById('planner-list');
const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

function renderPlanner() {
    plannerList.innerHTML = '';
    hours.forEach(hour => {
        const val = currentUserData.planner[hour] || '';
        const div = document.createElement('div');
        div.className = "flex items-stretch border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 transition-shadow";
        div.innerHTML = `
                    <div class="bg-gray-50 dark:bg-gray-800 w-20 flex-shrink-0 flex items-center justify-center font-medium text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                        ${hour}
                    </div>
                    <input type="text" class="flex-grow p-3 outline-none dark:bg-darkCard bg-white" placeholder="Plan for this hour..." value="${escapeHTML(val)}" data-hour="${hour}" onchange="savePlanner(this)">
                `;
        plannerList.appendChild(div);
    });
}

window.savePlanner = (input) => {
    const hour = input.getAttribute('data-hour');
    currentUserData.planner[hour] = input.value.trim();
    syncData();
}

document.getElementById('clear-planner').addEventListener('click', () => {
    if (confirm("Clear all planner entries for today?")) {
        currentUserData.planner = {};
        syncData();
        renderPlanner();
    }
});


/**
 * Feature 4: Pomodoro Timer
 */
let pomodoroInterval;
let pomodoroTimeLeft = 25 * 60; // 25 mins in seconds
let pomodoroMode = 'work'; // 'work' or 'break'
let pomodoroRunning = false;

const pomDisplay = document.getElementById('pomodoro-display');
const pomModeDisplay = document.getElementById('pomodoro-mode');
const pomStart = document.getElementById('pom-start');
const pomPause = document.getElementById('pom-pause');
const pomReset = document.getElementById('pom-reset');
const dashPomStatus = document.getElementById('pomodoro-status');

function updatePomodoroDisplay() {
    const m = Math.floor(pomodoroTimeLeft / 60).toString().padStart(2, '0');
    const s = (pomodoroTimeLeft % 60).toString().padStart(2, '0');
    pomDisplay.textContent = `${m}:${s}`;

    // Update document title if running
    if (pomodoroRunning) {
        document.title = `(${m}:${s}) FocusFlow`;
    } else {
        document.title = "FocusFlow - Productivity Dashboard";
    }
}

function updateDashPomStatus() {
    if (pomodoroRunning) {
        dashPomStatus.innerHTML = `<span class="text-emerald-500"><i class="fa-solid fa-circle-play"></i> Running (${pomModeDisplay.textContent})</span>`;
    } else if (pomodoroTimeLeft !== (pomodoroMode === 'work' ? 25 * 60 : 5 * 60)) {
        dashPomStatus.innerHTML = `<span class="text-amber-500"><i class="fa-solid fa-circle-pause"></i> Paused</span>`;
    } else {
        dashPomStatus.textContent = "Not running";
    }
}

window.setPomodoroMode = (mode) => {
    if (pomodoroRunning) return; // Prevent change while running
    pomodoroMode = mode;
    pomodoroTimeLeft = mode === 'work' ? 25 * 60 : 5 * 60;
    pomModeDisplay.textContent = mode === 'work' ? 'Focus' : 'Break';
    pomModeDisplay.className = `font-semibold uppercase tracking-widest mb-2 ${mode === 'work' ? 'text-red-500' : 'text-teal-500'}`;
    updatePomodoroDisplay();
    updateDashPomStatus();
}

pomStart.addEventListener('click', () => {
    if (pomodoroRunning) return;
    pomodoroRunning = true;
    pomStart.classList.add('hidden');
    pomPause.classList.remove('hidden');
    updateDashPomStatus();

    pomodoroInterval = setInterval(() => {
        pomodoroTimeLeft--;
        updatePomodoroDisplay();

        if (pomodoroTimeLeft <= 0) {
            clearInterval(pomodoroInterval);
            pomodoroRunning = false;
            showToast(`Time's up! ${pomodoroMode === 'work' ? 'Take a break.' : 'Back to work!'}`, "success");
            // Auto switch mode
            setPomodoroMode(pomodoroMode === 'work' ? 'break' : 'work');
            pomStart.classList.remove('hidden');
            pomPause.classList.add('hidden');
        }
    }, 1000);
});

pomPause.addEventListener('click', () => {
    clearInterval(pomodoroInterval);
    pomodoroRunning = false;
    pomStart.classList.remove('hidden');
    pomPause.classList.add('hidden');
    updateDashPomStatus();
    updatePomodoroDisplay();
});

pomReset.addEventListener('click', () => {
    clearInterval(pomodoroInterval);
    pomodoroRunning = false;
    pomStart.classList.remove('hidden');
    pomPause.classList.add('hidden');
    setPomodoroMode(pomodoroMode); // resets time based on current mode
});


/**
 * Feature 5: Motivation
 */
function getRandomFallbackQuote() {
    return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
}

function renderQuote(quote) {
    const textEl = document.getElementById('quote-text');
    const authorEl = document.getElementById('quote-author');

    // Fade out
    textEl.style.transition = 'opacity 0.3s ease';
    authorEl.style.transition = 'opacity 0.3s ease';
    textEl.style.opacity = 0;
    authorEl.style.opacity = 0;

    // Update content and fade back in
    setTimeout(() => {
        textEl.textContent = `"${quote.text}"`;
        authorEl.textContent = `- ${quote.author}`;
        // Force a repaint
        void textEl.offsetHeight;
        textEl.style.opacity = 1;
        authorEl.style.opacity = 1;
    }, 300);
}

async function getQuote() {
    const textEl = document.getElementById('quote-text');
    const authorEl = document.getElementById('quote-author');

    textEl.textContent = 'Loading inspiration...';
    authorEl.textContent = '- Author';

    try {
        // Try Using they-said-so quote API (free, no auth)
        const response = await fetch('https://api.quotable.io/random');
        if (response.ok) {
            const data = await response.json();
            if (data && data.content && data.author) {
                renderQuote({
                    text: data.content,
                    author: data.author
                });
                return;
            }
        }
    } catch (error) {
        console.warn('External API unavailable, using local quotes.', error);
    }

    // Use local fallback quotes
    renderQuote(getRandomFallbackQuote());
}

document.getElementById('new-quote-btn').addEventListener('click', () => getQuote());


/**
 * Utilities
 */
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
}

function showToast(message, type = "success") {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').textContent = message;

    toast.className = `fixed bottom-5 right-5 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform transition-all duration-300 z-50 pointer-events-none ${type === 'success' ? 'bg-gray-800 dark:bg-white dark:text-gray-900' : 'bg-red-500'}`;

    // Show
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-20', 'opacity-0');
    });

    // Hide
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

