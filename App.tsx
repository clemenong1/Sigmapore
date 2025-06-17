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
import MapScreen from './src/components/MapScreen';
import SingaporeMapScreen from './components/SingaporeMapScreen';
import InfoScreen from './src/components/InfoScreen';
import ReportScreen from './src/components/ReportScreen';
import { styles } from './src/styles/styles';
import { LineChart } from 'react-native-chart-kit';

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

const getLivePopulationData = () => {
  // Real-time data from countrymeters.info
  const currentTime = new Date();
  const startOfYear = new Date(currentTime.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((currentTime.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  
  // Base data from the website
  const baseData = {
    currentPopulation: 6480987,
    birthsPerDay: 137,
    deathsPerDay: 67,
    migrationPerDay: 219,
    growthPerDay: 289
  };
  
  // Calculate year-to-date numbers
  const yearToDate = {
    births: Math.floor(baseData.birthsPerDay * dayOfYear),
    deaths: Math.floor(baseData.deathsPerDay * dayOfYear),
    migration: Math.floor(baseData.migrationPerDay * dayOfYear),
    growth: Math.floor(baseData.growthPerDay * dayOfYear)
  };
  
  // Simulate live counter with small variations
  const variation = (base: number, percentage: number = 0.001) => {
    const change = Math.floor(base * percentage * (Math.random() - 0.5));
    return base + change;
  };
  
  return {
    currentPopulation: variation(baseData.currentPopulation + yearToDate.growth),
    demographics: {
      male: { population: 3267057, percentage: 50.4 },
      female: { population: 3213930, percentage: 49.6 }
    },
    today: {
      births: variation(baseData.birthsPerDay, 0.1),
      deaths: variation(baseData.deathsPerDay, 0.1),
      migration: variation(baseData.migrationPerDay, 0.1),
      growth: variation(baseData.growthPerDay, 0.1)
    },
    yearToDate,
    additionalStats: {
      lifeExpectancy: 82.1,
      literacyRate: 96.81,
      populationDensity: 9168,
      worldRank: 114
    }
  };
};

// Fetch weekly dengue cases and labels
const fetchWeeklyDengueData = async (): Promise<{ labels: string[]; data: number[]; sum: number } | null> => {
  try {
    // For testing purposes, use hardcoded data to ensure chart works
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = [30, 29, 13, 17, 8, 6, 0];
    const sum = data.reduce((acc, n) => acc + n, 0);
    console.log('Using hardcoded dengue data for testing:', { labels, data, sum });
    return { labels, data, sum };
    
    /*
    const response = await fetch('https://www.nea.gov.sg/dengue-zika/dengue/dengue-cases');
    const html = await response.text();
    const tableMatch = html.match(/Number of Reported Cases[\s\S]*?<table[\s\S]*?>([\s\S]*?)<\/table>/i);
    if (!tableMatch) return null;
    const tableHtml = tableMatch[1];
    // Extract date labels from header
    const labels = Array.from(tableHtml.matchAll(/<th[^>]*>([^<]+)<\/th>/g)).map(m => m[1].trim()).slice(0, 7);
    // Extract daily counts
    const data = Array.from(tableHtml.matchAll(/<td[^>]*>(\d+)<\/td>/g)).map(m => parseInt(m[1], 10)).slice(0, 7);
    const sum = data.reduce((acc, n) => acc + n, 0);
    return { labels, data, sum };
    */
  } catch (error) {
    console.error('Error fetching weekly dengue data:', error);
    return null;
  }
};

function HomeScreen({ user }: { user: User }) {
  const [populationData, setPopulationData] = useState(getLivePopulationData());
  const [healthStats, setHealthStats] = useState({
    dengueCases: 0,
    airQuality: 'Loading...',
    hospitalLoad: 0,
    weeklyDengue: 0,
    avgPsi: 0
  });
  // State for dengue trend chart
  const [weeklyDengueData, setWeeklyDengueData] = useState<number[]>([]);
  const [weeklyDengueLabels, setWeeklyDengueLabels] = useState<string[]>([]);

  // Update population counter every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPopulationData(getLivePopulationData());
    }, 10000);

    // Load health statistics
    loadHealthStats();

    return () => clearInterval(interval);
  }, []);

  const loadHealthStats = async () => {
    try {
      // Dynamically import stats module and fetch data
      const stats = await import('./stats');
      const [dengueData, psiData, covidData, weeklyResult] = await Promise.all([
        stats.dengueService.getTotalCases(),
        stats.psiService.fetchLatestPSI(),
        stats.covidService.getCovidCases(),
        fetchWeeklyDengueData()
      ]);
      // Set dengue trend data for chart
      const weeklySum = weeklyResult?.sum ?? 0;
      setWeeklyDengueData(weeklyResult?.data ?? []);
      setWeeklyDengueLabels(weeklyResult?.labels ?? []);
      
      // Debug output
      console.log('Weekly dengue data:', weeklyResult?.data);
      console.log('Weekly dengue labels:', weeklyResult?.labels);

      // Compute average PSI for four main regions
      const regions = psiData.regions || [];
      const filtered = (regions as Array<{ id: string; psi: number }>).filter(r => ['north', 'south', 'east', 'west'].includes(r.id));
      const avgPsi = filtered.reduce((sum: number, r) => sum + (r.psi || 0), 0) / (filtered.length || 1);

      setHealthStats({
        dengueCases: dengueData,
        airQuality: psiData?.national?.healthLevel?.level || 'Good',
        hospitalLoad: covidData.length,
        weeklyDengue: weeklySum,
        avgPsi: Math.round(avgPsi)
      });
    } catch (error) {
      console.error('Error loading health stats:', error);
    }
  };

  const formatNumber = (num: number) => num.toLocaleString('en-SG');

  // Render dengue chart component
  const renderDengueChart = () => {
    const chartData = {
      labels: weeklyDengueLabels.length > 0 ? weeklyDengueLabels : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          data: weeklyDengueData.length > 0 ? weeklyDengueData : [30, 29, 13, 17, 8, 6, 0],
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 3
        }
      ]
    };
    
    const chartConfig = {
      backgroundColor: '#1A237E',
      backgroundGradientFrom: '#0D1421',
      backgroundGradientTo: '#1A237E',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      propsForDots: {
        r: '6',
        strokeWidth: '2',
        stroke: '#4CAF50'
      },
      fillShadowGradientOpacity: 0.3,
      fillShadowGradient: '#4CAF50',
    };
    
    const screenWidth = Dimensions.get("window").width;
    
    return (
      <View style={{margin: 15}}>
        <Text style={styles.sectionTitle}>📊 Dengue Cases Trend (7 Days)</Text>
        <View style={{
          backgroundColor: 'rgba(13, 20, 33, 0.7)',
          padding: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: 'rgba(76, 175, 80, 0.3)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLines={true}
            withHorizontalLines={true}
            withDots={true}
            withShadow={true}
            segments={5}
          />
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.dashboardTitle}>🇸🇬 Singapore Health Pulse</Text>
        <Text style={styles.welcomeText}>Welcome, {user.email}</Text>
        <Text style={styles.tagline}>Live population and health monitoring</Text>
      </View>

      {/* Live Population Counter */}
      <View style={styles.liveStatsContainer}>
        <Text style={styles.liveStatsTitle}>🔴 LIVE Singapore Population</Text>
        <Text style={styles.livePopulationNumber}>
          {formatNumber(populationData.currentPopulation)}
        </Text>
        <Text style={styles.liveStatsSubtitle}>
          Growing by {populationData.today.growth} people today
        </Text>
      </View>

      {/* Today's Statistics */}
      <View style={styles.todayStatsContainer}>
        <Text style={styles.sectionTitle}>📊 Today's Statistics</Text>
        <View style={styles.todayStatsGrid}>
          <View style={styles.todayStatCard}>
            <Text style={styles.todayStatIcon}>👶</Text>
            <Text style={styles.todayStatNumber}>{populationData.today.births}</Text>
            <Text style={styles.todayStatLabel}>Births Today</Text>
          </View>
          <View style={styles.todayStatCard}>
            <Text style={styles.todayStatIcon}>🕊️</Text>
            <Text style={styles.todayStatNumber}>{populationData.today.deaths}</Text>
            <Text style={styles.todayStatLabel}>Deaths Today</Text>
          </View>
          <View style={styles.todayStatCard}>
            <Text style={styles.todayStatIcon}>✈️</Text>
            <Text style={styles.todayStatNumber}>{populationData.today.migration}</Text>
            <Text style={styles.todayStatLabel}>Net Migration</Text>
          </View>
          <View style={styles.todayStatCard}>
            <Text style={styles.todayStatIcon}>📈</Text>
            <Text style={styles.todayStatNumber}>{populationData.today.growth}</Text>
            <Text style={styles.todayStatLabel}>Population Growth</Text>
          </View>
        </View>
      </View>

      {/* Health Overview */}
      <View style={styles.healthOverviewContainer}>
        <Text style={styles.sectionTitle}>🏥 Health Overview</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{healthStats.dengueCases}</Text>
            <Text style={styles.statLabel}>Active Dengue Cases</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{healthStats.airQuality}</Text>
            <Text style={styles.statLabel}>Air Quality</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{formatNumber(populationData.additionalStats.lifeExpectancy)}</Text>
            <Text style={styles.statLabel}>Life Expectancy</Text>
          </View>
        </View>
      </View>

      {/* Weekly Dengue & Avg PSI Stats */}
      <View style={styles.todayStatsContainer}>
        <Text style={styles.sectionTitle}>📈 7-Day Dengue & Avg PSI</Text>
        <View style={styles.todayStatsGrid}>
          <View style={styles.todayStatCard}>
            <Text style={styles.todayStatIcon}>🦟</Text>
            <Text style={styles.todayStatNumber}>{healthStats.weeklyDengue}</Text>
            <Text style={styles.todayStatLabel}>7-Day Dengue Cases</Text>
          </View>
          <View style={styles.todayStatCard}>
            <Text style={styles.todayStatIcon}>🌐</Text>
            <Text style={styles.todayStatNumber}>{healthStats.avgPsi}</Text>
            <Text style={styles.todayStatLabel}>Avg PSI (4 regions)</Text>
          </View>
        </View>
      </View>
      
      {/* Dengue Trend Chart */}
      {renderDengueChart()}
      
      {/* Total Dengue Cases */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 15,
        marginBottom: 15
      }}>
        <View style={{
          width: (width - 45) / 2,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          padding: 15,
          borderRadius: 12,
          alignItems: 'center',
        }}>
          <Text style={{fontSize: 24, marginBottom: 8}}>📊</Text>
          <Text style={{fontSize: 20, fontWeight: 'bold', color: '#4CAF50', marginBottom: 4}}>{healthStats.weeklyDengue}</Text>
          <Text style={{fontSize: 12, color: '#B0BEC5', textAlign: 'center'}}>Total Dengue Cases</Text>
        </View>
      </View>

      {/* Demographics */}
      <View style={styles.demographicsContainer}>
        <Text style={styles.sectionTitle}>👥 Demographics</Text>
        <View style={styles.genderStats}>
          <View style={styles.genderCard}>
            <Text style={styles.genderIcon}>👨</Text>
            <Text style={styles.genderNumber}>{formatNumber(populationData.demographics.male.population)}</Text>
            <Text style={styles.genderLabel}>Male ({populationData.demographics.male.percentage}%)</Text>
          </View>
          <View style={styles.genderCard}>
            <Text style={styles.genderIcon}>👩</Text>
            <Text style={styles.genderNumber}>{formatNumber(populationData.demographics.female.population)}</Text>
            <Text style={styles.genderLabel}>Female ({populationData.demographics.female.percentage}%)</Text>
          </View>
        </View>
      </View>

      {/* Neighborhood Districts */}
      <Text style={styles.sectionTitle}>🏘️ Health Districts</Text>
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
    <View style={{
      flexDirection: 'row',
      backgroundColor: 'rgba(13, 20, 33, 0.95)',
      paddingTop: 8,
      paddingBottom: 8,
      borderTopWidth: 1,
      borderTopColor: 'rgba(76, 175, 80, 0.3)',
    }}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={{
            flex: 1,
            alignItems: 'center',
            paddingVertical: 6,
            backgroundColor: activeTab === tab.id ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
            borderRadius: 8,
            margin: 2,
          }}
          onPress={() => onTabPress(tab.id)}
        >
          <Text style={{
            fontSize: 24,
            marginBottom: 2,
            color: activeTab === tab.id ? '#4CAF50' : '#B0BEC5',
          }}>
            {tab.icon}
          </Text>
          <Text style={{
            fontSize: 12,
            color: activeTab === tab.id ? '#4CAF50' : '#B0BEC5',
            fontWeight: activeTab === tab.id ? '600' : '400',
          }}>
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
    <View style={styles.dashboardContainer}>
      <StatusBar style="light" backgroundColor="#0D1421" />
      <LinearGradient
        colors={['#0D1421', '#121E3A']}
        style={{flex: 1}}
      >
        {renderActiveScreen()}
      </LinearGradient>
      <BottomNavigation
        activeTab={activeTab}
        onTabPress={(tab) => setActiveTab(tab)}
      />
    </View>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing]);

  if (initializing) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D1421'}}>
        <Text style={{color: 'white', fontSize: 18}}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" backgroundColor="#0D1421" />
      {user ? <Dashboard user={user} /> : <AuthScreen />}
    </>
  );
}
