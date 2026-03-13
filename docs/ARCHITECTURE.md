# Resolve - Architecture Documentation

## Overview

Resolve follows a **layered architecture** pattern with strict separation of concerns. The architecture is designed for maintainability, testability, and future extensibility.

## Architecture Principles

### 1. Separation of Concerns
Each layer has a single, well-defined responsibility:
- **UI Layer**: Presentation and user interaction
- **Hooks Layer**: React state management and component logic
- **Service Layer**: Business logic and orchestration
- **Repository Layer**: Data access abstraction
- **Database Adapter**: Actual data storage implementation

### 2. Dependency Inversion
Higher layers depend on abstractions, not concrete implementations:
- Services depend on `IRepository` interfaces
- UI depends on services and hooks
- Database implementation can be swapped without changing business logic

### 3. Business Logic Isolation
All business logic lives in the service layer:
- Entry aggregation logic (accumulate vs single value)
- Data validation
- Complex calculations
- No business logic in UI components

### 4. Testability
Each layer can be tested independently:
- Services can be tested with mock repositories
- Repositories can be tested with mock databases
- UI components can be tested with mock services

## Layer Architecture

```
┌─────────────────────────────────────────┐
│           UI Components                  │
│  (Screens, Components)                  │
└─────────────┬───────────────────────────┘
              │ uses
              ↓
┌─────────────────────────────────────────┐
│         Custom Hooks                    │
│  (useMetricsWithTodayValues, etc.)      │
└─────────────┬───────────────────────────┘
              │ uses
              ↓
┌─────────────────────────────────────────┐
│        Zustand Store                    │
│    (Global State Management)            │
└─────────────┬───────────────────────────┘
              │ uses
              ↓
┌─────────────────────────────────────────┐
│        Service Layer                    │
│  (Business Logic)                       │
└─────────────┬───────────────────────────┘
              │ uses
              ↓
┌─────────────────────────────────────────┐
│       Repository Layer                  │
│  (Data Access Abstraction)              │
└─────────────┬───────────────────────────┘
              │ implements
              ↓
┌─────────────────────────────────────────┐
│      Database Adapter                   │
│  (In-Memory, AsyncStorage, Convex)      │
└─────────────────────────────────────────┘
```

## Directory Structure

```
/src
  /components          # Reusable UI components
    MetricInputCard.tsx
    CalendarHeatmap.tsx
    DayDetailModal.tsx
    CorrelationGraph.tsx
    index.ts           # Barrel export
  
  /screens            # Full-screen views
    HomeScreen.tsx
    CalendarScreen.tsx
    AnalyticsScreen.tsx
    index.ts
  
  /navigation         # Navigation configuration
    AppNavigator.tsx
    index.ts
  
  /hooks              # Custom React hooks
    index.ts
  
  /services           # Business logic layer
    userService.ts
    metricService.ts
    entryService.ts
    index.ts
  
  /repositories       # Data access layer
    interfaces.ts     # Repository contracts
    userRepository.ts
    metricRepository.ts
    entryRepository.ts
    index.ts
  
  /models             # TypeScript types/interfaces
    index.ts
  
  /store              # Zustand state management
    index.ts
  
  /utils              # Helper functions
    dateUtils.ts
    index.ts
  
  /constants          # App-wide constants
    index.ts

/docs                 # Documentation
```

## Key Architectural Decisions

### 1. Why Layered Architecture?

**Problem**: Monolithic components with mixed concerns become unmaintainable

**Solution**: Strict layer separation

**Benefits**:
- Easy to understand and onboard new developers
- Changes in one layer don't affect others
- Can replace implementations without rewriting logic
- Testable at each layer

### 2. Why Repository Pattern?

**Problem**: Direct database access couples code to specific storage solution

**Solution**: Repository interfaces abstract data access

**Benefits**:
- Can switch from in-memory → AsyncStorage → Convex without changing business logic
- Easy to mock for testing
- Centralized data access logic
- Database queries in one place

