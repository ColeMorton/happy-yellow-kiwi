# Happy Yellow Kiwi - Emergency Accessibility App

A React Native healthcare accessibility application with emergency features, built with Expo and TypeScript.

**⚠️ Disclaimer**: This app has no affiliation with Trilogy Care Pty Ltd. It is simply a demonstration of mobile accessibility patterns for healthcare applications.

## Emergency Core ✅ COMPLETED

### Features
- **Emergency Button**: Large, accessible button with haptic feedback
- **Screen Reader Support**: Full VoiceOver/TalkBack compatibility  
- **WCAG 2.2 Compliance**: 88px touch targets, high contrast design
- **Text-to-Speech**: Audio announcements for all interactions
- **TypeScript**: Strict type checking with accessibility interfaces
- **Emergency Confirmation**: 10-second countdown with button cancel

### Quick Start

```bash
# Install dependencies
yarn install

# Start development server
yarn start

# Run TypeScript checks
yarn typecheck

# Run acceptance tests
node test-phase1.js
```

### Testing the App

1. **Mobile Testing** (Recommended):
   - Install Expo Go on your phone
   - Scan QR code from `yarn start`
   - Test emergency button with haptic feedback

2. **Accessibility Testing**:
   - Enable VoiceOver (iOS) or TalkBack (Android)
   - Navigate using screen reader
   - Test voice announcements

3. **Development Testing**:
   - Run `node test-phase1.js` for automated tests
   - All tests should pass ✅

### Project Structure

```
src/
├── components/
│   └── emergency/
│       └── EmergencyButton.tsx    # Main emergency button
├── screens/
│   ├── EmergencyScreen.tsx        # Main emergency screen
│   └── EmergencyConfirmationScreen.tsx # Confirmation with countdown
├── types/
│   └── accessibility.ts          # TypeScript interfaces
└── utils/
    └── accessibility.ts          # WCAG utilities & screen reader
```

### Implementation Plan

See `trilogy_care_implementation_plan.md` for full implementation roadmap.

**Current Status**: Emergency Core Complete - Fully functional in Expo Go ✅

### Accessibility Features

- ✅ 88px minimum touch targets
- ✅ Screen reader announcements  
- ✅ Haptic feedback
- ✅ High contrast colors
- ✅ Semantic accessibility markup
- ✅ Error handling & graceful degradation
- ✅ Touch-based confirmation flows
- ✅ WCAG 2.2 compliant design

Built with accessibility-first principles for healthcare users.

## Troubleshooting

### Common Issues

**App won't start**
- Clear Metro cache: `npx expo start --clear`
- Reinstall dependencies: `yarn install`
- Check Node.js version (requires 20.16.0+ for SDK 54)

**TypeScript errors**
- Run: `yarn typecheck`
- Fix any type errors before building

**Emergency button not responding**
- Ensure haptic feedback is enabled in device settings
- Try restarting the app
- Check accessibility settings if using screen reader

**Screen reader not working**
- Enable VoiceOver (iOS) or TalkBack (Android) in device settings
- Restart the app after enabling screen reader
- Navigate using accessibility gestures

For more help, see the [Expo documentation](https://docs.expo.dev/).