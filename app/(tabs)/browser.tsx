import React, { useRef, useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Platform, PanResponder, GestureResponderEvent } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { ScreenContainer } from '@/components/screen-container';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { ADVANCED_AD_BLOCKING_SCRIPT } from '@/lib/webview-config';

export default function BrowserScreen() {
  const webViewRef = useRef<WebView>(null);
  const [url, setUrl] = useState('https://www.youtube.com');
  const [inputUrl, setInputUrl] = useState('https://www.youtube.com');
  const [loading, setLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const gestureStartX = useRef(0);
  const gestureStartY = useRef(0);
  const isGestureActive = useRef(false);

  const handleNavigate = useCallback(() => {
    let urlToNavigate = inputUrl;
    if (!urlToNavigate.startsWith('http://') && !urlToNavigate.startsWith('https://')) {
      if (urlToNavigate.includes('.')) {
        urlToNavigate = 'https://' + urlToNavigate;
      } else {
        urlToNavigate = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(urlToNavigate);
      }
    }
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
    } catch (e) {
      // Ignore parsing errors
    }
  }, []);

  const handleGestureStart = useCallback((e: GestureResponderEvent) => {
    gestureStartX.current = e.nativeEvent.pageX;
    gestureStartY.current = e.nativeEvent.pageY;
    isGestureActive.current = true;
  }, []);

  const handleGestureEnd = useCallback((e: GestureResponderEvent) => {
    if (!isGestureActive.current) return;
    isGestureActive.current = false;

    const endX = e.nativeEvent.pageX;
    const endY = e.nativeEvent.pageY;
    const deltaX = endX - gestureStartX.current;
    const deltaY = endY - gestureStartY.current;

    // Only consider horizontal swipes (ignore vertical swipes)
    if (Math.abs(deltaY) > Math.abs(deltaX)) return;

    // Minimum swipe distance (50 pixels)
    const minSwipeDistance = 50;

    // Swipe right (go back)
    if (deltaX > minSwipeDistance && canGoBack) {
      handleGoBack();
    }
    // Swipe left (go forward)
    else if (deltaX < -minSwipeDistance && canGoForward) {
      handleGoForward();
    }
  }, [canGoBack, canGoForward, handleGoBack, handleGoForward]);

  return (
    <ScreenContainer className="flex-1 bg-background" edges={['top', 'left', 'right', 'bottom']} style={{ pointerEvents: 'auto' }}>
      <View className="flex-1 bg-background" style={{ pointerEvents: 'auto' }}>
        {/* URL Bar */}
        <View className="bg-surface border-b border-border px-3 py-3 gap-2" pointerEvents="auto">
          <View className="flex-row items-center gap-2">
            <TextInput
              value={inputUrl}
              onChangeText={setInputUrl}
              placeholder="Enter URL or search..."
              placeholderTextColor="#999"
              onSubmitEditing={handleNavigate}
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-foreground"
              returnKeyType="go"
            />
          </View>

          {/* Navigation Controls */}
          <View className="flex-row gap-2 justify-center">
            <Pressable
              onPress={handleGoBack}
              disabled={!canGoBack}
              style={({ pressed }) => [
                { opacity: pressed ? 0.7 : 1 },
              ]}
              className={cn(
                'px-4 py-2 rounded-lg bg-primary',
                !canGoBack && 'opacity-50'
              )}
            >
              <Text className="text-white font-semibold">← Back</Text>
            </Pressable>

            <Pressable
              onPress={handleGoForward}
              disabled={!canGoForward}
              style={({ pressed }) => [
                { opacity: pressed ? 0.7 : 1 },
              ]}
              className={cn(
                'px-4 py-2 rounded-lg bg-primary',
                !canGoForward && 'opacity-50'
              )}
            >
              <Text className="text-white font-semibold">Forward →</Text>
            </Pressable>

            <Pressable
              onPress={handleRefresh}
              style={({ pressed }) => [
                { opacity: pressed ? 0.7 : 1 },
              ]}
              className="px-4 py-2 rounded-lg bg-primary"
            >
              <Text className="text-white font-semibold">🔄 Refresh</Text>
            </Pressable>
          </View>

          {/* Ad Blocker Status */}
          <View className="flex-row items-center gap-2 bg-success/10 border border-success rounded-lg px-3 py-2">
            <View className="w-2 h-2 rounded-full bg-success" />
            <Text className="text-sm text-foreground font-medium">Ad-blocking active</Text>
          </View>
        </View>

        {/* WebView */}
        <View 
          className="flex-1" 
          style={{ pointerEvents: 'auto' }}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => false}
          onResponderGrant={handleGestureStart}
          onResponderRelease={handleGestureEnd}
        >
          {loading && (
            <View 
              className="absolute inset-0 bg-background/50 flex items-center justify-center z-10"
              pointerEvents="auto"
            >
              <ActivityIndicator size="large" color="#FF0000" />
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
            }}
            injectedJavaScript={ADVANCED_AD_BLOCKING_SCRIPT}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            allowsFullscreenVideo={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            scrollEnabled={true}
            bounces={true}
            decelerationRate="normal"
            cacheEnabled={true}
            cacheMode="LOAD_CACHE_ELSE_NETWORK"
            mixedContentMode="always"
            textZoom={100}
            overScrollMode="always"
            setSupportMultipleWindows={true}
            pointerEvents="auto"
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
