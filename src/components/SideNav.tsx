import { Link } from "@tanstack/react-router";
import { FileWarning, MapPin, Megaphone, PenLine, Star } from "lucide-react";

import { CASE_TYPES } from "@/lib/casos";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

const itemClass =
  "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground";
const activeClass = "bg-secondary font-semibold text-foreground";

export function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Ações e categorias" className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-3 shadow-[var(--shadow-soft)]">
        <SectionTitle>Participe</SectionTitle>
        <Link to="/denuncia" onClick={onNavigate} className={itemClass} activeProps={{ className: activeClass }}>
          <Megaphone className="h-4 w-4 text-accent" aria-hidden />
          Denúncia anônima
        </Link>
        <Link to="/enviar-caso" onClick={onNavigate} className={itemClass} activeProps={{ className: activeClass }}>
          <PenLine className="h-4 w-4 text-accent" aria-hidden />
          Postar sobre um novo caso
        </Link>
      </div>

      <div className="rounded-lg border border-border bg-card p-3 shadow-[var(--shadow-soft)]">
        <SectionTitle>Navegar</SectionTitle>
        <Link to="/destaques" onClick={onNavigate} className={itemClass} activeProps={{ className: activeClass }}>
          <Star className="h-4 w-4 text-accent" aria-hidden />
          Casos em destaque
        </Link>
        <Link to="/regioes" onClick={onNavigate} className={itemClass} activeProps={{ className: activeClass }}>
          <MapPin className="h-4 w-4 text-accent" aria-hidden />
          Casos por região
        </Link>
        <Link to="/casos" onClick={onNavigate} className={itemClass} activeProps={{ className: activeClass }}>
          <FileWarning className="h-4 w-4 text-accent" aria-hidden />
          Todos os casos
        </Link>
        <Link to="/sobre" onClick={onNavigate} className={itemClass} activeProps={{ className: activeClass }}>
          <FileWarning className="h-4 w-4 text-accent" aria-hidden />
          Sobre e legislação
        </Link>
      </div>

      <div className="rounded-lg border border-border bg-card p-3 shadow-[var(--shadow-soft)]">
        <SectionTitle>Tipos de caso</SectionTitle>
        <ul>
          {CASE_TYPES.map((tipo) => (
            <li key={tipo.value}>
              <Link
                to="/tipos/$tipo"
                params={{ tipo: tipo.value }}
                onClick={onNavigate}
                className={itemClass}
                activeProps={{ className: activeClass }}
              >
                {tipo.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground shadow-[var(--shadow-soft)]">
        <p>Emergência com animais: ligue 190.</p>
        <Link to="/auth" onClick={onNavigate} className="mt-2 inline-block underline hover:text-foreground">
          Área da moderação
        </Link>
      </div>
    </nav>
  );
}
