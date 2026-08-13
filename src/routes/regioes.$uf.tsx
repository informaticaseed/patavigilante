import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/SiteLayout";
import { CaseList } from "@/components/CaseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ufNome } from "@/lib/casos";
import { casesQuery } from "@/lib/queries";

export const Route = createFileRoute("/regioes/$uf")({
  head: () => ({
    meta: [
      { title: "Casos por estado — Pata Vigilante" },
      {
        name: "description",
        content: "Casos de tráfico e maus-tratos de animais registrados neste estado.",
      },
      { property: "og:title", content: "Casos por estado — Pata Vigilante" },
      {
        property: "og:description",
        content: "Casos de tráfico e maus-tratos de animais registrados neste estado.",
      },
    ],
  }),
  component: RegiaoPage,
});

function RegiaoPage() {
  const { uf } = Route.useParams();
  const casos = useQuery(casesQuery({ uf: uf.toUpperCase() }));

  return (
    <SiteLayout>
      <h1 className="font-display text-3xl font-semibold">{ufNome(uf.toUpperCase())}</h1>
      <p className="mt-2 text-muted-foreground">Casos publicados neste estado.</p>
      <div className="mt-6">
        {casos.isLoading ? (
          <Skeleton className="h-36 w-full rounded-lg" />
        ) : (
          <CaseList items={casos.data ?? []} empty="Ainda não há casos publicados neste estado." />
        )}
      </div>
    </SiteLayout>
  );
}
