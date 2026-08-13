import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { CASE_TYPE_LABEL, formatarData, localLabel } from "@/lib/casos";
import type { CaseListItem } from "@/lib/queries";

export function CaseCard({ item }: { item: CaseListItem }) {
  return (
    <article className="rounded-lg border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-colors hover:border-primary/40">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="secondary">{CASE_TYPE_LABEL[item.case_type]}</Badge>
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
