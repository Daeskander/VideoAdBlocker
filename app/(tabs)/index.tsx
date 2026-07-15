import { Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const triggerHaptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
      router.push({
        pathname: "/(tabs)/browser",
        params: { url: searchUrl },
      });
      triggerHaptic();
    }
  };

  const handleBrowse = () => {
    router.push("/(tabs)/browser");
    triggerHaptic();
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 gap-7">
          <View className="gap-5">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 rounded-2xl bg-primary items-center justify-center">
                <IconSymbol name="play.rectangle.fill" size={28} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-3xl font-bold text-foreground">AdFreeVideoPlayer</Text>
                <Text className="text-sm text-muted mt-1">A calmer way to watch.</Text>
              </View>
            </View>

            <View className="bg-surface border border-border rounded-2xl p-4 gap-3">
              <Text className="text-sm font-semibold text-foreground">Search YouTube</Text>
              <View className="flex-row gap-2">
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search videos"
                  placeholderTextColor="#8A8F98"
                  onSubmitEditing={handleSearch}
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  returnKeyType="search"
                />
                <Pressable
                  onPress={handleSearch}
                  className="w-12 rounded-xl bg-primary items-center justify-center active:opacity-80"
                  accessibilityRole="button"
                  accessibilityLabel="Search"
                >
                  <IconSymbol name="magnifyingglass" size={22} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          </View>

          <View className="gap-3">
            <Text className="text-sm font-semibold text-muted uppercase">Focus Mode</Text>
            <View className="gap-2">
              <FeatureCard
                title="Less clutter"
                description="Promoted placements and video overlays are cleaned up as pages load."
              />
              <FeatureCard
                title="Native controls"
                description="Keep YouTube playback controls, fullscreen, and PiP available."
              />
              <FeatureCard
                title="History"
                description="Resume recently opened videos without digging through browser tabs."
              />
            </View>
          </View>

          <Pressable
            onPress={handleBrowse}
            className="bg-primary rounded-2xl py-4 items-center justify-center active:opacity-80"
            accessibilityRole="button"
          >
            <Text className="text-white font-bold text-base">Open YouTube</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  const colors = useColors();

  return (
    <View className="flex-row gap-3 bg-surface border border-border rounded-xl p-3">
      <View className="w-8 h-8 rounded-full bg-background border border-border items-center justify-center flex-shrink-0">
        <IconSymbol name="shield.lefthalf.filled" size={18} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">{title}</Text>
        <Text className="text-xs text-muted leading-5 mt-0.5">{description}</Text>
      </View>
    </View>
  );
}
