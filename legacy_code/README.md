# 🔍 Campus Lost & Found Management System

A full-stack web application for managing lost and found items on campus. Built as a DBMS college project using Node.js, Express, MySQL, and Bootstrap 5.

## ✨ Features

- **User Authentication** — Register, login, and manage sessions
- **Report Lost/Found Items** — With image upload and category selection
- **Search & Filter** — Find items by name, category, or location
- **Claim System** — Submit and manage claims on items
- **Admin Dashboard** — Manage users, items, categories, and view statistics
- **Notifications** — Real-time notification system for claims and status updates
- **Responsive Design** — Works on desktop, tablet, and mobile

## 🛠 Prerequisites

- **Node.js** (v16 or higher) — [Download](https://nodejs.org/)
- **MySQL** (v5.7 or higher) — [Download](https://dev.mysql.com/downloads/)

## 🚀 Setup & Run

### 1. Install Dependencies

```bash
cd dbms_project
npm install
```

### 2. Setup Database

Open MySQL command line or a tool like MySQL Workbench, then run:

```sql
source database/schema.sql;
source database/seed.sql;
```

Or via terminal:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 3. Configure Environment

Edit the `.env` file with your MySQL credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=campus_lost_found
DB_PORT=3306
```

### 4. Start the Server

```bash
npm start
```

Open your browser and visit: **http://localhost:3000**

## 👤 Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@campus.com | admin123 |
| User | rahul@student.com | password123 |
| User | priya@student.com | password123 |
| User | amit@student.com | password123 |

## 📁 Project Structure

```
dbms_project/
├── config/
│   └── db.js              # MySQL connection pool
├── database/
│   ├── schema.sql          # Database schema
│   └── seed.sql            # Sample data
├── middleware/
│   └── auth.js             # Authentication middleware
├── public/
│   ├── css/style.css       # Custom styles
│   ├── js/app.js           # Shared JavaScript
│   ├── uploads/            # Uploaded images
│   ├── index.html          # Home page
│   ├── login.html          # Login page
│   ├── register.html       # Registration page
│   ├── dashboard.html      # User dashboard
│   ├── report-lost.html    # Report lost item
│   ├── report-found.html   # Report found item
│   ├── lost-items.html     # Browse lost items
│   ├── found-items.html    # Browse found items
│   ├── item-details.html   # Item detail view
│   ├── admin.html          # Admin dashboard
│   └── contact.html        # Contact page
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── items.js            # Items CRUD routes
│   ├── claims.js           # Claims routes
│   ├── admin.js            # Admin routes
│   └── notifications.js    # Notifications routes
├── .env                    # Environment variables
├── package.json            # Dependencies
├── server.js               # Express server entry
└── README.md               # This file
```

## 📊 Database Schema

- **users** — User accounts (id, name, email, student_id, password, role)
- **categories** — Item categories (id, name, icon)
- **items** — Lost/Found items (item_id, item_name, category_id, description, location, date, image, status, user_id)
- **claims** — Item claims (claim_id, item_id, user_id, message, status)
- **notifications** — User notifications (id, user_id, message, is_read)

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Get current user |
| GET | /api/items | List items (with filters) |
| GET | /api/items/:id | Get single item |
| POST | /api/items | Create item |
| PUT | /api/items/:id | Update item |
| DELETE | /api/items/:id | Delete item |
| POST | /api/claims | Submit claim |
| GET | /api/claims/:itemId | Get claims for item |
| PUT | /api/claims/:id | Update claim status |
| GET | /api/admin/stats | Dashboard statistics |
| GET | /api/admin/users | List all users |
| DELETE | /api/admin/users/:id | Delete user |
| GET | /api/admin/items | List all items |
| PUT | /api/admin/items/:id/status | Update item status |
| DELETE | /api/admin/items/:id | Delete item |
| GET/POST/DELETE | /api/admin/categories | Manage categories |
| GET | /api/notifications | Get notifications |
| PUT | /api/notifications/:id/read | Mark read |

## 📝 Built With

- **Frontend:** HTML5, CSS3, JavaScript, Bootstrap 5
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Authentication:** bcryptjs, express-session
- **File Upload:** Multer
