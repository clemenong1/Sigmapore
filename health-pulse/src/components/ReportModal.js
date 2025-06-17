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
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';
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

  useEffect(() => {
    if (!visible) {
      // Reset form when modal closes
      setTitle('');
      setDescription('');
      setErrors({});
    }
  }, [visible]);

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
      const reportData = {
        title: title.trim(),
        description: description.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
        userId: user.uid,
        userEmail: user.email,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.REPORTS), reportData);
      
      Alert.alert(
        'Success',
        'Health report submitted successfully!',
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
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={modalStyles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Submit Health Report</Text>
            <TouchableOpacity 
              style={modalStyles.closeButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={modalStyles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={modalStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.label}>Title *</Text>
              <TextInput
                style={[
                  modalStyles.input,
                  errors.title && { borderColor: '#ff4444' }
                ]}
                placeholder="Brief title for your health report"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
                editable={!loading}
              />
              {errors.title && (
                <Text style={modalStyles.errorText}>{errors.title}</Text>
              )}
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
          </ScrollView>

          <View style={modalStyles.buttonContainer}>
            <TouchableOpacity
              style={[modalStyles.button, modalStyles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={[modalStyles.buttonText, modalStyles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                modalStyles.button,
                loading && modalStyles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={modalStyles.buttonText}>Submit Report</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ReportModal; 