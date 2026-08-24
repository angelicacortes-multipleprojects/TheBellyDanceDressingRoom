# Changelog

## 2026-08-14

### Added
- Added designer category to listings.
- Added designer dropdown filter.
- Added Supabase migration for the `designer` listing column.
- Added Inbox conversation threads.
- Added Inbox badge clearing after seller replies.
- Added accessibility improvements including skip link, screen state labels, larger touch targets, and reduced-motion support.

### Changed
- Updated listing form to include required designer selection.
- Updated listing search to include designer names.
- Updated README and Supabase notes.

### Fixed
- Added a zoom viewer for listing photos.
- Made saved dress matching more reliable in the Wishlist tab.
- Made the save/favorite button more visible and added Wishlist confirmation text.
- Added app-side owner checks for edit, delete, and mark-as-sold actions.

### Security
- Added `supabase-listing-ownership.sql` to enforce owner-only listing create, update, and delete policies.

### Database
- Added `supabase-designer-category.sql`.
- Added `supabase-inbox-status.sql`.
- Added `supabase-listing-ownership.sql`.

### Deployment Notes
- Run SQL migrations in Supabase before redeploying to Netlify when database fields change.
- For layout, copy, style, and JavaScript behavior changes, redeploy the updated folder to Netlify.

## 2026-08-24

### Added
- Added `SECURITY-CHECKLIST.md` to track app security review status and remaining launch risks.
- Added `.gitignore` to keep `config.js`, `.env` files, source maps, and build folders out of GitHub.
- Added `supabase-security-hardening.sql` to narrow database grants for reports, feedback, and inquiry status updates.

### Changed
- Added stronger Netlify security headers in `_headers`.
- Updated SQL migration files and the main schema to use narrower permissions.
- Added image upload validation for file type and 5 MB maximum size.

### Fixed
- Replaced one dynamic empty-state `innerHTML` path with safer text rendering.

### Documentation
- Added `TheBellyDanceDressingRoom-Security-Checklist.docx` as a Word copy of the cybersecurity checklist for records.
- Documented the Supabase Auth branding concern: testers may distrust the default random `supabase.co` project URL, and a paid custom domain is the clean fix.
- Added `GITHUB-SHOWCASE-GUIDE.md` with safe GitHub upload steps that avoid exposing credentials.
- Added a README project narrative summarizing the product thinking, Supabase configuration, deployment work, accessibility improvements, and security review.
