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
  const [selectedSickness, setSelectedSickness] = useState([]);
  const [otherSickness, setOtherSickness] = useState('');
  const [peopleCount, setPeopleCount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);

  const sicknessOptions = ['Cough', 'Fever', 'Flu', 'Others'];
  const peopleCountOptions = ['0-2', '2-5', '5-10', '>10'];

  useEffect(() => {
    if (!visible) {
      // Reset form when modal closes
      setSelectedSickness([]);
      setOtherSickness('');
      setPeopleCount('');
      setDescription('');
      setErrors({});
      setShowDropdown(false);
    }
  }, [visible]);

  const handleSicknessToggle = (sickness) => {
    if (selectedSickness.includes(sickness)) {
      setSelectedSickness(selectedSickness.filter(s => s !== sickness));
      if (sickness === 'Others') {
        setOtherSickness('');
      }
    } else {
      setSelectedSickness([...selectedSickness, sickness]);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (selectedSickness.length === 0) {
      newErrors.sickness = 'Please select at least one sickness';
    }

    if (selectedSickness.includes('Others') && !otherSickness.trim()) {
      newErrors.otherSickness = 'Please specify the other sickness';
    }

    if (!peopleCount) {
      newErrors.peopleCount = 'Please select the number of people affected';
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
      // Create title from selected sickness
      let sicknessTitle = selectedSickness.filter(s => s !== 'Others').join(', ');
      if (selectedSickness.includes('Others') && otherSickness.trim()) {
        sicknessTitle += sicknessTitle ? `, ${otherSickness.trim()}` : otherSickness.trim();
      }

      const reportData = {
        sickness: selectedSickness,
        otherSickness: selectedSickness.includes('Others') ? otherSickness.trim() : '',
        peopleCount: peopleCount,
        title: `Health Report: ${sicknessTitle}`, // Auto-generated title
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
            {/* Sickness Selection */}
            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.label}>What sickness are you reporting? *</Text>
              {sicknessOptions.map((sickness) => (
                <TouchableOpacity
                  key={sickness}
                  style={modalStyles.checkboxContainer}
                  onPress={() => handleSicknessToggle(sickness)}
                  disabled={loading}
                >
                  <View style={[
                    modalStyles.checkbox,
                    selectedSickness.includes(sickness) && modalStyles.checkboxSelected
                  ]}>
                    {selectedSickness.includes(sickness) && (
                      <Text style={modalStyles.checkboxText}>✓</Text>
                    )}
                  </View>
                  <Text style={modalStyles.checkboxLabel}>{sickness}</Text>
                </TouchableOpacity>
              ))}
              {errors.sickness && (
                <Text style={modalStyles.errorText}>{errors.sickness}</Text>
              )}

              {/* Others text input */}
              {selectedSickness.includes('Others') && (
                <View style={{ marginTop: 10 }}>
                  <TextInput
                    style={[
                      modalStyles.input,
                      errors.otherSickness && { borderColor: '#ff4444' }
                    ]}
                    placeholder="Please specify the sickness"
                    value={otherSickness}
                    onChangeText={setOtherSickness}
                    editable={!loading}
                  />
                  {errors.otherSickness && (
                    <Text style={modalStyles.errorText}>{errors.otherSickness}</Text>
                  )}
                </View>
              )}
            </View>

            {/* People Count Selection */}
            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.label}>Number of people you know with the sickness *</Text>
              <TouchableOpacity
                style={modalStyles.dropdownContainer}
                onPress={() => setShowDropdown(!showDropdown)}
                disabled={loading}
              >
                <Text style={[
                  modalStyles.dropdownText,
                  !peopleCount && modalStyles.dropdownPlaceholder
                ]}>
                  {peopleCount || 'Select number of people'}
                </Text>
                <Text style={modalStyles.dropdownArrow}>▼</Text>
              </TouchableOpacity>

              {showDropdown && (
                <View style={modalStyles.dropdownList}>
                  {peopleCountOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={modalStyles.dropdownOption}
                      onPress={() => {
                        setPeopleCount(option);
                        setShowDropdown(false);
                      }}
                    >
                      <Text style={modalStyles.dropdownOptionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {errors.peopleCount && (
                <Text style={modalStyles.errorText}>{errors.peopleCount}</Text>
              )}
            </View>

            {/* Description */}
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

            {/* Location */}
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