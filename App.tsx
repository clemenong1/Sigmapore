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
import QuizScreen from './src/components/QuizScreen';
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
    quiz: "Quiz",
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
    quiz: "测验",
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
    dengueAvgPsi: "7-Hari Denggi & Purata PSI",
    dengueCases: "Kes Denggi 7-Hari",
    avgPsi: "Purata PSI (4 wilayah)",
    dengueTrend: "Trend Kes Denggi (7 Hari)",
    totalDengueCases: "Jumlah Kes Denggi",
    demographics: "Demografi",
    male: "Lelaki",
    female: "Perempuan",
    logout: "Log Keluar",
    language: "Bahasa",
    english: "Bahasa Inggeris",
    chinese: "Cina",
    malay: "Melayu",
    tamil: "Tamil",
    hindi: "Hindi",

    // Navigation bar
    home: "Rumah",
    map: "Peta",
    quiz: "Kuiz",
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
    edit: "Edit",
    cancel: "Batal",
    saveChanges: "Simpan Perubahan",
    confirmLogout: "Sahkan Log Keluar",
    areYouSureLogout: "Adakah anda pasti untuk log keluar?",
    loading: "Memuatkan...",
    loadingProfile: "Memuatkan profil...",
    login: "Log Masuk",
    signUp: "Daftar",
    password: "Kata Laluan",
    selectCountry: "Pilih negara anda",
    pleaseWait: "Sila tunggu...",
    createAccount: "Cipta Akaun",

    // Error messages
    error: "Ralat",
    fillAllFields: "Sila isi semua ruangan",
    loginError: "Ralat Log Masuk",
    signupError: "Ralat Pendaftaran",
    success: "Berjaya",
    accountCreated: "Akaun berjaya dicipta!",
    accountCreatedWithError: "Akaun anda telah berjaya dicipta, tetapi terdapat masalah menyimpan data profil anda. Ralat: {0}\n\nAnda boleh mengemas kini profil anda kemudian dalam aplikasi."
  },
  tamil: {
    welcome: "வரவேற்கிறோம்",
    healthPulse: "சிங்கப்பூர் சுகாதார துடிப்பு",
    tagline: "நிகழ்நேர சுகாதார கண்காணிப்பு மற்றும் அறிக்கை",
    populationStats: "மக்கள்தொகை புள்ளிவிவரங்கள்",
    totalPopulation: "மொத்த மக்கள்தொகை",
    todayStatistics: "இன்றைய புள்ளிவிவரங்கள்",
    birthsToday: "இன்று பிறப்புகள்",
    deathsToday: "இன்று இறப்புகள்",
    netMigration: "நிகர குடியேற்றம்",
    populationGrowth: "மக்கள்தொகை வளர்ச்சி",
    healthOverview: "சுகாதார கண்ணோட்டம்",
    activeDengueCases: "செயலில் உள்ள டெங்கு வழக்குகள்",
    airQuality: "காற்றின் தரம்",
    lifeExpectancy: "வாழ்க்கை எதிர்பார்ப்பு",
    dengueAvgPsi: "7-நாள் டெங்கு & சராசரி PSI",
    dengueCases: "7-நாள் டெங்கு வழக்குகள்",
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
    quiz: "வினாடிவினா",
    reports: "அறிக்கைகள்",
    profile: "சுயவிவரம்",

    // Profile information
    profileInformation: "சுயவிவர தகவல்",
    fullName: "முழு பெயர்",
    username: "பயனர் பெயர்",
    phoneNumber: "தொலைபேசி எண்",
    country: "நாடு",
    homeAddress: "வீட்டு முகவரி",
    email: "மின்னஞ்சல்",
    memberSince: "உறுப்பினர் ஆனது",
    emailCannotBeChanged: "மின்னஞ்சலை மாற்ற முடியாது",
    notProvided: "வழங்கப்படவில்லை",
    edit: "திருத்து",
    cancel: "ரத்து",
    saveChanges: "மாற்றங்களை சேமி",
    confirmLogout: "வெளியேறுவதை உறுதிப்படுத்தவும்",
    areYouSureLogout: "நீங்கள் நிச்சயமாக வெளியேற விரும்புகிறீர்களா?",
    loading: "ஏற்றுகிறது...",
    loadingProfile: "சுயவிவரம் ஏற்றுகிறது...",
    login: "உள்நுழை",
    signUp: "பதிவு செய்",
    password: "கடவுச்சொல்",
    selectCountry: "உங்கள் நாட்டைத் தேர்ந்தெடுக்கவும்",
    pleaseWait: "தயவுசெய்து காத்திருக்கவும்...",
    createAccount: "கணக்கை உருவாக்கவும்",

    // Error messages
    error: "பிழை",
    fillAllFields: "தயவுசெய்து அனைத்து புலங்களையும் நிரப்பவும்",
    loginError: "உள்நுழைவு பிழை",
    signupError: "பதிவு பிழை",
    success: "வெற்றி",
    accountCreated: "கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது!",
    accountCreatedWithError: "உங்கள் கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது, ஆனால் உங்கள் சுயவிவர தரவைச் சேமிப்பதில் சிக்கல் இருந்தது. பிழை: {0}\n\nநீங்கள் பின்னர் பயன்பாட்டில் உங்கள் சுயவிவரத்தை புதுப்பிக்கலாம்."
  },
  hindi: {
    welcome: "स्वागत है",
    healthPulse: "सिंगापुर स्वास्थ्य पल्स",
    tagline: "वास्तविक समय स्वास्थ्य निगरानी और रिपोर्टिंग",
    populationStats: "जनसंख्या आंकड़े",
    totalPopulation: "कुल जनसंख्या",
    todayStatistics: "आज के आंकड़े",
    birthsToday: "आज जन्म",
    deathsToday: "आज मृत्यु",
    netMigration: "शुद्ध प्रवासन",
    populationGrowth: "जनसंख्या वृद्धि",
    healthOverview: "स्वास्थ्य अवलोकन",
    activeDengueCases: "सक्रिय डेंगू के मामले",
    airQuality: "वायु गुणवत्ता",
    lifeExpectancy: "जीवन प्रत्याशा",
    dengueAvgPsi: "7-दिन डेंगू और औसत PSI",
    dengueCases: "7-दिन डेंगू के मामले",
    avgPsi: "औसत PSI (4 क्षेत्र)",
    dengueTrend: "डेंगू के मामलों की प्रवृत्ति (7 दिन)",
    totalDengueCases: "कुल डेंगू के मामले",
    demographics: "जनसांख्यिकी",
    male: "पुरुष",
    female: "महिला",
    logout: "लॉग आउट",
    language: "भाषा",
    english: "अंग्रे़ी",
    chinese: "चीनी",
    malay: "मलय",
    tamil: "तमिल",
    hindi: "हिंदी",

    // Navigation bar
    home: "होम",
    map: "मैप",
    quiz: "प्रश्नोत्तरी",
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
    memberSince: "सदस्य बने",
    emailCannotBeChanged: "ईमेल नहीं बदला जा सकता",
    notProvided: "प्रदान नहीं किया गया",
    edit: "संपादित करें",
    cancel: "रद्द करें",
    saveChanges: "परिवर्तन सहेजें",
    confirmLogout: "लॉग आउट की पुष्टि करें",
    areYouSureLogout: "क्या आप वाकई लॉग आउट करना चाहते हैं?",
    loading: "लोड हो रहा है...",
    loadingProfile: "प्रोफाइल लोड हो रहा है...",
    login: "लॉग इन",
    signUp: "साइन अप",
    password: "पासवर्ड",
    selectCountry: "अपना देश चुनें",
    pleaseWait: "कृपया प्रतीक्षा करें...",
    createAccount: "खाता बनाएं",

    // Error messages
    error: "त्रुटि",
    fillAllFields: "कृपया सभी फ़ील्ड भरें",
    loginError: "लॉगिन त्रुटि",
    signupError: "साइनअप त्रुटि",
    success: "सफलता",
    accountCreated: "खाता सफलतापूर्वक बनाया गया!",
    accountCreatedWithError: "आपका खाता सफलतापूर्वक बनाया गया था, लेकिन आपके प्रोफाइल डेटा को सहेजने में समस्या थी। त्रुटि: {0}\n\nआप बाद में ऐप में अपनी प्रोफाइल अपडेट कर सकते हैं।"
  }
};

