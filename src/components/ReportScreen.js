import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';
import { styles } from '../styles/styles';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import CustomButton from './CustomButton';

const REPORT_CATEGORIES = [
  { id: 'air', title: 'Air Quality', icon: 'smog', description: 'Air pollution, smog, smoke' },
  { id: 'water', title: 'Water Quality', icon: 'tint', description: 'Drinking water, contamination' },
  { id: 'waste', title: 'Waste Management', icon: 'trash', description: 'Garbage, recycling issues' },
  { id: 'noise', title: 'Noise Pollution', icon: 'volume-up', description: 'Loud noises, construction' },
  { id: 'disease', title: 'Disease Outbreak', icon: 'virus', description: 'Illness, epidemic concerns' },
  { id: 'mental', title: 'Mental Health', icon: 'brain', description: 'Stress, community wellbeing' },
  { id: 'food', title: 'Food Safety', icon: 'apple-alt', description: 'Food poisoning, nutrition' },
  { id: 'other', title: 'Other Health Issue', icon: 'first-aid', description: 'General health concerns' },
];

const ReportScreen = ({ user }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  const [mapRegion, setMapRegion] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    getCurrentLocation();
    fetchRecentReports();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is needed to submit reports with accurate location data.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = currentLocation.coords;
      setLocation({ latitude, longitude });

      // Set map region
      const region = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMapRegion(region);

      // Reverse geocoding to get address
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (reverseGeocode.length > 0) {
          const result = reverseGeocode[0];
          const formattedAddress = [
            result.street,
            result.streetNumber,
            result.district,
            result.city,
            result.region,
            result.country,
          ]
            .filter(Boolean)
            .join(', ');
          setAddress(formattedAddress || 'Location detected');
        } else {
          setAddress('Location detected');
        }
      } catch (geocodeError) {
        console.warn('Geocoding error:', geocodeError);
        setAddress('Location detected');
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. You can still submit a report, but location data will not be included.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    if (mapRegion && mapRef.current) {
      const newRegion = {
        ...mapRegion,
        latitudeDelta: mapRegion.latitudeDelta * 0.5,
        longitudeDelta: mapRegion.longitudeDelta * 0.5,
      };
      setMapRegion(newRegion);
      mapRef.current.animateToRegion(newRegion, 300);
    }
  };

  const handleZoomOut = () => {
    if (mapRegion && mapRef.current) {
      const newRegion = {
        ...mapRegion,
        latitudeDelta: Math.min(mapRegion.latitudeDelta * 2, 0.1),
        longitudeDelta: Math.min(mapRegion.longitudeDelta * 2, 0.1),
      };
      setMapRegion(newRegion);
      mapRef.current.animateToRegion(newRegion, 300);
    }
  };

  const toggleMapView = () => {
    setShowMap(!showMap);
  };

  const fetchRecentReports = () => {
    try {
      const reportsQuery = query(
        collection(db, COLLECTIONS.REPORTS),
        where('userId', '==', user?.uid || ''),
        orderBy('timestamp', 'desc'),
        limit(5)
      );

      const unsubscribe = onSnapshot(reportsQuery, (querySnapshot) => {
        const reports = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          reports.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate?.() || new Date(data.createdAt),
          });
        });
        setRecentReports(reports);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error fetching recent reports:', error);
    }
  };

  const handleSubmitReport = async () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a report category');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Error', 'Please provide a title for your report');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description for your report');
      return;
    }

    setSubmitting(true);

    try {
      const reportData = {
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || 'anonymous',
        category: selectedCategory.id,
        title: title.trim(),
        description: description.trim(),
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
        status: 'pending',
        votes: 0,
        verified: false,
      };

      // Add location data if available
      if (location) {
        reportData.location = {
          latitude: location.latitude,
          longitude: location.longitude,
        };
        reportData.address = address;
      }

      await addDoc(collection(db, COLLECTIONS.REPORTS), reportData);

      Alert.alert(
        'Success',
        'Your health report has been submitted successfully! Thank you for contributing to community health.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setSelectedCategory(null);
              setTitle('');
              setDescription('');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert(
        'Error',
        'Failed to submit your report. Please check your connection and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatRecentReportDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  const customStyles = StyleSheet.create({
    cancelButton: {
      backgroundColor: '#f8f9fa',
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
      borderWidth: 1,
      borderColor: '#e9ecef',
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#666',
    },
    locationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    mapToggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: 'rgba(76, 175, 80, 0.3)',
    },
    mapToggleText: {
      fontSize: 12,
      color: '#4CAF50',
      fontWeight: '500',
    },
    mapContainer: {
      marginTop: 15,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
    },
    miniMap: {
      width: '100%',
      height: 200,
    },
    customMarker: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    zoomControls: {
      position: 'absolute',
      right: 10,
      top: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: 8,
      overflow: 'hidden',
    },
    zoomButton: {
      backgroundColor: 'rgba(76, 175, 80, 0.9)',
      padding: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    },
  });

  return (
    <LinearGradient colors={['#0D1421', '#1A237E']} style={styles.screenContainer}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle}>
            <FontAwesome5 name="hospital" size={20} color="#4CAF50" solid /> Submit Health Report
          </Text>
          <Text style={styles.reportSubtitle}>
            Help improve community health by reporting health concerns in your area
          </Text>
        </View>

        {/* Location Status */}
        <View style={styles.locationContainer}>
          <View style={customStyles.locationHeader}>
            <Text style={styles.locationLabel}>
              <FontAwesome5 name="map-marker-alt" size={16} color="#4CAF50" solid /> Report Location
            </Text>
            {location && (
              <TouchableOpacity style={customStyles.mapToggleButton} onPress={toggleMapView}>
                <FontAwesome5 
                  name={showMap ? "eye-slash" : "map"} 
                  size={14} 
                  color="#4CAF50" 
                  solid 
                />
                <Text style={customStyles.mapToggleText}>
                  {showMap ? " Hide Map" : " Show Map"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {loading ? (
            <View style={styles.locationLoading}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.locationText}>Getting your location...</Text>
            </View>
          ) : location ? (
            <>
              <Text style={styles.locationText}>
                {address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
              </Text>
              
              {showMap && mapRegion && (
                <View style={customStyles.mapContainer}>
                  <MapView
                    ref={mapRef}
                    style={customStyles.miniMap}
                    region={mapRegion}
                    onRegionChangeComplete={setMapRegion}
                  >
                    <Marker coordinate={location}>
                      <View style={customStyles.customMarker}>
                        <FontAwesome5 name="map-marker-alt" size={24} color="#4CAF50" solid />
                      </View>
                    </Marker>
                  </MapView>
                  
                  {/* Zoom Controls */}
                  <View style={customStyles.zoomControls}>
                    <TouchableOpacity style={customStyles.zoomButton} onPress={handleZoomIn}>
                      <FontAwesome5 name="plus" size={16} color="#FFFFFF" solid />
                    </TouchableOpacity>
                    <TouchableOpacity style={customStyles.zoomButton} onPress={handleZoomOut}>
                      <FontAwesome5 name="minus" size={16} color="#FFFFFF" solid />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          ) : (
            <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
              <Text style={styles.locationButtonText}>
                <FontAwesome5 name="map-marker-alt" size={14} color="#FFFFFF" solid /> Get Location
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Report Category</Text>
          <View style={styles.categoriesGrid}>
            {REPORT_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory?.id === category.id && styles.selectedCategoryCard,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <FontAwesome5
                  name={category.icon}
                  size={30}
                  color={selectedCategory?.id === category.id ? '#4CAF50' : '#B0BEC5'}
                  style={styles.categoryIcon}
                  solid
                />
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Report Details */}
        {selectedCategory && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Report Details</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Report Title</Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder={`Brief title for your ${selectedCategory.title.toLowerCase()} report`}
                placeholderTextColor="#B0BEC5"
                maxLength={100}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Provide detailed information about the health concern, including when you noticed it, severity, and any other relevant details..."
                placeholderTextColor="#B0BEC5"
                multiline
                numberOfLines={6}
                maxLength={500}
              />
              <Text style={styles.characterCount}>
                {description.length}/500 characters
              </Text>
            </View>

            <CustomButton
              title="Submit Report"
              icon="clipboard-check"
              onPress={handleSubmitReport}
              loading={submitting}
              disabled={submitting}
            />
          </View>
        )}

        {/* Recent Reports */}
        {recentReports.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Your Recent Reports</Text>
            {recentReports.map((report) => (
              <View key={report.id} style={styles.recentReportCard}>
                <View style={styles.recentReportHeader}>
                  <Text style={styles.recentReportTitle}>{report.title}</Text>
                  <Text style={styles.recentReportTime}>
                    {formatRecentReportDate(report.timestamp)}
                  </Text>
                </View>
                <Text style={styles.recentReportDescription} numberOfLines={2}>
                  {report.description}
                </Text>
                <View style={styles.recentReportFooter}>
                  <Text style={styles.recentReportStatus}>
                    Status: {report.status || 'Pending'}
                  </Text>
                  <FontAwesome5
                    name={REPORT_CATEGORIES.find(cat => cat.id === report.category)?.icon || 'first-aid'}
                    size={20}
                    color="#4CAF50"
                    style={styles.recentReportCategory}
                    solid
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

export default ReportScreen; 