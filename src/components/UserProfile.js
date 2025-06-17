import React, { useState, useEffect } from 'react';
import {
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
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';
import { modalStyles } from '../styles/styles';

const UserProfile = ({ user, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState({
    fullName: '',
    phoneNumber: '',
    country: '',
    points: 0,
    badges: [],
    totalReports: 0,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          fullName: data.fullName || '',
          phoneNumber: data.phoneNumber || '',
          country: data.country || '',
          points: data.points || 0,
          badges: data.badges || [],
          totalReports: data.totalReports || 0,
        });
      } else {
        // User document doesn't exist, use default values
        setUserData({
          fullName: '',
          phoneNumber: '',
          country: '',
          points: 0,
          badges: [],
          totalReports: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!userData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (userData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (userData.phoneNumber && userData.phoneNumber.length > 0) {
      const phoneRegex = /^[+]?[\d\s\-()]+$/;
      if (!phoneRegex.test(userData.phoneNumber)) {
        newErrors.phoneNumber = 'Please enter a valid phone number';
      }
    }

    if (!userData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      const updatedData = {
        ...userData,
        email: user.email,
        uid: user.uid,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), updatedData);
      
      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const getBadgeEmoji = (badge) => {
    const badgeEmojis = {
      'first_report': '🏅',
      'active_reporter': '🌟',
      'trusted_user': '🛡️',
      'community_hero': '🦸',
      'health_advocate': '💚',
    };
    return badgeEmojis[badge] || '🏆';
  };

  if (loading) {
    return (
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <View style={[modalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={modalStyles.label}>Loading profile...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={modalStyles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={modalStyles.container}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>User Profile</Text>
          <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
            <Text style={modalStyles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={modalStyles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Stats Section */}
          <View style={{ marginBottom: 20, padding: 15, backgroundColor: '#f8f9fa', borderRadius: 10 }}>
            <Text style={[modalStyles.label, { textAlign: 'center', marginBottom: 10 }]}>
              📊 Your Stats
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#4CAF50' }}>
                  {userData.points}
                </Text>
                <Text style={{ fontSize: 12, color: '#666' }}>Points</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#2196F3' }}>
                  {userData.totalReports}
                </Text>
                <Text style={{ fontSize: 12, color: '#666' }}>Reports</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FF9800' }}>
                  {userData.badges.length}
                </Text>
                <Text style={{ fontSize: 12, color: '#666' }}>Badges</Text>
              </View>
            </View>
          </View>

          {/* Badges Section */}
          {userData.badges.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={modalStyles.label}>🏆 Your Badges</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {userData.badges.map((badge, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: '#fff3cd',
                      padding: 8,
                      borderRadius: 15,
                      borderWidth: 1,
                      borderColor: '#ffeaa7',
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>
                      {getBadgeEmoji(badge)} {badge.replace('_', ' ')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Email (Read-only) */}
          <View style={modalStyles.inputGroup}>
            <Text style={modalStyles.label}>Email</Text>
            <View style={[modalStyles.input, { backgroundColor: '#f0f0f0' }]}>
              <Text style={{ fontSize: 16, color: '#666' }}>{user.email}</Text>
            </View>
          </View>

          {/* Full Name */}
          <View style={modalStyles.inputGroup}>
            <Text style={modalStyles.label}>Full Name *</Text>
            <TextInput
              style={[
                modalStyles.input,
                errors.fullName && { borderColor: '#ff4444' }
              ]}
              placeholder="Enter your full name"
              value={userData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              editable={!saving}
            />
            {errors.fullName && (
              <Text style={modalStyles.errorText}>{errors.fullName}</Text>
            )}
          </View>

          {/* Phone Number */}
          <View style={modalStyles.inputGroup}>
            <Text style={modalStyles.label}>Phone Number</Text>
            <TextInput
              style={[
                modalStyles.input,
                errors.phoneNumber && { borderColor: '#ff4444' }
              ]}
              placeholder="Enter your phone number (optional)"
              value={userData.phoneNumber}
              onChangeText={(value) => handleInputChange('phoneNumber', value)}
              keyboardType="phone-pad"
              editable={!saving}
            />
            {errors.phoneNumber && (
              <Text style={modalStyles.errorText}>{errors.phoneNumber}</Text>
            )}
          </View>

          {/* Country */}
          <View style={modalStyles.inputGroup}>
            <Text style={modalStyles.label}>Country *</Text>
            <TextInput
              style={[
                modalStyles.input,
                errors.country && { borderColor: '#ff4444' }
              ]}
              placeholder="Enter your country"
              value={userData.country}
              onChangeText={(value) => handleInputChange('country', value)}
              editable={!saving}
            />
            {errors.country && (
              <Text style={modalStyles.errorText}>{errors.country}</Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={modalStyles.buttonContainer}>
            <TouchableOpacity
              style={[modalStyles.button, modalStyles.cancelButton]}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={modalStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                modalStyles.button,
                saving && modalStyles.disabledButton
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={modalStyles.buttonText}>
                {saving ? 'Saving...' : 'Save Profile'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default UserProfile; 