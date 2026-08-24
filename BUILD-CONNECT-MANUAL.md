# Build And Connect App Manual

This manual summarizes the workflow used to build and connect TheBellyDanceDressingRoom. Use it as a checklist for future apps.

## 1. Start With A Working Prototype

1. Create the app files:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `manifest.json`
2. Build the first usable flow before worrying about polish.
3. Keep test data honest. For marketplace apps, avoid fake listings if the product depends on trust.
4. Run a local preview:

```powershell
python -m http.server 5173
```

5. Open:

```text
http://localhost:5173
```

## 2. Add The Brand And Product Rules

For this app we set:

- App name: `TheBellyDanceDressingRoom`
- Developer credit: `Laniakea Bellydancer LLC`
- Listings require actual seller-uploaded photos.
- Prices display in USD.
- Payments are arranged directly between buyer and seller during beta.

## 3. Add Supabase

Supabase provides:

- Google sign-in sessions
- database tables
- listing photo storage
- security policies

### Create Project

1. Go to Supabase.
2. Create a free project.
3. Save the database password privately.
4. Enable Data API.
5. Keep Row Level Security enabled.

### Run SQL

Open Supabase SQL Editor and run the SQL migrations your app needs.

For this app:

1. `supabase-schema.sql`: first-time setup for a brand-new project.
2. `supabase-tuneup.sql`: seller profile, reports, edit/delete/sold support.
3. `supabase-payments-contact.sql`: manual seller payment fields.
4. `supabase-feedback.sql`: beta feedback form.
5. `supabase-filters-messages.sql`: style/color/location filters and seller inquiries.

Only run a migration once unless it is written to be safely repeatable.

## 4. Connect App To Supabase

Copy from Supabase:

- Project URL
- anon/public key

Paste into `config.js`:

```js
window.TBDDR_CONFIG = {
  supabaseUrl: "https://your-project.supabase.co",
  supabaseAnonKey: "your-anon-public-key",
  listingBucket: "listing-photos"
};
```

Never put the Supabase service role key in frontend code.

## 5. Add Google Sign-In

### In Supabase

1. Go to Authentication.
2. Open Sign In / Providers.
3. Choose Google.
4. Copy the Supabase callback URL.

It looks like:

```text
https://your-project.supabase.co/auth/v1/callback
```

### In Google Cloud

1. Create a Google Cloud project.
2. Configure Google Auth Platform / OAuth consent screen.
3. Create an OAuth Client ID.
4. Application type: Web application.
5. Add local origin:

```text
http://localhost:5173
```

6. Add the Supabase callback URL under Authorized redirect URIs.
7. Copy Client ID and Client Secret.

### Back In Supabase

1. Paste the Google Client ID.
2. Paste the Google Client Secret.
3. Turn Google provider on.
4. Save.

## 6. Test Locally

Check:

- Continue with Google works.
- Account panel says signed in.
- Listings load without permission errors.
- A signed-in seller can post 1 to 5 photos.
- A buyer can message seller.
- Seller can see inquiry in Inbox.
- Seller can edit, delete, and mark sold.

If Google says `redirect_uri_mismatch`, add the current app URL to Google Cloud Authorized JavaScript origins and Supabase Auth URL settings.

## 7. Deploy To Netlify

1. Go to Netlify.
2. Open the site dashboard or Netlify Drop.
3. Drag the whole project folder into the deploy area.
4. Wait until Netlify says Published.
5. Open the Netlify URL.
6. Hard refresh with `Ctrl + F5`.

Whenever app code changes, redeploy the folder.

When database structure changes, run the SQL migration first, then redeploy the folder.

## 8. Update Auth URLs After Deploy

After Netlify gives a URL:

### Supabase

1. Authentication > URL Configuration.
2. Set Site URL to the Netlify URL.
3. Add the Netlify URL to Redirect URLs.
4. Keep local testing URL too:

```text
http://localhost:5173/**
```

### Google Cloud

1. Google Auth Platform > Clients.
2. Open your OAuth client.
3. Add Netlify domain to Authorized JavaScript origins.
4. Keep:

```text
http://localhost:5173
```

5. Keep Supabase callback URL under Authorized redirect URIs.

## 9. Private Beta Safety

Before broad launch:

- Keep `noindex` enabled while testing.
- Share only with trusted testers.
- Ask for 5 to 10 real listings before public sharing.
- Use real listing photos only.
- Keep payment disclaimer clear.
- Watch reports and feedback in Supabase.

## 10. Future Features

Good next features:

- Direct message reply flow.
- Hide/review reported listings.
- Admin moderation dashboard.
- Seller profile page.
- Custom domain.
- Real marketplace payments.
- Full accessibility audit.

## 11. Deployment Rule Of Thumb

Redeploy Netlify when:

- HTML changes.
- CSS changes.
- JavaScript changes.
- Images/assets change.
- `config.js` changes.

Run Supabase SQL when:

- A new table is needed.
- A new column is needed.
- A new policy is needed.
- A storage bucket or permission changes.

Do both when a feature needs new database structure and new app code.
