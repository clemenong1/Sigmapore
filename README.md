# 🏥 SigmaHealth

**AI-Powered Health Monitoring & Community Reporting Platform for Singapore**

A comprehensive React Native application that leverages real Singapore health data, AI-powered guidance, and community reporting to create an intelligent health monitoring ecosystem for Singapore.

![SigmaHealth](./assets/Screenshot_2025-06-18_at_3.30.31_AM-removebg-preview.png)

## 🌟 Elevator Pitch

SigmaHealth uses real Singapore dengue, PSI and COVID data with AI chatbot guidance and community reporting to create a crowdsourced health monitoring system that turns citizens into sensors.

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

### 🏠 Real-time Health Dashboard
- **Live Population Statistics** updated every 10 seconds with Singapore demographic data
- **Government Health Data Integration** including dengue clusters, PSI air quality, COVID-19 metrics
- **Interactive Health Charts** showing dengue trends and environmental data
- **Multi-language Support** (English, Chinese, Malay, Tamil, Hindi)
- **Live Counters** for births, deaths, migration, and population growth

### 🤖 AI Health Assistant (SigmaBoy)
- **OpenAI GPT-powered** intelligent health chatbot
- **Singapore-specific** health guidance and recommendations
- **Real-time Health Data** integration with government sources
- **Predictive Health Analytics** for dengue risk and air quality forecasting
- **Location-aware Advice** tailored to Singapore's health landscape
- **24/7 Health Support** with safety filters and professional referrals

### 📝 Daily Health Quiz & Gamification
- **Daily Health Education** with rotating Singapore health topics
- **Point-based Scoring** (10 points per correct answer)
- **Community Leaderboards** with real-time rankings
- **Progress Tracking** and achievement system
- **Health Literacy Building** through interactive learning

### 📊 Community Health Reporting
- **8 Health Categories**: Air Quality, Water Safety, Disease Outbreaks, Mental Health, Food Safety, Noise Pollution, Waste Management, General Health
- **GPS-enabled Reporting** with automatic Singapore location detection
- **Real-time Community Feed** showing health observations across Singapore
- **Anonymous Reporting** with privacy protection
- **Community Health Intelligence** for early outbreak detection

### 🗺️ Interactive Singapore Health Map
- **Multi-layer Health Visualization**: Dengue clusters, PSI air quality zones, COVID-19 data
- **Real-time Government Data** from MOH, NEA, and other official sources
- **Interactive Health Markers** with detailed information popups
- **Risk Level Visualization** with color-coded health zones
- **Community Report Integration** showing user-submitted health observations

### 👤 Secure User Management
- **Firebase Authentication** with privacy-first design
- **Multilingual Profiles** supporting Singapore's diverse population
- **Health Statistics Tracking** (quiz performance, community contributions)
- **Data Privacy Controls** with granular permission settings
- **Secure Cloud Storage** with user data protection

## 🛠️ Technical Architecture

### Frontend Stack
- **React Native** (0.79.3) with Expo (53.0.11) for cross-platform mobile development
- **TypeScript** for type safety and better developer experience
- **React Context** for global state management
- **React Native Vector Icons** for consistent UI elements
- **React Native Chart Kit** for health data visualization
- **React Native Maps** for interactive Singapore mapping

### Backend & Data Sources
- **Firebase Authentication** for secure user management
- **Cloud Firestore** for real-time data synchronization
- **OpenAI API** for intelligent health conversations
- **Singapore Government APIs** for official health data
- **Web Scraping** for real-time NEA dengue case data
- **Government Datasets** (36KB dengue clusters, 34KB PSI data)

### Key Dependencies
```json
{
  "expo": "~53.0.11",
  "firebase": "^11.9.1",
  "react-native": "0.79.3",
  "react-native-chart-kit": "^6.12.0",
  "react-native-vector-icons": "^10.2.0",
  "react-native-maps": "1.18.0",
  "expo-location": "~18.1.5",
  "expo-linear-gradient": "~14.1.5"
}
```

## 📁 Project Structure

