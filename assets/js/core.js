/* ============================================================
   مالي — Core (مشترك بين كل الصفحات)
   يحتوي على: إعداد Firebase، حراسة تسجيل الدخول، الوضع الداكن، التنبيهات العائمة
   ============================================================ */

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyBbYerrLcTE4o44bsBXPynHQ6ArXvtyEro",
    authDomain: "masrofat-c544f.firebaseapp.com",
    projectId: "masrofat-c544f",
    databaseURL: "https://masrofat-c544f-default-rtdb.firebaseio.com",
    storageBucket: "masrofat-c544f.appspot.com",
    messagingSenderId: "997053169222",
    appId: "1:997053169222:web:5cdd2a2901265b7f2ad447"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

let currentUser = null;

/* ============ الوضع الداكن (محفوظ محليًا عشان يفضل ثابت بين الصفحات) ============ */
function applyStoredTheme() {
    const saved = localStorage.getItem('maly-theme');
    const isDark = saved === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.classList.toggle('bi-moon-stars-fill', !isDark);
        icon.classList.toggle('bi-sun-fill', isDark);
    }
}

function initThemeToggle(onToggle) {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('maly-theme', isDark ? 'dark' : 'light');
        const icon = document.querySelector('#themeToggle i');
        icon.classList.toggle('bi-moon-stars-fill', !isDark);
        icon.classList.toggle('bi-sun-fill', isDark);
        if (typeof onToggle === 'function') onToggle(isDark);
    });
}

/* ============ حراسة صفحات التطبيق (لازم تسجيل دخول) ============ */
// يُستخدم في: dashboard.html, transactions.html, budget.html, recurring.html
function requireAuth(onReady) {
    const gate = document.getElementById('authGate');
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            const emailEl = document.getElementById('userEmail');
            if (emailEl) emailEl.textContent = user.email;
            if (gate) gate.classList.add('hidden');
            document.getElementById('appScreen')?.classList.remove('hidden');
            if (typeof onReady === 'function') onReady(user);
        } else {
            window.location.href = 'index.html';
        }
    });
}

// يُستخدم في: index.html — لو المستخدم داخل فعلاً يوديه على الداشبورد على طول
function redirectIfAuthed() {
    auth.onAuthStateChanged(user => {
        if (user) window.location.href = 'dashboard.html';
    });
}

function initLogout() {
    const btn = document.getElementById('logoutBtn');
    if (btn) btn.addEventListener('click', () => auth.signOut().then(() => window.location.href = 'index.html'));
}

/* ============ التنبيهات العائمة ============ */
function showToast(msg, type) {
    const wrap = document.getElementById('toastWrap');
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = `toast-pill ${type === 'danger' ? 'danger' : type === 'warn' ? 'warn' : ''}`;
    const icon = type === 'danger' ? 'bi-exclamation-octagon-fill' : type === 'warn' ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill';
    el.innerHTML = `<i class="bi ${icon}"></i><span>${msg}</span>`;
    wrap.appendChild(el);
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
        setTimeout(() => el.remove(), 300);
    }, 4000);
}

/* ============ أدوات عامة ============ */
const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

function catKey(name) { return name.replace(/[.#$\[\]\/]/g, '-'); }

// تُطبَّق فورًا (قبل ما الصفحة تكمل تحميل) عشان الوضع الداكن ميومضش عند فتح الصفحة
applyStoredTheme();
