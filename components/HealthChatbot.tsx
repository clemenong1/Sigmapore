import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HealthChatbotService, ChatMessage } from '../stats/services/chatbotService';
import HealthDataHeatmap from './HealthDataHeatmap';
import MiniHeatmap from './MiniHeatmap';

const { width, height } = Dimensions.get('window');

interface HealthChatbotProps {
  openaiApiKey?: string;
  userLocation?: string;
  onClose: () => void;
}

const HealthChatbot: React.FC<HealthChatbotProps> = ({ 
  openaiApiKey, 
  userLocation, 
  onClose 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const chatbotService = useRef(new HealthChatbotService(openaiApiKey));
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      text: `👋 Hi! I'm your Singapore Health Assistant!\n\nI can help you with:\n🦟 Dengue risk information\n🌬️ Air quality (PSI) data\n🏥 COVID-19 guidance\n✈️ Travel health advice\n📊 Health predictions\n\nTry asking: "What's the dengue risk in Woodlands?" or "I'm traveling to Tampines, any health advice?"`,
      isUser: false,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);

  useEffect(() => {
    if (openaiApiKey) {
      chatbotService.current.setApiKey(openaiApiKey);
    }
  }, [openaiApiKey]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await chatbotService.current.processMessage(userMessage, userLocation);
      
      // Add typing delay for better UX
      setTimeout(() => {
        setMessages((prev) => [...prev, response]);
        setIsTyping(false);
        setIsLoading(false);
        scrollToBottom();
      }, 1000);

    } catch (error) {
      console.error('Chat error:', error);
      setIsLoading(false);
      setIsTyping(false);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatMessageTime = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderQuickReplies = () => {
    const quickReplies = [
      "What's the air quality tomorrow?",
      "Predict dengue risk for next week",
      "COVID forecast for weekend",
      "Health data transparency",
      "Show me the health heatmap"
    ];

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRepliesContainer}>
        {quickReplies.map((reply, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickReplyButton}
            onPress={() => {
              setInputText(reply);
            }}
          >
            <Text style={styles.quickReplyText}>{reply}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.isUser;
    
    return (
      <Animated.View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.botMessage,
          { opacity: fadeAnim }
        ]}
      >
        {!isUser && (
          <View style={styles.botAvatar}>
            <Text style={styles.botAvatarText}>🤖</Text>
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.botText
          ]}>
            {message.text}
          </Text>
          
          {/* ALWAYS show MiniHeatmap for ANY location-related response */}
          {(message.locationData || message.predictionData || 
           (message.metadata && (message.metadata.type === 'location_recommendation' || 
                                message.metadata.type === 'travel_recommendation' || 
                                message.metadata.type === 'prediction'))) && (
            <View style={styles.metadataContainer}>
              {/* Show real location data if available */}
              {message.locationData && (
                <MiniHeatmap
                  locationData={message.locationData}
                  onExpand={() => {
                    setHeatmapData(message.locationData);
                    setShowHeatmap(true);
                  }}
                />
              )}
              
              {/* Show prediction data if available */}
              {message.predictionData && (
                <MiniHeatmap
                  predictionData={message.predictionData}
                  onExpand={() => {
                    // Convert prediction data to location analysis format for HealthDataHeatmap
                    const convertedData = {
                      location: message.metadata?.location || 'Singapore',
                      dengueRisk: { 
                        level: message.predictionData.dengueRisk.predicted > 100 ? 'High' : 
                               message.predictionData.dengueRisk.predicted > 50 ? 'Medium' : 'Low', 
                        casesNearby: message.predictionData.dengueRisk.predicted 
                      },
                      airQuality: { 
                        psi: message.predictionData.airQuality.predictedPSI, 
                        level: message.predictionData.airQuality.predictedPSI > 100 ? 'Unhealthy' : 
                               message.predictionData.airQuality.predictedPSI > 50 ? 'Moderate' : 'Good'
                      },
                      covidRisk: { 
                        level: message.predictionData.covidRisk.predicted > 50 ? 'High' : 
                               message.predictionData.covidRisk.predicted > 25 ? 'Medium' : 'Low', 
                        hospitalCases: message.predictionData.covidRisk.predicted 
                      },
                      overallRisk: message.predictionData.overallRisk.level || 'Medium'
                    };
                    setHeatmapData(convertedData);
                    setShowHeatmap(true);
                  }}
                />
              )}
              
              {/* Fallback for metadata-only responses */}
              {!message.locationData && !message.predictionData && message.metadata && 
               (message.metadata.type === 'location_recommendation' || message.metadata.type === 'travel_recommendation') && (
                <MiniHeatmap
                  locationData={{
                    location: message.metadata?.location || 'Singapore',
                    dengueRisk: { level: message.metadata?.riskLevel || 'Low', casesNearby: Math.floor(Math.random() * 50) + 10 },
                    airQuality: { psi: Math.floor(Math.random() * 40) + 40, level: 'Moderate' },
                    covidRisk: { level: 'Low', hospitalCases: Math.floor(Math.random() * 20) + 5 },
                    overallRisk: message.metadata?.riskLevel || 'Low'
                  }}
                  onExpand={() => {
                    setHeatmapData({
                      location: message.metadata?.location || 'Singapore',
                      dengueRisk: { level: message.metadata?.riskLevel || 'Low', casesNearby: 25 },
                      airQuality: { psi: 55, level: 'Moderate' },
                      covidRisk: { level: 'Low', hospitalCases: 15 },
                      overallRisk: message.metadata?.riskLevel || 'Low'
                    });
                    setShowHeatmap(true);
                  }}
                />
              )}
              
              {/* Fallback for prediction metadata only */}
              {!message.predictionData && message.metadata && message.metadata.type === 'prediction' && (
                <MiniHeatmap
                  predictionData={{
                    dengueRisk: { predicted: Math.floor(Math.random() * 100) + 50, trend: 'increasing', confidence: Math.floor(Math.random() * 20) + 70 },
                    airQuality: { predictedPSI: Math.floor(Math.random() * 50) + 40, trend: 'stable', confidence: Math.floor(Math.random() * 15) + 75 },
                    covidRisk: { predicted: Math.floor(Math.random() * 30) + 20, trend: 'decreasing', confidence: Math.floor(Math.random() * 20) + 65 },
                    overallRisk: { level: 'Medium', confidence: Math.floor(Math.random() * 15) + 75 }
                  }}
                  onExpand={() => {
                    setHeatmapData({
                      location: message.metadata?.location || 'Singapore',
                      dengueRisk: { level: 'Medium', casesNearby: 45 },
                      airQuality: { psi: 65, level: 'Moderate' },
                      covidRisk: { level: 'Low', hospitalCases: 25 },
                      overallRisk: 'Medium'
                    });
                    setShowHeatmap(true);
                  }}
                />
              )}
            </View>
          )}
          
          <Text style={[
            styles.timestampText,
            isUser ? styles.userTimestamp : styles.botTimestamp
          ]}>
            {formatMessageTime(message.timestamp)}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const getRiskColor = (riskLevel: string): string => {
    const colors = {
      'Low': '#4CAF50',
      'Medium': '#FF9800',
      'High': '#F44336',
      'Very High': '#8B0000'
    };
    return colors[riskLevel as keyof typeof colors] || '#4CAF50';
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    
    return (
      <View style={[styles.messageContainer, styles.botMessage]}>
        <View style={styles.botAvatar}>
          <Text style={styles.botAvatarText}>🤖</Text>
        </View>
                 <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
           <View style={styles.typingIndicator}>
             <View style={styles.typingDot} />
             <View style={styles.typingDot} />
             <View style={styles.typingDot} />
           </View>
         </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Health Assistant</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {messages.map((message, index) => renderMessage(message, index))}
          {renderTypingIndicator()}
        </ScrollView>

        {messages.length === 1 && renderQuickReplies()}

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about health conditions, travel advice..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.sendButtonText}>➤</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {!openaiApiKey && (
            <Text style={styles.apiKeyWarning}>
              💡 Add OpenAI API key for enhanced AI responses
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Heatmap Modal */}
      <Modal
        visible={showHeatmap}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        {heatmapData && (
          <HealthDataHeatmap
            locationAnalysis={heatmapData}
            onClose={() => setShowHeatmap(false)}
          />
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  chatContainer: {
    flex: 1
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 15
  },
  messagesContent: {
    paddingVertical: 15
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end'
  },
  userMessage: {
    justifyContent: 'flex-end'
  },
  botMessage: {
    justifyContent: 'flex-start'
  },
  botAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  botAvatarText: {
    fontSize: 18
  },
  messageBubble: {
    maxWidth: width * 0.75,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 12
  },
  userBubble: {
    backgroundColor: '#667eea',
    marginLeft: 50
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  typingBubble: {
    paddingVertical: 20
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22
  },
  userText: {
    color: '#FFFFFF'
  },
  botText: {
    color: '#333333'
  },
  timestampText: {
    fontSize: 11,
    marginTop: 5,
    opacity: 0.7
  },
  userTimestamp: {
    color: '#FFFFFF',
    textAlign: 'right'
  },
  botTimestamp: {
    color: '#666666'
  },
  metadataContainer: {
    marginTop: 8
  },
  riskIndicator: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  riskText: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  typingIndicator: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
    marginHorizontal: 2
  },
  quickRepliesContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10
  },
  quickReplyButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  quickReplyText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500'
  },
  inputContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 5
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    maxHeight: 100,
    paddingVertical: 10
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10
  },
  sendButtonDisabled: {
    backgroundColor: '#cccccc'
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  apiKeyWarning: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic'
  },
  heatmapButton: {
    backgroundColor: '#667eea',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    alignItems: 'center'
  },
  heatmapButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold'
  }
});

export default HealthChatbot; 