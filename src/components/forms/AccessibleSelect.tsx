import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  StyleSheet 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { WCAG_CONSTANTS, ScreenReaderAnnouncer } from '../../utils/accessibility';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface AccessibleSelectProps {
  label: string;
  options: SelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  disabled?: boolean;
  containerStyle?: any;
  size?: 'small' | 'medium' | 'large';
}

export const AccessibleSelect: React.FC<AccessibleSelectProps> = ({
  label,
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  helperText,
  errorText,
  required = false,
  disabled = false,
  containerStyle,
  size = 'medium'
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedOption = options.find(option => option.value === value);
  const hasError = Boolean(errorText);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
          minHeight: 40,
          paddingVertical: 8,
        };
      case 'large':
        return {
          fontSize: WCAG_CONSTANTS.LARGE_FONT_SIZE + 2,
          minHeight: WCAG_CONSTANTS.RECOMMENDED_TOUCH_TARGET,
          paddingVertical: 16,
        };
      default: // medium
        return {
          fontSize: WCAG_CONSTANTS.LARGE_FONT_SIZE,
          minHeight: WCAG_CONSTANTS.RECOMMENDED_TOUCH_TARGET - 16,
          paddingVertical: 12,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const handlePress = async () => {
    if (disabled) return;
    
    await Haptics.selectionAsync();
    setIsModalVisible(true);
    
    await ScreenReaderAnnouncer.announce(
      `Opening ${label} selection. ${options.length} options available.`,
      { priority: 'medium' }
    );
  };

  const handleOptionSelect = async (option: SelectOption) => {
    if (option.disabled) return;
    
    await Haptics.selectionAsync();
    onValueChange(option.value);
    setIsModalVisible(false);
    
    await ScreenReaderAnnouncer.announce(
      `Selected ${option.label} for ${label}`,
      { priority: 'high' }
    );
  };

  const handleModalClose = async () => {
    setIsModalVisible(false);
    await ScreenReaderAnnouncer.announce('Selection cancelled', { priority: 'medium' });
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text 
        style={[
          styles.label, 
          { fontSize: sizeStyles.fontSize - 2 },
          hasError && styles.labelError
        ]}
        accessible={true}
        accessibilityRole="text"
      >
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        style={[
          styles.selectButton,
          sizeStyles,
          hasError && styles.selectButtonError,
          disabled && styles.selectButtonDisabled
        ]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${label} ${required ? 'required field' : ''}`}
        accessibilityHint={`Currently selected: ${selectedOption?.label || 'none'}. Double tap to open selection menu.`}
        accessibilityState={{
          disabled,
          expanded: isModalVisible,
          selected: Boolean(value)
        }}
      >
        <Text 
          style={[
            styles.selectText,
            { fontSize: sizeStyles.fontSize },
            !selectedOption && styles.placeholderText,
            disabled && styles.disabledText
          ]}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <Text style={[styles.arrow, disabled && styles.disabledText]}>
          {isModalVisible ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>
      
      {helperText && !hasError && (
        <Text 
          style={[styles.helperText, { fontSize: sizeStyles.fontSize - 4 }]}
          accessible={true}
          accessibilityRole="text"
          accessibilityLiveRegion="polite"
        >
          {helperText}
        </Text>
      )}
      
      {hasError && (
        <Text 
          style={[styles.errorText, { fontSize: sizeStyles.fontSize - 4 }]}
          accessible={true}
          accessibilityRole="text"
          accessibilityLiveRegion="assertive"
        >
          {errorText}
        </Text>
      )}

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleModalClose}
        accessible={true}
        accessibilityViewIsModal={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {label}
              </Text>
              <TouchableOpacity
                onPress={handleModalClose}
                style={styles.closeButton}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close selection menu"
                accessibilityHint="Double tap to close the selection options"
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.optionsList}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleOptionSelect(option)}
                  disabled={option.disabled}
                  style={[
                    styles.optionItem,
                    option.value === value && styles.selectedOption,
                    option.disabled && styles.disabledOption
                  ]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  accessibilityHint={`Option ${index + 1} of ${options.length}. ${option.value === value ? 'Currently selected' : 'Double tap to select'}`}
                  accessibilityState={{
                    disabled: option.disabled,
                    selected: option.value === value
                  }}
                >
                  <Text 
                    style={[
                      styles.optionText,
                      option.value === value && styles.selectedOptionText,
                      option.disabled && styles.disabledOptionText
                    ]}
                  >
                    {option.label}
                  </Text>
                  {option.value === value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    lineHeight: 22,
  },
  labelError: {
    color: '#d32f2f',
  },
  required: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#dddddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  selectButtonError: {
    borderColor: '#d32f2f',
    backgroundColor: '#fff5f5',
  },
  selectButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#cccccc',
  },
  selectText: {
    flex: 1,
    color: '#333333',
  },
  placeholderText: {
    color: '#999999',
  },
  disabledText: {
    color: '#999999',
  },
  arrow: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 8,
  },
  helperText: {
    color: '#666666',
    marginTop: 6,
    lineHeight: 18,
  },
  errorText: {
    color: '#d32f2f',
    marginTop: 6,
    lineHeight: 18,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  modalTitle: {
    fontSize: WCAG_CONSTANTS.LARGE_FONT_SIZE + 2,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666666',
    fontWeight: 'bold',
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    minHeight: WCAG_CONSTANTS.RECOMMENDED_TOUCH_TARGET,
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
  },
  disabledOption: {
    backgroundColor: '#f8f8f8',
  },
  optionText: {
    fontSize: WCAG_CONSTANTS.LARGE_FONT_SIZE,
    color: '#333333',
    flex: 1,
  },
  selectedOptionText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  disabledOptionText: {
    color: '#999999',
  },
  checkmark: {
    fontSize: 18,
    color: '#1976d2',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default AccessibleSelect;