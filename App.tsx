import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Dimensions,
  Alert,
  FlatList,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './src/config/firebase';
import MapScreen from './src/screens/MapScreen';
import SingaporeMapScreen from './src/screens/SingaporeMapScreen';
import InfoScreen from './src/screens/InfoScreen';
import { styles } from './src/styles/styles';

const { width, height } = Dimensions.get('window');

const COUNTRIES = [
  'China',
  'India', 
  'Indonesia',
  'Malaysia',
  'Singapore'
];

interface HealthDistrict {
  id: string;
  name: string;
  icon: string;
  percentage: number;
  color: string;
  description: string;
}

const healthDistricts: HealthDistrict[] = [
  {
    id: '1',
    name: 'Wellness District',
    icon: '🏥',
    percentage: 94,
    color: '#4CAF50',
    description: 'Public health centers'
  },
  {
    id: '2',
    name: 'Active Quarter',
    icon: '🏃',
    percentage: 87,
    color: '#FF9800',
    description: 'Community fitness'
  },
  {
    id: '3',
    name: 'Green Commons',
    icon: '🌱',
    percentage: 76,
    color: '#8BC34A',
    description: 'Air quality'
  },
  {
    id: '4',
    name: 'Nutrition Hub',
    icon: '🍎',
    percentage: 89,
    color: '#F44336',
    description: 'Food security'
  },
  {
    id: '5',
    name: 'Mental Wellness Zone',
    icon: '💚',
    percentage: 82,
    color: '#9C27B0',
    description: 'Community support'
  },
  {
    id: '6',
    name: 'Education Heights',
    icon: '🎓',
    percentage: 91,
    color: '#2196F3',
    description: 'Health literacy'
  }
];

interface UserData {
  username: string;
  email: string;
  country: string;
  homeAddress: string;
}

