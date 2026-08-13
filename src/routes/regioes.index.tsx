import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/SiteLayout";
import { REGIOES, UFS } from "@/lib/casos";
import { casesQuery } from "@/lib/queries";

const title = "Casos por região — Pata Vigilante";
const description =
  "Navegue pelos casos de tráfico e maus-tratos de animais por estado e região do Brasil.";

export const Route = createFileRoute("/regioes/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: RegioesPage,
});

function RegioesPage() {
  const casos = useQuery(casesQuery());
  const contagem = new Map<string, number>();
  for (const caso of casos.data ?? []) {
    contagem.set(caso.uf, (contagem.get(caso.uf) ?? 0) + 1);
  }

  return (
    <SiteLayout>
      <h1 className="font-display text-3xl font-semibold">Casos por região</h1>
      <p className="mt-2 text-muted-foreground">
        Escolha um estado para ver os casos publicados naquela região.
      </p>

      <div className="mt-8 space-y-8">
        {REGIOES.map((regiao) => (
          <section key={regiao}>
            <h2 className="font-display text-xl font-semibold">{regiao}</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {UFS.filter((u) => u.regiao === regiao).map((u) => (
                <li key={u.uf}>
                  <Link
                    to="/regioes/$uf"
                    params={{ uf: u.uf }}
                    className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-2 text-sm transition-colors hover:border-primary/50"
                  >
                    <span>{u.nome}</span>
                    <span className="text-muted-foreground">{contagem.get(u.uf) ?? 0}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </SiteLayout>
  );
}
