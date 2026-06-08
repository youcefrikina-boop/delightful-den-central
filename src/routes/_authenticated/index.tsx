import { createFileRoute } from "@tanstack/react-router";
import { CRMProvider } from "@/context/CRMProvider";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "DafaTek CRM 2026 — Chauffage central & chaudières" },
      { name: "description", content: "CRM atelier dédié à l'entretien et au dépannage des chaudières et systèmes de chauffage central." },
    ],
  }),
  component: AuthedIndex,
});

function AuthedIndex() {
  const { user } = Route.useRouteContext();
  return (
    <CRMProvider userId={user.id} userEmail={user.email ?? null}>
      <AppShell />
    </CRMProvider>
  );
}
