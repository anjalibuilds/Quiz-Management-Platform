# Quiz Management Platform

A full-stack online quiz management platform with separate Admin and Student dashboards.

## Features

### Student
- Student registration and login
- Browse published quizzes
- Search and filter quizzes
- Start and attempt quizzes
- Quiz timer
- Automatic quiz submission
- Result and score calculation
- Attempt history
- Detailed attempt results
- Personal statistics
- Leaderboard

### Admin
- Admin login
- Dashboard statistics
- Student management
- Student profiles
- Quiz management
- Category management
- Question management
- Quiz attempts management
- Individual student results
- Leaderboard
- Activate/deactivate student accounts

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Python
- Flask
- Flask-JWT-Extended
- Flask-Bcrypt
- SQLAlchemy

### Database
- MySQL

## Project Structure

```text
Quiz-Management-Platform/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── app.py
│   ├── config.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
