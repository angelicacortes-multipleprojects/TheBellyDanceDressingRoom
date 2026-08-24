# GitHub Showcase Guide

Use this guide to put TheBellyDanceDressingRoom on GitHub without exposing credentials.

## Do Not Upload

- `config.js`
- `.env`
- `.env.*`
- Supabase service role keys
- Google OAuth client secrets
- Database passwords
- Payment provider secrets

The `.gitignore` file is already set up to exclude `config.js`, `.env` files, source maps, and build folders.

## Safe To Upload

- `index.html`
- `styles.css`
- `app.js`
- `config.example.js`
- `manifest.json`
- `netlify.toml`
- `_headers`
- `public/`
- `README.md`
- `CHANGELOG.md`
- `SECURITY-CHECKLIST.md`
- `SUPABASE-README.md`
- `BUILD-CONNECT-MANUAL.md`
- `GITHUB-SHOWCASE-GUIDE.md`
- SQL migration files such as `supabase-schema.sql` and `supabase-security-hardening.sql`

## Before Creating The Repository

1. Confirm `.gitignore` exists.
2. Confirm `config.js` is not included in GitHub uploads.
3. Keep `config.example.js` so people can see what values are needed without seeing your real project config.
4. If you ever accidentally upload a real secret, rotate it immediately in Supabase, Google Cloud, or the affected provider.

## Browser Upload Method

1. Go to GitHub.
2. Create a new repository named `TheBellyDanceDressingRoom`.
3. Choose Public only if you are comfortable showing the source code as a portfolio project.
4. Do not initialize with a new README because this folder already has one.
5. Click upload existing files.
6. Drag in the safe files and folders listed above.
7. Remove `config.js` if GitHub shows it in the upload list.
8. Commit with a message like `Add TheBellyDanceDressingRoom showcase project`.

## Git Command Method

Run these from the app folder:

```powershell
git init
git status
git add .
git status
git commit -m "Add TheBellyDanceDressingRoom showcase project"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/TheBellyDanceDressingRoom.git
git push -u origin main
```

Before committing, `git status` should not show `config.js`.

## Showcase Setup

In the GitHub repository About section:

- Description: `A Supabase-backed resale marketplace prototype for bellydance dresses.`
- Website: your Netlify app URL.
- Topics: `supabase`, `netlify`, `marketplace`, `javascript`, `accessibility`, `security`

Pin the repository on your GitHub profile so it appears as a showcase project.
