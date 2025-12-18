# Database Migration Guide

## Running Migrations

### Initial Setup

If you haven't set up the database yet:

```bash
# Push schema to database
npm run db:push

# Run migrations
npm run db:migrate
```

### Adding Default Markets

**IMPORTANT:** Run this migration to add default geographic markets. Without markets, chef browse functionality will show "0 chefs found".

```bash
# Option 1: Using psql (recommended)
psql $DATABASE_URL -f migrations/add_default_markets.sql

# Option 2: Using database client
# Copy and paste the contents of migrations/add_default_markets.sql into your database client
```

### Verification

After running the markets migration, verify it worked:

```sql
-- Check that markets were created
SELECT * FROM markets;

-- Check chef-market assignments
SELECT 
  cp.display_name as chef_name,
  m.name as market_name
FROM chef_markets cm
JOIN chef_profiles cp ON cm.chef_id = cp.id
JOIN markets m ON cm.market_id = m.id;
```

You should see:
- 10 markets (major US cities)
- All existing chefs assigned to at least one market

---

## Available Migrations

### 1. `add_menu_items.sql`
- **Purpose:** Adds menu_items table schema
- **Status:** Should already be in your schema
- **When to run:** Only if menu_items table is missing

### 2. `add_password_to_users.sql`
- **Purpose:** Adds password column to users table
- **Status:** Should already be in your schema
- **When to run:** Only if users.password column is missing

### 3. `add_default_markets.sql` ⭐ **NEW**
- **Purpose:** Creates default geographic markets and assigns existing chefs
- **Status:** Must run for chef browse to work
- **When to run:** After initial setup, before testing chef browse feature

---

## Migration Order

For a fresh database setup, run migrations in this order:

1. **Schema Push** (creates all tables)
   ```bash
   npm run db:push
   ```

2. **Default Markets** (required for chef discovery)
   ```bash
   psql $DATABASE_URL -f migrations/add_default_markets.sql
   ```

3. **Test Data** (optional, for development)
   ```bash
   npm run seed  # If seed script exists
   ```

---

## Troubleshooting

### "Markets table does not exist"

**Solution:** Run `npm run db:push` first to create all tables.

### "Chef browse shows 0 chefs"

**Possible causes:**
1. No markets created → Run `add_default_markets.sql`
2. Chefs not assigned to markets → Check `chef_markets` table
3. All chefs inactive → Check `chef_profiles.is_active`

**Fix:**
```sql
-- Create test market
INSERT INTO markets (id, name, slug, is_active)
VALUES (gen_random_uuid(), 'Test Market', 'test-market', true);

-- Assign all chefs to test market
INSERT INTO chef_markets (id, chef_id, market_id)
SELECT 
  gen_random_uuid(),
  cp.id,
  (SELECT id FROM markets WHERE slug = 'test-market' LIMIT 1)
FROM chef_profiles cp
WHERE cp.is_active = true
ON CONFLICT DO NOTHING;
```

### "Duplicate key violation on slug"

Markets with the same slug already exist. This is fine - the migration uses `ON CONFLICT DO NOTHING` to skip duplicates.

### How to add a new market

```sql
INSERT INTO markets (id, name, slug, description, is_active, created_at)
VALUES (
  gen_random_uuid(),
  'Philadelphia',
  'philadelphia',
  'Philadelphia and surrounding Pennsylvania suburbs',
  true,
  NOW()
);
```

### How to assign chef to market

```sql
-- Get chef ID and market ID first
SELECT id, display_name FROM chef_profiles WHERE display_name LIKE '%Marco%';
SELECT id, name FROM markets WHERE slug = 'new-york-city';

-- Then insert assignment
INSERT INTO chef_markets (id, chef_id, market_id, created_at)
VALUES (
  gen_random_uuid(),
  'chef-id-here',
  'market-id-here',
  NOW()
);
```

---

## Production Deployment

### Pre-deployment Checklist

- [ ] Backup database before running migrations
- [ ] Test migrations on staging environment first
- [ ] Verify rollback plan exists
- [ ] Update environment variables if needed
- [ ] Document any manual steps required

### Rollback Plans

#### Rollback add_default_markets.sql

```sql
-- Remove all market assignments
DELETE FROM chef_markets;

-- Remove all markets (if needed)
DELETE FROM markets;
```

**Warning:** Only rollback if necessary. Removing markets will break chef discovery.

---

## Future Migrations

When adding new migrations:

1. Create SQL file in `migrations/` folder
2. Name it descriptively: `add_feature_name.sql`
3. Include:
   - Comments explaining what it does
   - `ON CONFLICT` handling for idempotency
   - Verification queries at the end
4. Update this guide with the new migration
5. Test on development database first

---

## Getting Help

If you encounter migration issues:

1. Check the PostgreSQL logs for detailed error messages
2. Verify your `DATABASE_URL` is correct
3. Ensure database user has CREATE, INSERT, UPDATE permissions
4. Review `ROOT_CAUSE_ANALYSIS.md` for common issues
5. Contact support: support@dinemaison.com
