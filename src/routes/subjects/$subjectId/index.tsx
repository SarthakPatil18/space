import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/subjects/$subjectId/")({
  loader: ({ params }) => {
    throw redirect({
      to: "/subjects/$subjectId/$category",
      params: { subjectId: params.subjectId, category: "notes" },
    });
  },
});