```
SigmaHealth/
├── src/                      # Core application code
│   ├── components/           # Main application screens
│   │   ├── HomeScreen.js     # Real-time health dashboard
│   │   ├── QuizScreen.js     # Daily health quiz & leaderboard
│   │   ├── ReportScreen.js   # Community health reporting
│   │   ├── MapScreen.js      # Interactive Singapore health map
│   │   ├── InfoScreen.js     # User profile & settings
│   │   └── ReportModal.js    # Health report submission form
│   ├── styles/
│   │   └── styles.js         # Centralized styling system
│   └── config/
│       └── firebase.js       # Firebase configuration & security
├── components/               # Specialized health components
│   ├── HealthChatbot.tsx     # AI health assistant interface
│   ├── ChatbotButton.tsx     # Floating chatbot access button
│   └── SingaporeMapScreen.js # Advanced map with health data layers
├── services/                 # External data services
│   ├── data/                 # Singapore government health datasets
│   │   ├── DENGUECLUSTER.json      # Official MOH dengue cluster data
│   │   ├── PollutantStandardsIndexPSI.json # NEA air quality data
│   │   └── dengueData.ts           # Processed dengue statistics
│   ├── services/
│   │   ├── chatbotService.ts       # OpenAI integration service
│   │   ├── covidService.js         # COVID-19 data processing
│   │   ├── dengueService.ts        # Dengue data management
│   │   └── psiService.js           # Air quality data service
│   └── index.ts              # Service exports and configuration
├── utils/                    # Configuration & utility files
│   ├── firebase.json         # Firebase project configuration
│   ├── firestore.rules       # Database security rules
│   └── firestore.indexes.json # Database performance indexes
├── docs/                     # Comprehensive documentation
│   ├── PROJECT_STRUCTURE.md  # Detailed project architecture
│   ├── FEATURES_OVERVIEW.md  # Feature documentation
│   └── SETUP.md             # Development setup guide
├── assets/                   # Application resources
└── App.tsx                   # Main application entry point
```

## 🔧 Configuration & Setup

