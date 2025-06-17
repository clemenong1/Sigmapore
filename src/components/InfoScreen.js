import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { styles } from '../styles/styles';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { LanguageContext } from '../../App';

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
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Get language context
  const { language, setLanguage, translations } = useContext(LanguageContext);
  const t = translations[language] || translations.english;

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
      t.confirmLogout,
      t.areYouSureLogout,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.logout,
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

  const handleLanguageChange = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setShowLanguageModal(false);
  };

  const renderLanguageModal = () => {
    const languages = [
      { code: 'english', name: 'English' },
      { code: 'chinese', name: '中文 (Chinese)' },
      { code: 'malay', name: 'Bahasa Melayu (Malay)' },
      { code: 'tamil', name: 'தமிழ் (Tamil)' },
      { code: 'hindi', name: 'हिंदी (Hindi)' }
    ];

    return (
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View
            style={{
              width: '80%',
              backgroundColor: '#0D1421',
              borderRadius: 15,
              padding: 20,
              borderWidth: 1,
              borderColor: 'rgba(76, 175, 80, 0.3)',
            }}
            onStartShouldSetResponder={() => true}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: 'white',
                marginBottom: 15,
                textAlign: 'center',
              }}
            >
              {t.language}
            </Text>

            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(255,255,255,0.1)',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <Text style={{ fontSize: 16, color: 'white' }}>{lang.name}</Text>
                {language === lang.code && (
                  <FontAwesome5 name="check" size={16} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={{
                marginTop: 20,
                backgroundColor: 'rgba(76, 175, 80, 0.8)',
                padding: 12,
                borderRadius: 10,
                alignItems: 'center',
              }}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>{t.cancel}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0D1421' }}>
        <View style={[styles.screenContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>{t.loadingProfile}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={['#0D1421', '#1A237E']} style={styles.screenContainer}>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {userProfile.username ? userProfile.username.charAt(0).toUpperCase() :
                  <FontAwesome5 name="user" size={24} color="white" />}
              </Text>
            </View>
            <Text style={styles.profileName}>
              {userProfile.username || 'User'}
            </Text>
            <Text style={styles.profileEmail}>{userProfile.email}</Text>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                <FontAwesome5 name="user-circle" size={18} color="#4CAF50" solid /> {t.profileInformation}
              </Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(!isEditing)}
              >
                <Text style={styles.editButtonText}>
                  {isEditing ? t.cancel : <><FontAwesome5 name="edit" size={14} color="white" /> {t.edit}</>}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>{t.fullName}</Text>
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
                  {userProfile.fullName || t.notProvided}
                </Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>{t.username}</Text>
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
                  {userProfile.username || t.notProvided}
                </Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>{t.phoneNumber}</Text>
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
                  {userProfile.phoneNumber || t.notProvided}
                </Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>{t.country}</Text>
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
                  {userProfile.country || t.notProvided}
                </Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>{t.homeAddress}</Text>
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
                  {userProfile.homeAddress || t.notProvided}
                </Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>{t.email}</Text>
              <Text style={styles.fieldValue}>{userProfile.email}</Text>
              <Text style={styles.fieldNote}>{t.emailCannotBeChanged}</Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>{t.memberSince}</Text>
              <Text style={styles.fieldValue}>
                {formatDate(userProfile.createdAt)}
              </Text>
            </View>

            {isEditing && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    <FontAwesome5 name="save" size={16} color="white" solid /> {t.saveChanges}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Language Selection Button */}
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(76, 175, 80, 0.8)',
              paddingVertical: 10,
              paddingHorizontal: 25,
              borderRadius: 20,
              alignSelf: 'center',
              marginTop: 30
            }}
            onPress={() => setShowLanguageModal(true)}
          >
            <Text style={{
              color: 'white',
              fontSize: 14,
              fontWeight: 'bold',
            }}>
              <FontAwesome5 name="language" size={14} color="white" /> {t.language}
            </Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(244, 67, 54, 0.8)',
              paddingVertical: 10,
              paddingHorizontal: 25,
              borderRadius: 20,
              alignSelf: 'center',
              marginVertical: 30,
              marginBottom: 50
            }}
            onPress={handleLogout}
          >
            <Text style={{
              color: 'white',
              fontSize: 14,
              fontWeight: 'bold',
            }}>
              <FontAwesome5 name="sign-out-alt" size={14} color="white" /> {t.logout}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>

      {renderLanguageModal()}
    </SafeAreaView>
  );
};

export default InfoScreen; 