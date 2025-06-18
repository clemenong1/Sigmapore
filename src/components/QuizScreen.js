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
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { auth, db, COLLECTIONS } from '../config/firebase';
import { styles } from '../styles/styles';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const QuizScreen = ({ user }) => {
  const [dailyQuestion, setDailyQuestion] = useState({
    question: "How many hours of sleep do adults need per night for optimal health?",
    answers: ["7-9 hours", "5-6 hours", "10-12 hours", "4-5 hours"],
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
    if (user?.uid) {
      initializeQuiz();
    } else {
      setLoading(false);
      Alert.alert('Authentication Error', 'Please log in to access the quiz.');
    }
  }, [user]);

  const initializeQuiz = async () => {
    try {
      setLoading(true);
      await Promise.all([
        checkDailyQuizStatus(),
        fetchUserStats()
      ]);
    } catch (error) {
      console.error('Error initializing quiz:', error);
      Alert.alert('Error', 'Failed to load quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const checkDailyQuizStatus = async () => {
    if (!user?.uid) return;
    
    try {
      const today = getTodayDateString();
      const quizAnswersRef = collection(db, COLLECTIONS.QUIZ_ANSWERS);
      const q = query(
        quizAnswersRef,
        where('userId', '==', user.uid),
        where('date', '==', today)
      );
      
      console.log('Checking quiz status for user:', user.uid, 'date:', today);
      const querySnapshot = await getDocs(q);
      
      const hasAnswered = !querySnapshot.empty;
      setHasAnsweredToday(hasAnswered);
      
      if (hasAnswered) {
        const todayAnswer = querySnapshot.docs[0].data();
        setSelectedAnswer(todayAnswer.selectedAnswer);
        setShowResult(true);
        setIsCorrect(todayAnswer.isCorrect);
        console.log('User has already answered today:', todayAnswer);
      } else {
        console.log('User has not answered today');
      }
    } catch (error) {
      console.error('Error checking daily quiz status:', error);
      // Don't show error alert here, just log it
    }
  };

  const fetchUserStats = async () => {
    if (!user?.uid) return;
    
    try {
      const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const stats = {
          quizPoints: userData.quizPoints || 0,
          totalQuizAnswers: userData.totalQuizAnswers || 0,
          correctAnswers: userData.correctAnswers || 0
        };
        setUserStats(stats);
        console.log('Fetched user stats:', stats);
      } else {
        console.log('User document does not exist, will create on first quiz submission');
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchLeaderboard = async () => {
    if (!showLeaderboard || !user?.uid) return;
    
    console.log('Starting fetchLeaderboard...');
    setLoadingLeaderboard(true);
    setLeaderboardError(null);
    
    try {
      console.log('Fetching leaderboard data...');
      
      // Check if user is authenticated
      if (!user || !user.uid) {
        console.warn('User not authenticated for leaderboard');
        setLeaderboardData([]);
        return;
      }

      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        orderBy('quizPoints', 'desc'),
        limit(50) // Limit to top 50 users to prevent performance issues
      );
      
      const querySnapshot = await getDocs(q);
      
      console.log('Found users in database:', querySnapshot.size);
      
      const users = [];
      querySnapshot.forEach((doc) => {

        try {
          const userData = doc.data();
          // Include users with valid data
          if (userData && (userData.username || userData.email)) {
            users.push({
              id: doc.id,
              username: userData.username || userData.email?.split('@')[0] || 'Anonymous',
              quizPoints: Number(userData.quizPoints) || 0,
              totalQuizAnswers: Number(userData.totalQuizAnswers) || 0,
              correctAnswers: Number(userData.correctAnswers) || 0
            });
          }
        } catch (docError) {
          console.warn('Error processing user document:', docError);
        }
      });

      // Additional sort to ensure proper ordering
      users.sort((a, b) => {
        if (b.quizPoints !== a.quizPoints) {
          return b.quizPoints - a.quizPoints;
        }
        return b.totalQuizAnswers - a.totalQuizAnswers;
      });
      
      console.log('Leaderboard data fetched:', users.length, 'users');
      setLeaderboardData(users || []);

    } catch (error) {
      console.error('Leaderboard error:', error);
      setLeaderboardError('Failed to load rankings');
      setLeaderboardData([]); 
      // More specific error handling
      if (error.code === 'permission-denied') {
        Alert.alert('Access Denied', 'You need to be logged in to view the leaderboard.');
      } else if (error.code === 'unavailable') {
        Alert.alert('Network Error', 'Please check your internet connection and try again.');
      } else {
        Alert.alert('Error', 'Failed to load leaderboard. Please try again.');
      }
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const openLeaderboard = async () => {
    try {
      if (!user || !user.uid) {
        Alert.alert('Login Required', 'Please log in to view the leaderboard.');
        return;
      }
      
      console.log('Opening leaderboard...');
      setShowLeaderboard(true);
      await fetchLeaderboard();
    } catch (error) {
      console.error('Error opening leaderboard:', error);
      setShowLeaderboard(false);
      Alert.alert('Error', 'Failed to open leaderboard: ' + error.message);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    if (hasAnsweredToday || submitting) return;

    console.log('Answer selected:', answerIndex);
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
    if (selectedAnswer === null || submitting || !user?.uid) {
      console.log('Cannot submit:', { selectedAnswer, submitting, userUid: user?.uid });
      return;
    }

    console.log('Submitting answer:', selectedAnswer);
    setSubmitting(true);
    
    const today = getTodayDateString();
    const correct = selectedAnswer === dailyQuestion.correctAnswer;
    const pointsEarned = correct ? 10 : 0;

    try {
      // Save quiz answer with unique document ID
      const quizAnswerData = {
        userId: user.uid,
        date: today,
        selectedAnswer,
        isCorrect: correct,
        pointsEarned,
        timestamp: new Date().toISOString()
      };

      const docId = `${user.uid}_${today}`;
      await setDoc(doc(db, COLLECTIONS.QUIZ_ANSWERS, docId), quizAnswerData);
      console.log('Quiz answer saved successfully');

      // Update user stats
      const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
      const userDoc = await getDoc(userDocRef);
      
      const newStats = {
        quizPoints: userStats.quizPoints + pointsEarned,
        totalQuizAnswers: userStats.totalQuizAnswers + 1,
        correctAnswers: userStats.correctAnswers + (correct ? 1 : 0)
      };

      if (userDoc.exists()) {
        await updateDoc(userDocRef, newStats);
        console.log('User stats updated');
      } else {
        // Create user document
        const newUserData = {
          ...newStats,
          email: user.email,
          username: user.email?.split('@')[0] || 'User',
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newUserData);
        console.log('User document created');
        
        // Prompt user to complete profile
        setTimeout(() => {
          Alert.alert(
            'Complete Your Profile',
            'Visit the Profile tab to set a custom username for the leaderboard!',
            [{ text: 'OK' }]
          );
        }, 2000);
      }

      // Update local state
      setUserStats(newStats);
      setHasAnsweredToday(true);
      setShowResult(true);
      setIsCorrect(correct);

      // Show result
      Alert.alert(
        correct ? '🎉 Correct!' : '❌ Incorrect',
        correct 
          ? `Excellent! You earned ${pointsEarned} points!` 
          : `The correct answer was: ${dailyQuestion.answers[dailyQuestion.correctAnswer]}`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error submitting quiz answer:', error);
      Alert.alert(
        'Submission Error', 
        `Failed to submit your answer: ${error.message}. Please check your internet connection and try again.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetTodayQuiz = async () => {
    if (!user?.uid) return;
    
    try {
      const today = getTodayDateString();
      const docId = `${user.uid}_${today}`;
      
      // Delete today's quiz answer
      await deleteDoc(doc(db, COLLECTIONS.QUIZ_ANSWERS, docId));
      
      // Reset local state
      setHasAnsweredToday(false);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
      
      Alert.alert('Success', 'Today\'s quiz has been reset for testing!');
      
    } catch (error) {
      console.error('Error resetting quiz:', error);
      Alert.alert('Error', 'Failed to reset quiz: ' + error.message);
    }
  };

  const LeaderboardModal = () => {
    if (!showLeaderboard) return null;
    
    try {
      return (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showLeaderboard}
          onRequestClose={() => setShowLeaderboard(false)}
        >
          <View style={styles.leaderboardOverlay}>
            <View style={styles.leaderboardContainer}>
              <View style={{ flex: 1, backgroundColor: '#0D1421', borderRadius: 20, padding: 20 }}>
                <View style={styles.leaderboardHeader}>
                  <Text style={styles.leaderboardTitle}>🏆 Quiz Leaderboard</Text>
                  <TouchableOpacity
                    style={styles.leaderboardCloseButton}
                    onPress={() => setShowLeaderboard(false)}
                  >
                    <Text style={styles.leaderboardCloseButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.leaderboardSubtitle}>Top Quiz Champions</Text>
                
                {loadingLeaderboard ? (
                  <View style={styles.leaderboardLoading}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.leaderboardLoadingText}>Loading rankings...</Text>
                  </View>
                ) : !leaderboardData || leaderboardData.length === 0 ? (
                  <View style={styles.leaderboardEmpty}>
                    <Text style={styles.leaderboardEmptyText}>No quiz participants yet!</Text>
                    <Text style={styles.leaderboardEmptySubtext}>Be the first to answer a question</Text>
                  </View>
                ) : (
                  <ScrollView style={styles.leaderboardList} showsVerticalScrollIndicator={false}>
                    {leaderboardData.map((item, index) => {
                      try {
                        if (!item) return null;
                        
                        const safeItem = {
                          id: String(item.id || `user-${index}`),
                          username: String(item.username || item.email?.split('@')[0] || 'Anonymous'),
                          quizPoints: Number(item.quizPoints) || 0,
                          totalQuizAnswers: Number(item.totalQuizAnswers) || 0,
                          correctAnswers: Number(item.correctAnswers) || 0
                        };
                        
                        const isTopThree = index < 3;
                        const isCurrentUser = user && user.uid && item.id === user.uid;
                        
                        return (
                          <View 
                            key={safeItem.id}
                            style={styles.leaderboardItem}
                          >
                            <View style={styles.leaderboardRank}>
                              <Text style={styles.leaderboardRankText}>
                                {isTopThree ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
                              </Text>
                            </View>
                            
                            <View style={styles.leaderboardUserInfo}>
                              <Text style={styles.leaderboardUsername}>
                                {safeItem.username} {isCurrentUser ? '(You)' : ''}
                              </Text>
                              <Text style={styles.leaderboardUserStats}>
                                {safeItem.totalQuizAnswers} questions • {safeItem.totalQuizAnswers > 0 ? Math.round((safeItem.correctAnswers / safeItem.totalQuizAnswers) * 100) : 0}% accuracy
                              </Text>
                            </View>
                            
                            <View style={styles.leaderboardPoints}>
                              <Text style={styles.leaderboardPointsText}>
                                {safeItem.quizPoints}
                              </Text>
                              <Text style={styles.leaderboardPointsLabel}>pts</Text>
                            </View>
                          </View>
                        );
                      } catch (renderError) {
                        console.warn('Error rendering leaderboard item:', renderError);
                        return null;
                      }
                    }).filter(Boolean)}
                  </ScrollView>
                )}
              </View>
            </View>
          </View>
        </Modal>
      );
    } catch (error) {
      console.error('Error rendering leaderboard modal:', error);
      return (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showLeaderboard}
          onRequestClose={() => setShowLeaderboard(false)}
        >
          <View style={styles.leaderboardOverlay}>
            <View style={styles.leaderboardContainer}>
              <View style={{ flex: 1, backgroundColor: '#0D1421', borderRadius: 20, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 18, marginBottom: 20 }}>Error loading leaderboard</Text>
                <TouchableOpacity
                  style={{ backgroundColor: '#4CAF50', padding: 15, borderRadius: 10 }}
                  onPress={() => setShowLeaderboard(false)}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      );
    }
  };

  // Show authentication error if no user
  if (!user) {
    return (
      <LinearGradient colors={['#0D1421', '#1A237E']} style={styles.screenContainer}>
        <View style={[styles.screenContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <FontAwesome5 name="user-lock" size={48} color="#F44336" />
          <Text style={[styles.loadingText, { marginTop: 20 }]}>Please log in to access the quiz</Text>
          <Text style={[styles.loadingText, { fontSize: 14, opacity: 0.7, marginTop: 10 }]}>
            Visit the Profile tab to sign in
          </Text>
        </View>
      </LinearGradient>
    );
  }

  if (loading) {
    return (
      <LinearGradient colors={['#0D1421', '#1A237E']} style={styles.screenContainer}>
        <View style={[styles.screenContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading today's health quiz...</Text>
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
              onPress={openLeaderboard}
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
            {console.log('Quiz completed state:', { hasAnsweredToday, selectedAnswer, isCorrect })}
            <FontAwesome5 
              name={isCorrect ? "check-circle" : "times-circle"} 
              size={48} 
              color={isCorrect ? "#4CAF50" : "#F44336"} 
              solid 
            />
            <Text style={styles.quizCompletedTitle}>Quiz completed for today!</Text>
            <Text style={styles.quizCompletedText}>
              Come back tomorrow for a new health question
            </Text>
            <Text style={styles.quizCompletedSubtext}>
              Your answer: {dailyQuestion.answers[selectedAnswer]}
            </Text>
            <Text style={[
              styles.quizCompletedResult,
              { color: isCorrect ? '#4CAF50' : '#F44336' }
            ]}>
              {isCorrect ? '✓ Correct! +10 points' : '✗ Incorrect'}
            </Text>
            
            {/* Reset Button for Testing - Enhanced Visibility */}
            <TouchableOpacity
              style={{
                marginTop: 30,
                backgroundColor: '#FFC107',
                paddingHorizontal: 25,
                paddingVertical: 15,
                borderRadius: 25,
                borderWidth: 2,
                borderColor: '#FF9800',
                shadowColor: '#FFC107',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
              onPress={resetTodayQuiz}
            >
              <Text style={{ 
                color: '#000', 
                fontWeight: 'bold', 
                fontSize: 16,
                textAlign: 'center' 
              }}>
                🔄 RESET QUIZ (TESTING)
              </Text>
            </TouchableOpacity>
            
            {/* Debug Info */}
            <Text style={{ 
              color: '#666', 
              fontSize: 12, 
              textAlign: 'center', 
              marginTop: 10 
            }}>
              Debug: hasAnswered={hasAnsweredToday.toString()}
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
                <Text style={styles.quizSubmittingText}>Submitting your answer...</Text>
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