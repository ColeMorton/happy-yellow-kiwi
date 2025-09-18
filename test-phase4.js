#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Phase 4 Implementation...\n');

// Test 1: Check project structure for Phase 4 files
console.log('✅ Test 1: Phase 4 Project Structure');
const requiredFiles = [
  'src/components/forms/AccessibleTextInput.tsx',
  'src/components/forms/AccessibleSelect.tsx',
  'src/components/forms/FormValidation.ts',
  'src/components/cards/MedicalSummaryCard.tsx',
  'src/components/accessibility/AccessibilityToolbar.tsx',
  'src/contexts/AccessibilityContext.tsx',
  'src/screens/MedicalProfileScreen.tsx',
  'src/screens/CareCoordinatorScreen.tsx',
  'src/screens/HealthcareHomeScreen.tsx',
  'src/services/MedicationReminderService.ts',
  'src/types/accessibility.ts',
  'package.json'
];

for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`   ✓ ${file} exists`);
  } else {
    console.log(`   ❌ ${file} missing`);
    process.exit(1);
  }
}

// Test 2: Check TypeScript compilation
console.log('\n✅ Test 2: TypeScript Compilation');
const { execSync } = require('child_process');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('   ✓ TypeScript compilation successful');
} catch (error) {
  console.log('   ❌ TypeScript compilation failed');
  console.log(error.stdout?.toString() || error.stderr?.toString());
  process.exit(1);
}

// Test 3: Check Phase 4 dependencies
console.log('\n✅ Test 3: Phase 4 Dependencies');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  '@react-native-async-storage/async-storage',
  'expo-notifications',
  'expo-secure-store',
  'expo-location',
  'expo-sms',
  'expo-haptics',
  'expo-speech'
];

for (const dep of requiredDeps) {
  if (packageJson.dependencies[dep]) {
    console.log(`   ✓ ${dep} v${packageJson.dependencies[dep]}`);
  } else {
    console.log(`   ❌ ${dep} missing`);
    process.exit(1);
  }
}

// Test 4: Check healthcare types
console.log('\n✅ Test 4: Healthcare Feature Types');
const typesContent = fs.readFileSync('src/types/accessibility.ts', 'utf8');
const requiredTypes = [
  'MedicationReminder',
  'MedicationFrequency',
  'CareCoordinator',
  'AccessibilityPreferences',
  'HealthcareSettings'
];

for (const type of requiredTypes) {
  if (typesContent.includes(`interface ${type}`) || typesContent.includes(`type ${type}`)) {
    console.log(`   ✓ ${type} defined`);
  } else {
    console.log(`   ❌ ${type} missing`);
    process.exit(1);
  }
}

// Test 5: Check form components
console.log('\n✅ Test 5: Accessible Form Components');
const formChecks = [
  { file: 'src/components/forms/AccessibleTextInput.tsx', component: 'AccessibleTextInput' },
  { file: 'src/components/forms/AccessibleSelect.tsx', component: 'AccessibleSelect' },
  { file: 'src/components/forms/FormValidation.ts', class: 'FormValidation' }
];

for (const check of formChecks) {
  const content = fs.readFileSync(check.file, 'utf8');
  const searchTerm = check.component || check.class;
  if (content.includes(`export const ${searchTerm}`) || content.includes(`export class ${searchTerm}`)) {
    console.log(`   ✓ ${searchTerm} implemented`);
  } else {
    console.log(`   ❌ ${searchTerm} missing`);
    process.exit(1);
  }
}

// Test 6: Check healthcare screens
console.log('\n✅ Test 6: Healthcare Feature Screens');
const screenChecks = [
  { file: 'src/screens/MedicalProfileScreen.tsx', component: 'MedicalProfileScreen' },
  { file: 'src/screens/CareCoordinatorScreen.tsx', component: 'CareCoordinatorScreen' },
  { file: 'src/screens/HealthcareHomeScreen.tsx', component: 'HealthcareHomeScreen' }
];

