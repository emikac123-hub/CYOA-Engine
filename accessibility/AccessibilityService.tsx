// accessibility/AccessibilityService.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

// Type of context value
type AccessibilityContextType = {
  isScreenReaderEnabled: boolean;
};

const AccessibilityContext = createContext<AccessibilityContextType>({
  isScreenReaderEnabled: false,
});

// Provider component
export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);

  useEffect(() => {
    // Initial check
    AccessibilityInfo.isScreenReaderEnabled().then(setIsScreenReaderEnabled);

    // Subscribe to future changes
    const subscription = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      (enabled) => setIsScreenReaderEnabled(enabled)
    );

    return () => {
      subscription?.remove?.(); // For RN >= 0.65
    };
  }, []);

  return (
    <AccessibilityContext.Provider value={{ isScreenReaderEnabled }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Hook to use accessibility status anywhere
export const useAccessibility = (): AccessibilityContextType =>
  useContext(AccessibilityContext);
