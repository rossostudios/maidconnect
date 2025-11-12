# Algolia Supabase Connector Setup Guide

This guide walks through setting up the Algolia-Supabase Connector to automatically sync your PostgreSQL database tables to Algolia search indices.

## Overview

The Algolia-Supabase Connector provides automatic synchronization between Supabase (PostgreSQL) and Algolia, eliminating the need for custom ETL scripts or manual data syncing.

**Benefits:**
- ✅ Zero-code setup - Configure entirely through the Algolia dashboard
- ✅ Automatic syncing - Scheduled or on-demand updates
- ✅ Real-time search - Sub-50ms search performance
- ✅ Typo tolerance - Built-in fuzzy matching
- ✅ Production-scale - Handles millions of records

## Prerequisites

Before starting, ensure you have:

1. **Algolia Account** (Free tier is fine)
   - Application ID: `3TN945W8E3`
   - Admin API Key (from [Algolia Dashboard → API Keys](https://www.algolia.com/account/api-keys))

2. **Supabase Project**
   - Project URL: `https://hvnetxfsrtplextvtwfx.supabase.co`
   - Service Role Key (from [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/hvnetxfsrtplextvtwfx/settings/api))
   - Database Password (from project setup)

3. **Tables to Sync:**
   - `profiles` (for professional search)
   - `bookings` (for admin booking search)
   - `cities` (optional - for location search)

---

## Step 1: Access Algolia Connector Dashboard

1. Go to [Algolia Dashboard](https://www.algolia.com/apps/3TN945W8E3)
2. Navigate to **Data Sources** → **Connectors**
3. Click **New Connector**
4. Select **Supabase** from the list of integrations

---

## Step 2: Connect Supabase as a Data Source

### 2.1 Configure Connection

Fill in the connection details:

```
Host: db.hvnetxfsrtplextvtwfx.supabase.co
Port: 5432
Database: postgres
Username: postgres
Password: [Your Supabase Database Password]
SSL Mode: require
```

**Important:** The database password is NOT the same as your service role key. It was set when you created your Supabase project.

### 2.2 Test Connection

Click **Test Connection** to verify credentials. You should see:
- ✅ Connection successful
- Database version: PostgreSQL 15.x

### 2.3 Save Data Source

Click **Save** to add Supabase as a data source. You can now use it across multiple indices.

---

## Step 3: Create Algolia Index for Professionals

### 3.1 Create Index

1. Go to **Indices** → **Create Index**
2. Index name: `professionals`
3. Data source: Select **Supabase** (from Step 2)

### 3.2 Configure Table/View Selection

**Option A: Use Existing Table (Quick Setup)**
- Select table: `profiles`
- Primary key: `id`
- Filter: `WHERE role = 'professional' AND is_active = true`

**Option B: Create Optimized View (Recommended)**

For better search results, create a PostgreSQL view that joins related tables:

```sql
CREATE VIEW algolia_professionals_view AS
SELECT
  p.id as objectID,
  p.full_name,
  p.bio,
  p.hourly_rate,
  p.rating,
  p.total_reviews,
  p.city,
  p.country,
  array_agg(DISTINCT s.service_name) FILTER (WHERE s.service_name IS NOT NULL) as services,
  p.profile_image_url,
  p.is_verified,
  p.is_active,
  p.created_at
FROM profiles p
LEFT JOIN professional_services ps ON ps.professional_id = p.id
LEFT JOIN services s ON s.id = ps.service_id
WHERE p.role = 'professional' AND p.is_active = true
GROUP BY p.id;
```

Then in Algolia:
- Select table: `algolia_professionals_view`
- Primary key: `objectID`
- No filter needed (already filtered in view)

### 3.3 Configure Searchable Attributes

Set attribute priority (A = highest):

```
A. full_name
B. bio
C. services
D. city
E. country
```

### 3.4 Configure Facets

Enable faceted filtering:

```
- services (for "Filter by service type")
- city (for "Filter by location")
- country (for "Filter by country")
- is_verified (for "Show only verified")
```

### 3.5 Configure Custom Ranking

Set ranking criteria (in order of priority):

```
1. desc(rating)          # Higher rated first
2. desc(total_reviews)   # More reviews = more reliable
3. desc(is_verified)     # Verified professionals first
4. desc(created_at)      # Newer profiles as tiebreaker
```

### 3.6 Configure Sync Schedule

**Sync Frequency:**
- Free tier: Every 15 minutes (recommended)
- Paid tiers: Every 5 minutes or real-time

**Update Strategy:**
- Full updates: Re-index entire table (use for small tables <10k records)
- Incremental updates: Only sync changed records (requires `updated_at` column)

**Recommended for Professionals:**
- Strategy: Full updates
- Schedule: Every 15 minutes
- Batch size: 1000 records

---

## Step 4: Create Additional Indices (Optional)

### 4.1 Bookings Index (Admin Search)

**Use Case:** Admins searching for bookings by customer name, professional name, or booking ID

**Table:** `bookings`

**View (Recommended):**
```sql
CREATE VIEW algolia_bookings_view AS
SELECT
  b.id as objectID,
  b.booking_id,
  b.service_name,
  b.service_date,
  b.status,
  b.total_price,
  u.full_name as customer_name,
  u.email as customer_email,
  p.full_name as professional_name,
  b.created_at
FROM bookings b
INNER JOIN profiles u ON u.id = b.user_id
INNER JOIN profiles p ON p.id = b.professional_id
WHERE b.deleted_at IS NULL;
```

**Searchable Attributes:**
```
A. booking_id
B. customer_name
C. professional_name
D. customer_email
E. service_name
```

**Facets:**
```
- status (pending, confirmed, completed, cancelled)
- service_name
- service_date (for filtering by date range)
```

### 4.2 Cities Index (Location Search)

**Use Case:** Autocomplete for city selection, location-based marketing

**Table:** `cities`

**Searchable Attributes:**
```
A. name
B. country
C. state_province
```

**Facets:**
```
- country
- state_province
```

---

## Step 5: Test Your Indices

### 5.1 Trigger Initial Sync

1. Go to **Data Sources** → **Supabase Connector**
2. Select index (e.g., `professionals`)
3. Click **Sync Now** (runs full sync immediately)
4. Monitor progress in the **Tasks** tab

### 5.2 Verify Data

1. Go to **Indices** → `professionals`
2. Click **Browse** tab
3. You should see all your professional profiles

**Expected Record Count:**
- Professionals: ~50-200 (depending on your data)
- Bookings: Varies
- Cities: ~100+

### 5.3 Test Search

1. Go to **Indices** → `professionals` → **Search**
2. Try searches like:
   - "house cleaning"
   - "miami" (city search)
   - "maria" (professional name)
   - "verfied" (typo - should still find "verified")

**Expected Results:**
- ✅ Results returned in <50ms
- ✅ Typos are tolerated ("verfied" → "verified")
- ✅ Highlights show matched text
- ✅ Facets allow filtering (by city, service, etc.)

---

## Step 6: Configure Advanced Features

### 6.1 Synonyms (Optional)

Map common synonyms for better search:

Go to **Indices** → `professionals` → **Synonyms**

```
maid, housekeeper, cleaner, cleaning professional
nanny, babysitter, childcare provider
elderly care, senior care, caregiver
```

### 6.2 Rules (Optional)

Boost specific results:

Go to **Indices** → `professionals` → **Rules**

**Example:** Boost verified professionals
```
IF: (query contains any)
THEN: Boost records where is_verified = true by 10 positions
```

### 6.3 Query Suggestions (Optional - Paid tiers only)

Enable autocomplete suggestions based on popular queries.

---

## Step 7: Monitor & Maintain

### 7.1 Check Sync Status

Go to **Data Sources** → **Supabase** → **Tasks** to view:
- Last sync time
- Success/failure status
- Number of records synced
- Sync duration

### 7.2 Monitor Search Usage

Go to **Analytics** to track:
- Search queries per day
- Top searches
- Zero-result searches (queries with no results)
- Click-through rates

### 7.3 Set Up Alerts (Optional)

Go to **Monitoring** → **Alerts** to receive notifications for:
- Sync failures
- API quota exceeded (free tier: 10k searches/month)
- High latency (>100ms)

---

## Troubleshooting

### Issue: Connection Failed

**Error:** "Could not connect to database"

**Solutions:**
1. Verify Supabase project is active (not paused)
2. Check database password (not the same as service role key)
3. Ensure SSL mode is set to `require`
4. Verify host: `db.hvnetxfsrtplextvtwfx.supabase.co` (not the API URL)

### Issue: No Records Synced

**Error:** "0 records indexed"

**Solutions:**
1. Check table filter (e.g., `WHERE is_active = true`)
2. Verify table has records: `SELECT COUNT(*) FROM profiles WHERE role = 'professional'`
3. Check primary key is correctly mapped to `objectID`

### Issue: Slow Sync

**Problem:** Sync takes >5 minutes

**Solutions:**
1. Use incremental updates instead of full reindex
2. Reduce batch size (default 1000 → 500)
3. Add database index on `updated_at` column
4. Consider upgrading Algolia tier for faster syncs

---

## Next Steps

1. ✅ **Sanity Webhook** - Set up webhook for real-time CMS content sync ([Setup Guide](./sanity-algolia-webhook-setup.md))
2. ✅ **Initial Sync** - Run `bun run scripts/sync-sanity-to-algolia.ts` to populate Sanity content
3. ✅ **Test CMD K** - Test search in your application's command palette
4. ✅ **Monitor Analytics** - Track search queries and optimize based on insights

---

## Resources

- **Algolia Dashboard:** https://www.algolia.com/apps/3TN945W8E3
- **Supabase Connector Docs:** https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data/connectors/supabase
- **Algolia Search API:** https://www.algolia.com/doc/api-reference/search-api/
- **Support:** https://www.algolia.com/support

---

**Last Updated:** 2025-11-11
**Status:** Ready for setup
