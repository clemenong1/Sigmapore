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
  Modal,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import axios from 'axios';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

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

interface HealthIndicator {
  id: string;
  name: string;
  icon: string;
  color: string;
  active: boolean;
  value: string;
  status: string;
  location: string;
  lastUpdated: string;
}

interface SingaporeHealthData {
  airQuality: {
    psi: number;
    status: string;
    color: string;
  };
  dengue: {
    clusters: number;
    status: string;
    color: string;
  };
  temperature: {
    value: number;
    status: string;
    color: string;
  };
  lastUpdated: string;
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

// Singapore Government Data API Functions
const fetchSingaporeHealthData = async (): Promise<SingaporeHealthData> => {
  const defaultData: SingaporeHealthData = {
    airQuality: { psi: 45, status: 'Good', color: '#4CAF50' },
    dengue: { clusters: 12, status: 'Moderate', color: '#FF9800' },
    temperature: { value: 28, status: 'Normal', color: '#4CAF50' },
    lastUpdated: new Date().toLocaleString()
  };

  try {
    // Fetch Air Quality Data
    const airResponse = await axios.get('https://api.data.gov.sg/v1/environment/air-quality');
    if (airResponse.data.items && airResponse.data.items.length > 0) {
      const readings = airResponse.data.items[0].readings;
      const nationalPSI = readings.national?.psi || 45;
      defaultData.airQuality = {
        psi: nationalPSI,
        status: getPSIStatus(nationalPSI),
        color: getPSIColor(nationalPSI)
      };
    }

    // Fetch Dengue Data
    try {
      const dengueResponse = await axios.get('https://api.data.gov.sg/v1/environment/dengue-clusters');
      if (dengueResponse.data.items && dengueResponse.data.items.length > 0) {
        const clusters = dengueResponse.data.items[0].clusters || [];
        defaultData.dengue = {
          clusters: clusters.length,
          status: clusters.length > 20 ? 'High' : clusters.length > 10 ? 'Moderate' : 'Low',
          color: clusters.length > 20 ? '#F44336' : clusters.length > 10 ? '#FF9800' : '#4CAF50'
        };
      }
    } catch (dengueError) {
      console.log('Dengue data not available, using default');
    }

    // Fetch Temperature Data
    try {
      const tempResponse = await axios.get('https://api.data.gov.sg/v1/environment/air-temperature');
      if (tempResponse.data.items && tempResponse.data.items.length > 0) {
        const readings = tempResponse.data.items[0].readings;
        const avgTemp = readings.length > 0 ? readings[0].value : 28;
        defaultData.temperature = {
          value: avgTemp,
          status: avgTemp > 32 ? 'Hot' : avgTemp > 25 ? 'Warm' : 'Cool',
          color: avgTemp > 32 ? '#FF5722' : avgTemp > 25 ? '#FF9800' : '#4CAF50'
        };
      }
    } catch (tempError) {
      console.log('Temperature data not available, using default');
    }

    return defaultData;
  } catch (error) {
    console.error('Error fetching Singapore health data:', error);
    return defaultData;
  }
};

const getPSIColor = (psi: number): string => {
  if (psi <= 50) return '#4CAF50'; // Good - Green
  if (psi <= 100) return '#FFEB3B'; // Moderate - Yellow
  if (psi <= 200) return '#FF9800'; // Unhealthy - Orange
  if (psi <= 300) return '#F44336'; // Very Unhealthy - Red
  return '#9C27B0'; // Hazardous - Purple
};

const getPSIStatus = (psi: number): string => {
  if (psi <= 50) return 'Good';
  if (psi <= 100) return 'Moderate';
  if (psi <= 200) return 'Unhealthy';
  if (psi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

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
      Alert.alert('Success', 'Logged in successfully!');
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
      await setDoc(doc(db, 'users', user.uid), {
        username,
        email,
        country,
        homeAddress,
        createdAt: new Date().toISOString()
      });

      Alert.alert('Success', 'Account created successfully!');
    } catch (error: any) {
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.citySkylne}>
            <Text style={styles.skylineText}>🏙️🏢🏗️🏘️🌃</Text>
          </View>

          <Text style={styles.title}>🏙️ SigmaPulse</Text>
          <Text style={styles.subtitle}>Singapore Health Visualization</Text>

          <View style={styles.authToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, isLogin && styles.activeToggle]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.toggleText, isLogin && styles.activeToggleText]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !isLogin && styles.activeToggle]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.toggleText, !isLogin && styles.activeToggleText]}>Sign Up</Text>
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
                  placeholder="Select Country"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Home Address"
                  placeholderTextColor="#B0BEC5"
                  value={homeAddress}
                  onChangeText={setHomeAddress}
                  multiline
                  numberOfLines={2}
                />
              </>
            )}

            <TouchableOpacity
              style={[styles.enterButton, loading && styles.disabledButton]}
              onPress={isLogin ? handleLogin : handleSignup}
              disabled={loading}
            >
              <Text style={styles.enterButtonText}>
                {loading ? 'Please wait...' : (isLogin ? 'Login to SigmaPulse' : 'Create Account')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function HealthIndicatorCard({ 
  title, 
  icon, 
  value, 
  status, 
  color, 
  subtitle 
}: { 
  title: string; 
  icon: string; 
  value: string; 
  status: string; 
  color: string; 
  subtitle: string; 
}) {
  return (
    <View style={styles.healthCard}>
      <View style={styles.healthCardHeader}>
        <Text style={styles.healthCardIcon}>{icon}</Text>
        <View style={styles.healthCardInfo}>
          <Text style={styles.healthCardTitle}>{title}</Text>
          <Text style={styles.healthCardSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.healthCardValue}>
        <Text style={styles.healthCardNumber}>{value}</Text>
        <View style={[styles.healthCardStatus, { backgroundColor: color }]}>
          <Text style={styles.healthCardStatusText}>{status}</Text>
        </View>
      </View>
    </View>
  );
}

function SingaporeHealthDashboard({ user }: { user: User }) {
  const [healthData, setHealthData] = useState<SingaporeHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    setLoading(true);
    const data = await fetchSingaporeHealthData();
    setHealthData(data);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHealthData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      Alert.alert('Logout Error', error.message);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#0D1421', '#1A237E']}
        style={styles.dashboardContainer}
      >
        <SafeAreaView style={styles.dashboardContent}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading Singapore health data...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0D1421', '#1A237E']}
      style={styles.dashboardContainer}
    >
      <SafeAreaView style={styles.dashboardContent}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.dashboardTitle}>🇸🇬 Singapore Health Pulse</Text>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.welcomeText}>Welcome, {user.email}</Text>
            <Text style={styles.tagline}>Real-time health monitoring across Singapore</Text>
          </View>

          {/* Live Health Indicators */}
          <View style={styles.liveSection}>
            <Text style={styles.sectionTitle}>🔴 Live Health Indicators</Text>
            <Text style={styles.lastUpdated}>Last updated: {healthData?.lastUpdated}</Text>
            
            <View style={styles.healthCardsContainer}>
              <HealthIndicatorCard
                title="Air Quality (PSI)"
                icon="🌫️"
                value={healthData?.airQuality.psi.toString() || '45'}
                status={healthData?.airQuality.status || 'Good'}
                color={healthData?.airQuality.color || '#4CAF50'}
                subtitle="National average"
              />
              
              <HealthIndicatorCard
                title="Dengue Clusters"
                icon="🦟"
                value={healthData?.dengue.clusters.toString() || '12'}
                status={healthData?.dengue.status || 'Moderate'}
                color={healthData?.dengue.color || '#FF9800'}
                subtitle="Active clusters"
              />
              
              <HealthIndicatorCard
                title="Temperature"
                icon="🌡️"
                value={`${healthData?.temperature.value || 28}°C`}
                status={healthData?.temperature.status || 'Normal'}
                color={healthData?.temperature.color || '#4CAF50'}
                subtitle="Current average"
              />
            </View>
          </View>

          {/* Singapore Regions */}
          <View style={styles.regionsSection}>
            <Text style={styles.sectionTitle}>🏙️ Singapore Health Regions</Text>
            <View style={styles.regionsList}>
              <View style={styles.regionCard}>
                <Text style={styles.regionIcon}>🏙️</Text>
                <Text style={styles.regionName}>Central Region</Text>
                <Text style={styles.regionStatus}>Excellent</Text>
              </View>
              <View style={styles.regionCard}>
                <Text style={styles.regionIcon}>🌊</Text>
                <Text style={styles.regionName}>East Region</Text>
                <Text style={styles.regionStatus}>Good</Text>
              </View>
              <View style={styles.regionCard}>
                <Text style={styles.regionIcon}>🌳</Text>
                <Text style={styles.regionName}>North Region</Text>
                <Text style={styles.regionStatus}>Very Good</Text>
              </View>
              <View style={styles.regionCard}>
                <Text style={styles.regionIcon}>🏭</Text>
                <Text style={styles.regionName}>West Region</Text>
                <Text style={styles.regionStatus}>Good</Text>
              </View>
              <View style={styles.regionCard}>
                <Text style={styles.regionIcon}>🏢</Text>
                <Text style={styles.regionName}>South Region</Text>
                <Text style={styles.regionStatus}>Excellent</Text>
              </View>
            </View>
          </View>

          {/* Community Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>5.9M</Text>
              <Text style={styles.statLabel}>Population</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>83.2</Text>
              <Text style={styles.statLabel}>Life Expectancy</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>92%</Text>
              <Text style={styles.statLabel}>Healthcare Coverage</Text>
            </View>
          </View>

          {/* Health Districts */}
          <Text style={styles.sectionTitle}>🏘️ Health Districts Overview</Text>
          <View style={styles.districtsGrid}>
            {healthDistricts.map((district) => (
              <DistrictCard key={district.id} district={district} />
            ))}
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

