# Redis Persistence Implementation Plan

## Overview
Migrate from in-memory storage (Map) to Redis-backed persistence using Bun's built-in Redis client. This will ensure recipes persist across bot restarts.

## Current Architecture
- **Storage**: [`RecipeStorage`](src/services/storage.ts) class using in-memory `Map<string, Recipe>`
- **Data Loss**: All recipes lost on bot restart
- **Environment**: `REDIS_URL` already defined in [`.env.example`](.env.example:6)

## Implementation Strategy

### 1. Configuration Updates
**File**: [`src/config/index.ts`](src/config/index.ts)

- Add `redisUrl` to [`Config`](src/config/index.ts:1) interface
- Read `REDIS_URL` from environment variables in [`getConfig()`](src/config/index.ts:10)
- Add validation for Redis URL presence
- Provide fallback for development (optional)

### 2. RecipeStorage Refactoring
**File**: [`src/services/storage.ts`](src/services/storage.ts)

#### Key Changes:
- Replace `Map<string, Recipe>` with Bun's `RedisClient`
- Use Redis key namespace: `recipe:{id}` for individual recipes
- Store recipes as JSON strings using `JSON.stringify()` / `JSON.parse()`
- Maintain all existing public methods for backward compatibility

#### Redis Data Structure:
```
recipe:{recipeId} -> JSON string of Recipe object
recipe:index -> Set of all recipe IDs (for getAll, search operations)
```

#### Method Mapping:
| Current Method | Redis Implementation |
|----------------|---------------------|
| `add(recipe)` | `SET recipe:{id} JSON.stringify(recipe)` + `SADD recipe:index {id}` |
| `getById(id)` | `GET recipe:{id}` + JSON.parse |
| `getAll()` | `SMEMBERS recipe:index` + `MGET recipe:*` + sort by createdAt |
| `search(options)` | `SMEMBERS recipe:index` + `MGET recipe:*` + filter + sort |
| `delete(id)` | `DEL recipe:{id}` + `SREM recipe:index {id}` |
| `clear()` | `DEL recipe:*` + `DEL recipe:index` |
| `count()` | `SCARD recipe:index` |
| `exists(id)` | `EXISTS recipe:{id}` |
| `getByLanguage(lang)` | `SMEMBERS recipe:index` + filter + sort |
| `getAfterDate(date)` | `SMEMBERS recipe:index` + filter + sort |
| `getBeforeDate(date)` | `SMEMBERS recipe:index` + filter + sort |

### 3. Connection Management
- Initialize Redis client in constructor using `REDIS_URL`
- Implement connection error handling
- Add graceful degradation if Redis is unavailable
- Consider connection retry logic for production

### 4. Error Handling Strategy
- Wrap Redis operations in try-catch blocks
- Provide meaningful error messages
- Log Redis connection issues
- Consider fallback to in-memory storage if Redis fails (optional)

### 5. Bot Initialization Update
**File**: [`src/bot/index.ts`](src/bot/index.ts)

- Pass `redisUrl` to [`RecipeStorage`](src/bot/index.ts:24) constructor
- Update initialization logging to show Redis connection status
- Handle Redis connection errors during startup

## Technical Considerations

### Performance Optimizations
- Use pipeline operations for batch operations (getAll, search)
- Consider Redis sorted sets for date-based queries (getAfterDate, getBeforeDate)
- Implement caching for frequently accessed recipes

### Data Serialization
- Use `JSON.stringify()` for storage
- Handle Date object serialization (convert to ISO string)
- Ensure type safety when parsing Redis responses

### Key Design Decisions
1. **Namespace**: Use `recipe:` prefix to avoid key collisions
2. **Index**: Maintain a Set of all recipe IDs for efficient listing
3. **JSON Storage**: Store entire recipe objects as JSON for simplicity
4. **Backward Compatibility**: Keep all existing method signatures unchanged

## Implementation Steps

### Phase 1: Configuration
1. Update [`Config`](src/config/index.ts:1) interface
2. Add Redis URL validation in [`getConfig()`](src/config/index.ts:10)

### Phase 2: Storage Refactoring
1. Import Bun's Redis client
2. Initialize Redis client in constructor
3. Implement [`add()`](src/services/storage.ts:13) method
4. Implement [`getById()`](src/services/storage.ts:20) method
5. Implement [`getAll()`](src/services/storage.ts:27) method
6. Implement [`search()`](src/services/storage.ts:37) method
7. Implement [`delete()`](src/services/storage.ts:62) method
8. Implement [`clear()`](src/services/storage.ts:69) method
9. Implement [`count()`](src/services/storage.ts:76) method
10. Implement [`exists()`](src/services/storage.ts:83) method
11. Implement [`getByLanguage()`](src/services/storage.ts:90) method
12. Implement [`getAfterDate()`](src/services/storage.ts:99) method
13. Implement [`getBeforeDate()`](src/services/storage.ts:108) method

### Phase 3: Integration
1. Update [`createBot()`](src/bot/index.ts:9) to pass Redis URL
2. Update initialization logging
3. Test all bot commands with Redis storage

### Phase 4: Testing & Validation
1. Test recipe extraction and storage
2. Test search functionality
3. Test list command
4. Verify persistence across restarts
5. Test error handling

## Potential Issues & Mitigations

### Issue 1: Redis Connection Failure
**Mitigation**: Implement graceful error handling, log connection issues, consider fallback to in-memory storage

### Issue 2: Date Serialization
**Mitigation**: Ensure Date objects are properly serialized/deserialized when storing/retrieving from Redis

### Issue 3: Performance with Many Recipes
**Mitigation**: Use Redis sorted sets for date-based queries, implement pagination for list operations

### Issue 4: Concurrent Access
**Mitigation**: Redis handles concurrent access natively, but consider adding transactions for critical operations

## Success Criteria
- ✅ All existing functionality works with Redis storage
- ✅ Recipes persist across bot restarts
- ✅ Search and list operations perform well
- ✅ Error handling is robust
- ✅ No breaking changes to public API

## Files to Modify
1. [`src/config/index.ts`](src/config/index.ts) - Add Redis URL configuration
2. [`src/services/storage.ts`](src/services/storage.ts) - Complete refactor to use Redis
3. [`src/bot/index.ts`](src/bot/index.ts) - Update initialization
4. [`.env.example`](.env.example) - Already has REDIS_URL (no changes needed)

## Dependencies
- Bun's built-in Redis client (no additional packages needed)
- Existing dependencies remain unchanged
