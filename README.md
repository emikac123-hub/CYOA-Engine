# A Choose Your Own Adventure Engine

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/erikmikac/choose-your-own-adventure)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/erikmikac/choose-your-own-adventure/pulls)

An Expo-based application for creating and playing choose-your-own-adventure stories. It features a dynamic story-loading mechanism and a set of themed UI components for a consistent and engaging user experience.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Localization](#localization)
  - [Adding a New Language](#adding-a-new-language)
  - [Translating Story Files](#translating-story-files)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features

- **Dynamic Story Loading**: Stories are loaded from JSON files, allowing for easy expansion and modification of adventure content.
- **Themed UI Components**: Custom components that adapt to light and dark modes for a visually consistent experience.
- **File-Based Routing**: Utilizes Expo Router for simplified navigation.
- **Localization Support**: Includes a system for translating stories and UI elements into multiple languages.

## Project Structure

- `app/`: Contains the application's screens and navigation logic.
- `assets/`: Stores static assets like images and fonts.
- `components/`: Houses reusable UI components.
- `constants/`: Defines application-wide constants, including color palettes for themes.
- `hooks/`: Contains custom React hooks for theme-aware components.
- `stories/`: Stores the JSON files for different adventure stories.
- `localization/`: Handles internationalization (i18n) with a translation script.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Python](https://www.python.org/) (for the translation script)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/erikmikac/choose-your-own-adventure.git
    cd choose-your-own-adventure
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the application:**
    ```bash
    npx expo start
    ```

## Available Scripts

- `npm start`: Starts the Expo development server.
- `npm run android`: Starts the app on an Android emulator or device.
- `npm run ios`: Starts the app on an iOS simulator or device.
- `npm run web`: Starts the app in a web browser.
- `npm run lint`: Runs ESLint to check for code quality issues.

## Localization

### Adding a New Language

1.  Create a new JSON file in the `localization/` directory (e.g., `fr.json`).
2.  Add the new language to the `LANGUAGES` object in `localization/index.ts`.
3.  Use the `t` function from `localization/index.ts` to translate text in your components.

### Translating Story Files

The `localization/translator.py` script can be used to automatically translate story files using Google Translate.

**Usage:**

1.  Install the required Python libraries:
    ```bash
    pip install deep-translator
    ```
2.  Update the `input_file`, `output_file`, and `target_language` variables in the script.
3.  Run the script:
    ```bash
    python localization/translator.py
    ```

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m '''Add some AmazingFeature'''`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [deep-translator](https://pypi.org/project/deep-translator/)
