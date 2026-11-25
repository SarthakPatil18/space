# SPACE — MITAOE Academic Resource Hub

**Every note. Every PYQ. Every file. One place.**

Space is a fast, clutter-free academic resource hub for MITAOE students. It replaces the slow, overcomplicated LMS experience with a single job: open → find your subject → open the resource you need.

No sign-up. No dashboard. No noise.

---

## What it does

- **Subjects at a glance** — every subject in the division, one click from its material.
- **Four resource categories** — Notes, Files, PYQs and Syllabus for every subject.
- **Instant search** — search across subject names, resource titles, categories and exam metadata.
- **Read in the browser** — PDFs open in a built-in viewer with download available when needed.
- **Actually works on a phone** — layouts are designed for small screens, not just shrunk down.
- **Light and dark themes** — remembered locally on your device.
- **Admin uploads** — a protected admin portal for adding subjects and resources, with files stored in Supabase Storage.

## Tech stack

| Layer         | Technology                                                                                    |
| ------------- | --------------------------------------------------------------------------------------------- |
| Framework     | [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router) |
| UI            | React 19, TypeScript, Tailwind CSS v4, Lucide icons                                           |
| Data fetching | TanStack Query                                                                                |
| Backend       | Supabase (PostgreSQL, Storage, Auth)                                                          |
| Build tool    | Vite                                                                                          |
| Hosting       | Vercel                                                                                        |

## Getting started

### Prerequisites

- Node.js 20 or newer
- npm
- A Supabase project (for the database and storage bucket)

### 1. Install dependencies

```sh
git clone <repository-url>
cd space
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root (or copy `.env.example`) and fill in your values:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=

SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

ADMIN_SECRET=

GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_DRIVE_FOLDER_ID=
UPLOAD_SIGNING_SECRET=
UPLOAD_MAX_FILE_MB=25
UPLOAD_MAX_FILES=5
UPLOAD_RATE_LIMIT_PER_HOUR=10
```

| Variable                        | Used for                                                                   |
| ------------------------------- | -------------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`             | Supabase project URL in the browser                                        |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public (anon/publishable) key in the browser                               |
| `SUPABASE_URL`                  | Supabase project URL on the server                                         |
| `SUPABASE_PUBLISHABLE_KEY`      | Public key for server-side reads                                           |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-only key for admin operations — **never expose this to the client** |
| `ADMIN_SECRET`                  | Passkey required to sign in to the admin portal                            |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`  | Service account that uploads student files to Drive                        |
| `GOOGLE_PRIVATE_KEY`            | Service account private key (`\n` newlines are supported)                 |
| `GOOGLE_DRIVE_FOLDER_ID`        | Destination Drive folder that receives the `SPACE/` tree                  |
| `UPLOAD_SIGNING_SECRET`         | Signs upload intents; falls back to `ADMIN_SECRET` when empty              |
| `UPLOAD_MAX_FILE_MB`            | Per-file limit in MB (default `25`, capped at `100`)                       |
| `UPLOAD_MAX_FILES`              | Files per submission (default `5`, capped at `20`)                         |
| `UPLOAD_RATE_LIMIT_PER_HOUR`    | Student upload sessions per IP per hour (default `10`)                     |

> `.env` and `.env.*` files are gitignored (except `.env.example`). Never commit real credentials.
>
> `ADMIN_SECRET` has no default. If it is missing, the admin portal refuses to sign in.

### 3. Set up the database

Apply the SQL files in [`supabase/migrations`](./supabase/migrations) to your Supabase project, in filename order. You can run them through the Supabase CLI or paste them into the SQL editor in the Supabase dashboard.

### 4. Run the app

```sh
npm run dev
```

