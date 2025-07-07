# A Choose Your Own Adventure Engine

- Tentative Title: Forked Fates: Interactive Adventures
- Story in Progress: Tales of Covarnius

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/erikmikac/choose-your-own-adventure)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/erikmikac/choose-your-own-adventure/pulls)

**Tales of Covarnius** is a dynamic and engaging choose-your-own-adventure application built with Expo and React Native. It provides a robust framework for creating and playing interactive stories, complete with a flexible story-loading system, themed UI components, and comprehensive localization support.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Localization](#localization)
  - [Adding a New Language](#adding-a-new-language)
  - [Translating Story Files](#translating-story-files)
- [Testing](#testing)
  - [Story Validation](#story-validation)
  - [The `Constants.ts` File](#the-constantsts-file)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features

- **Dynamic Story Loading**: Stories are loaded from JSON files, allowing for easy expansion and modification of adventure content without needing to alter the application's source code.
- **Themed UI Components**: A set of custom components that automatically adapt to the system's light and dark modes, ensuring a visually consistent and appealing user experience.
- **File-Based Routing**: Leverages Expo Router to provide a simple and intuitive navigation structure based on the file system.
- **Localization Support**: A comprehensive internationalization (i18n) system that allows for the translation of both the UI and story content into multiple languages.
- **Progress Management**: Saves user progress, allowing players to resume their adventures from where they left off.
- **Haptic Feedback**: Enhances the user experience with haptic feedback on key interactions.

## Architecture

The application is built on a modular architecture that separates concerns and promotes code reusability. The core components of the architecture are:

- **Story Engine**: The heart of the application, responsible for loading and parsing story files, managing the current state of the adventure, and handling user choices.
- **UI Components**: A collection of reusable React components that are themed to adapt to light and dark modes. These components are used throughout the application to ensure a consistent look and feel.
- **Localization System**: A flexible system for managing translations. It uses JSON files to store translations for different languages and provides a simple API for accessing them.
- **Storage Manager**: A set of utility functions for saving and loading user progress, as well as managing unlocked stories.

## Project Structure

The project is organized into the following directories:

- `app/`: Contains the application's screens and navigation logic, powered by Expo Router.
- `assets/`: Stores static assets such as images, fonts, and audio files.
- `components/`: Houses reusable UI components that are used throughout the application.
- `constants/`: Defines application-wide constants, including color palettes for themes and testing flags.
- `context/`: Contains React context providers for managing global state, such as the current theme.
- `hooks/`: Contains custom React hooks that provide reusable logic for components.
- `localization/`: Handles internationalization (i18n) with a translation script and language-specific JSON files.
- `storage/`: Provides a simple API for saving and loading user progress and unlocked stories.
- `stories/`: Stores the JSON files for different adventure stories, organized by language.
- `test/`: Contains the test suite for the application, including story validation tests.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Python](https://www.python.org/) (for the translation script)

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/erikmikac/choose-your-own-adventure.git
    cd choose-your-own-adventure
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Start the application:**

    ```bash
    npx expo start
    ```

## Available Scripts

- `npm start`: Starts the Expo development server.
- `npm run android`: Starts the app on an Android emulator or device.
- `npm run ios`: Starts the app on an iOS simulator or device.
- `npm run web`: Starts the app in a web browser.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm test`: Runs the test suite.

## Localization

### Current Languages

- English
- Japanese
- Icelandic
- German
- French
- Spanish

### Adding a New Language

1. Create a new JSON file in the `localization/` directory (e.g., `fr.json`).
2. Add the new language to the `LANGUAGES` object in `localization/LanguageProvider.tsx`.
3. Use the `t` function from the `useLanguage` hook to translate text in your components.

### Translating Story Files

The `localization/translator.py` script can be used to automatically translate story files using Google Translate.
Then refine the translations using AI. The translator is not enough to proivde a cohesive and appropriate translation.

**Usage:**

1. Install the required Python libraries:

    ```bash
    pip install deep-translator
    ```

2. Update the `input_file`, `output_file`, and `target_language` variables in the script.
3. Run the script:

    ```bash
    python localization/translator.py
    ```

## Story File Structure

Stories are defined in JSON files located in the `stories/` directory. Each story file has a top-level object with two keys: `meta` and `story`.

### The `meta` Object

The `meta` object contains metadata about the story, including:

-   `id`: A unique identifier for the story. This ID must match the key used in the `storyMap` in `storyloader.ts`.
-   `title`: The title of the story.
-   `author`: The author of the story.
-   `sampleLimit`: The number of choices a user can make in a sample story before being prompted to purchase the full story.
-   `chapters`: An array of chapter objects, each with a `title`, `order`, and `id`. The `id` must match the `id` of the page where the chapter begins.

### The `story` Array

The `story` array contains the content of the story, with each element representing a page in the adventure. Each page object has the following structure:

-   `id`: A unique identifier for the page. The entry point for the story must have an `id` of `"intro"`.
-   `text`: The text to display on the page.
-   `image`: The filename of the image to display on the page.
-   `backgroundMusic`: The filename of the background music to play on the page.
-   `choices`: An array of choice objects, each with a `text` and `nextId`. The `nextId` is the `id` of the page to navigate to when the user selects that choice.
-   `chapter`: An object with a `title` and `order`. The `title` and `id` must match the corresponding chapter in the `meta` object.

### Example

```json
{
  "meta": {
    "id": "covarnius",
    "title": "Tales of Covarnius",
    "author": "Your Name",
    "sampleLimit": 15,
    "chapters": [
      {
        "title": "Adventure Time!",
        "order": 2,
        "id": "intro"
      }
    ]
  },
  "story": [
    {
      "id": "intro",
      "text": "You find yourself at a fork in the road.",
      "image": "fork-in-the-road.png",
      "backgroundMusic": "mysterious-tunes.mp3",
      "choices": [
        {
          "text": "Go left",
          "nextId": "left-path"
        },
        {
          "text": "Go right",
          "nextId": "right-path"
        }
      ],
      "chapter": {
        "title": "Adventure Time!",
        "order": 2
      }
    }
  ]
}
```

## Testing

The project includes a comprehensive test suite to ensure the quality and integrity of the stories.

### Story Validation

The `test/storyValidation.test.js` file contains a suite of tests that validate the structure and content of the story files. These tests check for:

- **Broken links**: Ensures that all `nextId` values in the story files reference an existing page ID.
- **Text length**: Verifies that no story page has more than 430 characters of text.
- **Duplicate page IDs**: Checks for duplicate page IDs in the story files.
- **Duplicate page text**: Ensures that there are no duplicate text passages in the story files.
- **Self-linking pages**: Verifies that no page has a choice that loops back to itself.

### The `Constants.ts` File

The `constants/Constants.ts` file plays a crucial role in the testing process. It contains a `TESTING` flag that can be used to enable or disable certain features during testing. For example, the `SAMPLE_LIMIT`, which restricts the number of choices a user can make in a sample story, is disabled when the `TESTING` flag is set to `true`. This allows the test suite to run through the entire story without being blocked by the paywall.

The `test/storyValidation.test.js` file also includes a test that ensures the `TESTING` flag is set to `false` before committing any code. This prevents the application from being accidentally released with the testing features enabled.

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m '''Add some AmazingFeature'''`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [deep-translator](https://pypi.org/project/deep-translator/)

## Privacy Policy

**Last Updated:** July 5, 2025

**App**: Forked Fates: Interactive Adventures

**Developer** Bright Anchor Apps

1. **Introduction**
   
Your privacy is important to us. This Privacy Policy explains how Forked Fates: Interactive Adventures (“the App”) collects, uses, and protects your information. By using the App, you agree to the practices described in this policy.

3. **Information We Do Not Collect**
   
We do not collect or store the following types of personal data:

- Your name, email address, or contact info
- Location data
- Health or biometric data
- Photos or media from your device
- The App does not include social logins, user accounts, or personal profiles.

3. **Information We May Collect**
   
We may collect non-personal information to improve the user experience and app functionality, including:

- Anonymous usage statistics (e.g., which stories are accessed most)
- Device type and operating system
- Crash reports or performance metrics (via Apple or other analytics tools)
- This data is used in aggregate and does not identify you personally.

4. **In-App Purchases**
   
All purchases are processed securely through the platform's respective app store (e.g., Apple App Store or Google Play Store). We do not store or have access to your payment information.

6. **Data Storage**
   
All story progress is stored locally on your device. We do not store any cloud-based user data or maintain external databases tied to individual users.

7. **Children’s Privacy**
   
Our App is suitable for users aged 10 and up. We do not knowingly collect any personal information from children under 13. If you're a parent or guardian and believe your child has provided personal information, please contact us immediately.

8. **Third-Party Services**

We may use third-party tools (e.g., for analytics or bug tracking). These tools may collect anonymous usage data but cannot access your personal information.
All third-party services used comply with Apple’s privacy guidelines.

9. **Your Rights**
Because we do not collect or store personal information, there's no data to request, export, or delete. You may delete the app at any time to remove all locally stored data.

10. **Contact Us**
If you have any questions or concerns about this Privacy Policy, feel free to contact us at:
📧  <croquet_player@proton.me>

11. **Changes to This Policy**
We may update this Privacy Policy from time to time. Changes will be posted here with a revised "Last Updated" date.

## Terms of Use
**Last Updated:** July 5, 2025
**App: Forked Fates:** Interactive Adventures
**Developer:** Bright Anchor Apps
**Contact:** croquet_player@proton.me

1. **Acceptance of Terms**
By downloading, accessing, or using Forked Fates: Interactive Adventures (“the App”), you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree, do not use the App.

2. **License to Use**
We grant you a limited, non-exclusive, non-transferable, revocable license to use the App for personal, non-commercial purposes in accordance with these terms.
You may not:

- Use the open-source engine in a way that violates its license terms
- Decompile or reverse-engineer any proprietary, non-open-source components (such as in-app content, artwork, music, etc.)
- Resell, sublicense, or distribute the App or its content
- Circumvent any security or access control mechanisms

3. **Intellectual Property**
   
All content in the App — including stories, artwork, sound effects, music, and branding — is owned by the developer or used with permission. You may not copy, reproduce, or exploit any part of the App without prior written consent.

5. **In-App Purchases**
   
The App may offer optional in-app purchases to unlock content. All payments are processed securely through the platform's respective app store (e.g., Apple App Store or Google Play Store).
Purchases are subject to the billing terms and refund policies of the store you use. We do not store or have access to your payment information.

All purchases are final.

We do not offer refunds except where required by law.

Content unlocked via in-app purchase may be tied to your platform account (e.g., Apple ID or Google Account) and device.

5. **Availability & Support**
   
We do our best to keep the App available and functioning smoothly. However, we do not guarantee uninterrupted service, bug-free operation, or continued availability of specific features or stories.

7. **User Conduct**
   
You agree not to:

- Use the App for any activity that violates local, state, or international laws
- Disrupt or interfere with the normal operation of the App
- Upload malicious code or exploit vulnerabilities

7. **Termination**
   
We reserve the right to terminate your access to the App if you violate these Terms or misuse the software. You may stop using the App at any time by uninstalling it from your device.

9. **Disclaimer of Warranties**
    
The App is provided “as is” without warranties of any kind, express or implied. We disclaim all warranties including but not limited to merchantability, fitness for a particular purpose, and non-infringement.

11. **Limitation of Liability**
    
To the fullest extent permitted by law, the developer shall not be liable for any indirect, incidental, or consequential damages arising from your use of the App.

13. **Changes to Terms**
    
We may revise these Terms of Use from time to time. Updates will be posted in the App and/or in the App Store listing with a revised "Last Updated" date. Continued use of the App after changes constitutes acceptance.

15. **Governing Law**
    
These Terms are governed by the laws of the State of Indiana, United States, without regard to its conflict of law principles.

17. **Open Source Components**
    
Parts of this App (e.g., the story engine) are open source and distributed under the MIT License. See the GitHub repository for details. These components may be reused or modified in accordance with their license.
