# 🏥 Health Pulse - Crowdsourced Health Reporting System

A comprehensive React Native Expo app that combines city health visualization with real-time crowdsourced health reporting on interactive maps.

## 🚀 Features

### 📱 **Existing Features (Health City Dashboard)**
- Firebase Authentication (Login/Signup)
- Searchable Country Dropdown
- Health Districts Visualization
- City Health Statistics

### 🗺️ **New Crowdsourced Health Reporting Features**
- **Interactive Map Interface** with Google Maps
- **Real-time Health Report Markers** with custom icons
- **Location-based Report Creation** (tap map or use current location)
- **Comprehensive Report Form** with validation
- **Live Updates** via Firestore real-time listeners
- **Smart Marker Icons** based on report content
- **Tab Navigation** between Dashboard and Health Reports

## 🛠️ Technical Stack

- **React Native** with Expo SDK 53
- **Firebase Auth** for user authentication
- **Firestore** for real-time data storage
- **Google Maps** for interactive mapping
- **Expo Location** for GPS functionality
- **React Hooks** for state management

## 📋 Setup Instructions

### 1. **Install Dependencies**
```bash
# Core dependencies are already installed
npm install

# Install additional Expo location services
npx expo install expo-location
```

### 2. **Firebase Configuration**
- ✅ Already configured in `src/config/firebase.js`
- ✅ Firestore collection structure: `reports` and `users`
- ✅ Real-time listeners enabled

### 3. **Google Maps Setup**
- ✅ API Key configured in `app.json`
- ✅ iOS and Android permissions added
- ✅ Location permissions configured

### 4. **Firestore Security Rules**
Add these rules to your Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read all reports
    match /reports/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                   request.auth.uid == resource.data.userId;
    }
    
    // Allow users to manage their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                        request.auth.uid == userId;
    }
  }
}
```

### 5. **Run the App**
```bash
# Start Expo development server
npx expo start

# For iOS
npx expo start --ios

# For Android  
npx expo start --android
```

## 🎯 App Navigation

### **Tab 1: Overview**
- City health statistics
- Neighborhood districts visualization
- Health metrics display

### **Tab 2: Health Reports**
- Interactive Google Maps
- Real-time health report markers
- Location-based report creation
- Live updates from community

## 📍 Report Creation Workflow

1. **Select Location**
   - Tap anywhere on the map, OR
   - Use FAB (+) button for current location

2. **Fill Report Form**
   - Title (3-100 characters)
   - Description (10-500 characters)
   - Location (auto-filled from map selection)

3. **Submit Report**
   - Validation and Firebase storage
   - Real-time updates to all users
   - Success confirmation

## 🎨 Smart Marker Icons

Reports automatically display contextual icons based on content:

- 🏭 **Air Pollution** - air, pollution keywords
- 💧 **Water Issues** - water, drinking keywords  
- 🗑️ **Waste Management** - waste, garbage keywords
- 🔊 **Noise Pollution** - noise keywords
- 🦠 **Disease Reports** - disease, illness keywords
- 🧠 **Mental Health** - mental, stress keywords
- 🍎 **Food Safety** - food, nutrition keywords
- ⚕️ **General Health** - default icon

## 📱 User Experience Features

### **Location Services**
- Automatic current location detection
- Permission handling with fallback
- Singapore default location
- Smooth map animations

### **Real-time Updates**
- Instant report visibility
- Live marker updates
- Automatic data synchronization
- Offline handling

### **Form Validation**
- Character limits and requirements
- Error messaging
- Loading states
- Input sanitization

## 🔧 Technical Architecture

```
src/
├── components/
│   ├── MapScreen.js          # Main map interface
│   ├── ReportModal.js        # Report creation form
│   └── CustomMarker.js       # Smart map markers
├── config/
│   └── firebase.js           # Firebase configuration
└── styles/
    └── styles.js             # Comprehensive styling
```

## 🌟 Key Features Implemented

### ✅ **Authentication System**
- Email/password login and signup
- Country selection dropdown
- User profile storage
- Session persistence

### ✅ **Interactive Mapping**
- Google Maps integration
- Current location detection
- Tap-to-create functionality
- Marker clustering (auto-handled)

### ✅ **Real-time Data**
- Firestore real-time listeners
- Automatic UI updates
- Error handling and retry logic
- Network status awareness

### ✅ **Mobile-First Design**
- Responsive layouts
- Touch-friendly interactions
- Loading states
- Error boundaries

## 🚀 Deployment

### **Expo Build**
```bash
# Build for iOS
npx expo build:ios

# Build for Android
npx expo build:android
```

### **Environment Variables**
- Google Maps API Key: `AIzaSyA0TwinKuJzfZ1ZnROtsR6Mag8lZ1L3tSo`
- Firebase Config: Pre-configured in `firebase.js`

## 🔒 Security Features

- Authentication required for all operations
- User-scoped data access
- Input validation and sanitization
- Firestore security rules
- API key restrictions (configure in Google Cloud Console)

## 📈 Performance Optimizations

- Limited query results (100 reports max)
- Efficient re-rendering with proper keys
- Optimized map marker clustering
- Lazy loading for large datasets
- Memory leak prevention

## 🐛 Troubleshooting

### **Common Issues**

1. **Maps not loading**
   - Check Google Maps API key
   - Verify billing account in Google Cloud Console
   - Ensure Maps SDK is enabled

2. **Location not working**
   - Check app permissions in device settings
   - Verify location services are enabled
   - Test on physical device (not simulator)

3. **Firebase connection issues**
   - Check internet connectivity
   - Verify Firebase project configuration
   - Check Firestore security rules

## 🎉 Success! 

Your Health Pulse app now includes:
- ✅ Complete authentication system
- ✅ Interactive health reporting maps  
- ✅ Real-time community updates
- ✅ Professional UI/UX design
- ✅ Production-ready architecture

Ready to crowdsource community health data! 🌟 