The dev server runs at [http://localhost:8080](http://localhost:8080).

## Scripts

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `npm run dev`       | Start the development server |
| `npm run build`     | Production build             |
| `npm run build:dev` | Development-mode build       |
| `npm run preview`   | Preview a production build   |
| `npm run lint`      | Run ESLint                   |
| `npm run format`    | Format with Prettier         |

## Project structure

```text
src/
├── components/divhub/     # Header, footer, cards, search, PDF viewer
├── hooks/                 # Shared hooks
├── integrations/supabase/ # Supabase clients and generated types
├── lib/                   # Queries, server functions, helpers
├── routes/                # File-based routes (TanStack Router)
│   ├── index.tsx          # Homepage
│   ├── subjects/          # Subject list, subject page, category pages
│   ├── search.tsx         # Global search
│   ├── contribute.tsx     # Contribution guide
│   ├── admin.tsx          # Protected admin portal
│   ├── privacy.tsx        # Privacy policy
│   └── terms.tsx          # Terms of service
└── styles.css             # Design tokens and Tailwind theme

supabase/migrations/       # Database schema, RLS policies and storage setup
```

Routes are file-based. Add a `.tsx` file under `src/routes/` and TanStack Router generates the route. Do not edit `src/routeTree.gen.ts` by hand.

## Admin portal

The admin portal lives at `/admin`. Sign in with the value of `ADMIN_SECRET` to create subjects, upload resources and delete entries. Uploads are handled server-side with the service role key, so keep that key private and set it only in your deployment environment.

The **Student Submissions** panel lists everything uploaded from `/contribute`. Filter by status, subject, category, academic year, title or contributor, then preview, approve, reject or delete. Only approved rows are readable by the public site.

## Google Drive uploads

Student uploads on `/contribute` go straight to Google Drive, and Supabase stores only the metadata. The browser never sees the service account key: the server creates a resumable upload session, the browser uploads the bytes to Google, then the server verifies the file size, MIME type and parent folder before writing the row.

### 1. Create the Google Cloud identity

1. Create (or reuse) a Google Cloud project and enable the **Google Drive API**.
2. Create a **service account** and add a JSON key. You need its `client_email` and `private_key`.
3. In Google Drive, share the destination folder with the service account email as **Editor**. Open the folder and copy the id from the URL: `https://drive.google.com/drive/folders/<FOLDER_ID>`.
4. Set `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` and `GOOGLE_DRIVE_FOLDER_ID` in your deployment environment.

The app creates `SPACE/<subject code>/<category>` inside that folder automatically, adding missing folders as needed. Files are shared as "anyone with the link" so pending items can be previewed by admins; a rejected submission has that permission removed, and deleting a submission deletes the Drive file. The folder itself is never made public or writable.

Use a **Shared Drive** if the destination folder is owned by a Workspace account. The service account only gets access to the folder you share with it, not to the rest of the drive.

### 2. Apply the migration

Run `supabase/migrations/20261120000000_drive_submissions.sql`. It extends the existing `resources` table (it does not create a parallel one), marks existing rows as `approved`, defaults new rows to `pending`, and replaces the public read policy with `status = 'approved'`.

### 3. Verify the setup

1. Open `/contribute` and upload a small PDF.
2. Confirm the file is in the Drive folder and a `pending` row exists in `resources`.
3. Open `/admin` → **Student Submissions**, approve it, and check that it appears in the public library.

Upload failures are reported in the form. If Drive is not configured, the page falls back to the email contribution option instead of faking success.

## Contributing

Space is built by students, for students. If you have notes, PYQs, syllabus documents or other useful subject files, the [Contribute page](/contribute) explains what to send and how it gets published.

In short:

1. Open `/contribute`, choose the subject, category and academic year, then upload your files.
2. An admin reviews the submission for readability and approves it.
3. Approved files appear in the public library for everyone, with no login.

You can also contribute to the codebase by opening an issue or pull request. Please keep changes focused, typed and consistent with the existing design system.

## Content and takedown

All material is shared for educational use. If you are a copyright holder or instructor and believe something should be corrected or removed, email [space.mitaoe@gmail.com](mailto:space.mitaoe@gmail.com) and it will be reviewed promptly.

## Security

- Keep `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_SECRET` server-side only. Never prefix them with `VITE_`.
- If a service role key, database password or admin passkey is ever exposed, rotate it immediately — deleting it from the latest commit is not enough once it has been published.
- Public read access goes through Row Level Security policies; privileged writes happen only in server functions using the service role key.

## License

This project is intended for educational use by the MITAOE community.
