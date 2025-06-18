import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  StyleSheet,
  SafeAreaView,
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
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const MapScreen = ({ user }) => {
  const [location, setLocation] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentRegion, setCurrentRegion] = useState(null);
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
    let unsubscribe;

    if (user) {
      unsubscribe = setupReportsListener();
    } else {
      // Clear reports when user logs out
      setReports([]);
      setError(null);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const requestLocationPermission = async () => {
    // For demo purposes, always use Singapore location
    setLocation(defaultLocation);
    setCurrentRegion(defaultLocation);
    setLoading(false);
  };

  const handleZoomIn = () => {
    if (currentRegion && mapRef.current) {
      const newRegion = {
        ...currentRegion,
        latitudeDelta: currentRegion.latitudeDelta * 0.5,
        longitudeDelta: currentRegion.longitudeDelta * 0.5,
      };
      setCurrentRegion(newRegion);
      mapRef.current.animateToRegion(newRegion, 300);
    }
  };

  const handleZoomOut = () => {
    if (currentRegion && mapRef.current) {
      const newRegion = {
        ...currentRegion,
        latitudeDelta: Math.min(currentRegion.latitudeDelta * 2, 0.5),
        longitudeDelta: Math.min(currentRegion.longitudeDelta * 2, 0.5),
      };
      setCurrentRegion(newRegion);
      mapRef.current.animateToRegion(newRegion, 300);
    }
  };

  const handleRegionChange = (region) => {
    setCurrentRegion(region);
  };

  const setupReportsListener = () => {
    if (!user) {
      console.log('User not authenticated, skipping reports listener setup');
      return;
    }

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
          console.log('Reports loaded:', reportsData.length, 'reports');
          console.log('Sample report:', reportsData[0]);
          setReports(reportsData);
          setError(null);
        },
        (error) => {
          console.error('Error fetching reports:', error);
          if (error.code === 'permission-denied') {
            console.log('Permission denied - user may not be authenticated');
            setError('Authentication required to view reports.');
          } else {
            setError('Failed to load reports. Please check your connection.');
          }
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
      return 'smog';
    } else if (titleLower.includes('water') || titleLower.includes('drinking')) {
      return 'tint';
    } else if (titleLower.includes('waste') || titleLower.includes('garbage')) {
      return 'trash';
    } else if (titleLower.includes('noise')) {
      return 'volume-up';
    } else if (titleLower.includes('disease') || titleLower.includes('illness')) {
      return 'virus';
    } else if (titleLower.includes('mental') || titleLower.includes('stress')) {
      return 'brain';
    } else if (titleLower.includes('food') || titleLower.includes('nutrition')) {
      return 'apple-alt';
    } else {
      return 'first-aid'; // Default health icon
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={[mapStyles.container, { backgroundColor: '#f5f5f5' }]}>
        {/* Header with instruction */}
        <View style={mapStyles.header}>
          <Text style={mapStyles.headerTitle}>
            <FontAwesome5 name="map-marker-alt" size={18} color="#4CAF50" solid /> Tap a location to report!
          </Text>
        </View>

        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={mapStyles.map}
          initialRegion={location || defaultLocation}
          region={currentRegion}
          onRegionChangeComplete={handleRegionChange}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton
        >
          {reports
            .filter(report => report.latitude && report.longitude)
            .map(report => (
              <Marker
                key={report.id}
                coordinate={{
                  latitude: report.latitude,
                  longitude: report.longitude,
                }}
                title={report.title}
                description={report.description}
                onPress={() => handleMarkerPress(report)}
              >
                <View style={mapStyles.markerContainer}>
                  <FontAwesome5
                    name={getMarkerIcon(report.title)}
                    size={24}
                    color="#4CAF50"
                    solid
                  />
                </View>
              </Marker>
            ))}
        </MapView>

        {/* Zoom Controls */}
        <View style={mapStyles.zoomControls}>
          <TouchableOpacity style={mapStyles.zoomButton} onPress={handleZoomIn}>
            <FontAwesome5 name="plus" size={20} color="#FFFFFF" solid />
          </TouchableOpacity>
          <TouchableOpacity style={[mapStyles.zoomButton, { borderBottomWidth: 0 }]} onPress={handleZoomOut}>
            <FontAwesome5 name="minus" size={20} color="#FFFFFF" solid />
          </TouchableOpacity>
        </View>

        {/* Floating Action Button */}
        <TouchableOpacity
          style={mapStyles.fab}
          onPress={handleFabPress}
        >
          <FontAwesome5 name="plus" size={24} color="white" style={mapStyles.fabIcon} solid />
        </TouchableOpacity>

        {/* Report Modal */}
        <ReportModal
          visible={showReportModal}
          onClose={() => setShowReportModal(false)}
          location={selectedLocation}
          onSubmit={handleReportSubmitted}
          user={user}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',  // show underlying gradient
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
});

export default MapScreen; 