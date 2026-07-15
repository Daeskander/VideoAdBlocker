import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer } from '@/components/screen-container';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const [adBlockingEnabled, setAdBlockingEnabled] = useState(true);
  const [cacheSize, setCacheSize] = useState('0 MB');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('ad_blocking_enabled');
      if (stored !== null) {
        setAdBlockingEnabled(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleAdBlockingToggle = async (value: boolean) => {
    try {
      setAdBlockingEnabled(value);
      await AsyncStorage.setItem('ad_blocking_enabled', JSON.stringify(value));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const handleClearCache = async () => {
    try {
      await AsyncStorage.multiRemove(['youtube_history', 'youtube_cache']);
      setCacheSize('0 MB');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-4 border-b border-border">
          <Text className="text-2xl font-bold text-foreground">Settings</Text>
        </View>

        <View className="px-4 py-4 border-b border-border">
          <Text className="text-lg font-semibold text-foreground mb-4">Playback</Text>
          
          <View className="bg-surface border border-border rounded-lg p-4 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">Focus Mode</Text>
              <Text className="text-sm text-muted mt-1">
                {adBlockingEnabled ? 'Clean up promoted placements and overlays' : 'Load pages without cleanup scripts'}
              </Text>
            </View>
            <Switch
              value={adBlockingEnabled}
              onValueChange={handleAdBlockingToggle}
              trackColor={{ false: '#E5E5E5', true: '#FF0000' }}
              thumbColor={adBlockingEnabled ? '#FFFFFF' : '#F0F0F0'}
            />
          </View>

          <View className="bg-success/10 border border-success rounded-lg p-3 mt-3">
            <View className="flex-row gap-2 items-start">
              <Text className="text-lg">✓</Text>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-success">PiP Ready</Text>
                <Text className="text-xs text-success/80 mt-1">
                  Video playback is configured for inline, fullscreen, and picture-in-picture controls.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Cache & Storage Section */}
        <View className="px-4 py-4 border-b border-border">
          <Text className="text-lg font-semibold text-foreground mb-4">Storage</Text>
          
          <View className="bg-surface border border-border rounded-lg p-4 mb-3">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-semibold text-foreground">Cache Size</Text>
              <Text className="text-sm text-muted">{cacheSize}</Text>
            </View>
            <TouchableOpacity
              onPress={handleClearCache}
              className="bg-error/10 rounded-lg py-2 px-3 active:opacity-70"
            >
              <Text className="text-sm font-semibold text-error text-center">Clear Cache</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-xs text-muted">
            Clearing cache removes local browsing history and temporary app data.
          </Text>
        </View>

        {/* About Section */}
        <View className="px-4 py-4">
          <Text className="text-lg font-semibold text-foreground mb-4">About</Text>
          
          <View className="bg-surface border border-border rounded-lg p-4 gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted">App Version</Text>
              <Text className="text-sm font-semibold text-foreground">1.0.0</Text>
            </View>
            <View className="border-t border-border" />
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted">Build</Text>
              <Text className="text-sm font-semibold text-foreground">1</Text>
            </View>
            <View className="border-t border-border" />
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted">Platform</Text>
              <Text className="text-sm font-semibold text-foreground">React Native</Text>
            </View>
          </View>

          <View className="bg-primary/10 border border-primary rounded-lg p-4 mt-4">
            <Text className="text-sm font-semibold text-foreground mb-2">AdFreeVideoPlayer</Text>
            <Text className="text-xs text-muted leading-relaxed">
              A focused mobile video browser for watching with fewer distractions and native playback controls.
            </Text>
          </View>
        </View>

        {/* Footer Spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
