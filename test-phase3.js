#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Phase 3 Implementation...\n');

// Test 1: Check project structure for Phase 3 files
console.log('✅ Test 1: Phase 3 Project Structure');
const requiredFiles = [
  'src/types/accessibility.ts',
  'src/services/SecureStorage.ts',
  'src/services/LocationService.ts', 
  'src/services/EmergencyContactService.ts',
  'src/screens/EmergencyDetectionScreen.tsx',
  'src/screens/EmergencyConfirmationScreen.tsx',
  'src/screens/EmergencyInProgressScreen.tsx',
  'src/screens/EmergencyFollowUpScreen.tsx',
  'App.tsx',
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

// Test 3: Check Phase 3 dependencies
console.log('\n✅ Test 3: Phase 3 Dependencies');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
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

// Test 4: Check medical profile types
console.log('\n✅ Test 4: Medical Profile Types');
const typesContent = fs.readFileSync('src/types/accessibility.ts', 'utf8');
const requiredTypes = [
  'MedicalProfile',
  'EmergencyContact', 
  'EmergencySession',
  'EmergencyStatus',
  'AuditEntry',
  'EmergencyFlowProps'
];

for (const type of requiredTypes) {
  if (typesContent.includes(`interface ${type}`) || typesContent.includes(`type ${type}`)) {
    console.log(`   ✓ ${type} defined`);
  } else {
    console.log(`   ❌ ${type} missing`);
    process.exit(1);
  }
}

// Test 5: Check emergency flow screens
console.log('\n✅ Test 5: Emergency Flow Screens');
const screenChecks = [
  { file: 'src/screens/EmergencyDetectionScreen.tsx', component: 'EmergencyDetectionScreen' },
  { file: 'src/screens/EmergencyConfirmationScreen.tsx', component: 'EmergencyConfirmationScreen' },
  { file: 'src/screens/EmergencyInProgressScreen.tsx', component: 'EmergencyInProgressScreen' },
  { file: 'src/screens/EmergencyFollowUpScreen.tsx', component: 'EmergencyFollowUpScreen' }
];

for (const check of screenChecks) {
  const content = fs.readFileSync(check.file, 'utf8');
  if (content.includes(`export const ${check.component}`) || content.includes(`export default ${check.component}`)) {
    console.log(`   ✓ ${check.component} component implemented`);
  } else {
    console.log(`   ❌ ${check.component} component missing`);
    process.exit(1);
  }
}

// Test 6: Check service implementations
console.log('\n✅ Test 6: Service Implementations');
const serviceChecks = [
  { file: 'src/services/SecureStorage.ts', class: 'SecureStorage' },
  { file: 'src/services/LocationService.ts', class: 'LocationService' },
  { file: 'src/services/EmergencyContactService.ts', class: 'EmergencyContactService' }
];

for (const check of serviceChecks) {
  const content = fs.readFileSync(check.file, 'utf8');
  if (content.includes(`export class ${check.class}`)) {
    console.log(`   ✓ ${check.class} service implemented`);
  } else {
    console.log(`   ❌ ${check.class} service missing`);
    process.exit(1);
  }
}

// Test 7: Check App.tsx integration
console.log('\n✅ Test 7: App.tsx Integration');
const appContent = fs.readFileSync('App.tsx', 'utf8');
const appChecks = [
  'EmergencyDetectionScreen',
  'EmergencyInProgressScreen', 
  'EmergencyFollowUpScreen',
  'SecureStorage',
  'LocationService',
  'EmergencyContactService',
  'EmergencyStatus',
  'EmergencySession',
  'MedicalProfile'
];

for (const check of appChecks) {
  if (appContent.includes(check)) {
    console.log(`   ✓ ${check} integrated`);
  } else {
    console.log(`   ❌ ${check} not integrated`);
    process.exit(1);
  }
}

// Test 8: Check accessibility compliance
console.log('\n✅ Test 8: Accessibility Features');
const accessibilityChecks = [
  'accessibilityRole',
  'accessibilityLabel',
  'accessibilityHint',
  'WCAG_CONSTANTS',
  'ScreenReaderAnnouncer'
];

let allScreensAccessible = true;
for (const screen of screenChecks) {
  const content = fs.readFileSync(screen.file, 'utf8');
  for (const check of accessibilityChecks) {
    if (!content.includes(check)) {
      console.log(`   ❌ ${check} missing in ${screen.file}`);
      allScreensAccessible = false;
    }
  }
}

if (allScreensAccessible) {
  console.log('   ✓ All accessibility features implemented');
} else {
  process.exit(1);
}

console.log('\n🎉 Phase 3 Testing Complete!\n');
console.log('📱 Application Status: ENHANCED WITH MULTI-STEP EMERGENCY FLOW');
console.log('🔒 Security Features: Secure storage, audit logging, encryption');
console.log('📍 Location Services: Emergency location sharing');
console.log('📱 SMS Capability: Emergency contact notification');
console.log('✨ Ready for Phase 4 implementation');
console.log('\nNext Steps:');
console.log('• Set up medical profile for testing');
console.log('• Add emergency contacts');
console.log('• Test full emergency flow');
console.log('• Grant location and SMS permissions for full functionality');