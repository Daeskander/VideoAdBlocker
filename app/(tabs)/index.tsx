import { ScrollView, Text, View, TouchableOpacity, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";
import { useState } from "react";

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
      router.push({
        pathname: "/(tabs)/browser",
        params: { url: searchUrl },
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleBrowse = () => {
    router.push("/(tabs)/browser");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScreenContainer className="p-4 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6">
          {/* Hero Section */}
          <View className="items-center gap-3 mt-6">
            <Text className="text-5xl font-bold text-primary">YouTube</Text>
            <Text className="text-lg font-semibold text-foreground">Ad-Free Browser</Text>
            <Text className="text-sm text-muted text-center leading-relaxed">
              Watch YouTube videos without any ads. Completely ad-free experience.
            </Text>
          </View>

          {/* Search Section */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Search YouTube</Text>
            <View className="flex-row gap-2">
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search videos..."
                placeholderTextColor="#999"
                onSubmitEditing={handleSearch}
                className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                returnKeyType="search"
              />
              <TouchableOpacity
                onPress={handleSearch}
                className="bg-primary rounded-lg px-4 py-3 items-center justify-center active:opacity-80"
              >
                <Text className="text-white font-semibold">🔍</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Features Section */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Features</Text>
            <View className="gap-2">
              <FeatureCard
                icon="✓"
                title="No Pre-Roll Ads"
                description="Skip ads that play before videos"
              />
              <FeatureCard
                icon="✓"
                title="No Mid-Roll Ads"
                description="No interruptions during playback"
              />
              <FeatureCard
                icon="✓"
                title="No Banner Ads"
                description="Clean, distraction-free interface"
              />
              <FeatureCard
                icon="✓"
                title="Full Playback Control"
                description="Standard video controls and fullscreen"
              />
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            onPress={handleBrowse}
            className="bg-primary rounded-xl py-4 items-center justify-center mt-4 active:opacity-80"
          >
            <Text className="text-white font-bold text-lg">Start Browsing</Text>
          </TouchableOpacity>

          {/* Info Section */}
          <View className="bg-surface border border-border rounded-lg p-4 gap-2">
            <Text className="text-sm font-semibold text-foreground">How It Works</Text>
            <Text className="text-xs text-muted leading-relaxed">
              This app uses advanced ad-blocking technology to remove all YouTube advertisements. Ads are blocked at the network level and removed from the page in real-time, giving you a completely ad-free viewing experience.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <View className="flex-row gap-3 bg-surface border border-border rounded-lg p-3">
      <View className="w-8 h-8 rounded-full bg-success items-center justify-center flex-shrink-0">
        <Text className="text-white font-bold text-lg">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">{title}</Text>
        <Text className="text-xs text-muted">{description}</Text>
      </View>
    </View>
  );
}
