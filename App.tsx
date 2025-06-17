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
import { auth, db, COLLECTIONS, createUserData } from './src/config/firebase';
import MapScreen from './src/components/MapScreen';
import UserProfile from './src/components/UserProfile';

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
    name: 'Downtown Core',
    icon: '🏢',
    percentage: 92,
    color: '#4CAF50',
    description: 'Business district with excellent healthcare access'
  },
  {
    id: '2', 
    name: 'Marina Bay',
    icon: '🌊',
    percentage: 88,
    color: '#2196F3',
    description: 'Modern waterfront with clean air quality'
  },
  {
    id: '3',
    name: 'Chinatown',
    icon: '🏮',
    percentage: 85,
    color: '#FF9800',
    description: 'Historic area with traditional wellness practices'
  },
  {
    id: '4',
    name: 'Little India',
    icon: '🕌',
    percentage: 82,
    color: '#9C27B0',
    description: 'Vibrant community with diverse health services'
  },
  {
    id: '5',
    name: 'Orchard Road',
    icon: '🛍️',
    percentage: 90,
    color: '#E91E63',
    description: 'Shopping district with premium medical facilities'
  },
  {
    id: '6',
    name: 'Sentosa',
    icon: '🏝️',
    percentage: 95,
    color: '#00BCD4',
    description: 'Resort island with recreational wellness programs'
  }
];

function DistrictCard({ district }: { district: HealthDistrict }) {
  const buildingHeight = (district.percentage / 100) * 80;
  
  return (
    <View style={styles.districtCard}>
      <View style={styles.buildingContainer}>
        <View 
          style={[
            styles.building, 
            { 
              height: buildingHeight,
              backgroundColor: district.color,
            }
          ]} 
        />
      </View>
      <Text style={styles.percentage}>{district.percentage}%</Text>
      <Text style={styles.districtName}>{district.name}</Text>
      <Text style={styles.description}>{district.description}</Text>
    </View>
  );
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

  const filteredCountries = COUNTRIES.filter(country => 
    country.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (country: string) => {
    setInputValue(country);
    onSelect(country);
    setIsVisible(false);
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    setIsVisible(true);
    
    // Auto-select if exact match
    const exactMatch = COUNTRIES.find(
      country => country.toLowerCase() === text.toLowerCase()
    );
    if (exactMatch) {
      onSelect(exactMatch);
    }
  };

  const handleFocus = () => {
    setIsVisible(true);
  };

  const handleBlur = () => {
    // Delay hiding to allow for selection
    setTimeout(() => setIsVisible(false), 150);
  };

  useEffect(() => {
    setInputValue(value);
  }, [value]);

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
  const [fullName, setFullName] = useState('');
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
    if (!email || !password || !fullName || !country || !homeAddress) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user profile in Firestore with enhanced schema
      const userData = createUserData(user.uid, user.email!, fullName, country);
      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
        ...userData,
        homeAddress, // Additional field for signup
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
    setFullName('');
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
          
          <Text style={styles.title}>🏙️ Health Pulse</Text>
          <Text style={styles.subtitle}>A Living City Health Visualization</Text>
          
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
                placeholder="Full Name"
                placeholderTextColor="#B0BEC5"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
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
                {loading ? 'Please wait...' : (isLogin ? 'Login to Health City' : 'Create Account')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Dashboard({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      Alert.alert('Logout Error', error.message);
    }
  };

  return (
    <LinearGradient
      colors={['#0D1421', '#1A237E']}
      style={styles.dashboardContainer}
    >
      <SafeAreaView style={styles.dashboardContent}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.dashboardTitle}>🏙️ Health City</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity 
                style={styles.profileButton} 
                onPress={() => setShowProfile(true)}
              >
                <Text style={styles.profileText}>👤 Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.welcomeText}>Welcome, {user.email}</Text>
          <Text style={styles.tagline}>Transform community health data into a breathing cityscape</Text>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
            onPress={() => setActiveTab('reports')}
          >
            <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>
              Health Reports
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'overview' ? (
          <ScrollView showsVerticalScrollIndicator={false}>
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
        ) : (
          <MapScreen user={user} />
        )}

        {/* User Profile Modal */}
        <Modal
          visible={showProfile}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowProfile(false)}
        >
          <UserProfile
            user={user}
            onClose={() => setShowProfile(false)}
          />
        </Modal>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 3,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeTabText: {
    color: '#1976D2',
  },
  profileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  profileText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  districtName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});
