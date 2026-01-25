# Real Estate Application - Installation Guide

## Prerequisites

- Node.js (version 20 or higher)
- npm or yarn
- PostgreSQL database (local or cloud)



## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd real-estate
   ```

2. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Install server dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up the database**

   - Create a PostgreSQL database
   - Copy the `.env.example` file in the server directory to `.env`
   - Update the `DATABASE_URL` in `server/.env` with your database connection string

5. **Generate Prisma client and run migrations**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   ```

6. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

## Running the Application

1. **Start the server**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the client** (in a new terminal)
   ```bash
   cd client
   npm run dev
   ```

The application will be available at:
- Client: http://localhost:3000
- Server: http://localhost:8000 (or configured port)

## Additional Commands

- **Build for production**
  ```bash
  # Client
  cd client && npm run build

  # Server
  cd server && npm run build
  ```

- **Run linting**
  ```bash
  cd client && npm run lint
  ```