import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/SiteLayout";
import { CaseList } from "@/components/CaseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { CASE_TYPES, isCaseType } from "@/lib/casos";
import { casesQuery } from "@/lib/queries";

export const Route = createFileRoute("/tipos/$tipo")({
  head: () => ({
    meta: [
      { title: "Casos por tipo — Pata Vigilante" },
      {
        name: "description",
        content:
          "Casos agrupados por tipo de crime: caça, criação abusiva, comércio ilegal, distinção de raças, agropecuária intensiva e esporte.",
      },
      { property: "og:title", content: "Casos por tipo — Pata Vigilante" },
      {
        property: "og:description",
        content: "Casos de maus-tratos e tráfico de animais agrupados por tipo de crime.",
      },
    ],
  }),
  component: TipoPage,
});

function TipoPage() {
  const { tipo } = Route.useParams();
  const valido = isCaseType(tipo);
  const info = CASE_TYPES.find((t) => t.value === tipo);
  const casos = useQuery({ ...casesQuery(valido ? { type: tipo } : {}), enabled: valido });

  if (!valido) {
    return (
      <SiteLayout>
        <h1 className="font-display text-3xl font-semibold">Tipo de caso desconhecido</h1>
        <Link to="/casos" className="mt-4 inline-block font-semibold text-primary hover:underline">
          Ver todos os casos
        </Link>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <h1 className="font-display text-3xl font-semibold">{info?.label}</h1>
      <p className="mt-2 text-muted-foreground">{info?.description}</p>
      <div className="mt-6">
        {casos.isLoading ? (
          <Skeleton className="h-36 w-full rounded-lg" />
        ) : (
          <CaseList items={casos.data ?? []} empty="Ainda não há casos publicados neste tipo." />
        )}
      </div>
    </SiteLayout>
  );
}
