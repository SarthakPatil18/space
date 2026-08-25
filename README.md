# Study Spot

DIVHUB — Full-Stack Student Academic Resource Hub

You are a senior full-stack engineer and product designer. Build a production-quality academic resource website called DIVHUB for a college division.

The purpose of DIVHUB is extremely simple:

Give students the fastest possible way to access their subject Notes, Files, Previous Year Questions (PYQs), and Syllabus.

The existing college LMS/Moodle is slow and unnecessarily complicated for this use case. DIVHUB should feel significantly faster, cleaner, and easier to navigate.

1. DESIGN SOURCE OF TRUTH

I will provide the UI/design separately as:

screenshots/images, and/or

an .md design specification.

IMPORTANT:

Treat the provided design as the primary visual source of truth.

Before implementing the UI:

Inspect every provided screenshot carefully.

Read the entire .md specification if provided.

Identify:

layout

spacing

typography

colors

borders

shadows

card styles

navigation

responsive behavior

component hierarchy

interactions

Reproduce the design as accurately as practical.

Do NOT replace the provided design with your own generic dashboard design.

If the design and this prompt conflict visually, prioritize the provided design.

If the design does not specify a behavior, use the functional requirements below.

Do not start coding blindly. First understand the supplied design.

2. PRODUCT PHILOSOPHY

DIVHUB is NOT:

Moodle

a social network

an LMS

a productivity application

an AI tutor

an attendance system

an assignment management system

a college ERP

Do NOT add unnecessary features.

The core experience is:

Open → Find Subject → Find Resource → Open/Download

The product should feel:

fast

minimal

modern

clean

student-focused

mobile-friendly

intuitive

reliable

Avoid visual clutter.

3. CORE RESOURCE CATEGORIES

Every subject must contain exactly these four primary categories:

1. Notes

Lecture notes, handwritten notes, PDFs, study material, etc.

2. Files

Other subject-related files that don't belong under Notes.

3. PYQs

Previous Year Questions / examination papers.

4. Syllabus

Official syllabus and related syllabus documents.

Do not create unnecessary categories unless explicitly requested later.

4. RECOMMENDED TECH STACK

Use the following stack.

Frontend

Next.js

TypeScript

React

Tailwind CSS

shadcn/ui

Lucide React icons

Use the current stable versions compatible with the project environment rather than blindly installing outdated versions.

Backend / Database

Use:

Supabase

PostgreSQL

Supabase Storage

Do NOT create a separate Express/Node backend unless there is a genuine technical requirement.

Deployment

The application must be deployable to:

Vercel

The project must work correctly locally and on Vercel.

Repository

Use Git/GitHub-friendly project structure.

5. APPLICATION STRUCTURE

Use a clean Next.js App Router architecture.

Suggested structure:

app/
├── page.tsx
├── subjects/
│   ├── page.tsx
│   └── [subjectId]/
│       ├── page.tsx
│       ├── notes/
│       │   └── page.tsx
│       ├── files/
│       │   └── page.tsx
│       ├── pyqs/
│       │   └── page.tsx
│       └── syllabus/
│           └── page.tsx
│
├── search/
│   └── page.tsx
│
└── admin/
    ├── page.tsx
    ├── subjects/
    └── resources/


Adjust the routing if the supplied design requires a different structure.

6. HOMEPAGE

The homepage should make the student's next action obvious.

It should provide:

DIVHUB branding

division/semester context

subject navigation

search

recently added resources if included in the provided design

clean subject cards/list

quick access to resources where appropriate

Do not overload the homepage.

The student should be able to reach a subject within one interaction.

7. SUBJECT PAGE

Each subject should have a dedicated page.

Example:

Data Structures & Algorithms

[ Notes ]
[ Files ]
[ PYQs ]
[ Syllabus ]


Each category should clearly communicate:

resource type

number of resources where useful

resource titles

file type

file size where available

upload date where useful

The exact visual treatment must follow the provided design.

8. RESOURCE EXPERIENCE

