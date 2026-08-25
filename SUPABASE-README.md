# Supabase Database Notes

This project uses one Supabase project with the normal `public` schema. The SQL files below create or update tables, policies, and storage rules inside that same Supabase project.

## Current Supabase Objects

- `profiles`: seller profile records linked to Supabase Auth users.
- `app_admins`: private admin allowlist used to give Angelica moderator controls.
- `listings`: dress listings with USD price, designer, seller owner ID, seller name, status, details, and 1 to 5 photo URLs.
- `listings.payment_options`: seller-provided payment handles or links for manual off-app payment coordination.
- `listing_reports`: moderation reports submitted by signed-in users.
- `listing_inquiries`: buyer messages sent to listing sellers.
- `inquiry_messages`: ongoing buyer/seller conversation messages.
- `listing_inquiries.status`: tracks whether a seller still needs to answer a buyer message.
- `beta_feedback`: private beta feedback submitted from the app.
- `listing-photos`: public Supabase Storage bucket for listing images.

## SQL Files

### `supabase-schema.sql`

Use this only for a brand-new Supabase project.

It creates the full starting setup:

- `profiles` table
- `listings` table
- `listing_reports` table
- `listing-photos` storage bucket
- Row Level Security policies
- Grants for `anon` and `authenticated` roles

### `supabase-tuneup.sql`

Use this once on the existing Supabase project that was created before the tune-up features.

It adds:

- `seller_name` column on `listings`
- `listing_reports` table
- updated listing visibility policy for active and sold listings
- report insert/read policies
- related grants

This file may trigger a Supabase warning because it replaces policies with `drop policy if exists`. It does not drop tables, listings, users, or photos.

## When To Run SQL

Run SQL only when the data structure changes, such as:

- adding a new table
- adding a new column
- changing Row Level Security policies
- creating a storage bucket
- adding moderation, payments, messages, or seller profile fields

Do not run SQL for simple app changes like copy, colors, layout, accessibility tweaks, or button labels. For those, redeploy the updated folder to Netlify.

## Migration Log

- `supabase-schema.sql`: initial project setup.
- `supabase-tuneup.sql`: seller profiles, edit/delete/sold listing support, and reports.
- `supabase-payments-contact.sql`: manual seller payment contact fields such as PayPal.me, Venmo, Cash App, and Zelle.
- `supabase-feedback.sql`: beta feedback form table and policies.
- `supabase-filters-messages.sql`: style/color/location filters and seller message inbox.
- `supabase-conversations.sql`: sustained buyer/seller reply threads for inbox conversations.
- `supabase-inbox-status.sql`: lets conversation participants update inquiry status so seller Inbox notifications clear after replies.
- `supabase-designer-category.sql`: designer dropdown/filter field on listings.
- `supabase-listing-ownership.sql`: confirms only listing owners can create, update, delete, or mark their own listings as sold.
- `supabase-admin-override.sql`: adds an admin allowlist so only approved admin accounts can edit, delete, or mark any listing as sold.

For future changes, create a new dated SQL file instead of editing an already-run migration, for example:

```text
supabase-2026-07-28-add-direct-messages.sql
supabase-2026-07-28-add-payments.sql
```
