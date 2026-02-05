# BodyFlow 🥗💪  
**Nutrition & Meal Planning Web Service**

BodyFlow is a full-stack web application for nutrition planning and food analysis.  
The service helps users explore food products, nutrients, and build balanced meal plans.

The project is built as a modern **Vue 3 / Nuxt 3 (SSR)** frontend with a **PHP API backend**, designed with scalability, SEO, and clean architecture in mind.

---

## ✨ Key Features

- 📊 Food products and categories with nutritional data  
- 🍽 Meal plan generation  
- 🌍 Multi-language support (RU / EN / UA)  
- ⚡ Server-Side Rendering (SSR) for better SEO  
- 🧩 Modular and scalable architecture  
- 🎨 Custom UI and design system  

---

## 🛠 Tech Stack

### Frontend
- **Vue 3**
- **Nuxt 3 (SSR)**
- Pinia (state management)
- Nuxt i18n (multi-language routing)
- SCSS (custom design system)

### Backend
- **PHP API**
- REST-style endpoints
- JSON responses

---

## 📂 Project Structure

bodyflow-app/
├── frontend/   # Nuxt 3 SSR application
└── backend/    # PHP API

## Environment Variables

The frontend requires an API base URL.

Create a .env file inside the frontend folder:

NUXT_PUBLIC_API_BASE=http://nutrition-n.test/api


See .env.example for reference.

🚀 Frontend Setup

Install dependencies:

cd frontend
npm install


Run development server:

npm run dev


The app will be available at:

http://localhost:3000

🔧 Backend Setup

The backend is a PHP-based API.

Place the backend folder into your local PHP server environment
(OpenServer, XAMPP, MAMP, or similar)

Configure your local domain (e.g. nutrition-n.test)

Ensure the API is accessible via:

http://nutrition-n.test/api

🌐 Deployment

Frontend: Vercel (Nuxt 3 SSR)

Backend: Any PHP-compatible hosting or VPS

The frontend communicates with the backend via the NUXT_PUBLIC_API_BASE environment variable.

📌 Project Status

BodyFlow is an actively developed project.
New features, UI improvements, and optimizations are continuously added.

👩‍💻 Author

BodyFlow — personal full-stack project focused on nutrition, health, and modern web technologies.