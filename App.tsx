import React, { useState, useEffect, createContext, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './src/config/firebase';
import MapScreen from './src/components/MapScreen';
import SingaporeMapScreen from './components/SingaporeMapScreen';
import InfoScreen from './src/components/InfoScreen';
import ReportScreen from './src/components/ReportScreen';
import HomeScreen from './src/components/HomeScreen';
import ChatbotButton from './components/ChatbotButton';
import { styles, authStyles } from './src/styles/styles';
import { LineChart } from 'react-native-chart-kit';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const { width, height } = Dimensions.get('window');

// Create language context
export const LanguageContext = createContext({
  language: 'english',
  setLanguage: (lang: string) => { },
  translations: {} as Record<string, Record<string, string>>
});

// Define translations
const translations = {
  english: {
    welcome: "Welcome",
    healthPulse: "Singapore Health Pulse",
    tagline: "Real-time health monitoring and reporting",
    populationStats: "Population Stats",
    totalPopulation: "Total Population",
    todayStatistics: "Today's Statistics",
    birthsToday: "Births Today",
    deathsToday: "Deaths Today",
    netMigration: "Net Migration",
    populationGrowth: "Population Growth",
    healthOverview: "Health Overview",
    activeDengueCases: "Active Dengue Cases",
    airQuality: "Air Quality",
    lifeExpectancy: "Life Expectancy",
    dengueAvgPsi: "7-Day Dengue & Avg PSI",
    dengueCases: "7-Day Dengue Cases",
    avgPsi: "Avg PSI (4 regions)",
    dengueTrend: "Dengue Cases Trend (7 Days)",
    totalDengueCases: "Total Dengue Cases",
    demographics: "Demographics",
    male: "Male",
    female: "Female",
    logout: "Logout",
    language: "Language",
    english: "English",
    chinese: "Chinese",
    malay: "Malay",
    tamil: "Tamil",
    hindi: "Hindi",

    // Navigation bar
    home: "Home",
    map: "Map",
    reports: "Reports",
    profile: "Profile",

    // Profile information
    profileInformation: "Profile Information",
    fullName: "Full Name",
    username: "Username",
    phoneNumber: "Phone Number",
    country: "Country",
    homeAddress: "Home Address",
    email: "Email",
    memberSince: "Member Since",
    emailCannotBeChanged: "Email cannot be changed",
    notProvided: "Not provided",
    edit: "Edit",
    cancel: "Cancel",
    saveChanges: "Save Changes",
    confirmLogout: "Confirm Logout",
    areYouSureLogout: "Are you sure you want to logout?",
    loading: "Loading...",
    loadingProfile: "Loading profile...",
    login: "Login",
    signUp: "Sign Up",
    password: "Password",
    selectCountry: "Select your country",
    pleaseWait: "Please wait...",
    createAccount: "Create Account",

    // Error messages
    error: "Error",
    fillAllFields: "Please fill in all fields",
    loginError: "Login Error",
    signupError: "Signup Error",
    success: "Success",
    accountCreated: "Account created successfully!",
    accountCreatedWithError: "Your account was created successfully, but there was an issue saving your profile data. Error: {0}\n\nYou can update your profile later in the app."
  },
  chinese: {
    welcome: "欢迎",
    healthPulse: "新加坡健康脉搏",
    tagline: "实时健康监测和报告",
    populationStats: "人口统计",
    totalPopulation: "总人口",
    todayStatistics: "今日统计",
    birthsToday: "今日出生",
    deathsToday: "今日死亡",
    netMigration: "净迁移",
    populationGrowth: "人口增长",
    healthOverview: "健康概览",
    activeDengueCases: "活跃登革热病例",
    airQuality: "空气质量",
    lifeExpectancy: "预期寿命",
    dengueAvgPsi: "7天登革热和平均PSI",
    dengueCases: "7天登革热病例",
    avgPsi: "平均PSI（4个地区）",
    dengueTrend: "登革热病例趋势（7天）",
    totalDengueCases: "登革热病例总数",
    demographics: "人口统计学",
    male: "男性",
    female: "女性",
    logout: "登出",
    language: "语言",
    english: "英语",
    chinese: "中文",
    malay: "马来语",
    tamil: "泰米尔语",
    hindi: "印地语",

    // Navigation bar
    home: "首页",
    map: "地图",
    reports: "报告",
    profile: "个人资料",

    // Profile information
    profileInformation: "个人资料信息",
    fullName: "全名",
    username: "用户名",
    phoneNumber: "电话号码",
    country: "国家",
    homeAddress: "家庭住址",
    email: "电子邮件",
    memberSince: "会员注册时间",
    emailCannotBeChanged: "电子邮件无法更改",
    notProvided: "未提供",
    edit: "编辑",
    cancel: "取消",
    saveChanges: "保存更改",
    confirmLogout: "确认登出",
    areYouSureLogout: "您确定要登出吗？",
    loading: "加载中...",
    loadingProfile: "加载个人资料中...",
    login: "登录",
    signUp: "注册",
    password: "密码",
    selectCountry: "选择国家",
    pleaseWait: "请稍候...",
    createAccount: "创建账户",

    // Error messages
    error: "错误",
    fillAllFields: "请填写所有字段",
    loginError: "登录错误",
    signupError: "注册错误",
    success: "成功",
    accountCreated: "账户创建成功！",
    accountCreatedWithError: "您的账户已成功创建，但保存个人资料数据时出现问题。错误：{0}\n\n您可以稍后在应用中更新您的个人资料。"
  },
  malay: {
    welcome: "Selamat Datang",
    healthPulse: "Denyut Kesihatan Singapura",
    tagline: "Pemantauan dan pelaporan kesihatan masa nyata",
    populationStats: "Statistik Penduduk",
    totalPopulation: "Jumlah Penduduk",
    todayStatistics: "Statistik Hari Ini",
    birthsToday: "Kelahiran Hari Ini",
    deathsToday: "Kematian Hari Ini",
    netMigration: "Migrasi Bersih",
    populationGrowth: "Pertumbuhan Penduduk",
    healthOverview: "Gambaran Kesihatan",
    activeDengueCases: "Kes Denggi Aktif",
    airQuality: "Kualiti Udara",
    lifeExpectancy: "Jangka Hayat",
    dengueAvgPsi: "Denggi 7 Hari & Purata PSI",
    dengueCases: "Kes Denggi 7 Hari",
    avgPsi: "Purata PSI (4 kawasan)",
    dengueTrend: "Trend Kes Denggi (7 Hari)",
    totalDengueCases: "Jumlah Kes Denggi",
    demographics: "Demografi",
    male: "Lelaki",
    female: "Perempuan",
    logout: "Log Keluar",
    language: "Bahasa",
    english: "Bahasa Inggeris",
    chinese: "Bahasa Cina",
    malay: "Bahasa Melayu",
    tamil: "Bahasa Tamil",
    hindi: "Bahasa Hindi",

    // Navigation bar
    home: "Laman Utama",
    map: "Peta",
    reports: "Laporan",
    profile: "Profil",

    // Profile information
    profileInformation: "Maklumat Profil",
    fullName: "Nama Penuh",
    username: "Nama Pengguna",
    phoneNumber: "Nombor Telefon",
    country: "Negara",
    homeAddress: "Alamat Rumah",
    email: "E-mel",
    memberSince: "Ahli Sejak",
    emailCannotBeChanged: "E-mel tidak boleh diubah",
    notProvided: "Tidak disediakan",
    edit: "Sunting",
    cancel: "Batal",
    saveChanges: "Simpan Perubahan",
    confirmLogout: "Sahkan Log Keluar",
    areYouSureLogout: "Adakah anda pasti mahu log keluar?",
    loading: "Memuatkan...",
    loadingProfile: "Memuatkan profil...",
    login: "Login",
    signUp: "Daftar",
    password: "Kata Laluan",
    selectCountry: "Pilih negara",
    pleaseWait: "Sila tunggu...",
    createAccount: "Buat Akun",

    // Error messages
    error: "Ralat",
    fillAllFields: "Sila isi semua medan",
    loginError: "Ralat Log Masuk",
    signupError: "Ralat Pendaftaran",
    success: "Berjaya",
    accountCreated: "Akaun berjaya dibuat!",
    accountCreatedWithError: "Akaun anda telah berjaya dibuat, tetapi terdapat masalah menyimpan data profil anda. Ralat: {0}\n\nAnda boleh mengemaskini profil anda kemudian dalam aplikasi."
  },
  tamil: {
    welcome: "வரவேற்கிறோம்",
    healthPulse: "சிங்கப்பூர் சுகாதார துடிப்பு",
    tagline: "நிகழ்நேர சுகாதார கண்காணிப்பு மற்றும் அறிக்கை",
    populationStats: "மக்கள்தொகை புள்ளிவிவரங்கள்",
    totalPopulation: "மொத்த மக்கள்தொகை",
    todayStatistics: "இன்றைய புள்ளிவிவரங்கள்",
    birthsToday: "இன்றைய பிறப்புகள்",
    deathsToday: "இன்றைய இறப்புகள்",
    netMigration: "நிகர இடம்பெயர்வு",
    populationGrowth: "மக்கள்தொகை வளர்ச்சி",
    healthOverview: "சுகாதார கண்ணோட்டம்",
    activeDengueCases: "செயலில் உள்ள டெங்கு வழக்குகள்",
    airQuality: "காற்று தரம்",
    lifeExpectancy: "ஆயுள் எதிர்பார்ப்பு",
    dengueAvgPsi: "7 நாள் டெங்கு & சராசரி PSI",
    dengueCases: "7 நாள் டெங்கு வழக்குகள்",
    avgPsi: "சராசரி PSI (4 பகுதிகள்)",
    dengueTrend: "டெங்கு வழக்குகள் போக்கு (7 நாட்கள்)",
    totalDengueCases: "மொத்த டெங்கு வழக்குகள்",
    demographics: "மக்கள்தொகை",
    male: "ஆண்",
    female: "பெண்",
    logout: "வெளியேறு",
    language: "மொழி",
    english: "ஆங்கிலம்",
    chinese: "சீனம்",
    malay: "மலாய்",
    tamil: "தமிழ்",
    hindi: "இந்தி",

    // Navigation bar
    home: "முகப்பு",
    map: "வரைபடம்",
    reports: "அறிக்கைகள்",
    profile: "சுயவிவரம்",

    // Profile information
    profileInformation: "சுயவிவர தகவல்",
    fullName: "முழு பெயர்",
    username: "பயனர்பெயர்",
    phoneNumber: "தொலைபேசி எண்",
    country: "நாடு",
    homeAddress: "வீட்டு முகவரி",
    email: "மின்னஞ்சல்",
    memberSince: "உறுப்பினராக இருந்து",
    emailCannotBeChanged: "மின்னஞ்சலை மாற்ற முடியாது",
    notProvided: "வழங்கப்படவில்லை",
    edit: "திருத்து",
    cancel: "ரத்து செய்",
    saveChanges: "மாற்றங்களை சேமி",
    confirmLogout: "வெளியேறுவதை உறுதிப்படுத்தவும்",
    areYouSureLogout: "நீங்கள் நிச்சயமாக வெளியேற விரும்புகிறீர்களா?",
    loading: "ஏற்றுகிறது...",
    loadingProfile: "சுயவிவரம் ஏற்றப்படுகிறது...",
    login: "உள்நுழைக",
    signUp: "புதிய கணக்கு தயாரிக்க",
    password: "கடவுச்சொல்",
    selectCountry: "நாட்டை தேர்ந்தெடுக்க",
    pleaseWait: "சரியாக நேரம் விட்டு வருகிறேன்...",
    createAccount: "புதிய கணக்கு தயாரிக்க",

    // Error messages
    error: "பிழை",
    fillAllFields: "அனைத்து புலங்களையும் நிரப்பவும்",
    loginError: "உள்நுழைவு பிழை",
    signupError: "பதிவு பிழை",
    success: "வெற்றி",
    accountCreated: "கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது!",
    accountCreatedWithError: "உங்கள் கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது, ஆனால் உங்கள் சுயவிவர தரவைச் சேமிப்பதில் சிக்கல் இருந்தது. பிழை: {0}\n\nபயன்பாட்டில் பின்னர் உங்கள் சுயவிவரத்தைப் புதுப்பிக்கலாம்."
  },
  hindi: {
    welcome: "स्वागत है",
    healthPulse: "सिंगापुर स्वास्थ्य पल्स",
    tagline: "रीयल-टाइम स्वास्थ्य निगरानी और रिपोर्टिंग",
    populationStats: "जनसंख्या आंकड़े",
    totalPopulation: "कुल जनसंख्या",
    todayStatistics: "आज के आंकड़े",
    birthsToday: "आज के जन्म",
    deathsToday: "आज की मौतें",
    netMigration: "शुद्ध प्रवास",
    populationGrowth: "जनसंख्या वृद्धि",
    healthOverview: "स्वास्थ्य अवलोकन",
    activeDengueCases: "सक्रिय डेंगू मामले",
    airQuality: "वायु गुणवत्ता",
    lifeExpectancy: "जीवन प्रत्याशा",
    dengueAvgPsi: "7-दिन डेंगू और औसत PSI",
    dengueCases: "7-दिन डेंगू मामले",
    avgPsi: "औसत PSI (4 क्षेत्र)",
    dengueTrend: "डेंगू मामलों का रुझान (7 दिन)",
    totalDengueCases: "कुल डेंगू मामले",
    demographics: "जनसांख्यिकी",
    male: "पुरुष",
    female: "महिला",
    logout: "लॉगआउट",
    language: "भाषा",
    english: "अंग्रे़ी",
    chinese: "चीनी",
    malay: "मलय",
    tamil: "तमिल",
    hindi: "हिंदी",

    // Navigation bar
    home: "होम",
    map: "नक्शा",
    reports: "रिपोर्ट",
    profile: "प्रोफाइल",

    // Profile information
    profileInformation: "प्रोफाइल जानकारी",
    fullName: "पूरा नाम",
    username: "उपयोगकर्ता नाम",
    phoneNumber: "फोन नंबर",
    country: "देश",
    homeAddress: "घर का पता",
    email: "ईमेल",
    memberSince: "कब से सदस्य हैं",
    emailCannotBeChanged: "ईमेल बदला नहीं जा सकता",
    notProvided: "प्रदान नहीं किया गया",
    edit: "संपादित करें",
    cancel: "रद्द करें",
    saveChanges: "परिवर्तन सहेजें",
    confirmLogout: "लॉगआउट की पुष्टि करें",
    areYouSureLogout: "क्या आप वाकई लॉगआउट करना चाहते हैं?",
    loading: "लोड हो रहा है...",
    loadingProfile: "प्रोफ़ाइल लोड हो रही है...",
    login: "लॉग इन",
    signUp: "साइन अप",
    password: "पासवर्ड",
    selectCountry: "देश चुनें",
    pleaseWait: "कृपया इंतजार करें...",
    createAccount: "खाता बनाएं",

    // Error messages
    error: "त्रुटि",
    fillAllFields: "कृपया सभी फ़ील्ड भरें",
    loginError: "लॉगिन त्रुटि",
    signupError: "साइनअप त्रुटि",
    success: "सफलता",
    accountCreated: "खाता सफलतापूर्वक बनाया गया!",
    accountCreatedWithError: "आपका खाता सफलतापूर्वक बनाया गया था, लेकिन आपके प्रोफ़ाइल डेटा को सहेजने में समस्या थी। त्रुटि: {0}\n\nआप बाद में ऐप में अपनी प्रोफ़ाइल अपडेट कर सकते हैं।"
  }
};

const COUNTRIES = [
  'China',
  'India',
  'Indonesia',
  'Malaysia',
  'Singapore'
];

interface UserData {
  username: string;
  email: string;
  country: string;
  homeAddress: string;
}

function CountryDropdown({
  value,
  onSelect,
  placeholder = "Select Country"
}: {
  value: string;
  onSelect: (country: string) => void;
  placeholder?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredCountries, setFilteredCountries] = useState(COUNTRIES);

  // Get language context
  const { language, translations } = useContext(LanguageContext);
  const t = translations[language] || translations.english;

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (inputValue === '') {
      setFilteredCountries(COUNTRIES);
    } else {
      const filtered = COUNTRIES.filter(country =>
        country.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  }, [inputValue]);

  const handleSelect = (country: string) => {
    setInputValue(country);
    onSelect(country);
    setIsVisible(false);
  };

  return (
    <View style={styles.countryDropdownWrapper}>
      <TouchableOpacity
        style={styles.countryInputContainer}
        onPress={() => setIsVisible(!isVisible)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.countryInput,
            !inputValue && { color: '#B0BEC5' }
          ]}
        >
          {inputValue || placeholder}
        </Text>
        <Text style={[styles.countryArrow, isVisible && styles.countryArrowUp]}>
          ▼
        </Text>
      </TouchableOpacity>

      {isVisible && (
        <>
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'transparent',
            }}
            onPress={() => setIsVisible(false)}
          />
          <View style={[styles.countryDropdown, { zIndex: 1 }]}>
            {filteredCountries.map((country, index) => (
              <TouchableOpacity
                key={country}
                style={[
                  styles.countryOption,
                  index === filteredCountries.length - 1 && styles.lastCountryOption
                ]}
                onPress={() => handleSelect(country)}
              >
                <Text style={styles.countryOptionText}>{country}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // Get language context
  const { language, setLanguage, translations } = useContext(LanguageContext);
  const t = translations[language] || translations.english;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t.error, t.fillAllFields);
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      Alert.alert(t.loginError, error.message);
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!email || !password || !username || !country || !homeAddress) {
      Alert.alert(t.error, t.fillAllFields);
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store additional user data in Firestore
      try {
        await setDoc(doc(db, 'users', user.uid), {
          username,
          email,
          country,
          homeAddress,
          createdAt: new Date().toISOString()
        });

        Alert.alert(t.success, t.accountCreated);
      } catch (firestoreError: any) {
        console.error('Firestore error:', firestoreError);

        // If Firestore fails, still complete signup but warn user
        Alert.alert(
          t.success,
          t.accountCreatedWithError.replace('{0}', firestoreError.message)
        );
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      Alert.alert(t.signupError, error.message);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setCountry('');
    setHomeAddress('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <LinearGradient
      colors={['#1976D2', '#4CAF50', '#00796B']}
      style={[styles.loginContainer, { paddingTop: 0, paddingBottom: 0 }]}
    >
      <View style={styles.loginContent}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%'
          }}>
            <View style={[styles.citySkylne, { alignItems: 'center' }]}>
              <Image
                source={require('./assets/Screenshot_2025-06-18_at_3.30.31_AM-removebg-preview.png')}
                style={{
                  width: 300,
                  height: 200,
                  marginBottom: -50
                }}
                resizeMode="contain"
              />
            </View>

            <Text style={[styles.subtitle, { marginBottom: 30, maxWidth: 300, textAlign: 'center' }]}>
              {t.tagline}
            </Text>

            <View style={styles.authToggle}>
              <TouchableOpacity
                style={[styles.toggleButton, isLogin && styles.activeToggle]}
                onPress={() => !isLogin && toggleMode()}
              >
                <Text style={[styles.toggleText, isLogin && styles.activeToggleText]}>
                  {t.login}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, !isLogin && styles.activeToggle]}
                onPress={() => isLogin && toggleMode()}
              >
                <Text style={[styles.toggleText, !isLogin && styles.activeToggleText]}>
                  {t.signUp}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.inputContainer, { alignItems: 'center' }]}>
              {!isLogin && (
                <TextInput
                  style={[styles.input, { width: '100%' }]}
                  placeholder={t.username}
                  placeholderTextColor="#333333"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              )}

              <TextInput
                style={[styles.input, { width: '100%' }]}
                placeholder={t.email}
                placeholderTextColor="#333333"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={[styles.input, { width: '100%' }]}
                placeholder={t.password}
                placeholderTextColor="#333333"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {!isLogin && (
                <>
                  <View style={{ width: '100%' }}>
                    <CountryDropdown
                      value={country}
                      onSelect={setCountry}
                      placeholder={t.selectCountry}
                    />
                  </View>

                  <TextInput
                    style={[styles.input, { width: '100%' }]}
                    placeholder={t.homeAddress}
                    placeholderTextColor="#333333"
                    value={homeAddress}
                    onChangeText={setHomeAddress}
                    multiline
                  />
                </>
              )}

              <TouchableOpacity
                style={[styles.enterButton, loading && styles.disabledButton, { width: '100%' }]}
                onPress={isLogin ? handleLogin : handleSignup}
                disabled={loading}
              >
                <Text style={styles.enterButtonText}>
                  {loading ? t.pleaseWait : isLogin ? t.login : t.createAccount}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const getLivePopulationData = () => {
  // Real-time data from countrymeters.info
  const currentTime = new Date();
  const startOfYear = new Date(currentTime.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((currentTime.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));

  // Base data from the website
  const baseData = {
    currentPopulation: 6480987,
    birthsPerDay: 137,
    deathsPerDay: 67,
    migrationPerDay: 219,
    growthPerDay: 289
  };

  // Calculate year-to-date numbers
  const yearToDate = {
    births: Math.floor(baseData.birthsPerDay * dayOfYear),
    deaths: Math.floor(baseData.deathsPerDay * dayOfYear),
    migration: Math.floor(baseData.migrationPerDay * dayOfYear),
    growth: Math.floor(baseData.growthPerDay * dayOfYear)
  };

  // Simulate live counter with small variations
  const variation = (base: number, percentage: number = 0.001) => {
    const change = Math.floor(base * percentage * (Math.random() - 0.5));
    return base + change;
  };

  return {
    currentPopulation: variation(baseData.currentPopulation + yearToDate.growth),
    demographics: {
      male: { population: 3267057, percentage: 50.4 },
      female: { population: 3213930, percentage: 49.6 }
    },
    today: {
      births: variation(baseData.birthsPerDay, 0.1),
      deaths: variation(baseData.deathsPerDay, 0.1),
      migration: variation(baseData.migrationPerDay, 0.1),
      growth: variation(baseData.growthPerDay, 0.1)
    },
    yearToDate,
    additionalStats: {
      lifeExpectancy: 82.1,
      literacyRate: 96.81,
      populationDensity: 9168,
      worldRank: 114
    }
  };
};

// Fetch weekly dengue cases and labels
const fetchWeeklyDengueData = async (): Promise<{ labels: string[]; data: number[]; sum: number } | null> => {
  try {
    const response = await fetch('https://www.nea.gov.sg/dengue-zika/dengue/dengue-cases');
    const html = await response.text();
    const tableMatch = html.match(/Number of Reported Cases[\s\S]*?<table[\s\S]*?>([\s\S]*?)<\/table>/i);
    if (!tableMatch) return null;
    const tableHtml = tableMatch[1];
    // Extract date labels from header
    const labels = Array.from(tableHtml.matchAll(/<th[^>]*>([^<]+)<\/th>/g)).map(m => m[1].trim()).slice(0, 7);
    // Extract daily counts
    const data = Array.from(tableHtml.matchAll(/<td[^>]*>(\d+)<\/td>/g)).map(m => parseInt(m[1], 10)).slice(0, 7);
    // Calculate sum of weekly cases
    const sum = data.reduce((acc, n) => acc + n, 0);
    return { labels, data, sum };
  } catch (error) {
    console.error('Error fetching weekly dengue data:', error);
    return null;
  }
};

function BottomNavigation({
  activeTab,
  onTabPress
}: {
  activeTab: string;
  onTabPress: (tab: string) => void;
}) {
  const { translations, language } = useContext(LanguageContext);
  const t = translations[language];

  const tabs = [
    { id: 'home', label: t.home, icon: 'home' },
    { id: 'map', label: t.map, icon: 'map-marked-alt' },
    { id: 'report', label: t.reports, icon: 'clipboard-list' },
    { id: 'info', label: t.profile, icon: 'user' },
  ];

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: 'rgba(13, 20, 33, 0.95)',
      paddingTop: 8,
      paddingBottom: 8,
      borderTopWidth: 1,
      borderTopColor: 'rgba(76, 175, 80, 0.3)',
    }}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={{
            flex: 1,
            alignItems: 'center',
            paddingVertical: 6,
            backgroundColor: activeTab === tab.id ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
            borderRadius: 8,
            margin: 2,
          }}
          onPress={() => onTabPress(tab.id)}
        >
          <FontAwesome5
            name={tab.icon}
            size={22}
            style={{
              marginBottom: 2,
              color: activeTab === tab.id ? '#4CAF50' : '#B0BEC5',
            }}
            solid
          />
          <Text style={{
            fontSize: 12,
            color: activeTab === tab.id ? '#4CAF50' : '#B0BEC5',
            fontWeight: activeTab === tab.id ? '600' : '400',
          }}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Dashboard({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState('home');

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <SafeAreaView style={{ flex: 1 }}><HomeScreen user={user} /></SafeAreaView>;
      case 'map':
        return <SafeAreaView style={{ flex: 1 }}><SingaporeMapScreen user={user} /></SafeAreaView>;
      case 'report':
        return <SafeAreaView style={{ flex: 1 }}><MapScreen user={user} /></SafeAreaView>;
      case 'info':
        return <SafeAreaView style={{ flex: 1 }}><InfoScreen user={user} /></SafeAreaView>;
      default:
        return <SafeAreaView style={{ flex: 1 }}><HomeScreen user={user} /></SafeAreaView>;
    }
  };

  return (
    <View style={[styles.dashboardContainer, { backgroundColor: '#0D1421', flex: 1 }]}>
      <StatusBar style="light" backgroundColor="transparent" translucent={true} />
      <LinearGradient
        colors={['#0D1421', '#121E3A']}
        style={{ flex: 1 }}
      >
        {renderActiveScreen()}

        {/* Health AI Chatbot Button - Only show on home screen */}
        {activeTab === 'home' && (
          <ChatbotButton
            openaiApiKey={process.env.EXPO_PUBLIC_OPENAI_API_KEY}
            userLocation="Singapore"
          />
        )}
      </LinearGradient>
      <SafeAreaView style={{ backgroundColor: 'rgba(13, 20, 33, 0.95)' }}>
        <BottomNavigation
          activeTab={activeTab}
          onTabPress={(tab) => setActiveTab(tab)}
        />
      </SafeAreaView>
    </View>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [language, setLanguage] = useState('english');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing]);

  if (initializing) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D1421', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="light" backgroundColor="transparent" translucent={true} />
        <Text style={{ color: 'white', fontSize: 18 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations }}>
      <View style={{ flex: 1, backgroundColor: '#0D1421' }}>
        <StatusBar style="light" backgroundColor="transparent" translucent={true} />
        {user ? <Dashboard user={user} /> : <AuthScreen />}
      </View>
    </LanguageContext.Provider>
  );
}
