import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import EmergencyButton from '../components/emergency/EmergencyButton';
import { ScreenReaderAnnouncer, WCAG_CONSTANTS } from '../utils/accessibility';

interface EmergencyScreenProps {
  onEmergencyPress?: () => void;
}

const EmergencyScreen: React.FC<EmergencyScreenProps> = ({ 
  onEmergencyPress = () => console.log('Emergency activated!')
}) => {
  useEffect(() => {
    // Announce screen to screen readers when component mounts
    const announceScreen = async () => {
      await ScreenReaderAnnouncer.announce(
        'Emergency assistance screen. Press the emergency button for immediate help.',
        { priority: 'medium', delay: 500 }
      );
    };
    
    announceScreen();
  }, []);

  const handleEmergencyPress = async () => {
    await ScreenReaderAnnouncer.announce(
      'Emergency call starting. Help is on the way.',
      { priority: 'high' }
    );
    onEmergencyPress();
  };

  return (
    <View style={styles.container}>
      <ExpoStatusBar style="light" backgroundColor="#1F2937" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={false} // Let child components handle accessibility
      >
        {/* Header */}
        <View style={styles.header}>
          <Text 
            style={styles.title}
            accessibilityRole="header"
          >
            Emergency Assistance
          </Text>
          <Text style={styles.subtitle}>
            Immediate help when you need it most
          </Text>
        </View>
        
        {/* Emergency Button */}
        <View style={styles.buttonContainer}>
          <EmergencyButton 
            onPress={handleEmergencyPress}
            size="large"
            accessibilityLabel="Emergency Contact Button"
            accessibilityHint="Double tap to start emergency call to your designated contact. This will send your location and medical information."
          />
        </View>
        
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text 
            style={styles.instructionsTitle}
            accessibilityRole="header"
          >
            How to Use
          </Text>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionBullet}>•</Text>
            <Text style={styles.instructionText}>
              Press the red emergency button above for immediate help
            </Text>
          </View>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionBullet}>•</Text>
            <Text style={styles.instructionText}>
              Your location and medical information will be shared automatically
            </Text>
          </View>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionBullet}>•</Text>
            <Text style={styles.instructionText}>
              A confirmation screen will appear before making the call
            </Text>
          </View>
        </View>
        
        {/* Accessibility Notice */}
        <View style={styles.accessibilityNotice}>
          <Text style={styles.accessibilityText}>
            This app is designed for accessibility. All features work with screen readers and touch controls.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 40,
  },
  
  subtitle: {
    fontSize: WCAG_CONSTANTS.LARGE_FONT_SIZE,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  
  instructionsContainer: {
    width: '100%',
    maxWidth: 400,
    marginTop: 40,
    paddingHorizontal: 20,
  },
  
  instructionsTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingRight: 10,
  },
  
  instructionBullet: {
    fontSize: WCAG_CONSTANTS.LARGE_FONT_SIZE,
    color: '#DC2626',
    marginRight: 12,
    marginTop: 2,
    fontWeight: 'bold',
  },
  
  instructionText: {
    flex: 1,
    fontSize: WCAG_CONSTANTS.LARGE_FONT_SIZE,
    color: '#374151',
    lineHeight: 24,
  },
  
  accessibilityNotice: {
    marginTop: 40,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    maxWidth: 400,
  },
  
  accessibilityText: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    color: '#166534',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
});

export default EmergencyScreen;