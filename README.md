# Amrutam Doctor Portal

A full-stack doctor portal application with React frontend and Node.js backend.

## Project Structure

```
amrutam-doctor-portal-main/
├── frontend/          # React frontend application
│   ├── src/          # React source code
│   ├── public/       # Static assets
│   ├── package.json  # Frontend dependencies
│   └── ...
├── backend/          # Node.js backend application
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── package.json  # Backend dependencies
│   └── ...
└── README.md         # This file
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Running the Application

#### 1. Start the Backend Server

```bash
cd backend
npm install
npm start
```

The backend server will run on `http://localhost:3001`

#### 2. Start the Frontend Development Server

```bash
cd frontend
npm install
npm run dev
```

The frontend application will run on `http://localhost:5173`

### Available Scripts

#### Frontend (in `frontend/` directory)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

#### Backend (in `backend/` directory)
- `npm start` - Start the server
- `npm run dev` - Start in development mode with nodemon

---

## 🤝 Contributing

### Backend
- RESTful API endpoints
- MongoDB database integration
- JWT authentication
- Doctor management system
- Consultation and appointment handling
- Payment processing
- Contact form processing

## API Endpoints

### Doctors
- `POST /api/doctors/register` - Register new doctor
- `POST /api/doctors/login` - Doctor login
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/stats/summary` - Get doctor statistics

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contact inquiries

### Consultations
- `POST /api/consultations` - Create consultation
- `GET /api/consultations/doctor/:id` - Get doctor consultations
- `GET /api/consultations/stats/summary` - Get consultation statistics

### Appointments
- `POST /api/appointments` - Book appointment
- `GET /api/appointments/doctor/:id` - Get doctor appointments
- `PUT /api/appointments/:id/status` - Update appointment status

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/complete` - Complete payment
- `GET /api/payments/earnings/:doctorId` - Get earnings summary

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3001
```

## Technologies Used

### Frontend
- React 18
- Vite
- React Router DOM
- CSS3 with custom styling
- Fetch API for HTTP requests

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests
- Helmet for security

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

