# 🏥 Singapore Health Pulse

**Comprehensive Health Monitoring & Community Reporting Platform**

A React Native application built for Singapore's health ecosystem, featuring real-time health data visualization, AI-powered health assistance, community reporting, and interactive maps.

![Singapore Health Pulse](./assets/Screenshot_2025-06-18_at_3.30.31_AM-removebg-preview.png)

## 🚀 Quick Start

```bash
git clone https://github.com/clemenong1/Sigmapore.git
cd Sigmapore
npm install
npx expo start
```

## 📱 Run Options

- **Press `w`** - Open in web browser
- **Press `i`** - Open in iOS simulator  
- **Press `a`** - Open in Android emulator
- **Scan QR code** - Run on your phone with Expo Go

## 🌟 Core Features

### 🏠 Home Dashboard
- **Real-time Population Statistics** with live updates every 10 seconds
- **Health Overview** including dengue cases, air quality, and life expectancy
- **Interactive Charts** showing dengue trends and PSI data
- **Multi-language Support** (English, Chinese, Malay, Tamil, Hindi)
- **Dynamic Demographics** with live birth/death/migration tracking

### 🤖 AI Health Chatbot (SigmaBoy)
- **OpenAI-powered** intelligent health assistant
- **Location-aware** health recommendations
- **Health Data Visualization** with interactive heatmaps
- **Predictive Analytics** for dengue risk and air quality
- **Travel Health Advice** for different Singapore regions
- **Quick Reply Suggestions** for common health queries

### 📝 Daily Health Quiz
- **Daily Health Questions** with rotating content
- **Point-based Scoring System** (10 points per correct answer)
- **Leaderboard** with community rankings
- **Progress Tracking** with statistics
- **Firebase Integration** for user data persistence

### 📊 Community Reporting System
- **8 Report Categories**: Air Quality, Water Quality, Waste Management, Noise Pollution, Disease Outbreak, Mental Health, Food Safety, Other Health Issues
- **GPS Location Integration** with automatic address detection
- **Real-time Report Tracking** with status updates
- **Community Verification** system
- **Recent Reports History** for users

### 🗺️ Interactive Singapore Map
- **3 Map Modes**: Dengue Clusters, Air Quality (PSI), COVID-19 Hospital Data
- **Real-time Data Integration** from government APIs
- **Interactive Markers** with detailed popup information
- **Risk Level Visualization** with color-coded regions
- **WebView-based Leaflet Maps** for smooth performance

### 👤 User Profile Management
- **Firebase Authentication** with email/password
- **Multi-language Profile** editing
- **User Statistics** tracking (quiz points, reports submitted)
- **Profile Customization** with country selection
- **Secure Data Storage** with Firestore

## 🛠️ Technical Architecture

### Frontend Stack
- **React Native** (0.79.3) with Expo (53.0.11)
- **TypeScript** for type safety
- **React Context** for state management
- **React Native Vector Icons** for UI elements
- **React Native Chart Kit** for data visualization
- **React Native WebView** for map integration

### Backend & Services
- **Firebase Authentication** for user management
- **Cloud Firestore** for data storage
- **OpenAI API** for chatbot intelligence
- **Singapore Government APIs** for real-time health data
- **Expo Location** for GPS services

### Key Libraries
```json
{
  "expo": "~53.0.11",
  "firebase": "^11.9.1",
  "react-native-chart-kit": "^6.12.0",
  "react-native-vector-icons": "^10.2.0",
  "react-native-webview": "13.13.5",
  "expo-location": "~18.1.5",
  "expo-linear-gradient": "~14.1.5"
}
```

## 📁 Project Structure

```
Sigmapore/
├── src/
│   ├── components/           # Main app screens
│   │   ├── HomeScreen.js     # Dashboard with live stats
│   │   ├── QuizScreen.js     # Daily health quiz
│   │   ├── ReportScreen.js   # Community reporting
│   │   ├── MapScreen.js      # Basic map component
│   │   ├── InfoScreen.js     # Profile management
│   │   └── CustomButton.js   # Reusable UI component
│   ├── styles/
│   │   └── styles.js         # Centralized styling
│   └── config/
│       └── firebase.js       # Firebase configuration
├── components/               # Specialized components
│   ├── HealthChatbot.tsx     # AI chatbot interface
│   ├── ChatbotButton.tsx     # Chatbot toggle button
│   ├── SingaporeMapScreen.js # Advanced map with data layers
│   ├── HealthDataHeatmap.tsx # Data visualization component
│   └── MiniHeatmap.tsx       # Compact heatmap display
├── services/                 # External API services
│   ├── services/
│   │   └── chatbotService.ts # OpenAI integration
│   └── index.js             # Service exports
├── assets/                   # Images and resources
├── docs/                     # Documentation files
├── utils/                    # Configuration files
└── App.tsx                   # Main application entry
```

## 🔧 Configuration & Setup

### Environment Variables
Create a `.env` file in the project root:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Update `src/config/firebase.js` with your configuration

### API Keys Required
- **OpenAI API Key** for chatbot functionality
- **Firebase Configuration** for authentication and data storage

## 🎯 Key Features Deep Dive

### 🤖 AI Chatbot Capabilities
- **Health Risk Assessment** based on location
- **Predictive Modeling** for dengue outbreaks
- **Air Quality Forecasting** with PSI predictions
- **Travel Health Recommendations** for Singapore regions
- **Interactive Health Data** with expandable visualizations

### 📊 Real-time Data Sources
- **Singapore Government APIs** for official health data
- **Live Population Statistics** with demographic breakdowns
- **Dengue Cluster Monitoring** from MOH data
- **Air Quality Index** from NEA readings
- **COVID-19 Hospital Capacity** tracking

### 🗺️ Map Features
- **Leaflet-based Interactive Maps** with smooth pan/zoom
- **Multi-layer Data Visualization** (Dengue/PSI/COVID)
- **Custom Markers** with detailed popups
- **Risk Level Color Coding** for easy interpretation
- **Real-time Data Updates** from government sources

## 📱 User Experience

### Navigation
- **Bottom Tab Navigation** with 5 main sections
- **Smooth Transitions** between screens
- **Responsive Design** for all device sizes
- **Dark Theme** optimized for health data visualization

### Accessibility
- **Multi-language Support** for Singapore's diverse population
- **Large Touch Targets** for easy interaction
- **High Contrast Colors** for readability
- **Voice-friendly Interface** for screen readers

## 🚀 Deployment & Distribution

### Development
```bash
npm install
npx expo start
```

### Production Build
```bash
npx expo build:android
npx expo build:ios
```

### Web Deployment
```bash
npx expo build:web
```

## 🔒 Security & Privacy

- **Firebase Security Rules** for data protection
- **API Key Management** with environment variables
- **User Data Encryption** in transit and at rest
- **Location Privacy** with user consent
- **GDPR Compliance** for international users

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Singapore Government** for providing open health data APIs
- **OpenAI** for powering the intelligent chatbot
- **Firebase** for backend infrastructure
- **Expo** for React Native development platform
- **React Native Community** for excellent libraries and tools

## 📞 Support

For support, email your questions or open an issue on GitHub.

---

**Built with ❤️ for Singapore's Health Community**

 
