/**
 * Root Entry Point
 * Loads polyfills before the app starts.
 * Required for Supabase + crypto in React Native.
 */
import 'react-native-url-polyfill/auto';
import 'expo-router/entry';