for (const check of screenChecks) {
  const content = fs.readFileSync(check.file, 'utf8');
  if (content.includes(`export const ${check.component}`) || content.includes(`export default ${check.component}`)) {
    console.log(`   ✓ ${check.component} implemented`);
  } else {
    console.log(`   ❌ ${check.component} missing`);
    process.exit(1);
  }
}

// Test 7: Check services and utilities
console.log('\n✅ Test 7: Healthcare Services');
const serviceChecks = [
  { file: 'src/services/MedicationReminderService.ts', class: 'MedicationReminderService' },
  { file: 'src/contexts/AccessibilityContext.tsx', component: 'AccessibilityProvider' },
  { file: 'src/components/cards/MedicalSummaryCard.tsx', component: 'MedicalSummaryCard' },
  { file: 'src/components/accessibility/AccessibilityToolbar.tsx', component: 'AccessibilityToolbar' }
];

for (const check of serviceChecks) {
  const content = fs.readFileSync(check.file, 'utf8');
  const searchTerm = check.class || check.component;
  if (content.includes(`export class ${searchTerm}`) || content.includes(`export const ${searchTerm}`)) {
    console.log(`   ✓ ${searchTerm} implemented`);
  } else {
    console.log(`   ❌ ${searchTerm} missing`);
    process.exit(1);
  }
}

// Test 8: Check accessibility features
console.log('\n✅ Test 8: Accessibility Features');
const accessibilityChecks = [
  'useAccessibility',
  'useAccessibleStyles',
  'AccessibilityPreferences',
  'textSize',
  'highContrast',
  'hapticFeedback',
  'voiceAnnouncements',
  'reducedMotion',
  'screenReaderOptimized'
];

const contextContent = fs.readFileSync('src/contexts/AccessibilityContext.tsx', 'utf8');
for (const check of accessibilityChecks) {
  if (contextContent.includes(check)) {
    console.log(`   ✓ ${check} implemented`);
  } else {
    console.log(`   ❌ ${check} missing`);
    process.exit(1);
  }
}

// Test 9: Check form validation
console.log('\n✅ Test 9: Form Validation Features');
const validationContent = fs.readFileSync('src/components/forms/FormValidation.ts', 'utf8');
const validationChecks = [
  'validateField',
  'validateForm',
  'commonRules',
  'formatPhoneNumber',
  'sanitizeInput'
];

for (const check of validationChecks) {
  if (validationContent.includes(check)) {
    console.log(`   ✓ ${check} implemented`);
  } else {
    console.log(`   ❌ ${check} missing`);
    process.exit(1);
  }
}

// Test 10: Check medication reminder features
console.log('\n✅ Test 10: Medication Reminder Features');
const medicationContent = fs.readFileSync('src/services/MedicationReminderService.ts', 'utf8');
const medicationChecks = [
  'initialize',
  'getAllReminders',
  'saveReminder',
  'markDoseTaken',
  'scheduleNotificationsForReminder',
  'getDueMedications'
];

for (const check of medicationChecks) {
  if (medicationContent.includes(check)) {
    console.log(`   ✓ ${check} implemented`);
  } else {
    console.log(`   ❌ ${check} missing`);
    process.exit(1);
  }
}

console.log('\n🎉 Phase 4 Testing Complete!\n');
console.log('📱 Application Status: ENHANCED WITH HEALTHCARE FEATURES & FORMS');
console.log('📋 Form System: Accessible inputs, validation, and error handling');
console.log('💊 Medication Reminders: Notifications and scheduling system');
console.log('👨‍⚕️ Care Coordinators: Healthcare team contact management');
console.log('🏥 Medical Summary: Comprehensive profile cards and summaries');
console.log('♿ Accessibility: Dynamic text sizing, high contrast, and preferences');
console.log('⚙️ Settings: Accessibility toolbar with user customization');
console.log('✨ Ready for Phase 5 implementation');
console.log('\nNext Steps:');
console.log('• Test medical profile form functionality');
console.log('• Set up medication reminders and notifications');
console.log('• Add care coordinator contacts');
console.log('• Customize accessibility preferences');
console.log('• Test complete healthcare workflow');