// Health districts data
const healthDistricts: HealthDistrict[] = [
  {
    id: '1',
    name: 'Central Singapore',
    icon: '🏢',
    percentage: 85,
    color: '#4CAF50',
    description: 'Low health risk areas'
  },
  {
    id: '2',
    name: 'East Singapore',
    icon: '🏘️',
    percentage: 73,
    color: '#FF9800',
    description: 'Moderate dengue activity'
  },
  {
    id: '3',
    name: 'North Singapore',
    icon: '🏬',
    percentage: 92,
    color: '#2196F3',
    description: 'Good air quality'
  },
  {
    id: '4',
    name: 'West Singapore',
    icon: '🏭',
    percentage: 68,
    color: '#F44336',
    description: 'Higher PSI levels'
  },
  {
    id: '5',
    name: 'Northeast Singapore',
    icon: '🏠',
    percentage: 79,
    color: '#9C27B0',
    description: 'Mixed health indicators'
  },
  {
    id: '6',
    name: 'Northwest Singapore',
    icon: '🏘️',
    percentage: 88,
    color: '#00BCD4',
    description: 'Improving health trends'
  }
];

interface HealthDistrict {
  id: string;
  name: string;
  icon: string;
  percentage: number;
  color: string;
  description: string;
}

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
  const [isOpen, setIsOpen] = useState(false);
  
  const countries = [
    "Singapore", "Malaysia", "Indonesia", "Thailand", "Philippines", "Vietnam",
    "Cambodia", "Laos", "Myanmar", "Brunei", "United States", "United Kingdom",
    "Australia", "Canada", "India", "China", "Japan", "South Korea", "Other"
  ];

  const handleSelect = (country: string) => {
    onSelect(country);
    setIsOpen(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 25,
          paddingHorizontal: 20,
          paddingVertical: 12,
          marginBottom: 15,
          justifyContent: 'center'
        }}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={{ color: value ? '#333' : '#999' }}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>
      
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={{
            backgroundColor: 'white',
            margin: 20,
            borderRadius: 10,
            maxHeight: 400,
          }}>
            <FlatList
              data={countries}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    padding: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee'
                  }}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={{ fontSize: 16 }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      Alert.alert('Login Error', error.message);
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!email || !password || !username || !country || !homeAddress) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user data to Firestore
      try {
        await setDoc(doc(db, 'users', user.uid), {
          username,
          email,
          country,
          homeAddress,
          createdAt: new Date().toISOString(),
          quizPoints: 0,
          totalQuizAnswers: 0,
          correctAnswers: 0
        });
        Alert.alert('Success', 'Account created successfully!');
      } catch (firestoreError: any) {
        console.error('Firestore error:', firestoreError);
        Alert.alert(
          'Success',
          `Your account was created successfully, but there was an issue saving your profile data. Error: ${firestoreError.message}\n\nYou can update your profile later in the app.`
        );
      }
      
      resetForm();
    } catch (error: any) {
      Alert.alert('Signup Error', error.message);
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
    <View style={styles.loginContainer}>
      <LinearGradient
        colors={['#0D1421', '#1A2332', '#2A3441']}
        style={styles.loginContent}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'center', width: '100%' }}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
            <View style={{ marginBottom: -300, alignItems: 'center', marginTop: -400 }}>
              <Image 
                source={require('./assets/Screenshot_2025-06-18_at_3.30.31_AM-removebg-preview.png')}
                style={{ 
                  width: width * 1.05, 
                  height: 800, 
                  resizeMode: 'contain' 
                }}
              />
            </View>
            
            <View style={{ width: '100%', maxWidth: 300, marginTop: 0 }}>
              <TextInput
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 25,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  marginBottom: 15,
                  fontSize: 16,
                  color: '#333'
                }}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TextInput
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 25,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  marginBottom: 15,
                  fontSize: 16,
                  color: '#333'
                }}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              
              {!isLogin && (
                <>
                  <TextInput
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: 25,
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      marginBottom: 15,
                      fontSize: 16,
                      color: '#333'
                    }}
                    placeholder="Username"
                    placeholderTextColor="#999"
                    value={username}
                    onChangeText={setUsername}
                  />
                  
                  <CountryDropdown
                    value={country}
                    onSelect={setCountry}
                    placeholder="Select your country"
                  />
                  
                  <TextInput
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: 25,
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      marginBottom: 15,
                      fontSize: 16,
                      color: '#333',
                      minHeight: 50
                    }}
                    placeholder="Home Address"
                    placeholderTextColor="#999"
                    value={homeAddress}
                    onChangeText={setHomeAddress}
                    multiline
                  />
                </>
              )}
             
             <TouchableOpacity
               style={[{
                 backgroundColor: '#4CAF50',
                 paddingVertical: 15,
                 paddingHorizontal: 30,
                 borderRadius: 25,
                 marginTop: 20,
                 width: '100%',
                 alignItems: 'center'
               }, loading && { opacity: 0.6 }]}
               onPress={isLogin ? handleLogin : handleSignup}
               disabled={loading}
             >
               <Text style={{
                 color: 'white',
                 fontSize: 16,
                 fontWeight: 'bold'
               }}>
                 {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
               </Text>
             </TouchableOpacity>
             
             <TouchableOpacity
               style={{ marginTop: 20 }}
               onPress={toggleMode}
             >
               <Text style={{ color: '#4CAF50', fontSize: 16, textAlign: 'center' }}>
                 {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
               </Text>
             </TouchableOpacity>
           </View>
         </ScrollView>
       </KeyboardAvoidingView>
     </LinearGradient>
   </View>
  );
}

