import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { CASE_TYPE_LABEL, formatarData, localLabel } from "@/lib/casos";
import { useImagemUrl } from "@/lib/imagens";
import type { CaseListItem } from "@/lib/queries";

export function CaseCard({ item }: { item: CaseListItem }) {
  const imagem = useImagemUrl(item.image_path);

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-soft)] transition-colors hover:border-primary/40">
      {imagem ? (
        <img src={imagem} alt={`Imagem do caso: ${item.title}`} loading="lazy" className="h-48 w-full object-cover" />
      ) : null}
      <div className="p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {item.case_type ? <Badge variant="secondary">{CASE_TYPE_LABEL[item.case_type]}</Badge> : null}
        <span className="text-muted-foreground">{localLabel(item.uf, item.city)}</span>
        {item.published_at ? (
          <span className="text-muted-foreground">· {formatarData(item.published_at)}</span>
        ) : null}
      </div>
      <h3 className="mt-3 font-display text-xl font-semibold leading-snug">
        <Link to="/casos/$slug" params={{ slug: item.slug ?? item.id }} className="hover:text-primary">
          {item.title}
        </Link>
      </h3>
      {item.summary ? <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p> : null}
      <Link
        to="/casos/$slug"
        params={{ slug: item.slug ?? item.id }}
        className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
      >
        Ler o caso
      </Link>
      </div>
    </article>
  );
}

export function CaseList({ items, empty }: { items: CaseListItem[]; empty?: string }) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        {empty ?? "Nenhum caso publicado aqui ainda."}
      </p>
    );
  }
  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <CaseCard key={item.id} item={item} />
      ))}
    </div>
  );
}
