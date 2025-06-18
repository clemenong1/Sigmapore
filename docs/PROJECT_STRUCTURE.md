# 📁 Project Structure Documentation

## Overview
This document provides a detailed breakdown of the Singapore Health Pulse project structure, explaining the purpose of each directory and file.

## Directory Structure

```
Sigmapore/
├── 📱 src/                          # Main source code
│   ├── 🖥️ components/              # Core application screens
│   │   ├── HomeScreen.js           # Main dashboard with live health stats
│   │   ├── QuizScreen.js           # Daily health quiz with leaderboard
│   │   ├── ReportScreen.js         # Community health reporting system
│   │   ├── MapScreen.js            # Basic map component
│   │   ├── InfoScreen.js           # User profile management
│   │   └── CustomButton.js         # Reusable UI component
│   ├── 🎨 styles/                  # Styling and themes
│   │   └── styles.js               # Centralized styling system
│   └── ⚙️ config/                  # Configuration files
│       └── firebase.js             # Firebase setup and configuration
├── 🔧 components/                   # Specialized components
│   ├── HealthChatbot.tsx           # AI-powered health assistant
│   ├── ChatbotButton.tsx           # Floating chatbot toggle button
│   ├── SingaporeMapScreen.js       # Advanced interactive map with data layers
│   ├── HealthDataHeatmap.tsx       # Comprehensive health data visualization
│   └── MiniHeatmap.tsx             # Compact heatmap for chatbot responses
├── 🌐 services/                     # External API integrations
│   ├── services/                   # Service implementations
│   │   └── chatbotService.ts       # OpenAI API integration for chatbot
│   └── index.js                    # Service exports and configurations
├── 🖼️ assets/                       # Static resources
│   ├── Screenshot_2025-06-18_at_3.30.31_AM-removebg-preview.png  # App logo
│   ├── icon.png                    # App icon
│   ├── splash-icon.png             # Splash screen icon
│   ├── favicon.png                 # Web favicon
│   └── adaptive-icon.png           # Android adaptive icon
├── 📚 docs/                         # Documentation
│   ├── CHATBOT_FEATURES.md         # Detailed chatbot functionality
│   ├── ENHANCED_CHATBOT_FEATURES.md # Advanced chatbot capabilities
│   ├── SETUP.md                    # Setup and installation guide
│   ├── README_CROWDSOURCED_HEALTH.md # Community health features
│   └── PROJECT_STRUCTURE.md        # This file
├── 🛠️ utils/                        # Utility files and configurations
│   ├── firebaseConfig.js           # Firebase project configuration
│   ├── firestore.rules             # Firestore security rules
│   ├── firestore.indexes.json      # Database indexes configuration
│   ├── firebase.json               # Firebase hosting configuration
│   ├── react-native-vector-icons.d.ts # TypeScript declarations
│   └── react-native-chart-kit.d.ts # Chart library type definitions
├── 📊 data/                         # Data files (if any)
├── 🏗️ App.tsx                       # Main application entry point
├── 📋 index.ts                      # Expo entry point
├── 📦 package.json                  # Dependencies and scripts
├── 🔧 app.json                      # Expo configuration
├── ⚙️ app.config.js                 # Dynamic Expo configuration
├── 🏗️ metro.config.js               # Metro bundler configuration
├── 📝 tsconfig.json                 # TypeScript configuration
├── 🚫 .gitignore                    # Git ignore rules
├── 🔐 .env                          # Environment variables (not in repo)
└── 📖 README.md                     # Main project documentation
```

## Core Components Breakdown

### 🏠 Home Dashboard (`src/components/HomeScreen.js`)
- **Live Population Statistics**: Updates every 10 seconds with real-time data
- **Health Metrics**: Dengue cases, air quality, life expectancy
- **Interactive Charts**: 7-day dengue trends using react-native-chart-kit
- **Multi-language Support**: 5 languages with React Context
- **Demographic Data**: Live birth/death/migration tracking

### 🤖 AI Chatbot System
#### `components/HealthChatbot.tsx`
- OpenAI GPT integration for intelligent responses
- Location-aware health recommendations
- Interactive heatmap integration
- Predictive health analytics
- Real-time typing indicators

