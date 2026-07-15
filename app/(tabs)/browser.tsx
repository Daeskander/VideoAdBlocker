import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { ScreenContainer } from '@/components/screen-container';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { ADVANCED_AD_BLOCKING_SCRIPT, MEDIA_PLAYBACK_STABILITY_SCRIPT } from '@/lib/webview-config';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';

const DEFAULT_URL = 'https://www.youtube.com';

function normalizeUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return DEFAULT_URL;
  }

  if (!trimmedValue.startsWith('http://') && !trimmedValue.startsWith('https://')) {
    if (trimmedValue.includes('.')) {
      return `https://${trimmedValue}`;
    }

    return `https://www.youtube.com/results?search_query=${encodeURIComponent(trimmedValue)}`;
  }

  return trimmedValue;
}

export default function BrowserScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ url?: string }>();
  const webViewRef = useRef<WebView>(null);
  const initialUrl = normalizeUrl(typeof params.url === 'string' ? params.url : DEFAULT_URL);
  const [url, setUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [adBlockingEnabled, setAdBlockingEnabled] = useState(true);

  useEffect(() => {
    if (typeof params.url !== 'string') return;

    const nextUrl = normalizeUrl(params.url);
    setUrl(nextUrl);
    setInputUrl(nextUrl);
  }, [params.url]);

  useFocusEffect(useCallback(() => {
    let isActive = true;

    AsyncStorage.getItem('ad_blocking_enabled')
      .then((stored) => {
        if (isActive && stored !== null) {
          setAdBlockingEnabled(JSON.parse(stored));
        }
      })
      .catch((error) => console.error('Error loading ad-blocking setting:', error));

    return () => {
      isActive = false;
    };
  }, []));

  const handleNavigate = useCallback(() => {
    const urlToNavigate = normalizeUrl(inputUrl);
    setUrl(urlToNavigate);
    setInputUrl(urlToNavigate);
  }, [inputUrl]);

  const handleGoBack = useCallback(() => {
    webViewRef.current?.goBack();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleGoForward = useCallback(() => {
    webViewRef.current?.goForward();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    webViewRef.current?.reload();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleWebViewMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'AD_BLOCKER_READY') {
        console.log('Ad blocker is active');
      }
      if (data.type === 'PIP_STATE') {
        console.log('PiP state:', data.state);
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }, []);

  const saveHistoryItem = useCallback(async (nextUrl: string, title?: string) => {
    if (!nextUrl.includes('youtube.com') && !nextUrl.includes('youtu.be')) return;

    try {
      const stored = await AsyncStorage.getItem('youtube_history');
      const items = stored ? JSON.parse(stored) : [];
      const filteredItems = items.filter((item: { url: string }) => item.url !== nextUrl);
      const nextItems = [
        {
          id: `${Date.now()}`,
          url: nextUrl,
          title: title || 'YouTube',
          timestamp: Date.now(),
        },
        ...filteredItems,
      ].slice(0, 50);

      await AsyncStorage.setItem('youtube_history', JSON.stringify(nextItems));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }, []);

  return (
    <ScreenContainer className="flex-1 bg-background" edges={['top', 'left', 'right', 'bottom']} style={{ pointerEvents: 'auto' }}>
      <View className="flex-1 bg-background" style={{ pointerEvents: 'auto' }}>
        <View className="bg-background border-b border-border px-3 py-3 gap-3" pointerEvents="auto">
          <View className="flex-row items-center gap-2">
            <TextInput
              value={inputUrl}
              onChangeText={setInputUrl}
              placeholder="Search or paste a link"
              placeholderTextColor="#8A8F98"
              onSubmitEditing={handleNavigate}
              className="flex-1 bg-surface border border-border rounded-2xl px-4 py-3 text-foreground"
              returnKeyType="go"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable
              onPress={handleNavigate}
              className="h-12 w-12 rounded-2xl bg-primary items-center justify-center active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel="Go"
            >
              <IconSymbol name="magnifyingglass" size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row gap-2">
              <ToolbarButton
                icon="chevron.backward"
                label="Back"
                onPress={handleGoBack}
                disabled={!canGoBack}
              />
              <ToolbarButton
                icon="chevron.forward"
                label="Forward"
                onPress={handleGoForward}
                disabled={!canGoForward}
              />
              <ToolbarButton icon="arrow.clockwise" label="Refresh" onPress={handleRefresh} />
            </View>
            <View className="flex-row items-center gap-2 rounded-full bg-surface border border-border px-3 py-2">
              <View className={cn('w-2 h-2 rounded-full', adBlockingEnabled ? 'bg-success' : 'bg-warning')} />
              <Text className="text-xs text-muted font-medium">
                {adBlockingEnabled ? 'Focus mode' : 'Standard mode'}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-1 bg-background">
          {loading && (
            <View className="absolute top-3 left-0 right-0 z-10 items-center" pointerEvents="none">
              <View className="flex-row items-center gap-2 rounded-full bg-background/95 border border-border px-3 py-2">
                <ActivityIndicator size="small" color={colors.primary} />
                <Text className="text-xs text-muted font-medium">Loading</Text>
              </View>
            </View>
          )}
          <WebView
            ref={webViewRef}
            source={{ uri: url }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onNavigationStateChange={(state) => {
              setCanGoBack(state.canGoBack);
              setCanGoForward(state.canGoForward);
              setUrl(state.url);
              setInputUrl(state.url);
              saveHistoryItem(state.url, state.title);
            }}
            injectedJavaScriptBeforeContentLoaded={MEDIA_PLAYBACK_STABILITY_SCRIPT}
            injectedJavaScript={`${MEDIA_PLAYBACK_STABILITY_SCRIPT}\n${adBlockingEnabled ? ADVANCED_AD_BLOCKING_SCRIPT : 'true;'}`}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            allowsFullscreenVideo={true}
            allowsInlineMediaPlayback={true}
            allowsPictureInPictureMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            allowsBackForwardNavigationGestures={true}
            scrollEnabled={true}
            bounces={true}
            decelerationRate="normal"
            cacheEnabled={true}
            cacheMode="LOAD_CACHE_ELSE_NETWORK"
            mixedContentMode="always"
            textZoom={100}
            overScrollMode="always"
            setSupportMultipleWindows={false}
            pointerEvents="auto"
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

function ToolbarButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: React.ComponentProps<typeof IconSymbol>['name'];
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(
        'h-10 w-10 rounded-full bg-surface border border-border items-center justify-center active:opacity-70',
        disabled && 'opacity-40'
      )}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <IconSymbol name={icon} size={20} color={colors.foreground} />
    </Pressable>
  );
}
