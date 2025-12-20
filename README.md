# Techspert - Online Learning Platform

A modern, full-featured online learning platform built with React and Firebase.

## 🚀 Features

### Course Management
- Browse and view detailed course information
- Course filtering and search
- Admin panel for course CRUD operations

### Demo Class Registration
- Register for free demo sessions
- **Automatic email notifications** via Firebase Cloud Functions
- Lead tracking and pipeline management

### Contact & Enquiries
- Contact form with automatic email confirmation
- Admin enquiry management with color-coded statuses:
  - 🔵 Blue: New enquiries
  - 🟢 Green: In Progress
  - 🔴 Red: Resolved

### Admin Dashboard
- Complete content management system
- User and admin management
- Lead pipeline tracking
- Demo class management

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Firebase (Firestore, Auth, Cloud Functions)
- **Email**: Firebase Cloud Functions + Nodemailer
- **UI Components**: Framer Motion, Lucide Icons, Sonner

## 📧 Automatic Email System

The platform uses Firebase Cloud Functions to automatically send emails:

1. **Demo Registration**: When a user registers for a demo, they receive:
   - Welcome email with session details
   - Course information
   - Demo link (if available)

2. **Contact Enquiries**: When a user submits an enquiry, they receive:
   - Confirmation email
   - Copy of their message

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Firebase account with Blaze plan (for Cloud Functions)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/techspert.git

# Navigate to client folder
cd techspert/client

# Install dependencies
npm install

# Start development server
npm run dev
```

### Firebase Setup

1. Create a Firebase project
2. Enable Firestore and Authentication
3. Deploy Cloud Functions for email automation

### Environment Variables

Create a `.env` file in the functions folder:
```
GMAIL_EMAIL=your-email@gmail.com
GMAIL_PASSWORD=your-app-password
```

## 📁 Project Structure

```
techspert/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── routes/        # Page components
│   │   ├── services/      # Firebase services
│   │   └── contexts/      # React contexts
│   └── functions_code/    # Cloud Functions source
├── functions/             # Deployed Cloud Functions
└── firebase.json
```

## 🔑 Key Components

| Component | Description |
|-----------|-------------|
| `FreeDemoModal` | Demo registration with course selection |
| `AdminEnquiriesManagement` | Manage enquiries with status tracking |
| `AdminLeadsOverview` | Lead pipeline and demo registrations |
| `Contact` | Contact form with auto-confirmation |

## 📝 License

MIT License

## 👨‍💻 Author

Techspert Team
