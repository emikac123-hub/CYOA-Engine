# Tales of Covarnius: A Choose Your Own Adventure App

This project is a choose-your-own-adventure application built with Expo. It features a dynamic story loading mechanism and custom UI components for a consistent user experience.

## Features

- **Dynamic Story Loading**: Stories are loaded from JSON files, allowing for easy expansion and modification of adventure content.
- **Themed UI Components**: Custom components that adapt to light and dark modes for a visually consistent experience.

## Project Structure

This project utilizes [Expo Router](https://docs.expo.dev/router/introduction) for file-based routing, simplifying navigation within the application.

### Key Directories and Files:

- `app/`: Contains the application's screens and navigation logic.
  - `index.tsx`: The title screen of the application.
  - `story.tsx`: Displays the story content and handles user choices.
- `assets/`: Stores static assets like images and fonts.
- `components/`: Houses reusable UI components.
  - `ThemedText.tsx`: A custom `Text` component that automatically adjusts its color based on the active theme (light or dark).
  - `ThemedView.tsx`: A custom `View` component that automatically adjusts its background color based on the active theme (light or dark).
- `constants/`: Defines application-wide constants.
  - `Colors.ts`: Defines the color palette for both light and dark themes.
- `hooks/`: Contains custom React hooks.
  - `useThemeColor.ts`: A hook that provides a convenient way to access theme-dependent colors defined in `Colors.ts`.
- `stories/`: Stores the JSON files for different adventure stories.
- `storyloader.ts`: Manages the loading and parsing of story content.

## Getting Started

Follow these steps to set up and run the project locally:

1.  **Install Dependencies**:

    ```bash
    npm install
    ```

2.  **Start the Application**:

    ```bash
    npx expo start
    ```

    After running the command, you will be presented with options to open the app in a:

    -   [Development Build](https://docs.expo.dev/develop/development-builds/introduction/)
    -   [Android Emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
    -   [iOS Simulator](https://docs.expo.dev/workflow/ios-simulator/)
    -   [Expo Go](https://expo.dev/go) (a limited sandbox for trying out app development with Expo)

## Available Scripts

-   `npm start`: Starts the Expo development server.
-   `npm run reset-project`: Resets the project to its initial state (moves starter code to `app-example` and creates a blank `app` directory).
-   `npm run android`: Starts the app on an Android emulator or device.
-   `npm run ios`: Starts the app on an iOS simulator or device.
-   `npm run web`: Starts the app in a web browser.
-   `npm run lint`: Runs ESLint to check for code quality issues.

## Learning Resources

For more information on developing with Expo, refer to the official documentation:

-   [Expo Documentation](https://docs.expo.dev/)
-   [Learn Expo Tutorial](https://docs.expo.dev/tutorial/introduction/)

## Community

Join the Expo developer community:

-   [Expo on GitHub](https://github.com/expo/expo)
-   [Discord Community](https://chat.expo.dev)