import React, { useEffect, useState } from "react";
import { Text, View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { loadStory } from "../storyloader";

type StoryLoaderGateProps = {
  children: (data: {
    meta: any;
    story: any[];
    resumePageId?: string;
  }) => React.ReactNode;
};

export default function StoryLoaderGate({ children }: StoryLoaderGateProps) {
  const { id, resume } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [storyData, setStoryData] = useState<{
    meta: any;
    story: any[];
    resumePageId?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id || typeof id !== "string") {
        setError("No story selected.");
        setLoading(false);
        return;
      }

      try {
        const data = await loadStory(id);

        if (resume && typeof resume === "string") {
          data.resumePageId = resume;
        }

        setStoryData(data);
      } catch (err) {
        setError(`Could not load story: ${id}`);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "#aaa", marginTop: 10 }}>Loading story...</Text>
      </View>
    );
  }

  if (error || !storyData) {
    return (
      <View style={{ padding: 24 }}>
        <Text style={{ fontSize: 18, color: "red", textAlign: "center" }}>
          {error || "Unknown error."}
        </Text>
        <Text
          onPress={() => router.replace("/")}
          style={{
            textAlign: "center",
            marginTop: 16,
            color: "#00f",
            textDecorationLine: "underline",
          }}
        >
          Back to story list
        </Text>
      </View>
    );
  }

  return <>{children(storyData)}</>;
}
