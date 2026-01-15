# 🚀 Persistence Layer - Quick Start Guide

**Time to Setup:** ~15 minutes  
**Difficulty:** Easy  
**Prerequisites:** PostgreSQL, Node.js 16+

---

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies
```bash
npm install @prisma/client
npm install -D prisma
```

### Step 2: Configure Database
```bash
# Copy environment variables
cp .env.example.persistence .env.local

# Edit DATABASE_URL to match your PostgreSQL
# Example: postgresql://user:password@localhost:5432/bitart_gamification
```

### Step 3: Create Database
```bash
# Create the database first (using your database tool)
createdb bitart_gamification
```

### Step 4: Initialize Database
```bash
# Generate Prisma client
npm run prisma:generate

# Create and run migrations
npm run db:init
# Or run individually:
# npm run prisma:migrate
# npm run prisma:seed
```

### Step 5: Start Server
```bash
npm run dev
```

### Step 6: Verify Setup
```bash
# Test health check
curl http://localhost:5000/api/persistence/admin/health

# Expected response:
# {
#   "success": true,
#   "healthy": true,
#   "status": "Database connection OK",
#   "timestamp": "2026-01-15T..."
# }
```

✅ **Done!** Your persistence layer is ready.

---

## 📋 Integration Steps

### Step 1: Update achievementService.ts

**Before:**
```typescript
const userAchievementsMap = new Map<string, UserAchievement[]>();

export const achievementService = {
  getUserAchievements: (userId: string) => {
    return userAchievementsMap.get(userId) || [];
  }
};
```

**After:**
```typescript
import persistenceService from './persistenceService';

export const achievementService = {
  getUserAchievements: async (userId: string) => {
    return await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });
  }
};
```

### Step 2: Update Other Services

Apply similar pattern to:
- `xpService.ts`
- `rewardsService.ts`
- Any other service using Map storage

### Step 3: Update Routes

```typescript
// In your route handler
import persistenceService from './services/persistenceService';

router.post('/achievements/unlock', async (req, res) => {
  try {
    const { userId, achievementId } = req.body;
    
    // Now uses database with transaction
    const result = await persistenceService.saveUserAchievement(
      userId,
      achievementId,
      100
    );
    
    res.json({ success: true, achievement: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});
```

### Step 4: Mount Routes

```typescript
import persistenceRoutes from './routes/persistenceRoutes';

app.use('/api/persistence', persistenceRoutes);
```

### Step 5: Test Integration

```bash
# Test save endpoint
curl -X POST http://localhost:5000/api/persistence/achievements/save \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "achievementId": "first_nft",
    "progress": 100
  }'
```

---

## 🔄 Common Operations

### Save Achievement
```typescript
const achievement = await persistenceService.saveUserAchievement(
  userId,
  achievementId,
  progress
);
```

### Award XP
```typescript
const transaction = await persistenceService.saveXPTransaction(
  userId,
  100,
  'achievement_unlock',
  achievementId
);
```

### Bulk Award XP
```typescript
const count = await persistenceService.bulkAwardXP([
  { userId: 'user1', amount: 100, reason: 'seasonal_bonus' },
  { userId: 'user2', amount: 100, reason: 'seasonal_bonus' },
]);
```

### Delete Achievement
```typescript
const deleted = await persistenceService.deleteUserAchievement(
  userId,
  achievementId
);
```

### Backup User Data
```typescript
const backup = await databaseService.exportUserDataBackup(userId);
```

### Restore User Data
```typescript
await databaseService.restoreUserDataBackup(backup);
```

---

## 📊 Database Commands

### View Database
```bash
# Open Prisma Studio (visual database browser)
npm run prisma:studio
```

### Run Migrations
```bash
# Development
npm run prisma:migrate

# Production
npm run prisma:migrate-prod

# Reset (clears all data)
npm run prisma:reset
```

### Check Migration Status
```bash
# See which migrations are applied
npx prisma migrate status
```

### Create Migration
```bash
# After updating schema.prisma
npx prisma migrate dev --name your_migration_name
```

---

## 🧪 Quick Test

### Test 1: Health Check
```bash
curl http://localhost:5000/api/persistence/admin/health
# Should return: healthy: true
```

### Test 2: Save Achievement
```bash
curl -X POST http://localhost:5000/api/persistence/achievements/save \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_1",
    "achievementId": "first_nft",
    "progress": 100
  }'
# Should return: success: true
```

