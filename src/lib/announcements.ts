export type Announcement = {
  id: string;
  title: string;
  body: string;
  /** Calendar date, YYYY-MM-DD. */
  date: string;
  to?: "/" | "/subjects" | "/search" | "/contribute" | "/practicals";
  action?: string;
};

/** Newest first. Add a notice here when something on the site changes. */
export const announcements: Announcement[] = [
  {
    id: "2026-11-27-practicals",
    date: "2026-11-27",
    title: "DSA practicals are on the Practicals page",
    body: "Arrays, hashing, sorting, linked lists, stacks, queues, trees, and graphs are listed with the code.",
    to: "/practicals",
    action: "Open practicals",
  },
];
