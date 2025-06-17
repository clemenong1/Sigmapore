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
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
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
}

interface MapDataPoint {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  value: string;
  color: string;
  type: string;
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

const healthIndicators: HealthIndicator[] = [
  { id: 'haze', name: 'Air Quality', icon: '🌫️', color: '#FF5722', active: true },
  { id: 'dengue', name: 'Dengue Clusters', icon: '🦟', color: '#E91E63', active: false },
  { id: 'temperature', name: 'Temperature', icon: '🌡️', color: '#FF9800', active: false },
  { id: 'hospitals', name: 'Hospitals', icon: '🏥', color: '#4CAF50', active: false },
];

interface UserData {
  username: string;
  email: string;
  country: string;
  homeAddress: string;
}

// Singapore Government Data API Functions
const fetchSingaporeHealthData = async (datasetId: string) => {
  try {
    const pollUrl = `https://api-open.data.gov.sg/v1/public/api/datasets/${datasetId}/poll-download`;
    const pollResponse = await axios.get(pollUrl);
    
    if (pollResponse.data.code !== 0) {
      throw new Error(pollResponse.data.errMsg);
    }
    
    const dataUrl = pollResponse.data.data.url;
    const dataResponse = await axios.get(dataUrl);
    return dataResponse.data;
  } catch (error) {
    console.error('Error fetching Singapore data:', error);
    return null;
  }
};

const fetchAirQualityData = async (): Promise<MapDataPoint[]> => {
  try {
    // Using the real-time air quality API
    const response = await axios.get('https://api.data.gov.sg/v1/environment/air-quality');
    const data = response.data;
    
    if (data.items && data.items.length > 0) {
      const readings = data.items[0].readings;
      const points: MapDataPoint[] = [];
      
      // Convert air quality readings to map points
      Object.keys(readings).forEach((key, index) => {
        if (readings[key] && typeof readings[key] === 'object') {
          // Sample coordinates for different regions of Singapore
          const coordinates = [
            { lat: 1.3521, lng: 103.8198 }, // Central
            { lat: 1.3644, lng: 103.9915 }, // East
            { lat: 1.4382, lng: 103.7890 }, // North
            { lat: 1.3048, lng: 103.8318 }, // South
            { lat: 1.3966, lng: 103.7764 }, // West
          ];
          
          const coord = coordinates[index % coordinates.length];
          
          points.push({
            id: `air-${index}`,
            latitude: coord.lat,
            longitude: coord.lng,
            title: `Air Quality - ${key}`,
            description: `PSI: ${readings[key].psi || 'N/A'}`,
            value: readings[key].psi?.toString() || 'N/A',
            color: getPSIColor(readings[key].psi || 0),
            type: 'air-quality'
          });
        }
      });
      
      return points;
    }
  } catch (error) {
    console.error('Error fetching air quality data:', error);
  }
  
  // Fallback sample data
  return [
    {
      id: 'air-1',
      latitude: 1.3521,
      longitude: 103.8198,
      title: 'Central Singapore',
      description: 'PSI: 45',
      value: '45',
      color: '#4CAF50',
      type: 'air-quality'
    },
    {
      id: 'air-2',
      latitude: 1.3644,
      longitude: 103.9915,
      title: 'East Singapore',
      description: 'PSI: 52',
      value: '52',
      color: '#4CAF50',
      type: 'air-quality'
    }
  ];
};

const fetchDengueData = async (): Promise<MapDataPoint[]> => {
  try {
    const response = await axios.get('https://api.data.gov.sg/v1/environment/dengue-clusters');
    const data = response.data;
    
    if (data.items && data.items.length > 0) {
      const clusters = data.items[0].clusters;
      return clusters.map((cluster: any, index: number) => ({
        id: `dengue-${index}`,
        latitude: parseFloat(cluster.latitude),
        longitude: parseFloat(cluster.longitude),
        title: 'Dengue Cluster',
        description: `Cases: ${cluster.case_size}`,
        value: cluster.case_size.toString(),
        color: '#E91E63',
        type: 'dengue'
      }));
    }
  } catch (error) {
    console.error('Error fetching dengue data:', error);
  }
  
  // Fallback sample data
  return [
    {
      id: 'dengue-1',
      latitude: 1.3400,
      longitude: 103.8300,
      title: 'Dengue Cluster',
      description: 'Cases: 12',
      value: '12',
      color: '#E91E63',
      type: 'dengue'
    }
  ];
};

const getPSIColor = (psi: number): string => {
  if (psi <= 50) return '#4CAF50'; // Good - Green
  if (psi <= 100) return '#FFEB3B'; // Moderate - Yellow
  if (psi <= 200) return '#FF9800'; // Unhealthy - Orange
  if (psi <= 300) return '#F44336'; // Very Unhealthy - Red
  return '#9C27B0'; // Hazardous - Purple
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

function SingaporeMap({ user }: { user: User }) {
  const [mapData, setMapData] = useState<MapDataPoint[]>([]);
  const [indicators, setIndicators] = useState<HealthIndicator[]>(healthIndicators);
  const [loading, setLoading] = useState(true);
  const [showIndicatorMenu, setShowIndicatorMenu] = useState(false);

  useEffect(() => {
    loadMapData();
  }, [indicators]);

  const loadMapData = async () => {
    setLoading(true);
    let allData: MapDataPoint[] = [];

    // Load data based on active indicators
    for (const indicator of indicators) {
      if (indicator.active) {
        switch (indicator.id) {
          case 'haze':
            const airData = await fetchAirQualityData();
            allData = [...allData, ...airData];
            break;
          case 'dengue':
            const dengueData = await fetchDengueData();
            allData = [...allData, ...dengueData];
            break;
          // Add more indicators as needed
        }
      }
    }

    setMapData(allData);
    setLoading(false);
  };

  const toggleIndicator = (indicatorId: string) => {
    setIndicators(prev => 
      prev.map(ind => 
        ind.id === indicatorId ? { ...ind, active: !ind.active } : ind
      )
    );
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      Alert.alert('Logout Error', error.message);
    }
  };

  return (
    <View style={styles.mapContainer}>
      <SafeAreaView style={styles.mapContent}>
        {/* Header */}
        <View style={styles.mapHeader}>
          <View style={styles.headerTop}>
            <Text style={styles.mapTitle}>🏙️ Singapore Health Map</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.welcomeText}>Welcome, {user.email}</Text>
        </View>

        {/* Map */}
        <View style={styles.mapWrapper}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: 1.3521,
              longitude: 103.8198,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {mapData.map((point) => (
              <Marker
                key={point.id}
                coordinate={{
                  latitude: point.latitude,
                  longitude: point.longitude,
                }}
                title={point.title}
                description={point.description}
                pinColor={point.color}
              />
            ))}
          </MapView>

          {/* Loading Overlay */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Loading health data...</Text>
            </View>
          )}
        </View>

