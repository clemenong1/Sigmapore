import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import HealthChatbot from './HealthChatbot';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const { width, height } = Dimensions.get('window');

interface ChatbotButtonProps {
  openaiApiKey?: string;
  userLocation?: string;
}

const ChatbotButton: React.FC<ChatbotButtonProps> = ({
  openaiApiKey,
  userLocation
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  React.useEffect(() => {
    // Subtle pulse animation to draw attention
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true
        })
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  const openChatbot = () => {
    setIsVisible(true);
  };

  const closeChatbot = () => {
    setIsVisible(false);
  };

  return (
    <>
      <Animated.View
        style={[
          styles.floatingButton,
          { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <TouchableOpacity onPress={openChatbot}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.gradient}
          >
            <FontAwesome5 name="robot" size={24} color="#FFFFFF" style={styles.buttonIcon} solid />
            <Text style={styles.labelText}>SigmaBoy</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeChatbot}
        statusBarTranslucent={true}
      >
        <HealthChatbot
          openaiApiKey={openaiApiKey}
          userLocation={userLocation}
          onClose={closeChatbot}
        />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 25,
    right: 20,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8
  },
  gradient: {
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70
  },
  buttonIcon: {
    textAlign: 'center'
  },
  labelText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 2,
    textAlign: 'center'
  }
});

export default ChatbotButton; 