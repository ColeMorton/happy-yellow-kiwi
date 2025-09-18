// Simple test to verify hybrid storage solution works
// This can be run in the Expo app console to test the implementation

const testHybridStorage = async () => {
  const { SecureStorage } = require('./src/services/SecureStorage');
  
  console.log('Testing hybrid storage solution...');
  
  // Create a large medical profile that would exceed SecureStore limit
  const largeProfile = {
    id: 'test-profile-123',
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1985-03-15',
      bloodType: 'A+',
      allergies: ['Penicillin', 'Shellfish', 'Peanuts', 'Tree nuts', 'Latex'],
      medications: ['Lisinopril 10mg daily', 'Metformin 500mg twice daily', 'Aspirin 81mg daily', 'Atorvastatin 20mg daily']
    },
    emergencyContacts: [
      {
        id: 'contact-1',
        name: 'Jane Doe',
        relationship: 'Spouse',
        phoneNumber: '+1-555-123-4567',
        isPrimary: true
      },
      {
        id: 'contact-2',
        name: 'Dr. Smith',
        relationship: 'Primary Care Physician',
        phoneNumber: '+1-555-987-6543',
        isPrimary: false
      }
    ],
    medicalConditions: ['Type 2 Diabetes', 'Hypertension', 'High Cholesterol'],
    additionalNotes: 'Patient has a history of cardiac events. Requires immediate medical attention for chest pain. Has had allergic reactions to multiple medications in the past. Please check allergy list before administering any medications.',
    lastUpdated: new Date().toISOString()
  };
  
  try {
    // Test saving large profile
    console.log('Saving large medical profile...');
    const profileSize = JSON.stringify(largeProfile).length;
    console.log(`Profile size: ${profileSize} bytes`);
    
    await SecureStorage.saveMedicalProfile(largeProfile);
    console.log('✅ Large profile saved successfully');
    
    // Test retrieving profile
    console.log('Retrieving medical profile...');
    const retrieved = await SecureStorage.getMedicalProfile();
    
    if (retrieved && retrieved.id === largeProfile.id) {
      console.log('✅ Profile retrieved successfully');
      console.log(`Retrieved profile for: ${retrieved.personalInfo.firstName} ${retrieved.personalInfo.lastName}`);
    } else {
      console.log('❌ Profile retrieval failed');
    }
    
    // Test audit log (which can also get large)
    console.log('Testing audit log...');
    const auditLog = await SecureStorage.getAuditLog();
    console.log(`Current audit log size: ${JSON.stringify(auditLog).length} bytes`);
    console.log(`Audit entries: ${auditLog.length}`);
    
    // Clean up
    await SecureStorage.deleteMedicalProfile();
    console.log('✅ Test data cleaned up');
    
    console.log('🎉 Hybrid storage test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Hybrid storage test failed:', error);
    return false;
  }
};

// Export for use in app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testHybridStorage };
}