# 🎨 Design System Sync

A powerful Figma plugin that automatically exports design tokens (strings, colors & typography) to GitHub repositories with support for Android, iOS, Flutter, and Kotlin Multiplatform projects.

![Version](https://img.shields.io/badge/version-4.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platforms](https://img.shields.io/badge/platforms-Android%20%7C%20iOS%20%7C%20Flutter-orange)

## ✨ Features

### 🌐 Localization (Strings)
- 📱 **Multi-Platform Support**: Export to Android XML, iOS Localizable.strings, and Flutter ARB
- 🌍 **30+ Languages**: Built-in support for major world languages
- 🔄 **Multi-Mode Variables**: Export all language modes in one click

### 🎨 Design Tokens (Colors)
- 🤖 **Android**: XML `colors.xml` + Jetpack Compose `Color.kt`
- 🍎 **iOS**: UIKit/SwiftUI color extensions with hex initializers (generated automatically)
- 🦋 **Flutter**: Dart color constants with `Color.fromARGB()`
- 🎯 **Full RGBA Support**: Alpha channel preserved across all platforms
- 🌗 **Light/Dark Theming**: Export all color modes as separate files using `{mode}` placeholder

### ✍️ Typography (Font Styles)
- 🤖 **Android Compose**: `Typography.kt` with TextStyle definitions and custom font family support
- 📄 **Android XML**: `styles.xml` with TextAppearance styles including `fontFamily`
- 🍎 **iOS**: SwiftUI `Font` / UIKit `UIFont` extensions with proper custom font handling
- 🦋 **Flutter**: `TextStyle` constants with font weights, sizes, and line height ratios
- 📐 **Comprehensive**: fontSize, fontWeight, fontFamily, letterSpacing, lineHeight

### 🚀 Automation
- 🔄 **Automated PR Creation**: Creates pull requests automatically
- 📱 **Multi-Platform Export**: Export Android + iOS + Flutter in a single PR
- 🌿 **Configurable Branches**: Custom branch names and PR titles
- 🔒 **Non-Destructive Updates**: Updates existing branches without deleting PR review comments
- 💾 **Settings Persistence**: Save your configuration for quick exports
- 🔐 **Secure**: Uses GitHub Personal Access Tokens

## 📦 Installation

### Option 1: Install from Figma Community
Search for "Design System Sync" in the Figma Community plugins.

**Direct Link:** [Design System Sync on Figma Community](https://www.figma.com/community/plugin/1595034045326188787/design-system-sync)

### Option 2: Manual Installation (Development)

1. Clone this repository:
```bash
git clone https://github.com/ZeyadAbdullah679/design-system-sync.git
cd design-system-sync
```

2. Install dependencies:
```bash
npm install
```

3. Build the plugin:
```bash
npm run build
```

4. Import to Figma:
   - Open Figma Desktop
   - Go to `Plugins` → `Development` → `Import plugin from manifest`
   - Select the `manifest.json` file from this project

## 🚀 Quick Start

### 1. Set Up Your Figma Variables & Styles

#### String Variables (Localization)

Create string variables in Figma with different modes for each language:

```
Collection: "App Strings"
├── Mode: English (default)
├── Mode: Arabic
└── Mode: Spanish

Variables:
├── app_title = "My App" / "تطبيقي" / "Mi App"
├── welcome_message = "Welcome!" / "مرحبا!" / "¡Bienvenido!"
└── button_continue = "Continue" / "متابعة" / "Continuar"
```

#### Color Variables (Design Tokens)

Create color variables in Figma. For theming, use multiple modes:

```
Collection: "Brand Colors"
├── Mode: Light
├── Mode: Dark

Variables:
├── primary     = #6200EE / #BB86FC
├── background  = #FFFFFF / #121212
├── surface     = #F5F5F5 / #1E1E1E
├── text        = #000000 / #FFFFFF
└── error       = #B00020 / #CF6679
```

#### Text Styles (Typography)

Create text styles in Figma with your typography system:

```
Text Styles:
├── Headline Large (32pt, Bold, Inter)
├── Headline Medium (24pt, SemiBold, Inter)
├── Body Large (16pt, Regular, Inter)
├── Body Medium (14pt, Regular, Inter)
├── Label Small (12pt, Medium, Inter)
└── Caption (10pt, Regular, Inter)
```

### 2. Configure GitHub Settings

1. Get a GitHub Personal Access Token:
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Click "Generate new token (classic)"
   - Select scope: `repo` (Full control of private repositories)
   - Copy the token (starts with `ghp_`)

2. In the plugin, enter:
   - GitHub Username
   - Repository Name
   - Base Branch (main/development)
   - Personal Access Token

3. Click **"Test"** to verify connection
4. Click **"Save"** to persist settings

### 3. Choose Export Types & Platforms

Select what you want to export:
- ✅ **Strings**: Localization strings for multi-language support
- ✅ **Colors**: Design tokens for consistent theming
- ✅ **Fonts**: Typography styles for text consistency

Select one or more platforms:
- ✅ **Android/KMP**: XML resources + Jetpack Compose
- ✅ **iOS**: SwiftUI / UIKit
- ✅ **Flutter**: Dart

You can select multiple platforms to export everything in a single PR.

### 4. Configure & Export

1. Customize file paths (defaults work for most projects)
2. Set branch name and PR title in the export section
3. Click **"Load Variables from Figma"**
4. Review the stats
5. Click **"Export to GitHub"**
6. Review the automated pull request! 🎉

## 🌗 Light/Dark Theme Support

If your Figma color variables have multiple modes (e.g., "Light" and "Dark"), you can export each mode as a separate file using the `{mode}` placeholder in file paths:

```
Android:  values/{mode}/colors.xml        → values/light/colors.xml, values/dark/colors.xml
iOS:      Theme/Colors_{mode}.swift       → Theme/Colors_light.swift, Theme/Colors_dark.swift
Flutter:  lib/theme/colors_{mode}.dart    → lib/theme/colors_light.dart, lib/theme/colors_dark.dart
```

If your path does **not** contain `{mode}`, only the first mode (base theme) is exported — backward compatible with single-mode setups.

## 📱 Platform Output Examples

### 🤖 Android / Kotlin Multiplatform

**Strings XML:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_title">My App</string>
    <string name="welcome_message">Welcome!</string>
</resources>
```

**Colors XML:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">#FF6200EE</color>
    <color name="secondary">#FF03DAC6</color>
</resources>
```

**Compose Colors:**
```kotlin
package com.example.theme

import androidx.compose.ui.graphics.Color

val Primary = Color(0xFF6200EE)
val Secondary = Color(0xFF03DAC6)
```

**Compose Typography:**
```kotlin
package com.example.theme

import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val HeadlineLarge = TextStyle(
    fontFamily = InterFontFamily,
    fontSize = 32.sp,
    fontWeight = FontWeight(700),
    lineHeight = 38.4.sp
)
```

**XML Typography (styles.xml):**
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="TextAppearance.HeadlineLarge">
        <item name="android:fontFamily">Inter</item>
        <item name="android:textSize">32sp</item>
        <item name="android:textFontWeight">700</item>
        <item name="android:lineHeight">38sp</item>
    </style>
</resources>
```

### 🍎 iOS / Swift

**Localizable.strings:**
```
/* Localization strings generated from Figma */

"app_title" = "My App";
"welcome_message" = "Welcome!";
```

**SwiftUI Colors** (includes hex initializer):
```swift
import SwiftUI

// MARK: - Color Hex Initializer
extension Color {
    init(hex: String, opacity: Double = 1.0) {
        // ... hex parsing logic generated automatically
    }
}

// MARK: - Design System Colors
extension Color {
    static let primary = Color(hex: "#6200EE")
    static let secondary = Color(hex: "#03DAC6")
    static let overlay = Color(hex: "#000000", opacity: 0.5)
}
```

**SwiftUI Typography:**
```swift
import SwiftUI

// MARK: - Typography Styles
extension Font {
    static let headlineLarge = Font.custom("Inter", size: 32).weight(.bold)
    static let bodyMedium = Font.system(size: 14, weight: .regular)
}
```

**UIKit Typography** (custom font with fallback):
```swift
import UIKit

extension UIFont {
    static let headlineLarge = UIFont(name: "Inter", size: 32) ?? UIFont.systemFont(ofSize: 32, weight: .bold)
    static let bodyMedium = UIFont.systemFont(ofSize: 14, weight: .regular)
}
```

### 🦋 Flutter / Dart

**ARB Strings:**
```json
{
  "@@locale": "en",
  "app_title": "My App",
  "welcome_message": "Welcome!"
}
```

**Dart Colors:**
```dart
import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color.fromARGB(255, 98, 0, 238);
  static const Color secondary = Color.fromARGB(255, 3, 218, 198);
}
```

**Dart Typography:**
```dart
import 'package:flutter/material.dart';

class AppTextStyles {
  static const TextStyle headlineLarge = TextStyle(
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: FontWeight.w700,
    height: 1.2,
  );
}
```

## 📁 Default File Paths

### Android / KMP
| Token Type | Path |
|---|---|
| Strings | `shared/src/commonMain/composeResources/{lang}/strings.xml` |
| Colors XML | `shared/src/commonMain/composeResources/values/colors.xml` |
| Compose Colors | `shared/src/commonMain/kotlin/theme/Color.kt` |
| Typography XML | `shared/src/commonMain/composeResources/values/styles.xml` |
| Compose Typography | `shared/src/commonMain/kotlin/theme/Typography.kt` |

### iOS
| Token Type | Path |
|---|---|
| Strings | `{lang}.lproj/Localizable.strings` |
| Colors | `Shared/Theme/Colors.swift` |
| Typography | `Shared/Theme/Typography.swift` |

### Flutter
| Token Type | Path |
|---|---|
| Strings | `lib/l10n/app_{lang}.arb` |
| Colors | `lib/theme/app_colors.dart` |
| Typography | `lib/theme/app_text_styles.dart` |

**Path Placeholders:**
- `{lang}` — Replaced with language code/folder (e.g., `values-ar`, `Base.lproj`, `app_en.arb`)
- `{mode}` — Replaced with color mode name (e.g., `light`, `dark`) for multi-theme exports

All paths are fully customizable in the plugin UI.

## 🌍 Supported Languages

Built-in mappings for 30+ languages including:

English, Arabic, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Dutch, Polish, Turkish, Swedish, Norwegian, Danish, Finnish, Greek, Hindi, Thai, Vietnamese, Indonesian, Malay, Czech, Hungarian, Romanian, Ukrainian, and more.

## 🔧 Troubleshooting

### GitHub Connection
- **"Failed to get base branch"**: Verify branch name and token permissions
- **"Connection failed"**: Check token validity and internet connection

### File Paths
- **"Path does not exist"**: Create folder structure first or adjust paths
- Strings paths must include `{lang}` placeholder
- For theming, include `{mode}` in color paths to get per-mode files

### Variables
- **"No variables found"**: Create variables/text styles in Figma first
- Typography requires Text Styles (not just text layers)
- Colors require Color type variables (not solid paint fills)

## 🛠️ Development

### Project Structure
```
src/
├── plugin.ts              # Entry point (Figma sandbox)
├── types.ts               # Shared type definitions
├── constants.ts           # Language mapping
├── github.ts              # GitHub PR workflow
├── extractors/            # Figma API data extraction
│   ├── colors.ts
│   └── typography.ts
├── generators/            # Platform-specific code generation
│   ├── strings.ts         # Android XML, iOS strings, Flutter ARB
│   ├── colors.ts          # Color files for all platforms
│   └── typography.ts      # Typography files for all platforms
├── utils/                 # Encoding, escaping, color conversion
│   ├── encoding.ts
│   ├── escaping.ts
│   ├── colors.ts
│   ├── network.ts
│   └── debug.ts
└── ui/                    # Plugin frontend
    ├── ui.html
    ├── ui.css
    └── ui.ts
```

### Build Commands
```bash
npm install           # Install dependencies
npm run build         # Bundle src/ → code.js + ui.html via esbuild
npm run watch         # Build with file watching
npm run typecheck     # TypeScript type checking
npm test              # Run tests
npm run test:coverage # Run tests with coverage
npm run lint          # ESLint
```

### Testing
The plugin includes 86+ tests covering:
- String parsing (Android XML, iOS Strings, Flutter ARB)
- Color conversion, generation, and multi-mode theming
- Typography generation with custom font handling
- GitHub API integration (branch create/update, PR creation)
- Encoding and escaping utilities
- Edge cases (prefix stripping, alpha channels, special characters)

```bash
npm test                                    # Run all tests
npx jest tests/core/colorParsing.test.ts    # Run a single test file
```

### Debug Mode
Set `DEBUG_MODE = true` in `src/utils/debug.ts` to enable console logging routed to the plugin UI.

## 📝 Changelog

### v4.0.0 - Multi-Platform & Theming Update
- ✨ **Multi-Platform Export**: Select Android + iOS + Flutter and export all in a single PR
- ✨ **Light/Dark Theming**: Export all color modes as separate files with `{mode}` placeholder
- ✨ **Configurable Branch & PR**: Custom branch names, PR titles, and commit messages
- 🔒 **Non-Destructive Branch Updates**: Existing branches are updated via PATCH, preserving PR review comments
- 🛠️ **Modular Codebase**: Refactored from 2 monolithic files into 15+ focused modules under `src/`
- 🛠️ **esbuild Bundler**: Replaced `tsc` with esbuild for fast builds
- 🐛 **iOS Hex Initializer**: Generated Swift code now includes the `Color(hex:)` / `UIColor(hex:)` extension
- 🐛 **iOS Alpha Support**: Colors with transparency correctly pass `opacity:` / `alpha:` parameter
- 🐛 **iOS Custom Fonts**: `Font.custom()` preserves exact font names; UIKit uses `UIFont(name:size:)` with fallback
- 🐛 **Android XML fontFamily**: Typography styles now include `android:fontFamily`
- 🧪 86+ tests with imports from source modules (no more duplicated test functions)

### v3.0.0 (2026-02-05)
- ✨ Flutter platform support (ARB, Dart colors, TextStyle)
- ✨ Typography/Font Styles export for all platforms
- ✨ Extract text styles from Figma
- 🎨 Enhanced UI with 3 export types

### v2.0.0 (2026-01-24)
- ✨ Color variables support
- ✨ Android Compose & iOS color extensions
- 🎨 Renamed to "Design System Sync"

### v1.0.0 (2026-01-15)
- 🚀 Initial release with string export

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/ZeyadAbdullah679/design-system-sync/issues)
- **Plugin:** [Figma Community](https://www.figma.com/community/plugin/1595034045326188787/design-system-sync)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with ❤️ for the multi-platform development community.
