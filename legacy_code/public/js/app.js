// ============================================
// Campus Lost & Found - Shared JavaScript
// ============================================

const API_BASE = '/api';

// ---------- API Helper ----------
async function apiRequest(endpoint, options = {}) {
    try {
        const config = {
            headers: { 'Content-Type': 'application/json' },
            ...options
        };

        // Don't set Content-Type for FormData
        if (options.body instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
        }
        return data;
    } catch (err) {
        throw err;
    }
}

// ---------- Auth State ----------
let currentUser = null;

async function checkAuth() {
    try {
        const data = await apiRequest('/auth/me');
        currentUser = data.user;
        return currentUser;
    } catch {
        currentUser = null;
        return null;
    }
}

async function logout() {
    try {
        await apiRequest('/auth/logout', { method: 'POST' });
        currentUser = null;
        window.location.href = '/index.html';
    } catch (err) {
        showToast('Error logging out', 'error');
    }
}

// ---------- Navbar ----------
function renderNavbar(activePage = '') {
    const nav = document.getElementById('main-navbar');
    if (!nav) return;

    const isLoggedIn = currentUser !== null;
    const isAdmin = currentUser?.role === 'admin';

    nav.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-custom fixed-top">
        <div class="container">
            <a class="navbar-brand" href="/index.html">
                <i class="bi bi-search-heart"></i>
                CampusFind
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    style="border-color: rgba(255,255,255,0.2);">
                <i class="bi bi-list" style="color: #fff; font-size: 1.5rem;"></i>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link ${activePage === 'home' ? 'active' : ''}" href="/index.html">
                            <i class="bi bi-house me-1"></i>Home
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link ${activePage === 'lost' ? 'active' : ''}" href="/lost-items.html">
                            <i class="bi bi-exclamation-circle me-1"></i>Lost Items
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link ${activePage === 'found' ? 'active' : ''}" href="/found-items.html">
                            <i class="bi bi-check-circle me-1"></i>Found Items
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link ${activePage === 'contact' ? 'active' : ''}" href="/contact.html">
                            <i class="bi bi-envelope me-1"></i>Contact
                        </a>
                    </li>
                </ul>
                <ul class="navbar-nav">
                    ${isLoggedIn ? `
                        <li class="nav-item dropdown notification-badge">
                            <a class="nav-link" href="#" data-bs-toggle="dropdown" id="notificationDropdown">
                                <i class="bi bi-bell"></i>
                                <span class="badge" id="notification-count" style="display:none;">0</span>
                            </a>
                            <div class="dropdown-menu dropdown-menu-end notifications-dropdown" id="notification-list">
                                <div class="p-3 text-center text-muted">Loading...</div>
                            </div>
                        </li>
                        ${isAdmin ? `
                        <li class="nav-item">
                            <a class="nav-link ${activePage === 'admin' ? 'active' : ''}" href="/admin.html">
                                <i class="bi bi-speedometer2 me-1"></i>Admin
                            </a>
                        </li>
                        ` : `
                        <li class="nav-item">
                            <a class="nav-link ${activePage === 'dashboard' ? 'active' : ''}" href="/dashboard.html">
                                <i class="bi bi-grid me-1"></i>Dashboard
                            </a>
                        </li>
                        `}
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                                <i class="bi bi-person-circle me-1"></i>${currentUser.name}
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><a class="dropdown-item" href="/dashboard.html"><i class="bi bi-grid me-2"></i>Dashboard</a></li>
                                <li><a class="dropdown-item" href="/report-lost.html"><i class="bi bi-exclamation-triangle me-2"></i>Report Lost</a></li>
                                <li><a class="dropdown-item" href="/report-found.html"><i class="bi bi-hand-thumbs-up me-2"></i>Report Found</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item" href="#" onclick="logout()"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
                            </ul>
                        </li>
                    ` : `
                        <li class="nav-item">
                            <a class="nav-link" href="/login.html">Login</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link btn-nav ms-2" href="/register.html">Register</a>
                        </li>
                    `}
                </ul>
            </div>
        </div>
    </nav>`;

    if (isLoggedIn) {
        loadNotifications();
    }
}

// ---------- Notifications ----------
async function loadNotifications() {
    try {
        const notifications = await apiRequest('/notifications');
        const unread = notifications.filter(n => !n.is_read);
        const countBadge = document.getElementById('notification-count');
        const list = document.getElementById('notification-list');

        if (countBadge) {
            if (unread.length > 0) {
                countBadge.textContent = unread.length;
                countBadge.style.display = 'inline';
            } else {
                countBadge.style.display = 'none';
            }
        }

        if (list) {
            if (notifications.length === 0) {
                list.innerHTML = '<div class="p-3 text-center text-muted"><i class="bi bi-bell-slash"></i><br>No notifications</div>';
            } else {
                list.innerHTML = `
                    <div class="p-2 d-flex justify-content-between align-items-center border-bottom">
                        <strong class="ms-2" style="font-size:0.85rem;">Notifications</strong>
                        <button class="btn btn-sm btn-link text-decoration-none" onclick="markAllRead()" style="font-size:0.8rem;">Mark all read</button>
                    </div>
                    ${notifications.slice(0, 10).map(n => `
                        <div class="notification-item ${n.is_read ? '' : 'unread'}" onclick="markNotificationRead(${n.id})">
                            <p>${n.message}</p>
                            <small>${formatDate(n.created_at)}</small>
                        </div>
                    `).join('')}
                `;
            }
        }
    } catch (err) {
        // Silently fail
    }
}

async function markNotificationRead(id) {
    try {
        await apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
        loadNotifications();
    } catch (err) { }
}

async function markAllRead() {
    try {
        await apiRequest('/notifications/read-all', { method: 'PUT' });
        loadNotifications();
    } catch (err) { }
}

// ---------- Toast Messages ----------
function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = {
        success: 'bi-check-circle-fill text-success',
        error: 'bi-x-circle-fill text-danger',
        warning: 'bi-exclamation-triangle-fill text-warning',
        info: 'bi-info-circle-fill text-primary'
    };

    const toast = document.createElement('div');
    toast.className = `toast-custom toast-${type}`;
    toast.innerHTML = `
        <i class="bi ${icons[type] || icons.info}" style="font-size:1.2rem;"></i>
        <span style="flex:1;font-size:0.9rem;">${message}</span>
        <i class="bi bi-x" style="cursor:pointer;opacity:0.5;" onclick="this.parentElement.remove()"></i>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ---------- Utility Functions ----------
function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getStatusBadge(status) {
    const classes = {
        'Lost': 'status-lost',
        'Found': 'status-found',
        'Claimed': 'status-claimed'
    };
    const icons = {
        'Lost': 'bi-exclamation-circle',
        'Found': 'bi-check-circle',
        'Claimed': 'bi-hand-thumbs-up'
    };
    return `<span class="status-badge ${classes[status] || ''}"><i class="bi ${icons[status] || ''}"></i> ${status}</span>`;
}

function createItemCard(item) {
    const imgHtml = item.image
        ? `<img src="${item.image}" class="item-card-img" alt="${item.item_name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
           <div class="item-card-img-placeholder" style="display:none;"><i class="bi bi-image"></i></div>`
        : `<div class="item-card-img-placeholder"><i class="bi bi-image"></i></div>`;

    return `
    <div class="col-md-6 col-lg-4 mb-4">
        <div class="item-card" onclick="window.location.href='/item-details.html?id=${item.item_id}'" style="cursor:pointer;">
            ${imgHtml}
            <div class="item-card-body">
                <div class="d-flex justify-content-between align-items-start mb-1">
                    <span class="item-card-category">${item.category_name || 'Uncategorized'}</span>
                    ${getStatusBadge(item.status)}
                </div>
                <h5 class="item-card-title">${item.item_name}</h5>
                <p class="item-card-desc">${item.description || ''}</p>
                <div class="item-card-footer">
                    <span class="item-card-location"><i class="bi bi-geo-alt"></i> ${item.location || 'N/A'}</span>
                    <span class="item-card-date">${formatDate(item.date)}</span>
                </div>
            </div>
        </div>
    </div>`;
}

function showLoading(containerId) {
    const el = document.getElementById(containerId);
    if (el) {
        el.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
    }
}

function showEmpty(containerId, message = 'No items found') {
    const el = document.getElementById(containerId);
    if (el) {
        el.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <h5>${message}</h5>
                    <p>Try adjusting your search or filters</p>
                </div>
            </div>
        `;
    }
}

// ---------- Render Footer ----------
function renderFooter() {
    const footer = document.getElementById('main-footer');
    if (!footer) return;

    footer.innerHTML = `
    <footer class="footer">
        <div class="container">
            <div class="row">
                <div class="col-md-4 mb-3">
                    <h5><i class="bi bi-search-heart me-2"></i>CampusFind</h5>
                    <p style="font-size:0.9rem;">Helping the campus community reunite with their lost belongings. Report, search, and claim items easily.</p>
                </div>
                <div class="col-md-2 mb-3">
                    <h5>Quick Links</h5>
                    <a href="/index.html">Home</a>
                    <a href="/lost-items.html">Lost Items</a>
                    <a href="/found-items.html">Found Items</a>
                    <a href="/contact.html">Contact</a>
                </div>
                <div class="col-md-3 mb-3">
                    <h5>Report</h5>
                    <a href="/report-lost.html">Report Lost Item</a>
                    <a href="/report-found.html">Report Found Item</a>
                    <a href="/dashboard.html">My Dashboard</a>
                </div>
                <div class="col-md-3 mb-3">
                    <h5>Contact</h5>
                    <p style="font-size:0.9rem;"><i class="bi bi-geo-alt me-2"></i>Campus Main Office</p>
                    <p style="font-size:0.9rem;"><i class="bi bi-envelope me-2"></i>lostandfound@campus.com</p>
                    <p style="font-size:0.9rem;"><i class="bi bi-telephone me-2"></i>+91 1234567890</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 CampusFind - Lost & Found Management System. All rights reserved.</p>
            </div>
        </div>
    </footer>`;
}

// ---------- Load categories into select ----------
async function loadCategoryOptions(selectId) {
    try {
        const categories = await apiRequest('/items/categories');
        const select = document.getElementById(selectId);
        if (select) {
            categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.id;
                opt.textContent = cat.name;
                select.appendChild(opt);
            });
        }
    } catch (err) { }
}

// ---------- Initialize Page ----------
async function initPage(activePage) {
    await checkAuth();
    renderNavbar(activePage);
    renderFooter();
}

// Protect page - redirect to login if not logged in
async function requireAuth(activePage) {
    await checkAuth();
    if (!currentUser) {
        window.location.href = '/login.html';
        return false;
    }
    renderNavbar(activePage);
    renderFooter();
    return true;
}

// Protect admin page
async function requireAdminAuth() {
    await checkAuth();
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = '/login.html';
        return false;
    }
    renderNavbar('admin');
    return true;
}