When a student selects a resource:

Support:

opening the resource

downloading the resource

viewing PDFs where practical

clear file metadata

For PDFs, prefer opening them in a browser/PDF viewer rather than forcing a download immediately.

The experience should be fast and frictionless.

9. SEARCH

Implement global resource search.

Students should be able to search things such as:

binary tree
DBMS unit 3
OOP PYQ
matrices
syllabus


Search should search across:

subject names

resource titles

categories

useful metadata

Initially use PostgreSQL/Supabase search functionality.

Do NOT introduce Elasticsearch, Algolia, or another paid/external search service.

Search results should clearly show:

Resource title
Subject
Category
File type


Clicking a result should take the student directly to the resource.

10. DATABASE SCHEMA

Use PostgreSQL through Supabase.

Start with a simple schema.

subjects

id
name
code
semester
description
created_at
updated_at


resources

id
subject_id
title
category
file_path
file_url
file_type
file_size
description
created_at
updated_at


Category must support:

notes
files
pyqs
syllabus


Use foreign keys properly.

Do not duplicate subject information inside every resource record.

11. STORAGE

Use Supabase Storage for academic files.

Example logical structure:

resources/
├── dsa/
│   ├── notes/
│   ├── files/
│   ├── pyqs/
│   └── syllabus/
│
├── oop/
│   ├── notes/
│   ├── files/
│   ├── pyqs/
│   └── syllabus/
│
└── dbms/
    ├── notes/
    ├── files/
    ├── pyqs/
    └── syllabus/


The actual storage implementation can differ if there is a better Supabase pattern.

Do not store PDF binary data directly inside PostgreSQL.

Store the file in Supabase Storage and store its metadata/path in PostgreSQL.

12. ADMIN SYSTEM

Students should not need an account to browse public resources unless the provided design explicitly requires authentication.

Create a simple protected admin area for resource management.

Admin should be able to:

Subjects

create subject

edit subject

delete subject

Resources

upload resource

select subject

select category

enter title

optionally enter description

upload file

edit metadata

delete resource

Example upload flow:

Upload Resource

Title: [________________]

Subject:
[ DSA ▼ ]

Category:
[ Notes ▼ ]

File:
[ Choose File ]

[ Upload ]


Do not build a complex CMS.

13. AUTHENTICATION

Do NOT implement student authentication for V1 unless required by the supplied design.

For admin access:

Use Supabase Auth.

The public site should remain frictionless.

Students should ideally be able to:

visit → search → open → download


without logging in.

14. RESPONSIVE DESIGN

The site must work properly on:

desktop

laptop

tablet

mobile

Mobile is extremely important.

Assume many students will access DIVHUB from their phones.

Do not simply shrink the desktop UI.

Design proper mobile layouts based on the supplied design.

Check:

navigation

subject cards

search

resource lists

PDF actions

admin upload forms

on small screens.

15. PERFORMANCE

Performance is one of the primary reasons this product exists.

Optimize aggressively but sensibly.

Requirements:

fast initial page load

optimized images

minimal JavaScript

server components where appropriate

avoid unnecessary client components

lazy-load heavy content

don't fetch data that isn't needed

avoid unnecessary API requests

cache static/rarely changing data where appropriate

Do NOT introduce unnecessary libraries.

The site should feel substantially faster than Moodle for this use case.

16. UI QUALITY

Use the supplied design exactly where possible.

Pay close attention to:

typography

spacing

alignment

border radius

shadows

hover states

active states

empty states

loading states

error states

responsive behavior

Do not use generic AI-generated dashboard aesthetics.

Avoid:

excessive gradients

excessive glassmorphism

huge decorative elements

unnecessary animations

giant hero sections

excessive cards

meaningless statistics

fake testimonials

fake user data

Every UI element must have a purpose.

17. ACCESSIBILITY

Implement basic accessibility properly:

semantic HTML

keyboard navigation

visible focus states

accessible buttons

proper labels

useful alt text

