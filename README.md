## 📦 React Native CLI – Essential Packages

This project is built using **React Native CLI**. Below are the core dependencies and development tools used.

---

### ✅ Production Dependencies

Install these packages using:

```bash
npm install
```

| Package                                     | Purpose                                          |
| ------------------------------------------- | ------------------------------------------------ |
| `@react-navigation/native`                  | Navigation (core)                                |
| `@react-navigation/stack`                   | Stack-based navigation                           |
| `react-native-screens`                      | Optimized navigation screen handling             |
| `react-native-safe-area-context`            | Safe area handling for notched devices           |
| `react-native-gesture-handler`              | Gesture support for navigation and UI            |
| `react-native-reanimated`                   | Smooth animations and gesture-based interactions |
| `nativewind`                                | Tailwind CSS styling for React Native            |
| `react-native-vector-icons`                 | Icon support (FontAwesome, Material, etc.)       |
| `react-native-paper`                        | Material design components                       |
| `@react-native-async-storage/async-storage` | Local key-value storage                          |
| `axios`                                     | HTTP client for API requests                     |
| `react-native-config`                       | Environment variables management                 |
| `react-native-device-info`                  | Device and OS information                        |
| `react-native-permissions`                  | Handle native permission requests                |
| `react-native-fs`                           | File system access                               |
| `react-native-mmkv` (optional)              | High-performance local storage                   |
| `realm` (optional)                          | Local offline database                           |

---

### 🛠️ Development Dependencies

Install these packages using:

```bash
npm install --save-dev
```

| Package                                                              | Purpose                   |
| -------------------------------------------------------------------- | ------------------------- |
| `typescript`, `@types/react`, `@types/react-native`                  | TypeScript support        |
| `tailwindcss`                                                        | Required for NativeWind   |
| `prettier`, `prettier-plugin-tailwindcss`                            | Code formatting           |
| `babel-plugin-react-native-reanimated`                               | Required for Reanimated 2 |
| `@testing-library/react-native`, `jest`, `babel-jest`, `@types/jest` | Testing tools             |
| `eslint`, `eslint-config-prettier`, `eslint-plugin-react`            | Linting & code quality    |

---

### ⚙️ Additional Setup

#### 🔧 Babel Configuration (`babel.config.js`)

```js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: ['react-native-reanimated/plugin'],
};
```

#### 🧵 Tailwind Initialization

```bash
npx tailwindcss init
```

#### 🍎 iOS Setup

```bash
cd ios && pod install
```

---

### 📁 Notes

* This setup assumes you're using the **React Native CLI**, not Expo.
* Use Native Modules like `react-native-fs`, `react-native-config`, and `react-native-device-info` only after proper native linking.
* Ensure you rebuild the app (`npx react-native run-android` / `run-ios`) after adding any native dependencies.

---

Happy Coding! 🚀
