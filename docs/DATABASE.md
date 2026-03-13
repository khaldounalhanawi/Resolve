# Resolve - Database Documentation

## Overview

This document describes the data model, storage strategy, and backend abstraction approach for Resolve.

## Current Implementation: In-Memory Storage

The app currently uses **in-memory storage** for development and testing. This allows rapid iteration without external dependencies.

## Data Model

### Entity Relationship Diagram

```
┌──────────────┐
│    User      │
│──────────────│
│ id (PK)      │
│ name         │
│ createdAt    │
└──────┬───────┘
       │
       │ 1:N
       ↓
┌──────────────┐
│   Metric     │
│──────────────│
│ id (PK)      │
│ userId (FK)  │◄──┐
│ name         │   │
│ type         │   │
│ unit         │   │
│ minValue     │   │
│ maxValue     │   │
│ targetValue  │   │ 1:N
│ aggregation  │   │
│ color        │   │
│ createdAt    │   │
└──────┬───────┘   │
       │           │
       │ 1:N       │
       ↓           │
┌──────────────┐   │
│    Entry     │   │
│──────────────│   │
│ id (PK)      │   │
│ userId (FK)  │   │
│ metricId (FK)│───┘
│ date         │
│ value        │
│ createdAt    │
└──────────────┘
```

## Tables

### Users Table

Stores user account information.

**Schema**:
```typescript
interface User {
  id: string;           // Unique identifier
  name: string;         // Display name
  createdAt: number;    // Unix timestamp
}
```

**Indexes**:
- Primary key: `id`

**Current Implementation**:
- Auto-created test user on first access
- Single user mode in MVP

**Future**:
- Authentication system
- Multiple users per device
- Cloud sync with user accounts

---

### Metrics Table

Stores user-defined trackable metrics.

**Schema**:
```typescript
interface Metric {
  id: string;                    // Unique identifier
  userId: string;                // Foreign key to Users
  name: string;                  // Display name (e.g., "Weight")
  type: MetricType;              // Data type
  unit?: string;                 // Unit of measurement (e.g., "kg")
  minValue: number;              // Minimum valid value
  maxValue: number;              // Maximum valid value
  targetValue?: number;          // Goal value (optional)
  aggregationType: AggregationType;  // How to aggregate daily entries
  color?: string;                // Hex color for visualization
  createdAt: number;             // Unix timestamp
}

type MetricType = 'number' | 'scale' | 'boolean' | 'duration';
type AggregationType = 'singleValue' | 'accumulate';
```

