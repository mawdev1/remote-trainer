<div align="center">

# 💪 Ext & Flex

### *Micro workouts for remote workers*

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

<br />

A beautiful, privacy-focused Chrome extension that helps remote workers track their daily exercises without leaving the browser. Log push-ups and arm curls with a single click, visualize your progress, and build healthy habits—all while your data stays completely local.

<br />

[Features](#-features) • [Installation](#-installation) • [Development](#-development) • [Tech Stack](#-tech-stack) • [License](#-license)

<br />

---

</div>

<br />

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎯 Quick Logging
One-click buttons for common rep counts. Log exercises in seconds without breaking your workflow.

### 📊 Progress Tracking
Daily and weekly statistics at a glance. Watch your totals grow as you build consistency.

### 📈 Visual History
Beautiful bar charts showing your last 7 days of activity. Spot trends and stay motivated.

</td>
<td width="50%">

### 🌓 Dark & Light Mode
Seamless theme switching that respects your system preferences. Easy on the eyes, day or night.

### 🔒 100% Private
All data stored locally in your browser using Chrome's storage API. Zero servers, zero tracking.

### ⚡ Lightweight
Minimal footprint. Fast popup that doesn't slow down your browsing experience.

</td>
</tr>
</table>

<br />

## 🏋️ Exercises Supported

| Exercise | Icon | Description |
|----------|------|-------------|
| **Push-ups** | 💪 | Classic upper body strength builder |
| **Arm Curls** | 🏋️ | Bicep training with dumbbells |

> 💡 *More exercises coming soon! Have a suggestion? Open an issue.*

<br />

## 📦 Installation

### From Source (Developer Mode)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ext-and-flex.git
   cd ext-and-flex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right)
   - Click **Load unpacked**
   - Select the `dist` folder

5. **Start training!** 💪

<br />

## 🛠 Development

```bash
# Install dependencies
npm install

# Start development mode (watches for changes)
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Lint code
npm run lint

# Build for production
npm run build
```

### Project Structure

```
src/
├── app/                  # Application entry point
├── components/           # Shared components
│   ├── common/           # Header, Footer, ViewToggle, icons
│   ├── theme/            # Theme provider
│   └── ui/               # Base UI primitives (shadcn-style)
├── features/             # Feature modules
│   ├── exercises/        # Exercise registry & components
│   ├── dashboard/        # Dashboard view
│   └── history/          # History view
├── stores/               # Global state (React Context)
├── lib/                  # Core libraries
│   ├── storage/          # Chrome storage abstraction
│   └── utils/            # Utility functions
├── types/                # TypeScript definitions
├── test/                 # Test utilities & setup
└── scripts/              # Extension scripts
```

> 📖 See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed documentation.

<br />

## 🧰 Tech Stack

<div align="center">

| Category | Technology |
|----------|------------|
| **Framework** | React 18 with Hooks |
| **Language** | TypeScript 5.3 |
| **Styling** | Tailwind CSS 4.1 |
| **UI Components** | Radix UI Primitives |
| **State** | React Context |
| **Testing** | Jest + React Testing Library |
| **Build Tool** | Webpack 5 |
| **Extension API** | Chrome Manifest V3 |
| **Storage** | Chrome Storage API |

</div>

<br />

## 🎨 Design Philosophy

Ext & Flex is built with these principles in mind:

- **🚀 Speed** — Popup loads instantly. No spinners, no waiting.
- **🎯 Focus** — Do one thing well. Track exercises, nothing else.
- **🔐 Privacy** — Your fitness data never leaves your device.
- **✨ Delight** — Smooth animations and satisfying interactions.
- **🌍 Accessibility** — High contrast, keyboard navigable, screen reader friendly.

<br />

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Ideas for Contributions

- [ ] Add more exercise types (squats, planks, etc.)
- [ ] Export data to CSV/JSON
- [ ] Reminders/notifications to exercise
- [ ] Weekly/monthly goals
- [ ] Streak tracking
- [ ] Customizable quick-add buttons

<br />

## 📄 License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

<br />

---

<div align="center">

**Made with ❤️ for remote workers everywhere**

*Take a break. Do some push-ups. Your body will thank you.*

<br />

⭐ **Star this repo if you find it useful!** ⭐

</div>