#### `components/ChatbotButton.tsx`
- Floating action button for chatbot access
- Restricted to home screen only
- Smooth animations and transitions

#### `services/services/chatbotService.ts`
- OpenAI API integration
- Message processing and formatting
- Health data integration
- Error handling and fallbacks

### 📝 Quiz System (`src/components/QuizScreen.js`)
- Daily health questions with rotating content
- Firebase integration for user progress
- Point-based scoring system (10 points per correct answer)
- Community leaderboard with rankings
- Answer history and statistics tracking

### 📊 Reporting System (`src/components/ReportScreen.js`)
- 8 health report categories
- GPS location integration with address detection
- Firebase Firestore for data persistence
- Real-time report status tracking
- Community verification system

### 🗺️ Map System
#### `components/SingaporeMapScreen.js`
- Advanced interactive map with Leaflet
- 3 data layers: Dengue, PSI, COVID-19
- Real-time government API integration
- Custom markers with detailed popups
- Risk level color coding

#### `src/components/MapScreen.js`
- Basic map component for simple use cases
- Lightweight alternative to advanced map

### 🎨 Styling System (`src/styles/styles.js`)
- Centralized styling for consistent UI
- Dark theme optimized for health data
- Responsive design for all screen sizes
- Color-coded health indicators
- Accessibility-friendly contrast ratios

### ⚙️ Configuration
#### Firebase Setup (`src/config/firebase.js`)
- Authentication configuration
- Firestore database setup
- Security rules and indexes
- Collection definitions

#### Utility Configurations (`utils/`)
- TypeScript declarations for React Native libraries
- Firebase project settings
- Security rules for data protection
- Database indexes for performance optimization

## Data Flow Architecture

```
User Input → React Native Components → Firebase/OpenAI APIs → Data Processing → UI Updates
     ↑                                                                            ↓
     └─────────────────── Real-time Updates ←─────────────────────────────────────┘
```

### Authentication Flow
1. User registration/login via Firebase Auth
2. User profile creation in Firestore
3. Session management with React Context
4. Multi-language preference storage

### Data Synchronization
1. **Real-time Updates**: Population data updates every 10 seconds
2. **API Integration**: Singapore government APIs for health data
3. **Offline Support**: Cached data for offline viewing
4. **Cross-platform Sync**: Data synchronized across devices

## Development Guidelines

### File Naming Conventions
- **Components**: PascalCase (e.g., `HealthChatbot.tsx`)
- **Screens**: PascalCase with "Screen" suffix (e.g., `HomeScreen.js`)
- **Services**: camelCase with "Service" suffix (e.g., `chatbotService.ts`)
- **Utilities**: camelCase (e.g., `firebaseConfig.js`)

### Import Structure
```javascript
// External libraries
import React from 'react';
import { View, Text } from 'react-native';

// Internal components
import CustomButton from './CustomButton';

// Services and utilities
import { chatbotService } from '../services';

// Styles
import { styles } from '../styles/styles';
```

### Component Organization
- **Functional Components**: Use hooks for state management
- **TypeScript**: For type safety in critical components
- **Context API**: For global state (language, user data)
- **Error Boundaries**: For graceful error handling

## Security Considerations

### API Key Management
- Environment variables for sensitive keys
- Firebase security rules for data protection
- User authentication for all data access

### Data Privacy
- Location data with user consent
- Encrypted data transmission
- GDPR compliance for international users
- Secure user profile management

## Performance Optimizations

### Bundle Size
- Code splitting for large components
- Lazy loading for non-critical features
- Optimized images and assets

### Runtime Performance
- Efficient re-rendering with React.memo
- Debounced API calls
- Cached data for offline support
- Optimized database queries

## Testing Strategy

### Unit Tests
- Component rendering tests
- Service function tests
- Utility function validation

### Integration Tests
- API integration testing
- Database operation tests
- Authentication flow tests

### End-to-End Tests
- User journey testing
- Cross-platform compatibility
- Performance benchmarking

---

This structure ensures maintainability, scalability, and clear separation of concerns for the Singapore Health Pulse application. 