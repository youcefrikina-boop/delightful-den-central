import { createFileRoute } from "@tanstack/react-router";
import { CRMProvider } from "@/context/CRMProvider";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "DafaTek CRM 2026 — Chauffage central & chaudières" },
      { name: "description", content: "CRM atelier dédié à l'entretien et au dépannage des chaudières et systèmes de chauffage central." },
      { property: "og:title", content: "DafaTek CRM — إدارة الزبائن والمهام" },
      { property: "og:description", content: "متابعة خدمات الزبائن والمهام والمواعيد في ورشة DafaTek." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