        {/* Indicator Controls */}
        <View style={styles.indicatorControls}>
          <TouchableOpacity
            style={styles.indicatorMenuButton}
            onPress={() => setShowIndicatorMenu(!showIndicatorMenu)}
          >
            <Text style={styles.indicatorMenuText}>Health Indicators ▼</Text>
          </TouchableOpacity>

          {showIndicatorMenu && (
            <View style={styles.indicatorMenu}>
              {indicators.map((indicator) => (
                <TouchableOpacity
                  key={indicator.id}
                  style={[
                    styles.indicatorItem,
                    indicator.active && styles.activeIndicatorItem
                  ]}
                  onPress={() => toggleIndicator(indicator.id)}
                >
                  <Text style={styles.indicatorIcon}>{indicator.icon}</Text>
                  <Text style={[
                    styles.indicatorName,
                    indicator.active && styles.activeIndicatorName
                  ]}>
                    {indicator.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
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
  const [currentView, setCurrentView] = useState<'map' | 'districts'>('map');

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      Alert.alert('Logout Error', error.message);
    }
  };

  if (currentView === 'map') {
    return <SingaporeMap user={user} />;
  }

  return (
    <LinearGradient
      colors={['#0D1421', '#1A237E']}
      style={styles.dashboardContainer}
    >
      <SafeAreaView style={styles.dashboardContent}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.dashboardTitle}>🏙️ SigmaPulse</Text>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.welcomeText}>Welcome, {user.email}</Text>
            <Text style={styles.tagline}>Transform community health data into a breathing cityscape</Text>
          </View>

          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewButton, currentView === 'map' && styles.activeViewButton]}
              onPress={() => setCurrentView('map')}
            >
              <Text style={[styles.viewButtonText, currentView === 'map' && styles.activeViewButtonText]}>
                🗺️ Live Map
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, currentView === 'districts' && styles.activeViewButton]}
              onPress={() => setCurrentView('districts')}
            >
              <Text style={[styles.viewButtonText, currentView === 'districts' && styles.activeViewButtonText]}>
                🏘️ Districts
              </Text>
            </TouchableOpacity>
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
      </SafeAreaView>
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

  // Map Styles
  mapContainer: {
    flex: 1,
    backgroundColor: '#0D1421',
  },
  mapContent: {
    flex: 1,
  },
  mapHeader: {
    padding: 20,
    backgroundColor: 'rgba(13, 20, 33, 0.9)',
  },
  mapTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  indicatorControls: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 1000,
  },
  indicatorMenuButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    padding: 12,
    borderRadius: 8,
    minWidth: 150,
  },
  indicatorMenuText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  indicatorMenu: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  indicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  activeIndicatorItem: {
    backgroundColor: '#E8F5E8',
  },
  indicatorIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  indicatorName: {
    fontSize: 14,
    color: '#333',
  },
  activeIndicatorName: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },

  // Dashboard Styles
  dashboardContainer: {
    flex: 1,
  },
  dashboardContent: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 14,
    color: '#B0BEC5',
    textAlign: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 5,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeViewButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  viewButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  activeViewButtonText: {
    color: 'white',
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
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
