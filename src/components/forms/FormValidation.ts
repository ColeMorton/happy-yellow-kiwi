export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  custom?: (value: string) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class FormValidation {
  static validateField(value: string, rules: ValidationRule): ValidationResult {
    const trimmedValue = value.trim();

    // Required validation
    if (rules.required && !trimmedValue) {
      return { isValid: false, error: 'This field is required' };
    }

    // Skip other validations if field is empty and not required
    if (!trimmedValue && !rules.required) {
      return { isValid: true };
    }

    // Min length validation
    if (rules.minLength && trimmedValue.length < rules.minLength) {
      return { 
        isValid: false, 
        error: `Must be at least ${rules.minLength} characters long` 
      };
    }

    // Max length validation
    if (rules.maxLength && trimmedValue.length > rules.maxLength) {
      return { 
        isValid: false, 
        error: `Must be no more than ${rules.maxLength} characters long` 
      };
    }

    // Email validation
    if (rules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedValue)) {
        return { isValid: false, error: 'Please enter a valid email address' };
      }
    }

    // Phone validation
    if (rules.phone) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanPhone = trimmedValue.replace(/[\s\-\(\)\.]/g, '');
      if (!phoneRegex.test(cleanPhone) || cleanPhone.length < 10) {
        return { isValid: false, error: 'Please enter a valid phone number' };
      }
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(trimmedValue)) {
      return { isValid: false, error: 'Please enter a valid format' };
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(trimmedValue);
      if (customError) {
        return { isValid: false, error: customError };
      }
    }

    return { isValid: true };
  }

  static validateForm(formData: Record<string, string>, rules: Record<string, ValidationRule>): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};
    let isValid = true;

    for (const [fieldName, fieldRules] of Object.entries(rules)) {
      const value = formData[fieldName] || '';
      const result = this.validateField(value, fieldRules);
      
      if (!result.isValid) {
        errors[fieldName] = result.error!;
        isValid = false;
      }
    }

    return { isValid, errors };
  }

  // Common validation rules
  static readonly commonRules = {
    required: { required: true },
    email: { required: true, email: true },
    phone: { required: true, phone: true },
    name: { 
      required: true, 
      minLength: 2, 
      maxLength: 50,
      pattern: /^[a-zA-Z\s\-']+$/
    },
    bloodType: {
      required: false,
      pattern: /^(A|B|AB|O)[\+\-]?$/i,
      custom: (value: string) => {
        if (!value) return null;
        const validTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        if (!validTypes.includes(value.toUpperCase())) {
          return 'Please enter a valid blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)';
        }
        return null;
      }
    },
    medication: {
      required: false,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\s\-\.(),]+$/
    },
    allergy: {
      required: false,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\s\-\.(),]+$/
    },
    medicalCondition: {
      required: false,
      minLength: 2,
      maxLength: 200,
      pattern: /^[a-zA-Z0-9\s\-\.(),]+$/
    },
    emergencyContactName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s\-']+$/
    },
    emergencyContactRelationship: {
      required: true,
      minLength: 2,
      maxLength: 30,
      pattern: /^[a-zA-Z\s\-']+$/
    },
    dateOfBirth: {
      required: true,
      pattern: /^\d{4}-\d{2}-\d{2}$/,
      custom: (value: string) => {
        if (!value) return null;
        const date = new Date(value);
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();
        
        if (isNaN(date.getTime())) {
          return 'Please enter a valid date';
        }
        
        if (date > now) {
          return 'Date of birth cannot be in the future';
        }
        
        if (age > 150) {
          return 'Please enter a valid date of birth';
        }
        
        return null;
      }
    }
  };

  // Utility functions for specific validations
  static formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone;
  }

  static formatBloodType(bloodType: string): string {
    if (!bloodType) return '';
    return bloodType.toUpperCase();
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/\s+/g, ' ');
  }

  static isValidAge(dateOfBirth: string): boolean {
    if (!dateOfBirth) return false;
    
    const birth = new Date(dateOfBirth);
    const now = new Date();
    const age = now.getFullYear() - birth.getFullYear();
    
    return age >= 0 && age <= 150;
  }
}