function CountryDropdown({ 
  value, 
  onSelect, 
  placeholder = "Select Country" 
}: { 
  value: string;
  onSelect: (country: string) => void;
  placeholder?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredCountries, setFilteredCountries] = useState(COUNTRIES);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (inputValue === '') {
      setFilteredCountries(COUNTRIES);
    } else {
      const filtered = COUNTRIES.filter(country =>
        country.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  }, [inputValue]);

  const handleInputChange = (text: string) => {
    setInputValue(text);
    setIsVisible(true);
    
    // Clear selection if input doesn't match exactly
    const exactMatch = COUNTRIES.find(country => 
      country.toLowerCase() === text.toLowerCase()
    );
    if (!exactMatch) {
      onSelect('');
    }
  };

  const handleSelect = (country: string) => {
    setInputValue(country);
    onSelect(country);
    setIsVisible(false);
  };

  const handleFocus = () => {
    setIsVisible(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsVisible(false);
    }, 200);
  };

  return (
    <View style={styles.countryDropdownWrapper}>
      <View style={styles.countryInputContainer}>
        <TextInput
          style={styles.countryInput}
          placeholder={placeholder}
          placeholderTextColor="#B0BEC5"
          value={inputValue}
          onChangeText={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="words"
        />
        <Text style={[styles.countryArrow, isVisible && styles.countryArrowUp]}>
          ▼
        </Text>
      </View>

      {isVisible && filteredCountries.length > 0 && (
        <View style={styles.countryDropdown}>
          {filteredCountries.map((country, index) => (
            <TouchableOpacity
              key={country}
              style={[
                styles.countryOption,
                index === filteredCountries.length - 1 && styles.lastCountryOption
              ]}
              onPress={() => handleSelect(country)}
            >
              <Text style={styles.countryOptionText}>{country}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      Alert.alert('Login Error', error.message);
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!email || !password || !username || !country || !homeAddress) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store additional user data in Firestore
      try {
        await setDoc(doc(db, 'users', user.uid), {
          username,
          email,
          country,
          homeAddress,
          createdAt: new Date().toISOString()
        });

        Alert.alert('Success', 'Account created successfully!');
      } catch (firestoreError: any) {
        console.error('Firestore error:', firestoreError);
        
        // If Firestore fails, still complete signup but warn user
        Alert.alert(
          'Account Created', 
          `Your account was created successfully, but there was an issue saving your profile data. Error: ${firestoreError.message}\n\nYou can update your profile later in the app.`
        );
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      Alert.alert('Signup Error', error.message);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setCountry('');
    setHomeAddress('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <LinearGradient
      colors={['#1976D2', '#4CAF50']}
      style={styles.loginContainer}
    >
      <SafeAreaView style={styles.loginContent}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.citySkylne}>
            <Text style={styles.skylineText}>🏙️</Text>
          </View>
          
          <Text style={styles.title}>Health Pulse</Text>
          <Text style={styles.subtitle}>
            Transform community health data into a breathing cityscape
          </Text>

          <View style={styles.authToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, isLogin && styles.activeToggle]}
              onPress={() => !isLogin && toggleMode()}
            >
              <Text style={[styles.toggleText, isLogin && styles.activeToggleText]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !isLogin && styles.activeToggle]}
              onPress={() => isLogin && toggleMode()}
            >
              <Text style={[styles.toggleText, !isLogin && styles.activeToggleText]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#B0BEC5"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#B0BEC5"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#B0BEC5"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {!isLogin && (
              <>
                <CountryDropdown
                  value={country}
                  onSelect={setCountry}
                  placeholder="Select your country"
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Home Address"
                  placeholderTextColor="#B0BEC5"
                  value={homeAddress}
                  onChangeText={setHomeAddress}
                  multiline
                />
              </>
            )}

            <TouchableOpacity
              style={[styles.enterButton, loading && styles.disabledButton]}
              onPress={isLogin ? handleLogin : handleSignup}
              disabled={loading}
            >
              <Text style={styles.enterButtonText}>
                {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function DistrictCard({ district }: { district: HealthDistrict }) {
  const buildingHeight = (district.percentage / 100) * 80;
  
  return (
    <View style={styles.districtCard}>
      <View style={styles.districtHeader}>
        <Text style={styles.districtIcon}>{district.icon}</Text>
        <Text style={styles.districtName}>{district.name}</Text>
      </View>
      
      <View style={styles.buildingContainer}>
        <View 
          style={[
            styles.building, 
            { 
              height: buildingHeight, 
              backgroundColor: district.color 
            }
          ]} 
        />
        <Text style={styles.percentage}>{district.percentage}%</Text>
      </View>
      
      <Text style={styles.description}>{district.description}</Text>
    </View>
  );
}

function HomeScreen({ user }: { user: User }) {
  return (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.dashboardTitle}>🏙️ Health City</Text>
        <Text style={styles.welcomeText}>Welcome, {user.email}</Text>
        <Text style={styles.tagline}>Transform community health data into a breathing cityscape</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>2.8M</Text>
          <Text style={styles.statLabel}>Population</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>34.2</Text>
          <Text style={styles.statLabel}>Average Age</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>86%</Text>
          <Text style={styles.statLabel}>Overall Wellbeing</Text>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>🏘️ Neighborhood Districts</Text>
      
      <View style={styles.districtsGrid}>
        {healthDistricts.map((district) => (
          <DistrictCard key={district.id} district={district} />
        ))}
      </View>
    </ScrollView>
  );
}

function BottomNavigation({ 
  activeTab, 
  onTabPress 
}: { 
  activeTab: string; 
  onTabPress: (tab: string) => void; 
}) {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'map', label: 'Map', icon: '🗺️' },
    { id: 'report', label: 'Reports', icon: '📋' },
    { id: 'info', label: 'Profile', icon: '👤' },
  ];

  return (
    <View style={styles.bottomNavigation}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.navItem,
            activeTab === tab.id && styles.activeNavItem,
          ]}
          onPress={() => onTabPress(tab.id)}
        >
          <Text
            style={[
              styles.navIcon,
              activeTab === tab.id && styles.activeNavIcon,
            ]}
          >
            {tab.icon}
          </Text>
          <Text
            style={[
              styles.navLabel,
              activeTab === tab.id && styles.activeNavLabel,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Dashboard({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState('home');

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen user={user} />;
      case 'map':
        return <SingaporeMapScreen user={user} />;
      case 'report':
        return <MapScreen user={user} />;
      case 'info':
        return <InfoScreen user={user} />;
      default:
        return <HomeScreen user={user} />;
    }
  };

  return (
    <LinearGradient
      colors={['#0D1421', '#1A237E']}
      style={styles.dashboardContainer}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {renderActiveScreen()}
        </View>
      </SafeAreaView>
      <BottomNavigation activeTab={activeTab} onTabPress={setActiveTab} />
    </LinearGradient>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <LinearGradient
        colors={['#1976D2', '#4CAF50']}
        style={styles.loginContainer}
      >
        <SafeAreaView style={styles.loginContent}>
          <Text style={styles.title}>🏙️ Health Pulse</Text>
          <Text style={styles.subtitle}>Loading...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <>
      {user ? <Dashboard user={user} /> : <AuthScreen />}
      <StatusBar style="light" />
    </>
  );
}
