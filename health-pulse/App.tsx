import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

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

function LoginScreen({ onLogin }: { onLogin: (city: string) => void }) {
  const [city, setCity] = useState('');
  const [community, setCommunity] = useState('');

  return (
    <LinearGradient
      colors={['#1976D2', '#4CAF50']}
      style={styles.loginContainer}
    >
      <SafeAreaView style={styles.loginContent}>
        <View style={styles.citySkylne}>
          <Text style={styles.skylineText}>🏙️🏢🏗️🏘️🌃</Text>
        </View>
        
        <Text style={styles.title}>🏙️ Health Pulse</Text>
        <Text style={styles.subtitle}>A Living City Health Visualization</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your city"
            placeholderTextColor="#B0BEC5"
            value={city}
            onChangeText={setCity}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Enter your community"
            placeholderTextColor="#B0BEC5"
            value={community}
            onChangeText={setCommunity}
          />
          
          <TouchableOpacity
            style={styles.enterButton}
            onPress={() => onLogin(city || 'Singapore')}
          >
            <Text style={styles.enterButtonText}>Enter Health City</Text>
          </TouchableOpacity>
        </View>
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

function Dashboard({ city }: { city: string }) {
  return (
    <LinearGradient
      colors={['#0D1421', '#1A237E']}
      style={styles.dashboardContainer}
    >
      <SafeAreaView style={styles.dashboardContent}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.dashboardTitle}>🏙️ {city} Health City</Text>
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
      </SafeAreaView>
    </LinearGradient>
  );
}

export default function App() {
  const [currentCity, setCurrentCity] = useState<string | null>(null);

  if (!currentCity) {
    return <LoginScreen onLogin={setCurrentCity} />;
  }

  return (
    <>
      <Dashboard city={currentCity} />
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
});
