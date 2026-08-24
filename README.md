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

## Configuration Notes

This repository is safe to share as a showcase project because the live runtime configuration is intentionally kept out of source control.

The app is designed to connect to:

- Supabase Auth for Google sign-in
- Supabase Database for listings, profiles, reports, feedback, and conversations
- Supabase Storage for listing photos
- Netlify for static hosting

The public repository includes `config.example.js` as a template only. A real deployment needs a local `config.js` file with that deployment's own Supabase project URL and anon/publishable key. Do not commit `config.js`.

Private values that should never be committed:

- Supabase service role keys
- Supabase database password
- Google OAuth client secret
- Payment provider secrets
- `.env` files
- Real tester data, private messages, or private payment details

The SQL files in this repository document the database structure, Row Level Security policies, storage rules, and security hardening work used for the beta. They are included for transparency and reproducibility, but live credentials are not included.

For a private deployment, configure the hosting domain in Supabase Auth redirect settings and Google OAuth settings. Keep redirect URLs limited to trusted local, Netlify, or custom production domains.

The app includes `noindex` settings for beta testing so search engines are discouraged from indexing the test URL. This is helpful for a private beta, but it is not the same as password protection.

## Run locally

Open `index.html` directly for a static preview, or run a static server from this folder:

```powershell
python -m http.server 5173
```

Then visit `http://localhost:5173`.
