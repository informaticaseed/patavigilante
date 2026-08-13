import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CASE_TYPE_LABEL, LEIS, formatarData, localLabel } from "@/lib/casos";
import { useImagemUrl } from "@/lib/imagens";
import { caseBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/casos/$slug")({
  head: () => ({
    meta: [
      { title: "Caso — Pata Vigilante" },
      {
        name: "description",
        content: "Relato completo de um caso de tráfico ou maus-tratos de animais publicado após revisão.",
      },
      { property: "og:title", content: "Caso — Pata Vigilante" },
      {
        property: "og:description",
        content: "Relato completo de um caso de tráfico ou maus-tratos de animais publicado após revisão.",
      },
      { property: "og:type", content: "article" },
    ],
  }),
  component: CasoPage,
});

function CasoPage() {
  const { slug } = Route.useParams();
  const caso = useQuery(caseBySlugQuery(slug));
  const imagem = useImagemUrl(caso.data?.image_path);

  if (caso.isLoading) {
    return (
      <SiteLayout>
        <Skeleton className="h-72 w-full rounded-lg" />
      </SiteLayout>
    );
  }

  if (!caso.data) {
    return (
      <SiteLayout>
        <h1 className="font-display text-3xl font-semibold">Caso não encontrado</h1>
        <p className="mt-2 text-muted-foreground">
          Este caso pode ter sido removido ou ainda estar em análise.
        </p>
        <Link to="/casos" className="mt-4 inline-block font-semibold text-primary hover:underline">
          Ver todos os casos
        </Link>
      </SiteLayout>
    );
  }

  const item = caso.data;

  return (
    <SiteLayout>
      <article>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {item.case_type ? <Badge variant="secondary">{CASE_TYPE_LABEL[item.case_type]}</Badge> : null}
          <span className="text-muted-foreground">{localLabel(item.uf, item.city)}</span>
          {item.published_at ? (
            <span className="text-muted-foreground">· {formatarData(item.published_at)}</span>
          ) : null}
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight">{item.title}</h1>
        {item.summary ? <p className="mt-4 text-lg text-muted-foreground">{item.summary}</p> : null}

        {imagem ? (
          <img
            src={imagem}
            alt={`Imagem do caso: ${item.title}`}
            className="mt-6 w-full rounded-lg border border-border object-cover"
          />
        ) : null}

        <div className="mt-8 space-y-4 text-base leading-relaxed text-foreground">
          {item.body.split("\n").filter(Boolean).map((paragrafo, i) => (
            <p key={i}>{paragrafo}</p>
          ))}
        </div>

        {item.source_url ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Fonte:{" "}
            <a href={item.source_url} className="text-primary hover:underline" rel="noreferrer noopener" target="_blank">
              {item.source_url}
            </a>
          </p>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3 text-sm">
          {item.case_type ? (
            <Link
              to="/tipos/$tipo"
              params={{ tipo: item.case_type }}
              className="rounded-md border border-border px-3 py-2 hover:border-primary/50"
            >
              Mais casos de {CASE_TYPE_LABEL[item.case_type].toLowerCase()}
            </Link>
          ) : null}
          <Link
            to="/regioes/$uf"
            params={{ uf: item.uf }}
            className="rounded-md border border-border px-3 py-2 hover:border-primary/50"
          >
            Casos em {item.uf}
          </Link>
        </div>

        <aside className="mt-10 rounded-xl border border-accent/40 bg-accent/10 p-6">
          <h2 className="font-display text-xl font-semibold">O que diz a lei</h2>
          <ul className="mt-3 space-y-3">
            {LEIS.map((lei) => (
              <li key={lei.titulo}>
                <p className="font-semibold">{lei.titulo}</p>
                <p className="text-sm text-muted-foreground">{lei.texto}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm">
            Presenciou algo parecido? Ligue 190 em caso de flagrante ou{" "}
            <Link to="/denuncia" className="font-semibold text-primary hover:underline">
              envie uma denúncia anônima
            </Link>
            .
          </p>
        </aside>
      </article>
    </SiteLayout>
  );
}