function DistrictCard({ district }: { district: HealthDistrict }) {
  const buildingHeight = (district.percentage / 100) * 60;

  return (
    <View style={styles.districtCard}>
      <View style={styles.districtHeader}>
        <Text style={styles.districtIcon}>{district.icon}</Text>
        <Text style={styles.districtName}>{district.name}</Text>
      </View>
      
      <View style={styles.buildingContainer}>
        <View 
          style={[
            styles.building, 
            { 
              height: buildingHeight, 
              backgroundColor: district.color 
            }
          ]} 
        />
        <Text style={styles.percentage}>{district.percentage}%</Text>
      </View>
      
      <Text style={styles.description}>{district.description}</Text>
    </View>
  );
}

export const getLivePopulationData = () => {
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
    { id: 'quiz', label: t.quiz, icon: 'question-circle' },
    { id: 'report', label: t.reports, icon: 'clipboard-list' },
    { id: 'info', label: t.profile, icon: 'user' },
  ];

  return (
    <View style={styles.bottomNavigation}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.navItem,
            activeTab === tab.id && styles.activeNavItem,
          ]}
          onPress={() => onTabPress(tab.id)}
        >
          <FontAwesome5
            name={tab.icon}
            size={20}
            style={{
              marginBottom: 2,
              color: activeTab === tab.id ? '#4CAF50' : '#B0BEC5',
            }}
            solid
          />
          <Text style={{
            fontSize: 10,
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
      case 'quiz':
        return <SafeAreaView style={{ flex: 1 }}><QuizScreen user={user} /></SafeAreaView>;
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
          onTabPress={(tab: string) => setActiveTab(tab)}
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
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setUser(user);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

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