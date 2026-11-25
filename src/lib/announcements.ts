export type Announcement = {
  id: string;
  title: string;
  body: string;
  /** Calendar date, YYYY-MM-DD. */
  date: string;
  to?: "/" | "/subjects" | "/search" | "/contribute";
  action?: string;
};

/** Newest first. Add a notice here when something on the site changes. */
export const announcements: Announcement[] = [
  {
    id: "2026-11-25-lab-files",
    date: "2026-11-25",
    title: "Lab files stay with each subject",
    body: "The standalone practicals page is gone. Open a subject and choose Practicals to find lab manuals and files.",
    to: "/subjects",
    action: "Browse subjects",
  },
];
