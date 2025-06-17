import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc, 
  updateDoc, 
  increment 
} from 'firebase/firestore';
import { db, COLLECTIONS, createReportData } from '../config/firebase';
import { modalStyles } from '../styles/styles';

const ReportModal = ({ 
  visible, 
  onClose, 
  location, 
  user,
  onReportSubmitted 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (!visible) {
      // Reset form when modal closes
      setTitle('');
      setDescription('');
      setErrors({});
    }
  }, [visible]);

  useEffect(() => {
    // Fetch user's full name when component mounts
    if (user?.uid && visible) {
      fetchUserName();
    }
  }, [user, visible]);

  const fetchUserName = async () => {
    try {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.fullName || user.email || 'Anonymous');
      } else {
        setUserName(user.email || 'Anonymous');
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
      setUserName(user.email || 'Anonymous');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (description.trim().length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (!location || !location.latitude || !location.longitude) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateUserStats = async () => {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const currentData = userDoc.data();
        const newTotalReports = (currentData.totalReports || 0) + 1;
        const pointsToAdd = 10; // Base points for a report
        const newBadges = [...(currentData.badges || [])];
        
        // Award badges based on milestones
        if (newTotalReports === 1 && !newBadges.includes('first_report')) {
          newBadges.push('first_report');
        }
        if (newTotalReports === 5 && !newBadges.includes('active_reporter')) {
          newBadges.push('active_reporter');
        }
        if (newTotalReports === 10 && !newBadges.includes('health_advocate')) {
          newBadges.push('health_advocate');
        }
        if (newTotalReports === 20 && !newBadges.includes('community_hero')) {
          newBadges.push('community_hero');
        }
        
        await updateDoc(userRef, {
          totalReports: increment(1),
          points: increment(pointsToAdd),
          badges: newBadges,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Create user document if it doesn't exist
        const userData = {
          uid: user.uid,
          email: user.email,
          fullName: userName,
          phoneNumber: '',
          country: '',
          points: 10,
          badges: ['first_report'],
          totalReports: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await updateDoc(userRef, userData);
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
      // Don't throw error here as the report was still created successfully
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to submit a report');
      return;
    }

    setLoading(true);

    try {
      // Create report data with enhanced schema
      const reportData = createReportData(
        title.trim(),
        description.trim(),
        location.latitude,
        location.longitude,
        user.uid,
        userName
      );

      // Set server timestamp
      reportData.timestamp = serverTimestamp();

      const docRef = await addDoc(collection(db, COLLECTIONS.REPORTS), reportData);
      
      // Update user statistics
      await updateUserStats();
      
      Alert.alert(
        'Success',
        'Health report submitted successfully! You earned 10 points.',
        [
          {
            text: 'OK',
            onPress: () => {
              onReportSubmitted && onReportSubmitted();
              onClose();
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert(
        'Error',
        'Failed to submit report. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const formatLocation = () => {
    if (!location) return 'Location not available';
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={modalStyles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Report Health Issue</Text>
            <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
              <Text style={modalStyles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* User Info */}
            <View style={{ marginBottom: 15, padding: 10, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
              <Text style={{ fontSize: 14, color: '#666' }}>
                📝 Reporting as: {userName || 'Loading...'}
              </Text>
            </View>

            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.label}>Title *</Text>
              <TextInput
                style={[
                  modalStyles.input,
                  errors.title && { borderColor: '#ff4444' }
                ]}
                placeholder="Brief title for the health issue"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
                editable={!loading}
              />
              {errors.title && (
                <Text style={modalStyles.errorText}>{errors.title}</Text>
              )}
              <Text style={modalStyles.errorText}>
                {title.length}/100 characters
              </Text>
            </View>

            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.label}>Description *</Text>
              <TextInput
                style={[
                  modalStyles.input,
                  modalStyles.textArea,
                  errors.description && { borderColor: '#ff4444' }
                ]}
                placeholder="Describe the health issue or concern in detail..."
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={4}
                maxLength={500}
                editable={!loading}
              />
              {errors.description && (
                <Text style={modalStyles.errorText}>{errors.description}</Text>
              )}
              <Text style={modalStyles.errorText}>
                {description.length}/500 characters
              </Text>
            </View>

            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.label}>Location</Text>
              <View style={modalStyles.locationContainer}>
                <Text style={modalStyles.locationText}>
                  📍 {formatLocation()}
                </Text>
              </View>
              {errors.location && (
                <Text style={modalStyles.errorText}>{errors.location}</Text>
              )}
            </View>

            <View style={modalStyles.buttonContainer}>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.cancelButton]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={modalStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  modalStyles.button,
                  loading && modalStyles.disabledButton
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={modalStyles.buttonText}>
                  {loading ? (
                    <>
                      <ActivityIndicator size="small" color="white" />
                      {' '}Submitting...
                    </>
                  ) : 'Submit Report (+10 pts)'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ReportModal; 