### Environment Variables
Create a `.env` file in the project root:
```env
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

### Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Create a Firestore database with security rules
4. Update `src/config/firebase.js` with your project configuration
5. Deploy security rules: `firebase deploy --only firestore:rules`

### Required API Access
- **OpenAI API Key** for SigmaBoy health assistant
- **Firebase Project** for authentication and real-time data
- **Singapore Government Data** (automatically fetched from public APIs)

## 🎯 Key Features Deep Dive

### 🤖 AI Health Assistant (SigmaBoy)
- **Singapore Health Context**: Trained on local health patterns and risks
- **Real-time Data Integration**: Access to current dengue, PSI, and COVID data
- **Safety-first Design**: Provides general guidance while recommending professional care
- **Multilingual Support**: Communicates in Singapore's major languages
- **Predictive Insights**: Forecasts health risks based on current data trends

### 📊 Real-time Data Pipeline
- **Web Scraping**: Live dengue case data from NEA website
- **Government APIs**: Official health data from MOH, NEA, and other agencies
- **Live Calculations**: Real-time Singapore population statistics
- **Community Intelligence**: User-generated health observations
- **Data Validation**: Cross-reference multiple sources for accuracy

### 🗺️ Interactive Health Mapping
- **Multi-layer Visualization**: Toggle between dengue, PSI, COVID, and community data
- **Real-time Updates**: Live synchronization with government data sources
- **Community Integration**: User reports displayed alongside official data
- **Risk Assessment**: Color-coded zones showing health risk levels
- **Location Intelligence**: GPS-based personalized health recommendations

### 🏆 Gamification & Engagement
- **Daily Health Quiz**: Educational content with point rewards
- **Community Leaderboards**: Friendly competition to encourage participation
- **Achievement System**: Recognition for consistent health engagement
- **Progress Tracking**: Personal health learning journey
- **Social Impact**: Show how individual contributions help community health

## 🔒 Privacy & Security

### Data Protection
- **Firebase Security Rules**: Granular access control for user data
- **Anonymous Reporting**: Community health observations without personal identification
- **Location Privacy**: Approximate coordinates to protect exact locations
- **User Consent**: Clear opt-in for all data collection and usage
- **Data Deletion**: User-controlled data removal and account deletion

### AI Safety
- **Health Disclaimer**: Clear boundaries on medical advice vs. general information
- **Professional Referrals**: Always recommend healthcare professionals for serious concerns
- **Content Filtering**: Safety measures to prevent harmful health misinformation
- **Singapore Context**: Culturally appropriate and locally relevant health guidance

## 🌍 Accessibility & Inclusion

### Language Support
- **5 Languages**: English, Chinese (Simplified), Malay, Tamil, Hindi
- **Cultural Sensitivity**: Respect for Singapore's diverse health practices
- **Simple Interface**: Intuitive design requiring minimal digital literacy
- **Offline Capability**: Core features work without constant internet access

### Universal Access
- **Free Platform**: No premium features or paid subscriptions
- **Low Data Usage**: Optimized for users with limited data plans
- **Device Compatibility**: Works on older Android and iOS devices
- **Accessibility Features**: Screen reader support and high contrast options

## 🚀 Impact & Future Vision

### Immediate Benefits
- **Early Health Detection**: Community reports identify trends before official statistics
- **Public Health Awareness**: Real-time information keeps citizens informed
- **Health Education**: Gamified learning improves population health literacy
- **Emergency Preparedness**: Rapid information sharing during health crises

### Long-term Goals
- **Predictive Health Analytics**: Machine learning for outbreak forecasting
- **Government Integration**: Official partnership with Singapore health authorities
- **Regional Expansion**: Adapt platform for other Southeast Asian countries
- **Healthcare Ecosystem**: Integration with Singapore's healthcare providers

### Research & Policy Impact
- **Public Health Research**: Anonymized data for academic and policy research
- **Evidence-based Policy**: Data-driven insights for health policy decisions
- **Community Health Trends**: Understanding population health patterns
- **Crisis Response**: Rapid mobilization during public health emergencies

## 📱 User Experience

### Navigation & Design
- **Bottom Tab Navigation** with 5 main health-focused sections
- **Dark Theme** optimized for health data visualization and battery life
- **Responsive Design** adapting to all screen sizes and orientations
- **Smooth Animations** for engaging user interactions

### Performance & Reliability
- **Real-time Synchronization** with minimal latency
- **Offline Functionality** for core features without internet
- **Battery Optimization** for extended usage during health monitoring
- **Cross-platform Consistency** between iOS and Android experiences

## 🚀 Development & Deployment

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on specific platforms
npx expo start --ios
npx expo start --android
npx expo start --web
```

### Production Deployment
```bash
# Build for production
npx expo build:android
npx expo build:ios

# Deploy Firebase rules
firebase deploy --only firestore:rules

# Update app in stores
npx expo upload:android
npx expo upload:ios
```

### Testing & Quality Assurance
- **Cross-platform Testing** on iOS and Android devices
- **Performance Monitoring** with real-time analytics
- **Security Auditing** of Firebase rules and API access
- **User Acceptance Testing** with Singapore health community

## 🤝 Contributing

SigmaHealth is built for Singapore's health community. We welcome contributions that improve public health outcomes:

1. **Health Data Integration**: Add new government data sources
2. **Language Support**: Improve translations for Singapore's languages
3. **Accessibility**: Enhance features for users with disabilities
4. **Security**: Strengthen privacy and data protection measures
5. **Performance**: Optimize for better user experience

## 📄 License & Acknowledgments

### Open Source Components
- Built with React Native and Expo for cross-platform development
- Powered by Firebase for secure, scalable backend infrastructure
- Enhanced with OpenAI for intelligent health conversations

### Data Sources
- **Ministry of Health (MOH)**: Official dengue cluster and health statistics
- **National Environment Agency (NEA)**: Air quality and environmental data
- **Singapore Government**: Population and demographic statistics
- **Community Contributors**: User-generated health observations

### Health Disclaimer
SigmaHealth provides general health information and community health intelligence. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical concerns.

---

**SigmaHealth - Empowering Singapore's Health Intelligence Through Community and AI** 🇸🇬💚

 
