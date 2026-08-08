# Mini ERP + CRM Operations Portal (Nexora-ERP)

This project is a small ERP/CRM system designed for a wholesale/distribution company. It manages customers, products, stock, sales challans, and basic CRM follow-ups, with role-based access control.

## 🏗️ Architecture Overview

The system follows a standard Client-Server architecture utilizing a RESTful API.
- **Backend:** Node.js with Express.js framework, utilizing JavaScript. It uses a layered architecture separating routes, controllers, and database models.
- **Database:** MySQL for relational data storage, managed through the `mysql2` promise wrapper for async/await support.
- **Authentication:** Stateless authentication using JSON Web Tokens (JWT) and role-based access control middleware.
- **Frontend (Pending):** A React-based Single Page Application (SPA) communicating with the backend APIs.

## ⚙️ How the Server was Set Up

The backend was scaffolded as a Node.js Express application.
- `express` is used for the web server routing.
- `mysql2` is used for connecting to the MySQL database securely.
- `bcryptjs` is used to hash passwords before storing them.
- `jsonwebtoken` handles the secure, stateless JWT generation for authenticated sessions.
- `express-validator` is used in the route definitions for strict input validation before controllers are executed.
- Structured into standard directories: `config`, `controllers`, `middleware`, `models`, `routes`.

## 🔐 Environment Variables

Environment variables are managed using the `dotenv` package.
A `.env.example` file is provided to indicate the required configuration.
To set this up locally, copy `.env.example` to `.env` in the `backend` directory and fill in your database credentials:

```bash
PORT=5000
DB_HOST=127.0.0.1
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
JWT_SECRET=your_super_secret_key
```

## 🚀 How to Run the Project Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/KuldipRana03/Nexora-ERP.git
   cd Nexora-ERP
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   
3. **Database Initialization:**
   Ensure MySQL is running on your machine. Update the `.env` file with your MySQL credentials.
   Then run the schema setup and seeding scripts:
   ```bash
   node run_schema.js
   node seed.js
   ```

4. **Start the Server:**
   ```bash
   node server.js
   ```
   The backend API will run on `http://localhost:5000`.

### Frontend (React/Vite)
1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment:**
   No .env file is strictly required if the backend is running on `http://localhost:5000`, as Vite is configured to proxy API requests in development mode, or falls back to it.

3. **Start the Frontend Development Server:**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

## 🌐 How to Deploy the Project

### Database (e.g., Supabase, Neon, or Aiven for MySQL)
1. Provision a free-tier MySQL database online.
2. Obtain the database connection details (Host, User, Password, Database Name, Port).
3. Connect to the remote database locally and run the `run_schema.js` and `seed.js` files by updating your local `.env` to point to the remote DB.

### Backend (e.g., Render, Railway)
1. Connect your GitHub repository to the hosting provider.
2. Set the root directory to `backend` (or define the start command as `cd backend && npm install && node server.js`).
3. Add the required Environment Variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`) in the hosting provider's dashboard.
4. Deploy the service.

### Frontend (e.g., Vercel, Netlify)
1. Connect the repository.
2. Set the framework preset to React (Vite) and root directory to `frontend`.
3. Set the build command to `npm run build` and output directory to `dist`.
4. Ensure your deployed backend API URL is accessible and update any necessary CORS configurations.

## 🔑 Test Login Credentials

Use the following credentials to test role-based access. All passwords are `password123`.

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `password123` |
| **Sales** | `sales@example.com` | `password123` |
| **Warehouse** | `warehouse@example.com` | `password123` |
| **Accounts** | `accounts@example.com` | `password123` |

## 💡 Assumptions Made
- The system operates under a single tenant (a single company).
- Sales Challans act as preliminary invoices. Once a challan is confirmed, stock is immediately deducted.
- Minimum stock alerts are simple integer thresholds verified on the API side.
- JWT tokens do not have a robust revocation strategy (like a Redis blacklist) in this lightweight version; they just expire automatically based on time.

## ⚠️ Known Limitations or Incomplete Parts
- **Email Notifications:** The system does not currently send actual emails for follow-ups or alerts; it relies entirely on API data.
- **Export to PDF (Bonus):** Challans/Invoices cannot currently be exported directly to PDF.
- **S3 Uploads (Bonus):** Product images are not supported yet; only text data is stored.
