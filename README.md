# Admin-Employee Armtronix Website (PWA)

## Project Overview
This is a Progressive Web App (PWA) developed for Armtronix to manage employee authentication, claims, leave requests, Git repository access, and AI-based automation through an interactive dashboard.

## Features
- **User Authentication**: Secure login with JWT/session-based authentication.
- **Admin Dashboard**: Centralized access to company resources.
- **Git Portal**: Git commands reference and repository management.
- **Cloudflare Portal**: Traffic monitoring, DDoS protection, and SSL management.
- **AI/GPT Portal**: AI-powered document generation and automation tools.
- **Annotation Portal**: Multi-format annotation for AI model training.
- **Claim & Leave Management**: Employees can submit requests, and admins can process them.
- **Real-time Notifications**: WebSocket-based updates for leave and claim status.
- **Employee Profile Management**: Admins can register and manage employees.
- **Progressive Web App**: Installable on devices with improved performance and user experience.

## Technologies Used
- **Frontend**: React+Vite, JavaScript, HTML, CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Auth**: JWT (JSON Web Token)
- **PWA**: Service Workers, Web Manifest
- **Package Manager**: npm


## Project Structure
```
/frontend                   # React-based client-side code
  ├── public/          
  │   ├── manifest.json     # PWA manifest file
  │   ├── service-worker.js # PWA service worker
  │   ├── icons/            # App icons for different platforms
  ├── src/
/backend                    # Express-based API and authentication logic
  ├── server.js             # Backend entry point
  ├── routes/               # API endpoints
  ├── models/               # Database models
  ├── controllers/          # Business logic
  ├── .env                  # Environment variables
  ├── package.json          # Dependencies and scripts
```

## Installation & Setup

### Prerequisites
```bash
# Install Node.js and npm (if not installed)
https://nodejs.org/

# Install MongoDB (if not installed)
https://www.mongodb.com/docs/manual/installation/

```

### Steps to Run Locally
```bash
# Clone the repository
git clone https://github.com/your-repo.git
cd your-repo

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Create a .env file in the backend folder and add the following:
MONGO_URI=your_mongo_connection
JWT_SECRET=your_jwt_secret

# Run the backend server
cd backend
node server.js

# Run the frontend
cd frontend
npm run dev
```

## PWA Installation

The application can be installed on supported devices by:

- Opening the website in a compatible browser
- Clicking the "Add to Home Screen" option in the browser menu
- Following the installation prompts

## Future Enhancements
- Implement multi-factor authentication (MFA)
- Optimize UI/UX for better experience
- Enhance security and API response times
- Integrate AI-driven analytics
