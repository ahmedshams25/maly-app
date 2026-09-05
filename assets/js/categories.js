/* ============================================================
   مالي — إدارة التصنيفات (افتراضية + مخصصة لكل مستخدم)
   يُستخدم في: transactions.html, budget.html
   ============================================================ */

const categories = {
    income: ['راتب', 'استثمار', 'عمل حر', 'أخرى'],
    expense: ['أكل', 'مواصلات', 'فواتير', 'صحة', 'ترفيه', 'هدية', 'أخرى']
};
let customCategories = { income: [], expense: [] };

let categoryModal;

function getCategories(type) {
    return [...new Set([...categories[type], ...(customCategories[type] || [])])];
}

function populateCategorySelect(selectEl, type, selectedValue) {
    if (!selectEl) return;
    const val = selectedValue !== undefined ? selectedValue : selectEl.value;
    selectEl.innerHTML = getCategories(type).map(c => `<option value="${c}" ${c === val ? 'selected' : ''}>${c}</option>`).join('');
}

// بيرجع Promise عشان الصفحات اللي محتاجة تستنى التصنيفات قبل ما تكمل رسم أي حاجة تانية
function loadCategories(onUpdate) {
    return new Promise(resolve => {
        let first = true;
        db.ref(`users/${currentUser.uid}/categories`).on('value', snap => {
            const val = snap.val() || {};
            customCategories.income = val.income ? Object.values(val.income).map(v => v.name) : [];
            customCategories.expense = val.expense ? Object.values(val.expense).map(v => v.name) : [];
            if (typeof onUpdate === 'function') onUpdate();
            if (first) { first = false; resolve(); }
        });
    });
}

// تفعيل مودال "إضافة تصنيف جديد" — لازم يكون موجود بنفس الـ HTML في الصفحة اللي بتستخدمه
function initCategoryModal() {
    const modalEl = document.getElementById('categoryModal');
    if (!modalEl) return;
    categoryModal = new bootstrap.Modal(modalEl);

    document.getElementById('categoryForm').onsubmit = e => {
        e.preventDefault();
        const type = document.getElementById('categoryFormType').value;
        const name = document.getElementById('newCategoryName').value.trim();
        if (!name) return;
        db.ref(`users/${currentUser.uid}/categories/${type}`).push({ name: name }).then(() => {
            categoryModal.hide();
            showToast(`تمت إضافة تصنيف "${name}"`, 'success');
        });
    };
}

function openCategoryModal(type) {
    document.getElementById('categoryFormType').value = type;
    document.getElementById('newCategoryName').value = '';
    categoryModal.show();
}