function Dashboard({ user }: { user: User }) {
  return <SingaporeHealthDashboard user={user} />;
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
          <Text style={styles.title}>🏙️ SigmaPulse</Text>
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

const styles = StyleSheet.create({
  // Login Screen Styles
  loginContainer: {
    flex: 1,
  },
  loginContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  citySkylne: {
    marginBottom: 40,
  },
  skylineText: {
    fontSize: 40,
    textAlign: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F5E8',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 300,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  enterButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  enterButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Country Dropdown Styles
  countryDropdownWrapper: {
    marginBottom: 15,
  },
  countryInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 10,
  },
  countryInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  countryArrow: {
    fontSize: 12,
    color: '#666',
  },
  countryArrowUp: {
    transform: [{ rotate: '180deg' }],
  },
  countryDropdown: {
    backgroundColor: 'white',
    borderRadius: 10,
    maxHeight: 200,
    marginTop: 5,
  },
  countryOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  countryOptionText: {
    fontSize: 16,
    color: '#333',
  },
  lastCountryOption: {
    borderBottomWidth: 0,
  },

  // Dashboard Styles
  dashboardContainer: {
    flex: 1,
  },
  dashboardContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    color: '#B0BEC5',
    textAlign: 'center',
    marginTop: 5,
  },
  liveSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#B0BEC5',
    marginBottom: 15,
  },
  healthCardsContainer: {
    gap: 15,
  },
  healthCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  healthCardIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  healthCardInfo: {
    flex: 1,
  },
  healthCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  healthCardSubtitle: {
    fontSize: 12,
    color: '#B0BEC5',
    marginTop: 2,
  },
  healthCardValue: {
    alignItems: 'flex-end',
  },
  healthCardNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  healthCardStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  healthCardStatusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  regionsSection: {
    padding: 20,
  },
  regionsList: {
    gap: 10,
  },
  regionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  regionIcon: {
    fontSize: 24,
  },
  regionName: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    flex: 1,
    marginLeft: 15,
  },
  regionStatus: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#B0BEC5',
    marginTop: 5,
  },
  districtsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  districtCard: {
    width: (width - 45) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  districtHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  districtIcon: {
    fontSize: 30,
    marginBottom: 5,
  },
  districtName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  buildingContainer: {
    alignItems: 'center',
    height: 100,
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  building: {
    width: 40,
    borderRadius: 5,
    marginBottom: 5,
  },
  percentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  description: {
    fontSize: 12,
    color: '#B0BEC5',
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 3,
    marginBottom: 30,
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  toggleText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#1976D2',
  },
  disabledButton: {
    opacity: 0.6,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  logoutText: {
    color: '#FF5722',
    fontSize: 14,
    fontWeight: '600',
  },
  welcomeText: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 5,
  },
});
