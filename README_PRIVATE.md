# TheBellyDanceDressingRoom Private README

This private README keeps the detailed setup, deployment, Supabase, Netlify, and security notes that do not need to be front-and-center in the public GitHub showcase.

Keep this file private if you want the public repository to stay simpler and less operational.

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

## Supabase Setup

1. Create a Supabase project.
2. Save the database password privately.
3. Keep Row Level Security enabled.
4. Open the Supabase SQL Editor.
5. For a brand-new project, run `supabase-schema.sql`.
6. For an existing project, run only the migration files that match the features being added.
7. In Supabase Project Settings, copy only the Project URL and anon/publishable key into your local `config.js`.
8. Never use the Supabase service role key in frontend JavaScript.

The app uses:

- Supabase Auth for Google sign-in
- Supabase Database for listings, profiles, reports, feedback, and conversations
- Supabase Storage for listing photos

## SQL Migration Files

Important migration files include:

- `supabase-schema.sql`: full starting setup for a brand-new project
- `supabase-tuneup.sql`: seller profiles, edit/delete/sold listing support, and reports
- `supabase-payments-contact.sql`: manual seller payment fields
- `supabase-feedback.sql`: beta feedback form
- `supabase-filters-messages.sql`: style/color/location filters and seller inbox
- `supabase-conversations.sql`: sustained buyer/seller conversation threads
- `supabase-inbox-status.sql`: Inbox badge clearing after seller replies
- `supabase-designer-category.sql`: designer field and designer filtering
- `supabase-listing-ownership.sql`: owner-only listing updates/deletes
- `supabase-security-hardening.sql`: narrower database grants for reports, feedback, and inquiry status

Run SQL only when the database structure, storage rules, grants, or Row Level Security policies change.

Do not rerun random SQL files just because the HTML, CSS, copy, or layout changed.

## Google Sign-In Setup

In Supabase:

1. Go to Authentication.
2. Open Sign In / Providers.
3. Choose Google.
4. Copy the Supabase callback URL.

The callback URL usually looks like:

```text
https://your-project.supabase.co/auth/v1/callback
```

In Google Cloud:

1. Create or open the Google Cloud project for this app.
2. Configure Google Auth Platform / OAuth consent screen.
3. Create an OAuth Client ID.
4. Use application type: Web application.
5. Add local origin if testing locally:

```text
http://localhost:5173
```

6. Add the Supabase callback URL under Authorized redirect URIs.
7. Copy the Google Client ID and Client Secret into Supabase only.

Back in Supabase:

1. Paste the Google Client ID.
2. Paste the Google Client Secret.
3. Turn on the Google provider.
4. Save.

Do not commit the Google Client Secret to GitHub.

## Netlify Deployment

The app is hosted as a static site.

For manual Netlify deploys:

1. Open Netlify.
2. Open the site dashboard or Netlify Drop.
3. Drag the project folder into the deploy area.
4. Wait until Netlify says Published.
5. Open the Netlify URL.
6. Hard refresh with `Ctrl + F5`.

When uploading to Netlify, include the live `config.js` file so the deployed app can connect to Supabase.

When uploading to GitHub, do not include `config.js`.

## Auth URLs After Deployment

After Netlify gives a URL, update both Supabase and Google Cloud.

In Supabase:

1. Go to Authentication > URL Configuration.
2. Set Site URL to the Netlify URL.
3. Add the Netlify URL to Redirect URLs.
4. Keep the local testing URL if needed:

```text
http://localhost:5173/**
```

In Google Cloud:

1. Go to Google Auth Platform > Clients.
2. Open the OAuth client.
3. Add the Netlify domain to Authorized JavaScript origins.
4. Keep the Supabase callback URL under Authorized redirect URIs.

If Google shows `redirect_uri_mismatch`, check these URL settings first.

## Netlify URL And Supabase Auth Branding

The Netlify app can have a cleaner public URL by renaming the Netlify site or using a custom domain.

The Supabase Auth domain may still show the default project domain during sign-in unless using a paid Supabase custom domain.

For small beta tests, tell testers that Supabase is the secure sign-in provider. For broader public testing, consider a branded auth domain.

## Security Checklist

Keep these practices in place:

- Keep `config.js` out of GitHub.
- Keep `.env` files out of GitHub.
- Keep service role keys private.
- Keep Google OAuth secrets private.
- Keep payment secrets private.
- Keep Row Level Security enabled.
- Test owner-only listing behavior with two accounts.
- Test buyer/seller conversations with two accounts.
- Review Supabase Auth redirect URLs after every domain change.
- Use `SECURITY-CHECKLIST.md` before wider release.

## Private Beta Notes

The app includes `noindex` settings for testing, but `noindex` is not password protection.

For a more private beta:

- Share the Netlify link only with trusted testers, or
- Add Netlify password protection, or
- Move to a branded custom domain before broader testing

Before broader launch:

- Ask for 5 to 10 real listings.
- Use real listing photos only.
- Keep the payment disclaimer clear.
- Watch reports and feedback in Supabase.
- Create a backup/restore plan in Supabase.
- Replace raw Supabase error text with friendlier user messages.
- Add admin/moderation tooling with server-side role checks before giving anyone admin powers.

## Deployment Rule Of Thumb

Redeploy Netlify when:

- HTML changes
- CSS changes
- JavaScript changes
- Images/assets change
- `config.js` changes

Run Supabase SQL when:

- A new table is needed
- A new column is needed
- A new policy is needed
- A storage bucket or permission changes

Do both when a feature needs new database structure and new app code.
