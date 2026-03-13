# Resolve

A production-quality mobile application for tracking daily metrics and discovering patterns in your life.

## 🎯 Overview

Resolve helps you track custom metrics (weight, sleep, mood, calories, steps, etc.), visualize data through heatmaps, and discover correlations through analytics charts.

**Key Features:**
- ⚡ Frictionless logging with slider inputs (< 5 seconds)
- 📅 Calendar heatmap visualization
- 📊 Correlation graphs for pattern discovery
- 🎨 Beautiful, minimal UI
- 🏗️ Production-ready architecture
- 📱 iOS and Android support

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 📁 Project Structure

```
/src
  /components      # Reusable UI components
  /screens         # Full-screen views
  /navigation      # Navigation configuration
  /hooks           # Custom React hooks
  /services        # Business logic layer
  /repositories    # Data access layer
  /models          # TypeScript types
  /store           # Zustand state management
  /utils           # Helper functions
  /constants       # App-wide constants

/docs              # Comprehensive documentation
```

## 📖 Documentation

- **[PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md)** - Full product specification
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Architecture decisions and patterns
- **[DATABASE.md](docs/DATABASE.md)** - Data model and backend abstraction
- **[FEATURES_CHECKLIST.md](docs/FEATURES_CHECKLIST.md)** - Feature completion tracking

## 🏗️ Architecture

### Layered Architecture

```
UI Layer (Screens, Components)
    ↓
Hooks Layer (Custom Hooks)
    ↓
Store Layer (Zustand)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access Abstraction)
    ↓
Database Adapter (In-Memory, AsyncStorage, Convex)
```

### Key Principles

- **Separation of Concerns**: Each layer has a single responsibility
- **Dependency Inversion**: Depend on abstractions, not implementations
- **Business Logic Isolation**: All business logic in service layer
- **Testability**: Each layer independently testable

## 🔧 Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development tooling and SDK
- **TypeScript** - Static typing
- **React Navigation** - Navigation library
- **Zustand** - State management
- **Victory Native** - Data visualization
- **React Native SVG** - SVG support
- **date-fns** - Date manipulation

## 📊 Data Model

### Core Entities

**User**
- Stores user information

**Metric**
- User-defined trackable metrics
- Supports: number, scale, boolean, duration types
- Aggregation: singleValue or accumulate

**Entry**
- Daily values for each metric
- Date stored as YYYY-MM-DD
- Numeric value

### Aggregation Logic

**Single Value**: Replaces previous value (e.g., weight, mood)
```
Log 78.5 kg → Save
Log 78.2 kg → Replace → Final: 78.2 kg
```

**Accumulate**: Adds to daily total (e.g., calories, steps)
```
Log 450 kcal → Save: 450
Log 680 kcal → Add → Total: 1130 kcal
Log 520 kcal → Add → Total: 1650 kcal
```

## 🎨 Screens

### Home (Today)
- Daily logging interface
- Slider inputs for all metrics
- Current values displayed
- Quick save per metric

### Calendar
- Monthly heatmap view
- Color-coded days (red → yellow → green)
- Tap day for details
- Switch between metrics

### Analytics
- Multi-metric correlation charts
- Date range selection
- Toggle metrics on/off
- Discover patterns

## 🔌 Backend Abstraction

The repository pattern allows easy switching between storage implementations:

### Current: In-Memory
```typescript
// Fast, zero-setup, perfect for development
class InMemoryMetricRepository implements IMetricRepository { }
```

### Future: AsyncStorage
```typescript
// Persistent local storage
class AsyncStorageMetricRepository implements IMetricRepository { }
```

### Future: Convex
```typescript
// Real-time cloud sync
class ConvexMetricRepository implements IMetricRepository { }
```

**Service layer code never changes when switching!**

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

### Testing Strategy
- **Unit Tests**: Service layer, repositories, utilities
- **Integration Tests**: Data flow, store integration
- **Component Tests**: UI components

## 🔐 Security & Privacy

- **Local-first**: Data stored locally by default
- **No tracking**: No analytics or third-party SDKs
- **Type-safe**: TypeScript prevents many runtime errors
- **Input validation**: All inputs validated in service layer

## 🚢 Deployment

### iOS
1. Build with Expo: `expo build:ios`
2. Submit to App Store Connect
3. Review and publish

### Android
1. Build with Expo: `expo build:android`
2. Submit to Google Play Console
3. Review and publish

## 🛣️ Roadmap

### Phase 1 (Current - MVP)
- ✅ Core architecture
- ✅ Daily logging
- ✅ Calendar heatmap
- ✅ Analytics charts
- ✅ Documentation

### Phase 2 (Next)
- [ ] AsyncStorage persistence
- [ ] Push notifications
- [ ] Streak tracking
- [ ] Dark mode

### Phase 3 (Future)
- [ ] Convex backend integration
- [ ] Real-time sync
- [ ] AI-powered insights
- [ ] Health app integration

## 🤝 Contributing

This is a professional codebase designed for maintainability:

1. Follow the established architecture
2. Add TypeScript types for everything
3. Keep business logic in services
4. Document complex logic
5. Write tests for new features

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Built with production-quality practices:
- Clean architecture
- SOLID principles
- Repository pattern
- Dependency inversion
- Test-driven development

## 📞 Support

For questions about the architecture or implementation, see the comprehensive documentation in the `/docs` folder.

---

**Built with ❤️ using React Native and TypeScript**
