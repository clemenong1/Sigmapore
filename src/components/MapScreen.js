import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  limit 
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';
import { mapStyles } from '../styles/styles';
import ReportModal from './ReportModal';

const MapScreen = ({ user }) => {
  const [location, setLocation] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapRef = useRef(null);

  // Singapore default location
  const defaultLocation = {
    latitude: 1.3521,
    longitude: 103.8198,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  useEffect(() => {
    requestLocationPermission();
    setupReportsListener();
  }, []);

  const requestLocationPermission = async () => {
    // For demo purposes, ignore device geo and use default Singapore center
    setLocation(defaultLocation);
    setLoading(false);
  };

  const setupReportsListener = () => {
    try {
      const reportsQuery = query(
        collection(db, COLLECTIONS.REPORTS),
        orderBy('timestamp', 'desc'),
        limit(100) // Limit to prevent performance issues
      );

      const unsubscribe = onSnapshot(
        reportsQuery,
        (querySnapshot) => {
          const reportsData = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            reportsData.push({
              id: doc.id,
              ...data,
              // Handle Firestore Timestamp
              timestamp: data.timestamp?.toDate?.() || new Date(data.createdAt),
            });
          });
          setReports(reportsData);
          setError(null);
        },
        (error) => {
          console.error('Error fetching reports:', error);
          setError('Failed to load reports. Please check your connection.');
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up reports listener:', error);
      setError('Failed to setup real-time updates.');
    }
  };

  const getMarkerIcon = (title) => {
    // Simple icon mapping based on report title keywords
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('air') || titleLower.includes('pollution')) {
      return '🏭';
    } else if (titleLower.includes('water') || titleLower.includes('drinking')) {
      return '💧';
    } else if (titleLower.includes('waste') || titleLower.includes('garbage')) {
      return '🗑️';
    } else if (titleLower.includes('noise')) {
      return '🔊';
    } else if (titleLower.includes('disease') || titleLower.includes('illness')) {
      return '🦠';
    } else if (titleLower.includes('mental') || titleLower.includes('stress')) {
      return '🧠';
    } else if (titleLower.includes('food') || titleLower.includes('nutrition')) {
      return '🍎';
    } else {
      return '⚕️'; // Default health icon
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
    setShowReportModal(true);
  };

  const handleFabPress = () => {
    if (location) {
      setSelectedLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      setShowReportModal(true);
    } else {
      Alert.alert(
        'Location Required',
        'Please wait for location to be detected or tap on the map to select a location.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleReportSubmitted = () => {
    // Reports will be updated automatically via the real-time listener
    console.log('Report submitted successfully');
  };

  const handleMarkerPress = (report) => {
    Alert.alert(
      report.title,
      `${report.description}\n\n${formatDate(report.timestamp)}`,
      [{ text: 'OK' }]
    );
  };

  const retry = () => {
    setLoading(true);
    setError(null);
    requestLocationPermission();
    setupReportsListener();
  };

  if (loading) {
    return (
      <View style={mapStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={mapStyles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (error && !location) {
    return (
      <View style={mapStyles.errorContainer}>
        <Text style={mapStyles.errorText}>{error}</Text>
        <TouchableOpacity style={mapStyles.retryButton} onPress={retry}>
          <Text style={mapStyles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={mapStyles.container}>
      {/* Header with instruction */}
      <View style={mapStyles.header}>
        <Text style={mapStyles.headerTitle}>📍 Tap a location to report!</Text>
      </View>
      
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={mapStyles.map}
        initialRegion={location || defaultLocation}
        showsUserLocation={true}
        showsMyLocationButton={true}
        myLocationButtonTintColor="#4285F4"
        onPress={handleMapPress}
        mapType="standard"
      >
        {reports.map((report) => (
          <Marker
            key={report.id}
            coordinate={{
              latitude: report.latitude,
              longitude: report.longitude,
            }}
            title={report.title}
            description={`${report.description} • ${formatDate(report.timestamp)}`}
            onPress={() => handleMarkerPress(report)}
          >
            <View style={{
              backgroundColor: '#ff4444',
              padding: 8,
              borderRadius: 20,
              borderWidth: 3,
              borderColor: 'white',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}>
              <Text style={{ fontSize: 20, color: 'white' }}>
                {getMarkerIcon(report.title)}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity
        style={mapStyles.fab}
        onPress={handleFabPress}
        activeOpacity={0.8}
      >
        <Text style={mapStyles.fabIcon}>+</Text>
      </TouchableOpacity>

      <ReportModal
        visible={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setSelectedLocation(null);
        }}
        location={selectedLocation}
        user={user}
        onReportSubmitted={handleReportSubmitted}
      />

      {error && (
        <View style={mapStyles.errorContainer}>
          <Text style={mapStyles.errorText}>{error}</Text>
          <TouchableOpacity style={mapStyles.retryButton} onPress={retry}>
            <Text style={mapStyles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default MapScreen; 