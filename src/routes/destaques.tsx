import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/SiteLayout";
import { CaseList } from "@/components/CaseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { casesQuery } from "@/lib/queries";

const title = "Casos em destaque — Pata Vigilante";
const description =
  "Casos selecionados de tráfico e maus-tratos de animais que merecem atenção imediata do público e das autoridades.";

export const Route = createFileRoute("/destaques")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: DestaquesPage,
});

function DestaquesPage() {
  const casos = useQuery(casesQuery({ featured: true }));

  return (
    <SiteLayout>
      <h1 className="font-display text-3xl font-semibold">Casos em destaque</h1>
      <p className="mt-2 text-muted-foreground">
        Seleção de casos com maior gravidade, repercussão ou risco de continuidade.
      </p>
      <div className="mt-6">
        {casos.isLoading ? (
          <Skeleton className="h-36 w-full rounded-lg" />
        ) : (
          <CaseList items={casos.data ?? []} empty="Nenhum caso em destaque no momento." />
        )}
      </div>
    </SiteLayout>
  );
}
