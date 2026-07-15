import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';

interface HistoryItem {
  id: string;
  url: string;
  title: string;
  timestamp: number;
}

export default function HistoryScreen() {
  const router = useRouter();
  const colors = useColors();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('youtube_history');
      if (stored) {
        const items = JSON.parse(stored);
        setHistory(items.sort((a: HistoryItem, b: HistoryItem) => b.timestamp - a.timestamp));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await AsyncStorage.removeItem('youtube_history');
      setHistory([]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const handleNavigate = (item: HistoryItem) => {
    router.push({
      pathname: '/(tabs)/browser',
      params: { url: item.url },
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 py-4 border-b border-border">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-2xl font-bold text-foreground">History</Text>
            {history.length > 0 && (
              <TouchableOpacity
                onPress={handleClearHistory}
                className="px-3 py-2 rounded-lg bg-error/10 active:opacity-70"
              >
                <Text className="text-xs font-semibold text-error">Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text className="text-sm text-muted">
            {history.length} {history.length === 1 ? 'video' : 'videos'}
          </Text>
        </View>

        {/* History List */}
        {history.length === 0 ? (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-lg font-semibold text-muted mb-2">No history yet</Text>
            <Text className="text-sm text-muted text-center">
              Videos you watch will appear here
            </Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleNavigate(item)}
                className="px-4 py-3 border-b border-border active:bg-surface"
              >
                <View className="flex-row gap-3 items-center">
                  <View className="w-12 h-12 rounded-lg bg-surface border border-border items-center justify-center flex-shrink-0">
                    <IconSymbol name="play.rectangle.fill" size={24} color={colors.primary} />
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="text-sm font-semibold text-foreground" numberOfLines={2}>
                      {item.title || 'YouTube Video'}
                    </Text>
                    <Text className="text-xs text-muted mt-1">{formatTime(item.timestamp)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScreenContainer>
  );
}
