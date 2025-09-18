import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TextInputProps 
} from 'react-native';
import { WCAG_CONSTANTS } from '../../utils/accessibility';

export interface AccessibleTextInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  containerStyle?: any;
  inputStyle?: any;
  labelStyle?: any;
  size?: 'small' | 'medium' | 'large';
}

export const AccessibleTextInput: React.FC<AccessibleTextInputProps> = ({
  label,
  helperText,
  errorText,
  required = false,
  containerStyle,
  inputStyle,
  labelStyle,
  size = 'medium',
  value,
  onChangeText,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const inputId = `input_${label.replace(/\s+/g, '_').toLowerCase()}`;
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

  return (
    <View style={[styles.container, containerStyle]}>
      <Text 
        style={[
          styles.label, 
          labelStyle,
          { fontSize: sizeStyles.fontSize - 2 },
          hasError && styles.labelError
        ]}
        accessible={true}
        accessibilityRole="text"
      >
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <TextInput
        {...textInputProps}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[
          styles.input,
          sizeStyles,
          inputStyle,
          isFocused && styles.inputFocused,
          hasError && styles.inputError
        ]}
        accessible={true}
        accessibilityRole="text"
        accessibilityLabel={label + (required ? ' required field' : '')}
        accessibilityHint={helperText || errorText || undefined}
        accessibilityState={{
          selected: isFocused,
          expanded: isFocused,
        }}
        nativeID={inputId}
        placeholderTextColor={hasError ? '#d32f2f' : '#999999'}
        selectionColor="#2196f3"
      />
      
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
  input: {
    borderWidth: 2,
    borderColor: '#dddddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    color: '#333333',
    fontFamily: 'System',
  },
  inputFocused: {
    borderColor: '#2196f3',
    backgroundColor: '#f8f9ff',
  },
  inputError: {
    borderColor: '#d32f2f',
    backgroundColor: '#fff5f5',
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
});

export default AccessibleTextInput;