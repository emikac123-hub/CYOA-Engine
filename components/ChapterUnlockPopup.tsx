import React from "react";
import { Text, View, Dimensions } from "react-native";
import Modal from "react-native-modal";
import ConfettiCannon from "react-native-confetti-cannon";
import { styles } from "./storyStyles";

const SCREEN_WIDTH = Dimensions.get("window").width;

const ChapterUnlockPopup = ({ visible, title, confettiKey }) => {
  if (!visible) return null;

  return (
    <>
      <ConfettiCannon
        count={100}
        origin={{ x: SCREEN_WIDTH / 2, y: -20 }}
        fadeOut
        autoStart
        key={confettiKey}
      />
      <Modal
        isVisible={visible}
        animationIn="zoomInDown"
        animationOut="fadeOut"
        backdropOpacity={0.6}
        animationOutTiming={1200}
        useNativeDriver
      >
        <View
          style={{
            backgroundColor: "#222",
            padding: 20,
            borderRadius: 16,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 20,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {title}
          </Text>
        </View>
      </Modal>
    </>
  );
};

export default ChapterUnlockPopup;