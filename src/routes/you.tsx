import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/you")({
  beforeLoad: () => {
    throw redirect({ to: "/profile" });
  },
});
