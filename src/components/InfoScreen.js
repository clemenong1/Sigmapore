import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { styles } from '../styles/styles';

const InfoScreen = ({ user }) => {
  const [userProfile, setUserProfile] = useState({
    username: '',
    email: user?.email || '',
    country: '',
    homeAddress: '',
    fullName: '',
    phoneNumber: '',
    createdAt: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      if (user?.uid) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile({
            username: userData.username || '',
            email: userData.email || user.email,
            country: userData.country || '',
            homeAddress: userData.homeAddress || '',
            fullName: userData.fullName || '',
            phoneNumber: userData.phoneNumber || '',
            createdAt: userData.createdAt || '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (user?.uid) {
        await updateDoc(doc(db, 'users', user.uid), {
          username: userProfile.username,
          country: userProfile.country,
          homeAddress: userProfile.homeAddress,
          fullName: userProfile.fullName,
          phoneNumber: userProfile.phoneNumber,
          updatedAt: new Date().toISOString(),
        });
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={[styles.screenContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#0D1421', '#1A237E']} style={styles.screenContainer}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {userProfile.username ? userProfile.username.charAt(0).toUpperCase() : '👤'}
            </Text>
          </View>
          <Text style={styles.profileName}>
            {userProfile.fullName || userProfile.username || 'User'}
          </Text>
          <Text style={styles.profileEmail}>{userProfile.email}</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={userProfile.fullName}
                onChangeText={(text) =>
                  setUserProfile({ ...userProfile, fullName: text })
                }
                placeholder="Enter your full name"
                placeholderTextColor="#B0BEC5"
              />
            ) : (
              <Text style={styles.fieldValue}>
                {userProfile.fullName || 'Not provided'}
              </Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Username</Text>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={userProfile.username}
                onChangeText={(text) =>
                  setUserProfile({ ...userProfile, username: text })
                }
                placeholder="Enter your username"
                placeholderTextColor="#B0BEC5"
              />
            ) : (
              <Text style={styles.fieldValue}>
                {userProfile.username || 'Not provided'}
              </Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={userProfile.phoneNumber}
                onChangeText={(text) =>
                  setUserProfile({ ...userProfile, phoneNumber: text })
                }
                placeholder="Enter your phone number"
                placeholderTextColor="#B0BEC5"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.fieldValue}>
                {userProfile.phoneNumber || 'Not provided'}
              </Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Country</Text>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={userProfile.country}
                onChangeText={(text) =>
                  setUserProfile({ ...userProfile, country: text })
                }
                placeholder="Enter your country"
                placeholderTextColor="#B0BEC5"
              />
            ) : (
              <Text style={styles.fieldValue}>
                {userProfile.country || 'Not provided'}
              </Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Home Address</Text>
            {isEditing ? (
              <TextInput
                style={[styles.fieldInput, styles.addressInput]}
                value={userProfile.homeAddress}
                onChangeText={(text) =>
                  setUserProfile({ ...userProfile, homeAddress: text })
                }
                placeholder="Enter your home address"
                placeholderTextColor="#B0BEC5"
                multiline
              />
            ) : (
              <Text style={styles.fieldValue}>
                {userProfile.homeAddress || 'Not provided'}
              </Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email</Text>
            <Text style={styles.fieldValue}>{userProfile.email}</Text>
            <Text style={styles.fieldNote}>Email cannot be changed</Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Member Since</Text>
            <Text style={styles.fieldValue}>
              {formatDate(userProfile.createdAt)}
            </Text>
          </View>

          {isEditing && (
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.disabledButton]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default InfoScreen; 