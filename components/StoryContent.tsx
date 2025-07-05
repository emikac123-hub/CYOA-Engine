import React from "react";
import { View, Text, TouchableOpacity, Image, Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "context/ThemeContext";
import { storyStyles } from "./storyStyles";

const StoryContent = ({
  page,
  fadeAnim,
  handleChoice,
  history,
  setCurrentPageId,
  isSingleContinue,
  showPaywall,
  meta,
  router,
  setShowPaywall,
  setHistory,
}) => {
  const { theme } = useTheme();
  const s = storyStyles(theme);
  return (
    <TouchableOpacity
      style={s.container}
      activeOpacity={1}
      onPress={() => {
        if (page?.choices?.length === 1) {
          Haptics.selectionAsync();
          handleChoice(page.choices[0].nextId);
        }
      }}
    >
      {page?.image && (
        <Image
          source={{ uri: page.image }}
          style={s.image}
          resizeMode="cover"
        />
      )}

      <Animated.View style={[s.textContainer, { opacity: fadeAnim }]}>
        <Text style={s.storyText}>{page.text}</Text>
      </Animated.View>

      <View style={s.storyContent} pointerEvents="box-none">
        {!isSingleContinue && (
          <View style={s.choicesContainer}>
            {page.choices.map((choice, index) => (
              <TouchableOpacity
                key={index}
                style={s.choiceButton}
                onPress={() => {
                  Haptics.selectionAsync();
                  handleChoice(choice.nextId);
                }}
              >
                <Text style={s.choiceText}>{choice.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {showPaywall && (
        <View style={s.paywall}>
          <Text style={s.paywallText}>
            Buy “{meta.title}” to continue reading!
          </Text>
          <TouchableOpacity
            style={s.purchaseButton}
            onPress={() =>
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            }
          >
            <Text style={s.purchaseButtonText}>
              {meta?.price ? `$${meta.price}` : "$1.99"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace("/")}>
            <Text style={s.cancelText}>Back to story list</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default StoryContent;
function styles(theme: string): { s: any; } {
  throw new Error("Function not implemented.");
}

