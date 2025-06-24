# Kirtan Samagam - Event Management Platform

A modern web platform for managing and displaying Sikh religious events (Kirtan Samagams) with Firebase backend integration.

## Features

- **Event Submission**: Users can submit new events through a comprehensive form
- **Admin Panel**: Secure admin interface for event approval/rejection
- **Real-time Database**: Firebase Firestore integration for data persistence
- **Authentication**: Firebase Authentication for admin access
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Live Events**: Support for streaming links and live event indicators

## Setup Instructions

### 1. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable the following services:
   - **Authentication** (Email/Password provider)
   - **Firestore Database**
3. Get your Firebase configuration from Project Settings > General > Your apps
4. Update `js/firebase-config.js` with your Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
};
```

### 2. Firestore Security Rules

Set up the following security rules in Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Events collection - read for all, write for authenticated users
    match /events/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Admins collection - only authenticated users can read/write
    match /admins/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Authentication Setup

1. In Firebase Console, go to Authentication > Sign-in method
2. Enable "Email/Password" provider
3. Run the admin setup by opening `setup-admin.html` in your browser
4. Create an admin account with email and password
5. **Important**: Delete `setup-admin.html` after creating the admin account for security

### 4. Local Development

1. Clone or download the project files
2. Serve the files using a local web server (required for ES6 modules):

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

3. Open `http://localhost:8000` in your browser

### 5. File Structure

```
kirtansamagam/
├── index.html              # Homepage
├── submit.html             # Event submission form
├── admin.html              # Admin panel
├── setup-admin.html        # One-time admin setup (delete after use)
├── css/
│   └── styles.css          # Custom styles
├── js/
│   ├── firebase-config.js  # Firebase configuration
│   ├── main.js            # Main application logic
│   ├── submit-form.js     # Form submission handling
│   └── admin.js           # Admin panel functionality
├── images/
│   ├── khanda.svg         # Logo
│   └── favicon.svg        # Favicon
└── README.md              # This file
```

## Usage

### For Users

1. Visit the homepage to view upcoming events
2. Click "Submit Event" to add a new samagam
3. Fill out the comprehensive form with event details
4. Events will be pending approval until reviewed by admin

### For Admins

1. Go to `/admin.html`
2. Login with your admin credentials
3. Review pending events in the admin panel
4. Approve or reject events with optional feedback
5. Manage all events from the dashboard

## Database Schema

### Events Collection

```javascript
{
  title: string,
  description: string,
  poster: string,           // filename
  eventDate: string,        // YYYY-MM-DD
  startTime: string,        // HH:MM
  endTime: string,          // HH:MM
  locationName: string,
  fullAddress: string,
  isOnline: boolean,
  streamingLink: string,
  contactName: string,
  contactInfo: string,
  organizer: string,
  additionalNotes: string,
  termsAccepted: boolean,
  submittedAt: timestamp,
  approved: boolean
}
```

### Admins Collection

```javascript
{
  uid: string,
  email: string,
  role: string,             // "admin"
  createdAt: timestamp,
  isActive: boolean
}
```

## Security Features

- Firebase Authentication for admin access
- Firestore security rules to protect data
- Input validation and sanitization
- HTTPS enforcement in production
- Admin-only event approval system

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore + Authentication)
- **Icons**: Heroicons (via Tailwind)
- **Fonts**: Google Fonts (Mukta)

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues or questions, please contact: info@kirtansamagam.com

---

**Note**: Remember to delete `setup-admin.html` after creating your admin account for security purposes.
