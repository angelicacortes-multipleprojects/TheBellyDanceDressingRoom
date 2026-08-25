# TheBellyDanceDressingRoom

TheBellyDanceDressingRoom is a mobile-friendly marketplace prototype developed by Angelica to help dancers buy and sell bellydance dresses in a more centralized, organized way.


<img width="406" height="327" alt="listing" src="https://github.com/user-attachments/assets/4b92aa4d-4f2c-4c60-9ba7-1862afa7a42d" />


## Project Narrative

TheBellyDanceDressingRoom began as a focused marketplace prototype for a real community need: bellydancers often buy, sell, and trade costumes through scattered social media posts, private chats, and informal networks. The goal of this project was to centralize that experience into a simple mobile-friendly app where dancers can browse real listings, upload dress photos, contact sellers, and manage resale activity in one place.

I built the project iteratively, starting with a static frontend and then expanding it into a Supabase-backed beta. Along the way, I made product decisions around the workflows dancers would actually need: listings require actual photos, prices are shown in USD, sellers can add payment-contact options such as PayPal.me, Venmo, Cash App, Zelle, or another note, and buyers can message sellers through an Inbox instead of relying only on outside messages. The Inbox was later improved into sustained buyer/seller conversation threads with seller notifications that clear after the seller replies.

The app also includes marketplace management features that are important for trust and usability. Sellers can edit, delete, and mark only their own listings as sold. Buyers can save dresses to a Wishlist, zoom in on listing photos, filter by style, designer, color, size, and location, and report listings for moderation review. The designer filter was added after researching common bellydance costume designers and vendors so listings can be organized in a way dancers naturally understand.

I treated deployment and security as part of the build, not as an afterthought. The app was configured for Netlify deployment, Google sign-in through Supabase Auth, Supabase database tables, Supabase Storage for listing photos, and Row Level Security policies to protect user-owned records. I created SQL migration files for each database change so the schema can be tracked over time instead of becoming a mystery.

Security and privacy were reviewed against a practical startup-app checklist. The project includes a `.gitignore` to keep local configuration files out of GitHub, security headers for Netlify, owner-only listing policies, conversation participant policies, file upload validation, and a dedicated security checklist. The app is designed so database access is controlled by Row Level Security rather than trusting the browser alone.

This project demonstrates product thinking, iterative development, database design, authentication setup, deployment awareness, accessibility improvements, and security review. It is still a beta prototype, but it reflects the real decisions needed to move from an idea to a working marketplace foundation.

## Use Of Codex

Codex was used as an AI coding collaborator throughout the project. I directed the product decisions, feature priorities, privacy concerns, and security questions, while Codex helped translate those decisions into working files, SQL migrations, documentation, and review checklists.

Codex supported the build by helping inspect the existing project structure, edit HTML/CSS/JavaScript files, create Supabase SQL migrations, validate JavaScript syntax, document deployment steps, and organize the project for GitHub. It was also used as a review partner for accessibility, authentication, authorization, file upload safety, GitHub credential hygiene, Netlify deployment notes, and Supabase Row Level Security.

The workflow was iterative: I identified what the app needed next, tested the deployed version, reported issues, and used Codex to help diagnose and implement fixes. This included refining the marketplace experience, adding multi-photo listings, Google sign-in, buyer/seller messaging, Inbox notifications, designer filters, Wishlist behavior, image zoom, security headers, and public/private documentation.

Using Codex in this project demonstrates how AI-assisted development can support critical thinking rather than replace it. The project required human judgment around user trust, privacy, beta testing, payment boundaries, and community-specific marketplace needs, while Codex accelerated implementation, documentation, and structured review.

## What Is Included

- Browse resale dress listings
- Zoom in on listing photos
- Search by color, size, designer, or details
- Filter by style, designer, color, size, location, ready-to-ship, price, and plus sizes
- Save dresses to a Wishlist
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

## Technical Highlights

- Frontend: HTML, CSS, and vanilla JavaScript
- Hosting: Netlify static deployment
- Authentication: Supabase Auth with Google sign-in
- Database: Supabase tables with Row Level Security
- Storage: Supabase Storage for listing photos
- Security: owner-only listing updates, participant-only conversations, upload validation, security headers, and credential-safe GitHub setup
- Documentation: changelog, setup notes, security checklist, and database migration files

## Repository Safety

This public repository does not include live deployment credentials. The included `config.example.js` file is a template only.

Do not commit:

- `config.js`
- `.env` files
- Supabase service role keys
- Google OAuth client secrets
- Database passwords
- Payment provider secrets

## Run Locally

Open `index.html` directly for a static preview, or run a static server from this folder:

```powershell
python -m http.server 5173
```

Then visit `http://localhost:5173`.
