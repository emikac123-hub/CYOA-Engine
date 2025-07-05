import React from "react";
import { FlatList, Text, TouchableOpacity, SafeAreaView } from "react-native";
import Modal from "react-native-modal";
import { useLanguage } from "../localization/LanguageProvider";

const ChapterSelectMenu = ({
  visible,
  onClose,
  unlockedChapters,
  onSelectChapter,
}) => {
  const { t } = useLanguage();

  const chaptersWithHome = [
    { title: `${t("home")}`, id: "home" },
    ...unlockedChapters,
  ];

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={{ justifyContent: "flex-end", margin: 0 }}
    >
      <SafeAreaView
        edges={["bottom", "left", "right"]}
        style={{
          backgroundColor: "#111",
          padding: 20,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 20, marginBottom: 10 }}>
          {t("selectChapter")}
        </Text>

        <FlatList
          data={chaptersWithHome}
          keyExtractor={(item, index) => `${item.id || item.title}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onSelectChapter(item)}
              style={{ paddingVertical: 12 }}
            >
              <Text style={{ color: "#fff", fontSize: 16 }}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
};

export default ChapterSelectMenu;
