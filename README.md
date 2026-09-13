# Salon & Beauty Booking Platform

A full-stack Salon & Beauty Booking Platform developed using the MERN stack. The project provides separate applications for customers, salon owners, and administrators.

## Features

### Customer

- Customer registration and login
- Browse and search salons
- Filter salons by city
- View salon details
- View services and pricing
- View salon staff
- Check available appointment slots
- Book appointments
- View appointment history
- View appointment details
- Cancel appointments
- Submit reviews
- View salon reviews and ratings

### Salon Owner

- Salon owner registration and login
- Manage salon details
- Manage services
- Manage staff
- Manage working hours
- Manage staff leave
- View appointments
- Manage appointments

### Admin

- Admin authentication
- Dashboard with statistics
- Customer management
- Salon management
- Salon owner management
- Staff management
- Service management
- Category management
- Appointment management
- Review management
- Activate and deactivate records

## Technologies Used

### Frontend

- React.js
- React Router
- Bootstrap
- CSS
- Axios
- Chart.js

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Multer

### Mobile

- React Native
- Expo
- Expo Router
- AsyncStorage
- Axios

## Project Structure

```text
salon-booking-platform/
│
├── backend/
├── frontend/
├── customer-mobile/
├── .gitignore
└── README.md

## Requirements
Node.js
npm
MongoDB
Git
Expo
Expo Go or an Android emulator
Installation

## Clone the repository:

git clone https://github.com/SaravanaDVirat/salon-booking-platform.git
cd salon-booking-platform
Backend Setup

## Navigate to the backend folder:

cd backend
npm install

## Create a .env file inside the backend folder and add the required environment variables.

Example:

PORT=1812
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

## Start the backend:

npm start

For development, if nodemon is configured:

npm run dev

The backend runs on:

http://localhost:1812

## Frontend Setup

## Open another terminal and navigate to the frontend folder:

cd frontend
npm install
npm start

The frontend runs on:

http://localhost:3000

## Make sure the frontend API configuration points to the running backend server.

## Customer Mobile Setup

## Navigate to the mobile application:

cd customer-mobile
npm install

## Configure the backend API URL in the environment configuration.

Example:

EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:1812/api

Start the Expo development server:

npx expo start

The application can be tested using Expo Go or an Android emulator.

## Database

The project uses MongoDB as the database.

For local development, MongoDB can be run locally and managed using MongoDB Compass.

For production deployment, MongoDB Atlas can be used as the remote database.

The database itself is not included in this repository.

## Authentication

The application uses JWT-based authentication with role-based access control.

Supported roles:

CUSTOMER
SALON_OWNER
ADMIN

Each role has access to the features and resources required for that type of user.

## Environment Variables

Environment files containing secrets and private configuration are not committed to the repository.

Create the required .env files locally before running the applications.

## Running the Project

Start the backend first:

cd backend
npm install
npm start

Then start the web frontend in another terminal:

cd frontend
npm install
npm start

For the customer mobile application:

cd customer-mobile
npm install
npx expo start

Make sure the backend is running before using the web or mobile applications.

## Author

Udhaya Prakash