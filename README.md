# TheBellyDanceDressingRoom

TheBellyDanceDressingRoom is an App developed by Laniakea Bellydancer LLC to help dancers around the world to buy and sell dresses in a centralized manner. About me: Laniakea Bellydancer is a Puerto Rican artist based in Maryland, USA. She loves gigging and understands the importance of getting new costumes to support all your performance needs!

## Project Narrative

TheBellyDanceDressingRoom began as a focused marketplace prototype for a real community need: bellydancers often buy, sell, and trade costumes through scattered social media posts, private chats, and informal networks. The goal of this project was to centralize that experience into a simple mobile-friendly app where dancers can browse real listings, upload dress photos, contact sellers, and manage resale activity in one place.

I built the project iteratively, starting with a static frontend and then expanding it into a Supabase-backed beta. Along the way, I made product decisions around the workflows dancers would actually need: listings require actual photos, prices are shown in USD, sellers can add payment-contact options such as PayPal.me, Venmo, Cash App, Zelle, or another note, and buyers can message sellers through an Inbox instead of relying only on outside messages. The Inbox was later improved into sustained buyer/seller conversation threads with seller notifications that clear after the seller replies.

The app also includes marketplace management features that are important for trust and usability. Sellers can edit, delete, and mark only their own listings as sold. Buyers can save dresses to a Wishlist, zoom in on listing photos, filter by style, designer, color, size, and location, and report listings for moderation review. The designer filter was added after researching common bellydance costume designers and vendors so listings can be organized in a way dancers naturally understand.

I treated deployment and security as part of the build, not as an afterthought. The app was configured for Netlify deployment, Google sign-in through Supabase Auth, Supabase database tables, Supabase Storage for listing photos, and Row Level Security policies to protect user-owned records. I created SQL migration files for each database change so the schema can be tracked over time instead of becoming a mystery. I also documented the setup process, deployment process, and security review in separate project files.

Security and privacy were reviewed against a practical startup-app checklist. The project now includes a `.gitignore` to keep `config.js`, `.env` files, and source maps out of GitHub; security headers for Netlify; owner-only listing policies; conversation participant policies; file upload validation; and a dedicated security checklist. The Supabase anon key is intentionally used in frontend code, but the app is designed so database access is controlled by Row Level Security rather than trusting the browser alone.

This project demonstrates product thinking, iterative development, database design, authentication setup, deployment awareness, accessibility improvements, and security review. It is still a beta prototype, but it reflects the real decisions needed to move from an idea to a working marketplace foundation.

## What is included

- Browse resale dress listings
- Zoom in on listing photos
- Search by color, size, designer, or details
- Filter by style, designer, color, size, location, ready-to-ship, price, and plus sizes
- Save dresses to a wishlist
- View saved dresses in the Wishlist tab
- Post a dress with 1 to 5 required actual listing photos, USD price, designer, size, condition, and shipping status
- Edit, delete, and mark your own listings as sold
- Save a seller display name/profile
- Add manual seller payment options such as PayPal.me, Venmo, Cash App, Zelle, or another note
- Receive buyer inquiries and reply in sustained Inbox conversations
- Clear seller Inbox notifications after the seller answers buyer messages
- Report listings for moderation review
- Basic terms and privacy text for testing
- Abuse/spam plan and private beta guidance
- Feedback form for testers
- Start buyer messages from a listing
- Supabase-ready Google sign-in, listing storage, and 5-photo uploads

## About

TheBellyDanceDressingRoom is an App developed by Laniakea Bellydancer LLC to help dancers around the world to buy and sell dresses in a centralized manner. About me: Laniakea Bellydancer is a Puerto Rican artist based in Maryland, USA. She loves gigging and understands the importance of getting new costumes to support all your performance needs!

## Supabase Setup

1. Create a free Supabase project.
2. Open the Supabase SQL Editor.
3. Run the contents of `supabase-schema.sql`.
4. In Supabase, go to Project Settings > API.
5. Copy your Project URL and anon public key.
6. Paste them into `config.js`.
7. In Authentication > Sign In / Providers, enable Google after creating Google OAuth credentials.

If you already ran the first schema before these tune-up features were added, run `supabase-tuneup.sql` in the Supabase SQL Editor too.

See `SUPABASE-README.md` for the schema/migration notes.

See `BUILD-CONNECT-MANUAL.md` for the full build, Supabase, Google sign-in, and Netlify workflow we followed.

Only use the anon public key in `config.js`. Never paste a Supabase service role key into frontend code.

## Netlify Setup

1. Create a free Netlify account.
2. Deploy this folder with Netlify Drop or connect it to a Git repository.
3. In Supabase Auth settings, add your Netlify URL to the allowed site/redirect URLs.
4. In Google Cloud OAuth settings, add your Netlify URL as an authorized JavaScript origin.
5. Test Google sign-in, listing creation, and photo uploads.

The app still runs in local preview mode when `config.js` is empty, but live users need Supabase connected.

The app includes `noindex` settings for testing so search engines are discouraged from indexing the Netlify test URL. This is not the same as password protection.

## Rename Netlify URL

In Netlify, open the site dashboard, go to Site configuration or Site settings, then change the site name. A name like `thebellydancedressingroom` gives you a prettier URL if it is available:

```text
https://thebellydancedressingroom.netlify.app/
```

After renaming, update both Supabase Auth URL settings and Google Cloud Authorized JavaScript origins with the new Netlify URL.

## Run locally

Open `index.html` directly, or run a static server from this folder:

```powershell
python -m http.server 5173
```

Then visit `http://localhost:5173`.
