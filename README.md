# Supermarket Inventory Management System

**Student Name:** BRIGHT ASSEM OJOBE  
**Matric Number:** 24/CSC/237 
**Assigned Inventory Type:** Supermarket  
**Project:** Software Engineering Industrial Training (SE-IT)

## Description
A full-stack inventory management system for a supermarket. It provides secure user registration/login, a dashboard, product CRUD operations, category and supplier management through REST APIs, product search/filtering, stock increase/reduction, and stock history.

> If your instructor assigned a different inventory domain, replace the supermarket-specific labels/sample data with your assigned domain before submission.

## Technologies
- Node.js
- Express.js
- MySQL
- HTML5/CSS3
- Bootstrap 5
- Vanilla JavaScript
- Git/GitHub
- JWT authentication
- bcrypt password hashing

## Features
- User registration and login
- Password hashing with bcrypt
- JWT authentication
- Dashboard statistics
- Add/edit/delete/view products
- Product search and category filtering
- Categories and suppliers CRUD APIs
- Increase/reduce stock
- Stock history
- Client-side and server-side validation
- API error handling
- Responsive Bootstrap interface

## Folder Structure
```text
inventory-management-system/
├── app.js
├── db.js
├── package.json
├── .env.example
├── .gitignore
├── README.md
├── database/
│   └── schema.sql
├── middleware/
│   └── auth.js
├── routes/
│   ├── auth.js
│   ├── categories.js
│   ├── dashboard.js
│   ├── products.js
│   ├── stock.js
│   └── suppliers.js
└── public/
    ├── index.html
    ├── style.css
    └── app.js
```

## Installation
1. Install Node.js and MySQL.
2. Create a MySQL database by running `database/schema.sql`.
3. Copy `.env.example` to `.env`.
4. Enter your MySQL username/password and a strong JWT secret in `.env`.
5. Install dependencies:
```bash
npm install
```
6. Start the application:
```bash
npm start
```
7. Open:
```text
http://localhost:3000
```

## API Endpoints
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/dashboard`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`
- `GET /api/suppliers`
- `POST /api/suppliers`
- `PUT /api/suppliers/:id`
- `DELETE /api/suppliers/:id`
- `POST /api/stock/adjust`
- `GET /api/stock/history`

All endpoints except registration/login/health require a JWT in the `Authorization: Bearer TOKEN` header.

## Example Product JSON
```json
{
  "name": "Rice 5kg",
  "sku": "SUP-RICE-05",
  "price": 8500,
  "quantity": 25,
  "reorder_level": 5,
  "category_id": 1,
  "supplier_id": 1
}
```

## Git Commit Plan
Use several meaningful commits rather than one upload:
```bash
git init
git add package.json .gitignore .env.example
git commit -m "chore: initialize inventory project"

git add database db.js
git commit -m "feat: add MySQL database schema"

git add middleware routes app.js
git commit -m "feat: add authenticated inventory APIs"

git add public
git commit -m "feat: add responsive inventory dashboard"

git add README.md
git commit -m "docs: add setup and API documentation"

git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## Submission Checklist
- [ ] Public GitHub repository
- [ ] `package.json`
- [ ] `app.js`
- [ ] MySQL `.sql` export
- [ ] `README.md`
- [ ] Frontend files
- [ ] Meaningful Git history
- [ ] 2–3 screenshots of tested application/endpoints
- [ ] Final GitHub repository URL

## Suggested Screenshots
Take real screenshots after running the project:
1. Login/dashboard showing the statistics cards.
2. Products table showing CRUD/search functionality.
3. API test in Postman/Thunder Client showing a successful POST and GET response.

Do not submit fabricated screenshots; use screenshots from your own running application.
