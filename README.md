E-Commerce Platform

A full-stack e-commerce application built with Node.js, Express, React, and Sequelize. Includes authentication, product management, cart, orders, and an AdminJS dashboard.

📁 Project Structure
backend/  - Express API + AdminJS  
frontend/ - React (Vite)

✨ Features

User authentication

Product & category management

Shopping cart & orders

Admin dashboard (AdminJS)

Responsive UI

🛠 Tech Stack

Backend: Node.js, Express, Sequelize, AdminJS, MySQL/PostgreSQL/SQLite, JWT, bcrypt
Frontend: React, Vite, React Router, Axios
Database: Models, migrations, associations, validation

🚀 Installation
Backend
cd backend
npm install
npm run migrate
npm start

Frontend
cd frontend
npm install


Create .env:

VITE_API_URL=http://localhost:5000


Run:

npm run dev

🗄 Models

User, Product, Category, Order, OrderItem, Cart, Settings

🔗 API

RESTful endpoints for:

Authentication

Products & categories

Orders & order items

Cart

Settings

🛠 Admin Dashboard

Available at /admin

Auto CRUD

Search, filter, pagination

Bulk actions

🤝 Contributing

Create a feature branch

Commit changes

Push

Open a Pull Request
