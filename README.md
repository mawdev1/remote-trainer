# Remote Trainer

A personal fitness trainer Chrome extension for remote workers. Track pushups and arm curls right from your browser. All data stays local on your device.

## Features

- **Quick logging**: One-click buttons to log +5, +10, +15 reps or enter custom amounts
- **Two exercises**: Track pushups and dumbbell arm curls
- **Today & weekly stats**: See your progress at a glance
- **7-day history**: Visual bar chart showing your workout patterns
- **Local storage**: All data stored in your browser, never sent to any server
- **Dark/Light mode**: Automatic theme detection with manual toggle
- **Beautiful UI**: Modern, clean design that stays out of your way

## Getting Started

### Prerequisites

- Node.js LTS
- Chrome browser

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

Watches and rebuilds `dist/` on changes.

### Build for Production

```bash
npm run build
```

### Load in Chrome

1. Open `chrome://extensions` in Chrome
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist/` folder

## Usage

1. Click the Remote Trainer icon in your browser toolbar
2. Use the +5, +10, +15 buttons to quickly log reps, or enter a custom number
3. Switch between "Dashboard" and "History" views
4. Toggle dark/light mode with the sun/moon icon

## Project Structure

```
remote-trainer-extension/
├── public/
│   ├── icons/            # Extension icons
│   └── manifest.json     # MV3 manifest
├── src/
│   ├── app/
│   │   └── App.tsx       # Main popup UI
│   ├── components/
│   │   ├── theme/        # Theme provider
│   │   └── ui/           # UI components
│   ├── lib/
│   │   └── storage.ts    # Exercise data storage layer
│   ├── scripts/
│   │   ├── background/   # Service worker
│   │   └── content/      # Content script (minimal)
│   ├── styles/           # Tailwind CSS styles
│   └── popup.tsx         # Popup entry point
└── dist/                 # Build output
```

## Data Storage

All workout data is stored locally using `chrome.storage.local`. The extension never sends data to any external server. Your workout history stays on your device.

Data structure:
- Each exercise entry includes: type (pushups/arm_curls), reps, timestamp
- Statistics are computed client-side from stored entries

## Scripts

- `npm run dev` – Watch mode build
- `npm run build` – Production build
- `npm run type-check` – TypeScript check
- `npm run lint` / `npm run lint:fix` – Linting

## Privacy

Remote Trainer is designed with privacy in mind:
- No account required
- No data collection
- No analytics
- Everything stored locally in your browser
- Open source

## License

ISC