**Example**:
```typescript
// Service layer doesn't know about database
const metrics = await metricRepository.getMetricsByUserId(userId);

// Repository implementation can be swapped:
// - InMemoryMetricRepository (testing)
// - AsyncStorageMetricRepository (offline)
// - ConvexMetricRepository (production)
```

### 3. Why Zustand for State Management?

**Problem**: Redux is too verbose, Context API causes re-render issues

**Solution**: Zustand - lightweight, performant state management

**Benefits**:
- Simple API
- No boilerplate
- TypeScript-first
- Selectors prevent unnecessary re-renders
- Easy to test

### 4. Why Service Layer?

**Problem**: Business logic in UI components is hard to test and reuse

**Solution**: Dedicated service layer

**Benefits**:
- Business logic in one place
- Reusable across components
- Easy to unit test
- Clear API for common operations

**Example**:
```typescript
// Aggregation logic in service, not UI
export async function logMetricValue(metricId, value, date) {
  const metric = await metricRepository.getMetricById(metricId);
  const existingEntry = await entryRepository.getEntryByMetricIdAndDate(metricId, date);
  
  if (existingEntry) {
    const newValue = metric.aggregationType === 'accumulate'
      ? existingEntry.value + value  // Business rule
      : value;
    return entryRepository.updateEntry(existingEntry.id, { value: newValue });
  }
  // ...
}
```

### 5. Why TypeScript?

**Problem**: JavaScript's dynamic typing causes runtime errors

**Solution**: Strict TypeScript with comprehensive types

**Benefits**:
- Catch errors at compile time
- Better IDE support
- Self-documenting code
- Refactoring confidence
- Safer async operations

## Data Flow

### Example: Logging a Metric Value

1. **UI Layer**: User adjusts slider and taps Save
```typescript
<MetricInputCard onSave={(value) => logValue(metric.id, value)} />
```

2. **Store**: Zustand action called
```typescript
const logValue = useAppStore(state => state.logValue);
```

3. **Service Layer**: Business logic applied
```typescript
export async function logMetricValue(metricId, value) {
  const metric = await metricRepository.getMetricById(metricId);
  // Aggregation logic here
  if (metric.aggregationType === 'accumulate') {
    // Add to existing value
  } else {
    // Replace existing value
  }
}
```

4. **Repository Layer**: Abstract data access
```typescript
await entryRepository.updateEntry(entryId, { value });
```

5. **Database Adapter**: Actual storage
```typescript
// In-memory implementation
this.entries.set(entryId, updatedEntry);
```

6. **State Update**: Zustand updates reactive state
```typescript
set(state => ({ entries: [...updatedEntries] }));
```

7. **UI Re-render**: React components automatically update

## State Management Strategy

### Global State (Zustand)
- Current user
- All metrics
- All entries
- Loading states
- Error states

### Local Component State
- Form inputs
- Modal visibility
- Slider values
- UI-only state

### Derived State (Custom Hooks)
- Metrics with today's values
- Entries for specific dates
- Calculated analytics

## Database Abstraction

### Current: In-Memory Storage

**Use Case**: Development and testing

**Implementation**:
```typescript
class InMemoryMetricRepository implements IMetricRepository {
  private metrics: Map<string, Metric> = new Map();
  // CRUD operations
}
```

### Future: AsyncStorage

**Use Case**: Offline-first mobile app

**Implementation**:
```typescript
class AsyncStorageMetricRepository implements IMetricRepository {
  async getMetricsByUserId(userId: string) {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.METRICS);
    return JSON.parse(json);
  }
}
```

### Future: Convex Backend

**Use Case**: Production with cloud sync

**Implementation**:
```typescript
class ConvexMetricRepository implements IMetricRepository {
  async getMetricsByUserId(userId: string) {
    return await convex.query(api.metrics.getByUser, { userId });
  }
}
```

**Key Point**: Service layer code doesn't change!

## Performance Considerations

