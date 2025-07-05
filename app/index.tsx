// app/index.tsx
import React, { useEffect, useState } from "react";
import TitleScreen from "../components/TitleScreen";
import { useTheme } from "../context/ThemeContext";
const { theme } = useTheme();
export default function Index() {
  return <TitleScreen />;
}

