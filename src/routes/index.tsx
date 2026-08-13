import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Megaphone, PenLine, ShieldAlert } from "lucide-react";

import { SiteLayout } from "@/components/SiteLayout";
import { CaseList } from "@/components/CaseCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { casesQuery } from "@/lib/queries";
import { CASE_TYPES, LEIS } from "@/lib/casos";

const title = "Pata Vigilante — casos de tráfico e maus-tratos de animais";
const description =
  "Blog independente com casos de tráfico e maus-tratos de animais no Brasil. Envie denúncias anônimas e acompanhe casos por região e tipo de crime.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

function Index() {
  const destaques = useQuery(casesQuery({ featured: true, limit: 3 }));
  const recentes = useQuery(casesQuery({ limit: 6 }));

  return (
    <SiteLayout>
      <section className="rounded-xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Informação e denúncia</p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
          Nenhum caso de crueldade contra animais deveria passar despercebido
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          Reunimos e publicamos casos de tráfico e maus-tratos de animais em todo o Brasil. Você pode
          denunciar ou contar um caso de forma totalmente anônima — pedimos apenas a região onde ocorreu.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/denuncia">
              <Megaphone className="h-4 w-4" aria-hidden />
              Fazer denúncia anônima
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/enviar-caso">
              <PenLine className="h-4 w-4" aria-hidden />
              Postar sobre um novo caso
            </Link>
          </Button>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold">Casos em destaque</h2>
          <Link to="/destaques" className="text-sm font-semibold text-primary hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="mt-4">
          {destaques.isLoading ? <Skeletons /> : <CaseList items={destaques.data ?? []} empty="Nenhum destaque no momento." />}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">Tipos de caso</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {CASE_TYPES.map((tipo) => (
            <Link
              key={tipo.value}
              to="/tipos/$tipo"
              params={{ tipo: tipo.value }}
              className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
            >
              <p className="font-display text-lg font-semibold">{tipo.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{tipo.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold">Últimos casos</h2>
          <Link to="/casos" className="text-sm font-semibold text-primary hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="mt-4">
          {recentes.isLoading ? <Skeletons /> : <CaseList items={recentes.data ?? []} />}
        </div>
      </section>

      <section className="mt-12 rounded-xl border border-accent/40 bg-accent/10 p-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-accent-foreground" aria-hidden />
          <h2 className="font-display text-xl font-semibold">A lei protege os animais</h2>
        </div>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {LEIS.map((lei) => (
            <li key={lei.titulo}>
              <p className="font-semibold text-foreground">{lei.titulo}</p>
              <p className="mt-1 text-sm text-muted-foreground">{lei.texto}</p>
            </li>
          ))}
        </ul>
      </section>
    </SiteLayout>
  );
}

function Skeletons() {
  return (
    <div className="grid gap-4">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-36 w-full rounded-lg" />
      ))}
    </div>
  );
}