### 1. State Selectors
```typescript
// Bad: Re-renders on any state change
const state = useAppStore();

// Good: Only re-renders when metrics change
const metrics = useAppStore(state => state.metrics);
```

### 2. React.memo for Components
```typescript
export const MetricInputCard = React.memo(({ metric, onSave }) => {
  // Only re-renders if props change
});
```

### 3. Virtualized Lists
For future with many metrics:
```typescript
<FlatList
  data={metrics}
  renderItem={({ item }) => <MetricCard metric={item} />}
  keyExtractor={item => item.id}
/>
```

### 4. Debounced Search/Filter
```typescript
const debouncedSearch = useMemo(
  () => debounce(searchMetrics, 300),
  []
);
```

## Testing Strategy

### Unit Tests

**Service Layer**:
```typescript
describe('logMetricValue', () => {
  it('should accumulate values for accumulate metrics', async () => {
    // Mock repository
    // Call service
    // Assert result
  });
});
```

**Repository Layer**:
```typescript
describe('InMemoryMetricRepository', () => {
  it('should return metrics for user', async () => {
    // Test CRUD operations
  });
});
```

### Integration Tests

Test full data flow:
```typescript
it('should log value and update store', async () => {
  // Create metric
  // Log value
  // Check store state
});
```

### Component Tests

```typescript
describe('MetricInputCard', () => {
  it('should call onSave with correct value', () => {
    // Render component
    // Interact with slider
    // Press save
    // Assert onSave called
  });
});
```

## Error Handling

### Repository Layer
```typescript
async getMetricById(id: string): Promise<Metric | null> {
  try {
    return this.metrics.get(id) || null;
  } catch (error) {
    console.error('Failed to get metric:', error);
    throw new Error('Database error');
  }
}
```

### Service Layer
```typescript
export async function logMetricValue(metricId, value) {
  try {
    // Business logic
  } catch (error) {
    console.error('Failed to log value:', error);
    throw error; // Re-throw for store to handle
  }
}
```

### Store Layer
```typescript
logValue: async (metricId, value) => {
  try {
    set({ isLoading: true, error: null });
    const entry = await entryService.logMetricValue(metricId, value);
    // Update state
  } catch (error) {
    set({ error: error.message, isLoading: false });
  }
}
```

### UI Layer
```typescript
{error && (
  <Text style={styles.error}>{error}</Text>
)}
```

## Security Considerations

### Data Validation
- Validate input ranges in service layer
- Sanitize user inputs
- Check for NaN, Infinity, negative values where inappropriate

### Type Safety
- Strict TypeScript prevents many runtime errors
- Validate dates format (YYYY-MM-DD)
- Ensure IDs are valid before database operations

### Future: API Security
- JWT authentication
- Rate limiting
- Input sanitization on backend
- HTTPS only

## Scalability

### Current Architecture Supports:
- Hundreds of metrics per user
- Thousands of entries per metric
- Multiple users (through userId)

### Future Optimizations:
- Pagination for large datasets
- Virtual scrolling for long lists
- Lazy loading of historical data
- Caching strategies
- Background sync

## Extension Points

### Adding New Metric Types
1. Add type to `MetricType` enum
2. Update UI input component
3. No changes needed in service/repository layers

### Adding New Screens
1. Create screen component in `/screens`
2. Add route in `AppNavigator`
3. Use existing services and hooks

### Adding New Repository
1. Implement `IRepository` interface
2. Swap in DI container
3. No changes to service layer

### Adding New Features
1. Add model types
2. Create repository interface and implementation
3. Create service with business logic
4. Add store actions
5. Create UI components
6. Wire up in screens

## Conclusion

This architecture prioritizes:
- **Maintainability**: Clear structure, easy to navigate
- **Testability**: Each layer independently testable
- **Extensibility**: Easy to add features without major refactoring
- **Flexibility**: Can swap implementations without changing business logic
- **Type Safety**: TypeScript catches errors early

The result is a professional, production-ready codebase that can scale with the product's growth.
