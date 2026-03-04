# DTEAA - Supabase Database Changes Documentation

## Overview
This document lists all Supabase database changes required for the new admin dashboard features, directory updates, privacy tab, event management, and payment info.

---

## 1. New Table: `events`

**Purpose:** Store events managed by admin (replacing hardcoded `mockEvents`).

```sql
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active events"
  ON events FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Admins can manage events"
  ON events FOR ALL USING (is_admin());

GRANT ALL ON events TO authenticated;
GRANT ALL ON events TO service_role;

CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);
```

---

## 2. Updated RLS Policies: Directory Access (All Users Visible)

**Purpose:** Allow all authenticated users to view all profiles in the alumni directory, regardless of status (pending, verified, rejected).

The following policies need to be added to each relevant table. These allow any authenticated user to SELECT from these tables:

```sql
-- Profiles
CREATE POLICY "Authenticated users can view all profiles for directory"
  ON profiles FOR SELECT TO authenticated USING (true);

-- Personal Details
CREATE POLICY "Authenticated users can view all personal details for directory"
  ON personal_details FOR SELECT TO authenticated USING (true);

-- Contact Details
CREATE POLICY "Authenticated users can view all contact details for directory"
  ON contact_details FOR SELECT TO authenticated USING (true);

-- Employee Experiences
CREATE POLICY "Authenticated users can view all employee experiences for directory"
  ON employee_experiences FOR SELECT TO authenticated USING (true);

-- Entrepreneur Experiences
CREATE POLICY "Authenticated users can view all entrepreneur experiences for directory"
  ON entrepreneur_experiences FOR SELECT TO authenticated USING (true);

-- Open to Work Details
CREATE POLICY "Authenticated users can view all open_to_work details for directory"
  ON open_to_work_details FOR SELECT TO authenticated USING (true);

-- Privacy Settings
CREATE POLICY "Authenticated users can view all privacy settings for directory"
  ON privacy_settings FOR SELECT TO authenticated USING (true);
```

> **Note:** Since existing policies may conflict (e.g., "Verified users can view other verified profiles"), you may need to drop those narrower policies first if they cause issues with duplicate policy names.

---

## 3. Existing Tables Referenced (No Changes Required)

These tables already exist in the schema and are used by the new features:

| Table | Usage |
|---|---|
| `profiles` | Core user profile, status, role |
| `personal_details` | Name, DOB, qualification, etc. |
| `contact_details` | Address, phone, mobile |
| `employee_experiences` | Work history |
| `entrepreneur_experiences` | Business history |
| `open_to_work_details` | Job-seeking info |
| `privacy_settings` | Controls directory visibility |
| `event_registrations` | Event registration records |
| `event_sponsorships` | Alumni sponsorships |
| `guest_sponsorships` | Guest sponsorships |
| `e_vouchers` | Invoices / receipts |

---

## 4. Migration File Location

The full migration SQL is at:
```
migrations/001_create_events_table.sql
```

Run this migration against your Supabase project using the SQL Editor in the Supabase Dashboard or via `supabase db push`.

---

## 5. Frontend Changes Summary

### New Components Created
| File | Description |
|---|---|
| `components/dashboard/PrivacySettingsTab.tsx` | Standalone privacy settings tab for the dashboard |
| `components/dashboard/PaymentInfoCard.tsx` | Payment info card for pending/rejected users (Rs.100 + Rs.600) |
| `components/dashboard/AdminEventManager.tsx` | Admin CRUD for events (create, edit, delete with past/upcoming split) |

### Modified Components
| File | Changes |
|---|---|
| `components/dashboard/DashboardNavbar.tsx` | Added `privacy` tab to navigation |
| `components/dashboard/Dashboard.tsx` | Added privacy tab, payment card, past event filtering, sponsor popup suppression, initial step for profile edit |
| `components/dashboard/AlumniDirectory.tsx` | Removed `verified` filter, shows all users, added status badge, added profile view modal with privacy-aware display |
| `components/dashboard/ProfileEditForm.tsx` | Added `initialStep` prop for redirecting to first incomplete step |
| `components/AdminDashboard.tsx` | Added `manage-events` tab with AdminEventManager, imported new component |

---

## 6. Feature Details

### Privacy Tab
- New standalone tab in the dashboard navbar
- Users can toggle email, phone, company, and location visibility
- Changes saved directly to `privacy_settings` table

### Directory (All Users)
- Directory now shows ALL users regardless of status
- Status badge (Verified/Pending/Rejected) displayed on each card
- Profile view modal respects privacy settings

### Past Event Filtering
- Dashboard `UpcomingEventsSection` only shows events with future dates
- Events tab still shows both upcoming and past events separately
- Sponsor promo popup only appears if there are future events

### Payment Info (Pending Users)
- Shows fee structure: Rs.100 one-time + Rs.600 yearly = Rs.700 first year
- Lists membership benefits
- Shows rejection comments if status is rejected

### Admin Event Management
- Full CRUD for events via `events` table
- Events separated into Upcoming and Past sections
- New "Manage Events" tab in admin dashboard

### Complete Profile Redirect
- "Complete Profile" button calculates the first step with missing required fields
- Opens ProfileEditForm at that step directly
