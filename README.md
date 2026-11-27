# SPACE — MITAOE Academic Resource Hub

Notes, PYQs, and subject files for MITAOE students. No sign-up.

## Run locally

Node.js 20 or newer, npm, and a Supabase project.

```sh
npm install
cp .env.example .env
npm run dev
```

The app runs at [http://localhost:8080](http://localhost:8080).

Apply the SQL files in [`supabase/migrations`](./supabase/migrations) in filename order (Supabase CLI or the SQL editor).

`npm run build` makes a production build. `npm run preview` serves it.

## Environment

Copy [`.env.example`](./.env.example). Do not commit `.env`.

These stay server-side. Never prefix them with `VITE_`:

- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_SECRET` (no default; `/admin` refuses to sign in without it)
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_DRIVE_FOLDER_ID`

`UPLOAD_SIGNING_SECRET` falls back to `ADMIN_SECRET`. Upload limits in `.env.example` are optional.

## Contribute and admin

Students upload at `/contribute`. Files go to Google Drive; Supabase stores metadata only. New rows stay `pending` until an admin approves them at `/admin`. Only approved files are public. If Drive is not configured, the contribute page falls back to email.

Drive setup:

1. Enable the Google Drive API and create a service account key.
2. Share the destination folder with that account as Editor, and set `GOOGLE_DRIVE_FOLDER_ID` from the folder URL.
3. The app creates `SPACE/<subject code>/<category>` inside that folder.

Use a Shared Drive when the folder is owned by a Workspace account.

## Takedown

Educational use by the MITAOE community. To correct or remove material, email [space.mitaoe@gmail.com](mailto:space.mitaoe@gmail.com).
