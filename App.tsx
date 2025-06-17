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
  KeyboardAvoidingView,
  Platform,
  Image
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
import ChatbotButton from './components/ChatbotButton';
import { styles, authStyles } from './src/styles/styles';
import { LineChart } from 'react-native-chart-kit';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const { width, height } = Dimensions.get('window');

const COUNTRIES = [
  'China',
  'India',
  'Indonesia',
  'Malaysia',
  'Singapore'
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

  const handleSelect = (country: string) => {
    setInputValue(country);
    onSelect(country);
    setIsVisible(false);
  };

  return (
    <View style={styles.countryDropdownWrapper}>
      <TouchableOpacity
        style={styles.countryInputContainer}
        onPress={() => setIsVisible(!isVisible)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.countryInput,
            !inputValue && { color: '#B0BEC5' }
          ]}
        >
          {inputValue || placeholder}
        </Text>
        <Text style={[styles.countryArrow, isVisible && styles.countryArrowUp]}>
          ▼
        </Text>
      </TouchableOpacity>

      {isVisible && (
        <>
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'transparent',
            }}
            onPress={() => setIsVisible(false)}
          />
          <View style={[styles.countryDropdown, { zIndex: 1 }]}>
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
        </>
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
      colors={['#1976D2', '#4CAF50', '#00796B']}
      style={[styles.loginContainer, { paddingTop: 0, paddingBottom: 0 }]}
    >
      <View style={styles.loginContent}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%'
          }}>
            <View style={[styles.citySkylne, { alignItems: 'center' }]}>
              <Image
                source={require('./assets/Screenshot_2025-06-18_at_3.30.31_AM-removebg-preview.png')}
                style={{
                  width: 300,
                  height: 200,
                  marginBottom: -50
                }}
                resizeMode="contain"
              />
            </View>

            <Text style={[styles.subtitle, { marginBottom: 30, maxWidth: 300, textAlign: 'center' }]}>
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

            <View style={[styles.inputContainer, { alignItems: 'center' }]}>
              {!isLogin && (
                <TextInput
                  style={[styles.input, { width: '100%' }]}
                  placeholder="Username"
                  placeholderTextColor="#333333"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              )}

              <TextInput
                style={[styles.input, { width: '100%' }]}
                placeholder="Email"
                placeholderTextColor="#333333"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={[styles.input, { width: '100%' }]}
                placeholder="Password"
                placeholderTextColor="#333333"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {!isLogin && (
                <>
                  <View style={{ width: '100%' }}>
                    <CountryDropdown
                      value={country}
                      onSelect={setCountry}
                      placeholder="Select your country"
                    />
                  </View>

                  <TextInput
                    style={[styles.input, { width: '100%' }]}
                    placeholder="Home Address"
                    placeholderTextColor="#333333"
                    value={homeAddress}
                    onChangeText={setHomeAddress}
                    multiline
                  />
                </>
              )}

              <TouchableOpacity
                style={[styles.enterButton, loading && styles.disabledButton, { width: '100%' }]}
                onPress={isLogin ? handleLogin : handleSignup}
                disabled={loading}
              >
                <Text style={styles.enterButtonText}>
                  {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
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
    const response = await fetch('https://www.nea.gov.sg/dengue-zika/dengue/dengue-cases');
    const html = await response.text();
    const tableMatch = html.match(/Number of Reported Cases[\s\S]*?<table[\s\S]*?>([\s\S]*?)<\/table>/i);
    if (!tableMatch) return null;
    const tableHtml = tableMatch[1];
    // Extract date labels from header
    const labels = Array.from(tableHtml.matchAll(/<th[^>]*>([^<]+)<\/th>/g)).map(m => m[1].trim()).slice(0, 7);
    // Extract daily counts
    const data = Array.from(tableHtml.matchAll(/<td[^>]*>(\d+)<\/td>/g)).map(m => parseInt(m[1], 10)).slice(0, 7);
    // Calculate sum of weekly cases
    const sum = data.reduce((acc, n) => acc + n, 0);
    return { labels, data, sum };
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
    // Process labels to remove time suffix (e.g., "16-Jun 11am" -> "16-Jun")
    const processedLabels = weeklyDengueLabels.length > 0
      ? weeklyDengueLabels.map(label => label.split(' ')[0])
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const processedData = weeklyDengueData.length > 0
      ? weeklyDengueData
      : [30, 29, 13, 17, 8, 6, 0];
    const chartData = {
      labels: processedLabels,
      datasets: [{
        data: processedData,
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 3
      }]
    };

    const chartConfig = {
      backgroundColor: '#0D1421',
      backgroundGradientFrom: '#0D1421',
      backgroundGradientTo: '#0D1421',
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

    // Render dengue chart within scroll padding (20 each side) with proper bounds
    return (
      <View style={{ margin: 16 }}>
        <Text style={styles.sectionTitle}>
          <FontAwesome5 name="chart-bar" size={18} color="#4CAF50" solid /> Dengue Cases Trend (7 Days)
        </Text>
        <View style={[styles.chartContainer, { alignItems: 'center', justifyContent: 'center' }]}>
          <LineChart
            data={chartData}
            // Chart width = screenWidth - margin*2 (15*2) - container padding*2 (16*2)
            width={screenWidth - 62}
            height={220}
            chartConfig={{
              ...chartConfig,
              propsForLabels: { fontSize: 10 }
            }}
            bezier
            style={{
              marginVertical: 0,
              borderRadius: 12,
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
    <ScrollView
      style={styles.dashboardContent}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.displayName || 'User'}</Text>
        <Text style={styles.dashboardTitle}>Singapore Health Pulse</Text>
        <Text style={styles.tagline}>Real-time health monitoring and reporting</Text>
      </View>

      {/* Population Stats */}
      <View style={styles.populationContainer}>
        <Text style={styles.sectionTitle}>
          <FontAwesome5 name="users" size={18} color="#4CAF50" solid /> Population Stats
        </Text>
        <View style={styles.populationCard}>
          <Text style={styles.populationNumber}>{formatNumber(populationData.currentPopulation)}</Text>
          <Text style={styles.populationLabel}>Total Population</Text>
        </View>
      </View>

      {/* Today's Statistics */}
      <View style={styles.todayStatsContainer}>
        <Text style={styles.sectionTitle}>
          <FontAwesome5 name="chart-bar" size={18} color="#4CAF50" solid /> Today's Statistics
        </Text>
        <View style={styles.todayStatsGrid}>
          <View style={styles.todayStatCard}>
            <FontAwesome5 name="baby" size={24} color="#4CAF50" style={styles.todayStatIcon} solid />
            <Text style={styles.todayStatNumber}>{populationData.today.births}</Text>
            <Text style={styles.todayStatLabel}>Births Today</Text>
          </View>
          <View style={styles.todayStatCard}>
            <FontAwesome5 name="dove" size={24} color="#4CAF50" style={styles.todayStatIcon} solid />
            <Text style={styles.todayStatNumber}>{populationData.today.deaths}</Text>
            <Text style={styles.todayStatLabel}>Deaths Today</Text>
          </View>
          <View style={styles.todayStatCard}>
            <FontAwesome5 name="plane" size={24} color="#4CAF50" style={styles.todayStatIcon} solid />
            <Text style={styles.todayStatNumber}>{populationData.today.migration}</Text>
            <Text style={styles.todayStatLabel}>Net Migration</Text>
          </View>
          <View style={styles.todayStatCard}>
            <FontAwesome5 name="chart-line" size={24} color="#4CAF50" style={styles.todayStatIcon} solid />
            <Text style={styles.todayStatNumber}>{populationData.today.growth}</Text>
            <Text style={styles.todayStatLabel}>Population Growth</Text>
          </View>
        </View>
      </View>

      {/* Health Overview */}
      <View style={styles.todayStatsContainer}>
        <Text style={styles.sectionTitle}>
          <FontAwesome5 name="hospital" size={18} color="#4CAF50" solid /> Health Overview
        </Text>
        <View style={styles.todayStatsGrid}>
          <View style={styles.todayStatCard}>
            <FontAwesome5 name="virus" size={24} color="#4CAF50" style={styles.todayStatIcon} solid />
            <Text style={styles.todayStatNumber}>{healthStats.dengueCases}</Text>
            <Text style={styles.todayStatLabel}>Active Dengue Cases</Text>
          </View>
          <View style={styles.todayStatCard}>
            <FontAwesome5 name="wind" size={24} color="#4CAF50" style={styles.todayStatIcon} solid />
            <Text style={styles.todayStatNumber}>{healthStats.airQuality}</Text>
            <Text style={styles.todayStatLabel}>Air Quality</Text>
          </View>
          <View style={styles.todayStatCard}>
            <FontAwesome5 name="heartbeat" size={24} color="#4CAF50" style={styles.todayStatIcon} solid />
            <Text style={styles.todayStatNumber}>{formatNumber(populationData.additionalStats.lifeExpectancy)}</Text>
            <Text style={styles.todayStatLabel}>Life Expectancy</Text>
          </View>
        </View>
      </View>

      {/* Weekly Dengue & Avg PSI Stats */}
      <View style={styles.todayStatsContainer}>
        <Text style={styles.sectionTitle}>
          <FontAwesome5 name="chart-line" size={18} color="#4CAF50" solid /> 7-Day Dengue & Avg PSI
        </Text>
        <View style={styles.todayStatsGrid}>
          <View style={styles.todayStatCard}>
            <FontAwesome5 name="bug" size={24} color="#4CAF50" style={styles.todayStatIcon} solid />
            <Text style={styles.todayStatNumber}>{healthStats.weeklyDengue}</Text>
            <Text style={styles.todayStatLabel}>7-Day Dengue Cases</Text>
          </View>
          <View style={styles.todayStatCard}>
            <FontAwesome5 name="globe-asia" size={24} color="#4CAF50" style={styles.todayStatIcon} solid />
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
          <FontAwesome5 name="chart-pie" size={24} color="#4CAF50" style={{ marginBottom: 8 }} solid />
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#4CAF50', marginBottom: 4 }}>{healthStats.weeklyDengue}</Text>
          <Text style={{ fontSize: 12, color: '#B0BEC5', textAlign: 'center' }}>Total Dengue Cases</Text>
        </View>
      </View>

      {/* Demographics */}
      <View style={styles.demographicsContainer}>
        <Text style={styles.sectionTitle}>
          <FontAwesome5 name="users" size={18} color="#4CAF50" solid /> Demographics
        </Text>
        <View style={styles.genderStats}>
          <View style={styles.genderCard}>
            <FontAwesome5 name="male" size={24} color="#4CAF50" style={styles.genderIcon} solid />
            <Text style={styles.genderNumber}>{formatNumber(populationData.demographics.male.population)}</Text>
            <Text style={styles.genderLabel}>Male ({populationData.demographics.male.percentage}%)</Text>
          </View>
          <View style={styles.genderCard}>
            <FontAwesome5 name="female" size={24} color="#4CAF50" style={styles.genderIcon} solid />
            <Text style={styles.genderNumber}>{formatNumber(populationData.demographics.female.population)}</Text>
            <Text style={styles.genderLabel}>Female ({populationData.demographics.female.percentage}%)</Text>
          </View>
        </View>
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
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'map', label: 'Map', icon: 'map-marked-alt' },
    { id: 'report', label: 'Reports', icon: 'clipboard-list' },
    { id: 'info', label: 'Profile', icon: 'user' },
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
          <FontAwesome5
            name={tab.icon}
            size={22}
            style={{
              marginBottom: 2,
              color: activeTab === tab.id ? '#4CAF50' : '#B0BEC5',
            }}
            solid
          />
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
        return <SafeAreaView style={{ flex: 1 }}><HomeScreen user={user} /></SafeAreaView>;
      case 'map':
        return <SafeAreaView style={{ flex: 1 }}><SingaporeMapScreen user={user} /></SafeAreaView>;
      case 'report':
        return <SafeAreaView style={{ flex: 1 }}><MapScreen user={user} /></SafeAreaView>;
      case 'info':
        return <SafeAreaView style={{ flex: 1 }}><InfoScreen user={user} /></SafeAreaView>;
      default:
        return <SafeAreaView style={{ flex: 1 }}><HomeScreen user={user} /></SafeAreaView>;
    }
  };

  return (
    <View style={[styles.dashboardContainer, { backgroundColor: '#0D1421', flex: 1 }]}>
      <StatusBar style="light" backgroundColor="transparent" translucent={true} />
      <LinearGradient
        colors={['#0D1421', '#121E3A']}
        style={{ flex: 1 }}
      >
        {renderActiveScreen()}

        {/* Health AI Chatbot Button - Only show on home screen */}
        {activeTab === 'home' && (
          <ChatbotButton
            openaiApiKey={process.env.EXPO_PUBLIC_OPENAI_API_KEY}
            userLocation="Singapore"
          />
        )}
      </LinearGradient>
      <SafeAreaView style={{ backgroundColor: 'rgba(13, 20, 33, 0.95)' }}>
        <BottomNavigation
          activeTab={activeTab}
          onTabPress={(tab) => setActiveTab(tab)}
        />
      </SafeAreaView>
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
      <View style={{ flex: 1, backgroundColor: '#0D1421', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="light" backgroundColor="transparent" translucent={true} />
        <Text style={{ color: 'white', fontSize: 18 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0D1421' }}>
      <StatusBar style="light" backgroundColor="transparent" translucent={true} />
      {user ? <Dashboard user={user} /> : <AuthScreen />}
    </View>
  );
}
