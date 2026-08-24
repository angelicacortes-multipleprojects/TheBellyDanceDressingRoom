# TheBellyDanceDressingRoom Private Notes

This file is for internal setup and maintenance notes. Keep it out of public showcase uploads if you want the GitHub repository to stay focused and less operational.

## Private Configuration

The live app needs a local `config.js` file. Do not commit `config.js` to GitHub.

Use `config.example.js` as the template and add the deployment's own:

- Supabase project URL
- Supabase anon/publishable key
- Storage bucket name

Never put these private values in frontend code or GitHub:

- Supabase service role key
- Supabase database password
- Google OAuth client secret
- Payment provider secrets
- `.env` files
- Private tester data
- Private messages
- Private payment details

## Supabase Setup Notes

The app uses:

- Supabase Auth for Google sign-in
- Supabase Database for listings, profiles, reports, feedback, and conversations
- Supabase Storage for listing photos

For a new Supabase project, run `supabase-schema.sql` first. For existing projects, run the migration files that match the features being added.

Important migration files include:

- `supabase-tuneup.sql`
- `supabase-payments-contact.sql`
- `supabase-feedback.sql`
- `supabase-filters-messages.sql`
- `supabase-conversations.sql`
- `supabase-inbox-status.sql`
- `supabase-designer-category.sql`
- `supabase-listing-ownership.sql`
- `supabase-security-hardening.sql`

After running SQL migrations, test with two separate Google accounts to confirm ownership, messaging, and Inbox behavior.

## Netlify Notes

The app is hosted as a static site. When uploading manually to Netlify, include the live `config.js` file in the Netlify deploy folder so the deployed app can connect to Supabase.

Do not upload `config.js` to GitHub.

Keep Supabase Auth redirect URLs and Google OAuth origins limited to trusted domains:

- local testing URL
- Netlify beta URL
- custom production domain, if added later

## Public Beta Notes

The app includes `noindex` settings for testing, but `noindex` is not password protection.

For a more private beta:

- Share the Netlify link only with trusted testers, or
- Add Netlify password protection, or
- Move to a branded custom domain before broader testing

The default Supabase Auth domain can look unfamiliar to testers. A branded Supabase custom domain is the cleaner long-term fix if the beta group becomes larger.