sufficient contrast

proper heading hierarchy

Do not sacrifice accessibility for visual similarity.

18. EMPTY STATES

Handle empty subjects/categories gracefully.

Example:

No notes uploaded yet.

Check back later.


Do not leave blank screens.

19. ERROR HANDLING

Handle:

missing resources

deleted files

failed uploads

Supabase errors

invalid routes

network failures

Show clean user-friendly messages.

Never expose raw database errors to students.

20. SECURITY

Implement sensible Supabase security.

Use Row Level Security where appropriate.

Students should have read-only access to public resources.

Only authenticated admins should be able to:

upload

modify

delete

resources.

Never expose:

Supabase service-role keys

private credentials

secrets

admin credentials

in client-side code.

Use environment variables correctly.

21. ENVIRONMENT VARIABLES

Create:

.env.local


with placeholders such as:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=


Never hardcode secrets.

Also create/update:

.env.example


so deployment is straightforward.

22. SEED DATA

Create realistic sample data for development.

Example subjects:

Data Structures & Algorithms
Object Oriented Programming
Database Management Systems
Mathematics


Create several sample resources for each category.

Clearly mark seed/sample content so it can be removed later.

Do not use fake academic information in production.

23. COMPONENT ARCHITECTURE

Build reusable components.

Potential components:

Navbar
SearchBar
SubjectCard
SubjectGrid
ResourceCard
ResourceList
CategoryCard
Breadcrumbs
FileIcon
EmptyState
LoadingState
ErrorState
AdminUploadForm


Do not duplicate UI logic unnecessarily.

Keep components modular and maintainable.

24. CODE QUALITY

Write production-quality code.

Requirements:

TypeScript

strong typing

reusable components

clear naming

no unnecessary duplication

no giant monolithic components

no unused dependencies

no console spam

proper error handling

clean folder structure

Do not create fake implementations just to make the UI appear functional.

If a feature is represented in the UI, connect it to the real backend whenever the required infrastructure exists.

25. DEVELOPMENT PROCESS

Follow this order:

Phase 1 — Understand

Inspect all supplied screenshots and/or the .md design file.

Determine:

visual system

pages

components

navigation

responsive behavior

interactions

Phase 2 — Foundation

Set up:

Next.js

TypeScript

Tailwind

shadcn/ui

Supabase

environment variables

project structure

Phase 3 — Database

Create:

subjects table

resources table

relationships

indexes

required RLS policies

Phase 4 — Storage

Configure:

Supabase Storage

resource upload

file retrieval

file deletion

Phase 5 — UI

Implement the supplied design accurately.

Build:

Homepage

Subjects

Subject page

Notes

Files

PYQs

Syllabus

Search

Resource viewing/downloading

Admin

Phase 6 — Testing

Test:

desktop

mobile

navigation

search

resource opening

downloads

uploads

deletion

invalid resources

empty states

Supabase failures

Phase 7 — Production

Prepare for:

GitHub

Vercel

Supabase production environment

26. IMPORTANT CONSTRAINT

Do NOT add features simply because they seem useful.

The V1 product is intentionally small.

The four core resource types are:

Notes + Files + PYQs + Syllabus

Everything else is secondary.

If you think a feature should be added, do not silently implement it. Flag it separately as a possible future improvement.

27. FINAL QUALITY BAR

Before considering the project complete, verify:

Design matches supplied screenshots/specification

Homepage works

Subjects load from Supabase

Subject pages work

Notes work

Files work

PYQs work

Syllabus works

Search works

PDFs open correctly

Files download correctly

Admin authentication works

Admin upload works

Admin deletion works

Supabase RLS is configured

Mobile layout works

Desktop layout works

Loading states exist

Empty states exist

Error handling exists

No secrets are committed

.env.example exists

No unnecessary dependencies

Production build succeeds

Most importantly:

The final product should feel like the fastest, simplest way for a student in this division to find academic material.

Do not optimize for feature count.

This project is built for MITAOE students.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
