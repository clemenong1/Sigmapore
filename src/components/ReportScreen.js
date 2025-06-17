import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
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

const REPORT_CATEGORIES = [
  { id: 'air', title: 'Air Quality', icon: '🏭', description: 'Air pollution, smog, smoke' },
  { id: 'water', title: 'Water Quality', icon: '💧', description: 'Drinking water, contamination' },
  { id: 'waste', title: 'Waste Management', icon: '🗑️', description: 'Garbage, recycling issues' },
  { id: 'noise', title: 'Noise Pollution', icon: '🔊', description: 'Loud noises, construction' },
  { id: 'disease', title: 'Disease Outbreak', icon: '🦠', description: 'Illness, epidemic concerns' },
  { id: 'mental', title: 'Mental Health', icon: '🧠', description: 'Stress, community wellbeing' },
  { id: 'food', title: 'Food Safety', icon: '🍎', description: 'Food poisoning, nutrition' },
  { id: 'other', title: 'Other Health Issue', icon: '⚕️', description: 'General health concerns' },
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

  return (
    <LinearGradient colors={['#0D1421', '#1A237E']} style={styles.screenContainer}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle}>🏥 Submit Health Report</Text>
          <Text style={styles.reportSubtitle}>
            Help improve community health by reporting health concerns in your area
          </Text>
        </View>

        {/* Location Status */}
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>📍 Report Location</Text>
          {loading ? (
            <View style={styles.locationLoading}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.locationText}>Getting your location...</Text>
            </View>
          ) : location ? (
            <Text style={styles.locationText}>
              {address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
            </Text>
          ) : (
            <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
              <Text style={styles.locationButtonText}>📍 Get Location</Text>
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
                <Text style={styles.categoryIcon}>{category.icon}</Text>
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

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.disabledButton]}
              onPress={handleSubmitReport}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitButtonText}>📋 Submit Report</Text>
              )}
            </TouchableOpacity>
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
                  <Text style={styles.recentReportCategory}>
                    {REPORT_CATEGORIES.find(cat => cat.id === report.category)?.icon || '⚕️'}
                  </Text>
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