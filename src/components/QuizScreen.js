import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Modal,
  ScrollView,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { styles } from '../styles/styles';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const QuizScreen = ({ user }) => {
  const [dailyQuestion, setDailyQuestion] = useState({
    question: "What is the vaccination for COVID-19?",
    answers: ["Pfizer", "Measles", "Mumps", "Tetanus"],
    correctAnswer: 0
  });
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnsweredToday, setHasAnsweredToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [userStats, setUserStats] = useState({
    quizPoints: 0,
    totalQuizAnswers: 0,
    correctAnswers: 0
  });
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(null);

  const animatedValues = dailyQuestion.answers.map(() => new Animated.Value(1));

  useEffect(() => {
    checkDailyQuizStatus();
    fetchUserStats();
  }, []);

  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const checkDailyQuizStatus = async () => {
    try {
      const today = getTodayDateString();
      const quizAnswersRef = collection(db, 'quizAnswers');
      const q = query(
        quizAnswersRef,
        where('userId', '==', user.uid),
        where('date', '==', today)
      );
      
      const querySnapshot = await getDocs(q);
      setHasAnsweredToday(!querySnapshot.empty);
      
      if (!querySnapshot.empty) {
        const todayAnswer = querySnapshot.docs[0].data();
        setSelectedAnswer(todayAnswer.selectedAnswer);
        setShowResult(true);
        setIsCorrect(todayAnswer.isCorrect);
      }
    } catch (error) {
      console.error('Error checking daily quiz status:', error);
      Alert.alert('Error', 'Failed to load quiz status');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserStats({
          quizPoints: userData.quizPoints || 0,
          totalQuizAnswers: userData.totalQuizAnswers || 0,
          correctAnswers: userData.correctAnswers || 0
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchLeaderboard = async () => {
    if (!showLeaderboard) return;
    
    console.log('Starting fetchLeaderboard...');
    setLoadingLeaderboard(true);
    setLeaderboardError(null);
    
    // Shorter timeout - 5 seconds
    const timeoutId = setTimeout(() => {
      console.log('Leaderboard fetch timeout - showing empty state');
      if (showLeaderboard) {
        setLeaderboardData([]);
        setLeaderboardError(null);
        setLoadingLeaderboard(false);
      }
    }, 5000);
    
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      clearTimeout(timeoutId);
      console.log('Found users:', querySnapshot.size);
      
      const users = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        
        // Include current user even without quiz activity for testing
        if (userData && (userData.totalQuizAnswers > 0 || userData.quizPoints > 0 || doc.id === user?.uid)) {
          users.push({
            id: doc.id,
            username: userData.username || userData.email?.split('@')[0] || 'You',
            quizPoints: userData.quizPoints || 0,
            totalQuizAnswers: userData.totalQuizAnswers || 0,
            correctAnswers: userData.correctAnswers || 0
          });
        }
      });

      users.sort((a, b) => b.quizPoints - a.quizPoints);
      
      if (showLeaderboard) {
        setLeaderboardData(users);
        setLeaderboardError(null);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Leaderboard error:', error);
      
      if (showLeaderboard) {
        // Just show empty state instead of error
        setLeaderboardData([]);
        setLeaderboardError(null);
      }
    } finally {
      if (showLeaderboard) {
        setLoadingLeaderboard(false);
      }
    }
  };

  const openLeaderboard = () => {
    console.log('Opening leaderboard...');
    setShowLeaderboard(true);
    setLoadingLeaderboard(true);
    setLeaderboardError(null);
    
    // Clear any existing data first
    setLeaderboardData([]);
    
    // Fetch data after modal is shown
    setTimeout(() => {
      fetchLeaderboard();
    }, 100);
  };

  // Test function to add dummy data for debugging
  const addTestData = () => {
    const dummyUsers = [
      { id: 'test1', username: 'TestUser1', quizPoints: 50, totalQuizAnswers: 5, correctAnswers: 4 },
      { id: 'test2', username: 'TestUser2', quizPoints: 30, totalQuizAnswers: 3, correctAnswers: 3 },
      { id: 'test3', username: 'TestUser3', quizPoints: 20, totalQuizAnswers: 2, correctAnswers: 1 },
    ];
    setLeaderboardData(dummyUsers);
    setLoadingLeaderboard(false);
    setLeaderboardError(null);
    console.log('Added test data:', dummyUsers);
  };

  // Test Firebase connectivity
  const testFirebaseConnection = async () => {
    console.log('Testing Firebase connection...');
    console.log('User authenticated:', !!user, user?.uid);
    console.log('Database instance:', !!db);
    
    try {
      // Try to write a test document
      const testDoc = {
        test: true,
        timestamp: new Date().toISOString(),
        userId: user?.uid
      };
      
      const docRef = await addDoc(collection(db, 'test'), testDoc);
      console.log('Firebase write test successful:', docRef.id);
      
      // Try to read it back
      const testQuery = await getDocs(collection(db, 'test'));
      console.log('Firebase read test successful, docs:', testQuery.size);
      
      Alert.alert('Success', 'Firebase connection is working!');
    } catch (error) {
      console.error('Firebase test failed:', error);
      Alert.alert('Firebase Error', `Connection failed: ${error.message}`);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    if (hasAnsweredToday || submitting) return;

    setSelectedAnswer(answerIndex);
    
    // Animate button selection
    Animated.sequence([
      Animated.timing(animatedValues[answerIndex], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues[answerIndex], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const submitAnswer = async () => {
    if (selectedAnswer === null || submitting) return;

    setSubmitting(true);
    const today = getTodayDateString();
    const correct = selectedAnswer === dailyQuestion.correctAnswer;
    const pointsEarned = correct ? 10 : 0;

    try {
      // Save quiz answer
      const quizAnswerData = {
        userId: user.uid,
        date: today,
        selectedAnswer,
        isCorrect: correct,
        pointsEarned,
        timestamp: new Date().toISOString()
      };

      await setDoc(doc(db, 'quizAnswers', `${user.uid}_${today}`), quizAnswerData);

      // Update user stats
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let newStats = {
        quizPoints: userStats.quizPoints + pointsEarned,
        totalQuizAnswers: userStats.totalQuizAnswers + 1,
        correctAnswers: userStats.correctAnswers + (correct ? 1 : 0)
      };

      if (userDoc.exists()) {
        await updateDoc(userDocRef, newStats);
      } else {
        // Create user document with basic info, but prompt to complete profile
        await setDoc(userDocRef, {
          ...newStats,
          email: user.email,
          username: user.email?.split('@')[0] || 'User', // Use email prefix as default username
          createdAt: new Date().toISOString()
        });
        
        // Alert user to complete their profile for leaderboard
        setTimeout(() => {
          Alert.alert(
            'Complete Your Profile',
            'To appear on the leaderboard, please complete your profile by setting a username in the Profile tab.',
            [{ text: 'OK' }]
          );
        }, 2000);
      }

      setUserStats(newStats);
      setHasAnsweredToday(true);
      setShowResult(true);
      setIsCorrect(correct);

      Alert.alert(
        correct ? '🎉 Correct!' : '❌ Incorrect',
        correct 
          ? `Great job! You earned ${pointsEarned} points!` 
          : `The correct answer was: ${dailyQuestion.answers[dailyQuestion.correctAnswer]}`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error submitting quiz answer:', error);
      Alert.alert('Error', 'Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const LeaderboardModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showLeaderboard}
      onRequestClose={() => setShowLeaderboard(false)}
    >
      <View style={styles.leaderboardOverlay}>
        <View style={styles.leaderboardContainer}>
          <LinearGradient colors={['#0D1421', '#1A237E']} style={{ flex: 1, borderRadius: 20, padding: 20 }}>
            <View style={styles.leaderboardHeader}>
              <View style={styles.leaderboardTitleContainer}>
                <FontAwesome5 name="trophy" size={24} color="#FFD700" solid />
                <Text style={styles.leaderboardTitle}> Quiz Leaderboard</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  style={[styles.leaderboardCloseButton, { marginRight: 10, backgroundColor: 'rgba(76, 175, 80, 0.2)' }]}
                  onPress={fetchLeaderboard}
                  disabled={loadingLeaderboard}
                >
                  <FontAwesome5 name="sync-alt" size={16} color="#4CAF50" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.leaderboardCloseButton, { backgroundColor: 'rgba(244, 67, 54, 0.2)' }]}
                  onPress={() => setShowLeaderboard(false)}
                >
                  <FontAwesome5 name="times" size={16} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={styles.leaderboardSubtitle}>Top Quiz Champions</Text>
            
            {loadingLeaderboard ? (
              <View style={styles.leaderboardLoading}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.leaderboardLoadingText}>Loading rankings...</Text>
              </View>
            ) : leaderboardError ? (
              <View style={styles.leaderboardEmpty}>
                <FontAwesome5 name="exclamation-triangle" size={32} color="#F44336" />
                <Text style={styles.leaderboardEmptyText}>Error loading leaderboard</Text>
                <Text style={styles.leaderboardEmptySubtext}>{leaderboardError}</Text>
                <TouchableOpacity
                  style={{
                    marginTop: 15,
                    backgroundColor: 'rgba(76, 175, 80, 0.8)',
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 20,
                  }}
                  onPress={fetchLeaderboard}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : leaderboardData.length === 0 ? (
              <View style={styles.leaderboardEmpty}>
                <FontAwesome5 name="trophy" size={32} color="#FFD700" />
                <Text style={styles.leaderboardEmptyText}>No quiz participants yet!</Text>
                <Text style={styles.leaderboardEmptySubtext}>Be the first to answer a question</Text>
              </View>
            ) : (
              <ScrollView style={styles.leaderboardList} showsVerticalScrollIndicator={false}>
                {leaderboardData.map((item, index) => {
                  const isTopThree = index < 3;
                  const getRankIcon = (position) => {
                    const iconProps = { size: 20, solid: true };
                    switch(position) {
                      case 0: return <FontAwesome5 name="medal" color="#FFD700" {...iconProps} />;
                      case 1: return <FontAwesome5 name="medal" color="#C0C0C0" {...iconProps} />;
                      case 2: return <FontAwesome5 name="medal" color="#CD7F32" {...iconProps} />;
                      default: return null;
                    }
                  };
                  const isCurrentUser = user && item.id === user.uid;
                  
                  return (
                    <View 
                      key={item.id || index}
                      style={[
                        styles.leaderboardItem,
                        isTopThree && styles.leaderboardItemTopThree,
                        isCurrentUser && styles.leaderboardItemCurrentUser
                      ]}
                    >
                      <View style={styles.leaderboardRank}>
                        {isTopThree ? (
                          getRankIcon(index)
                        ) : (
                          <Text style={[
                            styles.leaderboardRankText,
                            isTopThree && styles.leaderboardRankTextTopThree
                          ]}>
                            #{index + 1}
                          </Text>
                        )}
                      </View>
                      
                      <View style={styles.leaderboardUserInfo}>
                        <Text style={[
                          styles.leaderboardUsername,
                          isTopThree && styles.leaderboardUsernameTopThree,
                          isCurrentUser && styles.leaderboardUsernameCurrentUser
                        ]}>
                          {item.username || 'Unknown'} {isCurrentUser ? '(You)' : ''}
                        </Text>
                        <Text style={styles.leaderboardUserStats}>
                          {item.totalQuizAnswers || 0} questions • {item.totalQuizAnswers > 0 ? Math.round(((item.correctAnswers || 0) / item.totalQuizAnswers) * 100) : 0}% accuracy
                        </Text>
                      </View>
                      
                      <View style={styles.leaderboardPoints}>
                        <Text style={[
                          styles.leaderboardPointsText,
                          isTopThree && styles.leaderboardPointsTextTopThree
                        ]}>
                          {item.quizPoints || 0}
                        </Text>
                        <Text style={styles.leaderboardPointsLabel}>pts</Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#0D1421', '#1A237E']} style={styles.screenContainer}>
        <View style={[styles.screenContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading today's quiz...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0D1421', '#1A237E']} style={styles.screenContainer}>
      <View style={styles.quizContainer}>
        {/* Header */}
        <View style={styles.quizHeader}>
          <View style={styles.quizHeaderContent}>
            <View>
              <View style={styles.quizTitleContainer}>
                <FontAwesome5 name="book-medical" size={20} color="#4CAF50" solid />
                <Text style={styles.quizTitle}> Daily Health Quiz</Text>
              </View>
              <Text style={styles.quizSubtitle}>Test your health knowledge!</Text>
            </View>
            <TouchableOpacity
              style={styles.leaderboardButton}
              onPress={() => {
                console.log('Leaderboard button pressed');
                openLeaderboard();
              }}
            >
              <FontAwesome5 name="trophy" size={20} color="#FFD700" solid />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.quizStatsContainer}>
          <View style={styles.quizStatCard}>
            <Text style={styles.quizStatNumber}>{userStats.quizPoints}</Text>
            <Text style={styles.quizStatLabel}>Points</Text>
          </View>
          <View style={styles.quizStatCard}>
            <Text style={styles.quizStatNumber}>{userStats.totalQuizAnswers}</Text>
            <Text style={styles.quizStatLabel}>Answered</Text>
          </View>
          <View style={styles.quizStatCard}>
            <Text style={styles.quizStatNumber}>
              {userStats.totalQuizAnswers > 0 
                ? Math.round((userStats.correctAnswers / userStats.totalQuizAnswers) * 100)
                : 0}%
            </Text>
            <Text style={styles.quizStatLabel}>Accuracy</Text>
          </View>
        </View>

        {hasAnsweredToday ? (
          /* Already Answered */
          <View style={styles.quizCompletedContainer}>
            <FontAwesome5 name="check-circle" size={48} color="#4CAF50" solid />
            <Text style={styles.quizCompletedTitle}>Already answered today!</Text>
            <Text style={styles.quizCompletedText}>
              Come back tomorrow for a new question
            </Text>
            <Text style={styles.quizCompletedSubtext}>
              Your answer: {dailyQuestion.answers[selectedAnswer]}
            </Text>
            <Text style={[
              styles.quizCompletedResult,
              { color: isCorrect ? '#4CAF50' : '#F44336' }
            ]}>
              {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </Text>
          </View>
        ) : (
          /* Quiz Question */
          <View style={styles.quizQuestionContainer}>
            <Text style={styles.quizQuestion}>{dailyQuestion.question}</Text>
            
            <View style={styles.quizAnswersContainer}>
              {dailyQuestion.answers.map((answer, index) => (
                <Animated.View
                  key={index}
                  style={[
                    { transform: [{ scale: animatedValues[index] }] }
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.quizAnswerButton,
                      selectedAnswer === index && styles.quizAnswerButtonSelected,
                      showResult && index === dailyQuestion.correctAnswer && styles.quizAnswerButtonCorrect,
                      showResult && selectedAnswer === index && selectedAnswer !== dailyQuestion.correctAnswer && styles.quizAnswerButtonIncorrect
                    ]}
                    onPress={() => handleAnswerSelect(index)}
                    disabled={submitting}
                  >
                    <Text style={[
                      styles.quizAnswerText,
                      selectedAnswer === index && styles.quizAnswerTextSelected
                    ]}>
                      {answer}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            {selectedAnswer !== null && !submitting && (
              <TouchableOpacity
                style={styles.quizSubmitButton}
                onPress={submitAnswer}
              >
                <Text style={styles.quizSubmitButtonText}>Submit Answer</Text>
              </TouchableOpacity>
            )}

            {submitting && (
              <View style={styles.quizSubmittingContainer}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.quizSubmittingText}>Submitting...</Text>
              </View>
            )}
          </View>
        )}
      </View>
      
      <LeaderboardModal />
    </LinearGradient>
  );
};

export default QuizScreen; 