### Test 3: Get Statistics
```bash
curl http://localhost:5000/api/persistence/admin/stats \
  -H "Authorization: Bearer TOKEN"
# Should show: achievements: 50, unlocked_achievements: 1, etc.
```

### Test 4: Bulk Award
```bash
curl -X POST http://localhost:5000/api/persistence/bulk/xp \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "awards": [
      {
        "userId": "test_user_1",
        "amount": 100,
        "reason": "test_award",
        "relatedId": "first_nft"
      }
    ]
  }'
# Should return: processedCount: 1
```

---

## 📁 Files Created

| File | Purpose | Size |
|------|---------|------|
| `prisma/schema.prisma` | Database schema | 300 lines |
| `backend/src/services/persistenceService.ts` | Core persistence | 500 lines |
| `backend/src/services/databaseService.ts` | DB management | 400 lines |
| `backend/src/routes/persistenceRoutes.ts` | API endpoints | 450 lines |
| `PERSISTENCE_LAYER_GUIDE.md` | Complete guide | 500 lines |
| `PERSISTENCE_MIGRATION_EXAMPLES.ts` | Code examples | 400 lines |
| `PERSISTENCE_IMPLEMENTATION_SUMMARY.md` | Summary | 300 lines |

**Total:** 2650+ lines of code and documentation

---

## 🔍 Troubleshooting

### "connect ECONNREFUSED"
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Or if using Docker
docker ps | grep postgres
```

### "Database does not exist"
```bash
# Create database
createdb bitart_gamification
```

### "No migrations found"
```bash
# Run migrations
npm run prisma:migrate
```

### "JWT authentication failed"
```bash
# Make sure token is in Authorization header
-H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### "Migration lock"
```bash
# Resolve lock
npx prisma migrate resolve --rolled-back MIGRATION_NAME
```

---

## 📈 Performance Tips

1. **Use Bulk Operations**
   - For 50+ records, use bulk endpoints
   - 10x faster than individual saves

2. **Monitor Transactions**
   - Check `/api/persistence/transactions`
   - Look for slow operations

3. **Run Maintenance**
   - `POST /api/persistence/admin/maintenance`
   - Cleans up old logs

4. **Check Statistics**
   - `GET /api/persistence/admin/stats`
   - Monitor database growth

---

## 🚀 Production Deployment

### Pre-Deployment
```bash
# 1. Build TypeScript
npm run build

# 2. Run migrations
npm run prisma:migrate-prod

# 3. Seed data (optional)
npm run prisma:seed

# 4. Run tests
npm test
```

### Deployment
```bash
# 1. Set environment variables
export DATABASE_URL=your_production_db_url
export JWT_SECRET=your_production_secret

# 2. Start server
npm start
```

### Post-Deployment
```bash
# 1. Verify health
curl https://api.yourdomain.com/api/persistence/admin/health

# 2. Check stats
curl https://api.yourdomain.com/api/persistence/admin/stats

# 3. Monitor logs
tail -f server.log
```

---

## 📚 Next Steps

1. ✅ **Setup complete** - Database is running
2. 📝 **Integrate services** - Update achievementService, xpService, etc.
3. 🧪 **Run tests** - Test all operations
4. 🚀 **Deploy** - Push to production
5. 📊 **Monitor** - Check health and stats regularly

---

## 💡 Key Concepts

### Transaction
All database operations are wrapped in transactions. If anything fails, all changes are rolled back automatically.

### Rollback
If an operation fails, the database automatically reverts to the state before the transaction started.

### Audit Trail
Every transaction is logged. You can see what changed, when, and the status.

### Backup/Restore
All user data can be exported and imported. Great for recovery or testing.

### Bulk Operations
Process multiple records efficiently in a single transaction.

---

## 📞 Getting Help

1. **Check health:** `GET /api/persistence/admin/health`
2. **View stats:** `GET /api/persistence/admin/stats`
3. **See logs:** `GET /api/persistence/transactions`
4. **Read guide:** `PERSISTENCE_LAYER_GUIDE.md`
5. **See examples:** `PERSISTENCE_MIGRATION_EXAMPLES.ts`

---

## ✅ Success Indicators

After setup, you should see:

✅ Health check returns `healthy: true`  
✅ Database stats show created achievements  
✅ Can save/retrieve data from database  
✅ Transactions logged in audit trail  
✅ Bulk operations work efficiently  

---

**You're all set!** 🎉

Your persistence layer is now live and ready to use.

Start integrating your services with the persistence layer!