**Indexes**:
- Primary key: `id`
- Index: `by_user` on `userId` (for fetching user's metrics)

**Example Data**:
```json
{
  "id": "metric_001",
  "userId": "user_001",
  "name": "Weight",
  "type": "number",
  "unit": "kg",
  "minValue": 40,
  "maxValue": 150,
  "targetValue": 70,
  "aggregationType": "singleValue",
  "color": "#007AFF",
  "createdAt": 1710000000000
}
```

**Common Queries**:
1. Get all metrics for a user
2. Get specific metric by ID
3. Create new metric
4. Update metric properties
5. Delete metric

---

### Entries Table

Stores daily metric values logged by users.

**Schema**:
```typescript
interface Entry {
  id: string;           // Unique identifier
  userId: string;       // Foreign key to Users
  metricId: string;     // Foreign key to Metrics
  date: string;         // Date in YYYY-MM-DD format
  value: number;        // Numeric value
  createdAt: number;    // Unix timestamp
}
```

**Indexes**:
- Primary key: `id`
- Index: `by_metric_date` on `(metricId, date)` (for heatmap queries)
- Index: `by_user_date` on `(userId, date)` (for daily summary)

**Example Data**:
```json
{
  "id": "entry_001",
  "userId": "user_001",
  "metricId": "metric_001",
  "date": "2026-03-13",
  "value": 78.5,
  "createdAt": 1710345600000
}
```

**Common Queries**:
1. Get all entries for a metric (for heatmap)
2. Get entries for a date range (for charts)
3. Get entry for specific metric and date (for updates)
4. Get all entries for a specific date (for day detail)
5. Create/update entry

---

## Aggregation Logic

### Single Value Metrics

**Behavior**: Each day has one value; new entries replace old values

**Use Cases**:
- Weight: 78.5 kg (your weight at the end of the day)
- Sleep: 7.5 hours (total sleep last night)
- Mood: 4/5 (how you feel today)

**Database Operation**:
```typescript
// User logs weight: 78.5 kg
const existingEntry = await getEntryByMetricIdAndDate(metricId, today);

if (existingEntry) {
  // Replace value
  await updateEntry(existingEntry.id, { value: 78.5 });
} else {
  // Create new entry
  await createEntry({ metricId, date: today, value: 78.5 });
}
```

**Result**:
- Only one entry per metric per day
- Latest value overwrites previous

---

### Accumulate Metrics

**Behavior**: Multiple entries per day are summed together

**Use Cases**:
- Calories: 450 kcal (breakfast) + 680 kcal (lunch) + 520 kcal (dinner) = 1650 kcal
- Steps: 2000 (morning) + 5000 (afternoon) + 3000 (evening) = 10000 steps
- Water: 250ml + 500ml + 250ml = 1000ml

**Database Operation**:
```typescript
// User logs calories: 450 kcal
const existingEntry = await getEntryByMetricIdAndDate(metricId, today);

if (existingEntry) {
  // Add to existing value
  await updateEntry(existingEntry.id, { 
    value: existingEntry.value + 450 
  });
} else {
  // Create new entry
  await createEntry({ metricId, date: today, value: 450 });
}
```

**Result**:
- One entry per metric per day (value is cumulative)
- New values added to existing total

---

## Query Patterns

### Home Screen: Today's Values

**Goal**: Display all metrics with today's current values

**Query**:
```typescript
const today = getTodayISO(); // "2026-03-13"
const metrics = await getMetricsByUserId(userId);
const entries = await getEntriesByUserIdAndDate(userId, today);

// Combine metrics with entries
const display = metrics.map(metric => ({
  metric,
  value: entries.find(e => e.metricId === metric.id)?.value || 0
}));
```

**Optimization**:
- Fetch metrics once on app load (cached in Zustand)
- Fetch today's entries once on app load
- Update only changed entries in-memory

---

### Calendar Screen: Monthly Heatmap

**Goal**: Display color-coded calendar for one metric

**Query**:
```typescript
const startDate = "2026-03-01";
const endDate = "2026-03-31";
const metricId = "metric_001";

const entries = await getEntriesByMetricIdAndDateRange(
  metricId,
  startDate,
  endDate
);

// Map entries to calendar dates
const calendar = generateCalendarDays(startDate, endDate).map(date => ({
  date,
  entry: entries.find(e => e.date === date),
  color: getHeatmapColor(entry?.value, metric)
}));
```

**Optimization**:
- Load one month at a time
- Cache loaded months
- Pre-fetch adjacent months

---

### Analytics Screen: Correlation Graph

**Goal**: Display multiple metrics over time on one chart

**Query**:
```typescript
const selectedMetricIds = ["metric_001", "metric_002", "metric_003"];
const startDate = "2026-02-13"; // 30 days ago
const endDate = "2026-03-13";

const entriesByMetric = {};
for (const metricId of selectedMetricIds) {
  entriesByMetric[metricId] = await getEntriesByMetricIdAndDateRange(
    metricId,
    startDate,
    endDate
  );
}

// Normalize and plot
```

**Optimization**:
- Parallel queries for multiple metrics
- Normalize values for comparison
- Limit to 30-90 day windows

---

### Day Detail Modal

**Goal**: Show all metric values for a specific date

**Query**:
```typescript
const date = "2026-03-13";
const userId = "user_001";

const metrics = await getMetricsByUserId(userId);
const entries = await getEntriesByUserIdAndDate(userId, date);

const display = metrics.map(metric => ({
  metric,
  entry: entries.find(e => e.metricId === metric.id) || null
}));
```

---

## Backend Abstraction Strategy

### Repository Interface Pattern

All data access goes through repository interfaces, allowing different implementations:

```typescript
interface IMetricRepository {
  getMetricsByUserId(userId: string): Promise<Metric[]>;
  getMetricById(metricId: string): Promise<Metric | null>;
  createMetric(userId: string, data: CreateMetricDTO): Promise<Metric>;
  updateMetric(metricId: string, data: Partial<Metric>): Promise<Metric>;
  deleteMetric(metricId: string): Promise<void>;
}
```

### Implementation 1: In-Memory (Current)

**Use Case**: Development, testing, demo

```typescript
class InMemoryMetricRepository implements IMetricRepository {
  private metrics: Map<string, Metric> = new Map();
  
  async getMetricsByUserId(userId: string) {
    return Array.from(this.metrics.values())
      .filter(m => m.userId === userId);
  }
}
```

**Pros**:
- Fast
- No setup
- Easy to reset

**Cons**:
- Data lost on reload
- Not production-ready

---

### Implementation 2: React Native AsyncStorage (Future)

**Use Case**: Offline-first mobile app

```typescript
class AsyncStorageMetricRepository implements IMetricRepository {
  async getMetricsByUserId(userId: string) {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.METRICS);
    const allMetrics = JSON.parse(json || '[]');
    return allMetrics.filter(m => m.userId === userId);
  }
  
  async createMetric(userId: string, data: CreateMetricDTO) {
    const metric = { id: generateId(), userId, ...data, createdAt: Date.now() };
    const json = await AsyncStorage.getItem(STORAGE_KEYS.METRICS);
    const metrics = JSON.parse(json || '[]');
    metrics.push(metric);
    await AsyncStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(metrics));
    return metric;
  }
}
```

**Pros**:
- Persists data
- Works offline
- No backend needed

**Cons**:
- No cloud sync
- Limited storage
- No multi-device support

---

### Implementation 3: Convex (Production Target)

**Use Case**: Production with real-time sync

```typescript
class ConvexMetricRepository implements IMetricRepository {
  async getMetricsByUserId(userId: string) {
    return await convex.query(api.metrics.getByUser, { userId });
  }
  
  async createMetric(userId: string, data: CreateMetricDTO) {
    return await convex.mutation(api.metrics.create, { userId, ...data });
  }
}
```

**Convex Schema**:
```typescript
export default defineSchema({
  metrics: defineTable({
    userId: v.id("users"),
    name: v.string(),
    type: v.string(),
    unit: v.optional(v.string()),
    minValue: v.number(),
    maxValue: v.number(),
    targetValue: v.optional(v.number()),
    aggregationType: v.string(),
    color: v.optional(v.string()),
    createdAt: v.number()
  }).index("by_user", ["userId"]),
  
  entries: defineTable({
    userId: v.id("users"),
    metricId: v.id("metrics"),
    date: v.string(),
    value: v.number(),
    createdAt: v.number()
  })
  .index("by_metric_date", ["metricId", "date"])
  .index("by_user_date", ["userId", "date"])
});
```

**Pros**:
- Real-time sync
- Multi-device support
- Serverless
- Type-safe
- Automatic indexes

**Cons**:
- Requires internet
- External dependency

---

## Switching Between Implementations

**The key advantage**: Service layer code never changes!

```typescript
// service/metricService.ts
export async function getUserMetrics() {
  const user = await userRepository.getCurrentUser();
  return metricRepository.getMetricsByUserId(user.id);
}
```

To switch implementations, update the import:

```typescript
// repositories/index.ts

// Development
export { default as metricRepository } from './inMemory/metricRepository';

// Production
export { default as metricRepository } from './convex/metricRepository';
```

No other code changes needed!

---

## Data Migration Strategy

### From In-Memory to AsyncStorage

1. Export data from current repository
2. Initialize AsyncStorage repository
3. Import data
4. Switch DI binding

### From AsyncStorage to Convex

1. User creates account
2. Upload local data to Convex
3. Switch to Convex repository
4. Keep AsyncStorage as cache

### Future: Sync Strategy

- AsyncStorage as offline cache
- Convex as source of truth
- Sync on network available
- Conflict resolution (last-write-wins initially)

---

## Scalability Considerations

### Data Volume Estimates

**Per User**:
- Metrics: ~10-50
- Entries: ~10 entries/day × 365 days = 3,650/year
- Entry size: ~100 bytes
- Total: ~365 KB/year

**1000 Users**:
- ~365 MB/year of entry data
- Very manageable

### Query Performance

**Heatmap Query**:
- Fetch ~30 entries (one month)
- With index on (metricId, date): O(log N + 30)
- Fast even with millions of entries

**Analytics Query**:
- Fetch 3 metrics × 30 days = 90 entries
- Parallel queries
- Sub-100ms response time

### Future Optimizations

1. **Pagination**: Load entries in chunks
2. **Caching**: Cache recent queries
3. **Indexes**: Proper indexes on common queries
4. **Aggregations**: Pre-calculate summaries
5. **Compression**: Compress old entries

---

## Data Privacy & Security

### Current (In-Memory)

- Data doesn't persist
- No network transmission
- Zero privacy concerns

### AsyncStorage

- Data stored locally
- Device encryption (iOS/Android)
- No cloud upload
- User controls data

### Convex (Future)

- End-to-end encryption
- User authentication
- GDPR compliant
- Data export available
- User can delete account

---

## Backup & Recovery

### Current

No backup (development mode)

### Future: AsyncStorage

- Export to JSON
- Import from JSON
- Manual backup to cloud storage

### Future: Convex

- Automatic cloud backup
- Point-in-time recovery
- Multi-device sync
- Data export API

---

## Testing Data

### Seed Data Generation

```typescript
export async function seedTestData() {
  const user = await userRepository.createUser('Test User');
  
  // Create suggested metrics
  for (const suggestion of SUGGESTED_METRICS) {
    await metricRepository.createMetric(user.id, suggestion);
  }
  
  // Generate 90 days of random data
  const metrics = await metricRepository.getMetricsByUserId(user.id);
  for (let i = 0; i < 90; i++) {
    const date = dateToISO(subDays(new Date(), i));
    for (const metric of metrics) {
      const value = Math.random() * (metric.maxValue - metric.minValue) + metric.minValue;
      await entryRepository.createEntry(user.id, {
        metricId: metric.id,
        date,
        value
      });
    }
  }
}
```

---

## Conclusion

The database abstraction layer provides:

1. **Flexibility**: Easy to swap storage implementations
2. **Testability**: Mock repositories for unit tests
3. **Scalability**: Optimized indexes for common queries
4. **Type Safety**: TypeScript enforces data integrity
5. **Future-Proof**: Ready for Convex integration

The repository pattern ensures business logic remains clean and focused, while data access details are properly abstracted and interchangeable.
