# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native healthcare accessibility project focused on building the Trilogy Care mobile application with comprehensive accessibility features and voice interaction capabilities. The project is currently in the specification phase with a detailed implementation guide in `trilogy_care_mobile_accessibility_specification.md`.

## Key Project Components

### Core Features
- Emergency contact system with haptic feedback
- Voice command integration for hands-free operation
- WCAG 2.2 compliant UI components
- Screen reader support with proper accessibility labels
- Large touch targets (88px minimum) for motor impairments
- High contrast themes for visual accessibility

### Technology Stack
- React Native with TypeScript
- Expo SDK for development and deployment
- expo-speech for voice synthesis
- expo-haptics for tactile feedback
- Platform-specific implementations for iOS/Android

## Development Commands

Since the project is not yet initialized, here are the commands to set up and run the project:

### Initial Setup
```bash
# Initialize Expo project
npx create-expo-app@latest . --template blank-typescript

# Install required dependencies
npm install expo-speech expo-haptics
```

### Development
```bash
# Start development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Run in web browser
npx expo start --web
```

### Testing & Quality
```bash
# Run TypeScript type checking
npx tsc --noEmit

# Run ESLint
npx eslint . --ext .ts,.tsx,.js,.jsx

# Run tests (once configured)
npm test
```

## Architecture Guidelines

### Component Structure
- Place all accessibility-focused components in `src/components/accessible/`
- Voice interaction handlers in `src/services/voice/`
- Emergency features in `src/features/emergency/`
- Shared accessibility utilities in `src/utils/accessibility/`

### Accessibility Patterns
1. Always include comprehensive accessibility props on interactive elements
2. Use semantic HTML roles via `accessibilityRole`
3. Provide both `accessibilityLabel` and `accessibilityHint`
4. Implement `accessibilityLiveRegion` for dynamic content
5. Ensure minimum touch target sizes of 88x88px

### Voice Command Integration
- Voice commands should map to critical functions (emergency, navigation, help)
- Always provide visual feedback for voice recognition state
- Include fallback mechanisms for environments without speech recognition
- Announce all state changes via Text-to-Speech

## Critical Implementation Notes

1. **Emergency Features**: The emergency button must be immediately accessible and provide multi-modal feedback (visual, haptic, auditory)

2. **Platform Differences**: Handle iOS/Android differences explicitly, especially for:
   - Haptic feedback patterns
   - Voice recognition APIs
   - Accessibility announcements

3. **Expo Snack Demo**: The specification includes a complete Expo Snack implementation for rapid prototyping and demonstration

4. **Healthcare Compliance**: While implementing, consider HIPAA requirements for any real medical data handling

## Quick Reference

- Main specification: `trilogy_care_mobile_accessibility_specification.md`
- Demo implementation starts at line 2018 in the specification
- Focus on mobile-first accessibility patterns throughout