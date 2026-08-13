import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, PawPrint, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SideNav } from "@/components/SideNav";

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-primary" aria-hidden />
            <span className="font-display text-lg font-semibold leading-tight text-foreground">
              Pata Vigilante
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-5 text-sm md:flex">
            <Link to="/" className="text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground font-semibold" }} activeOptions={{ exact: true }}>
              Início
            </Link>
            <Link to="/casos" className="text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground font-semibold" }}>
              Casos
            </Link>
            <Link to="/regioes" className="text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground font-semibold" }}>
              Regiões
            </Link>
            <Link to="/sobre" className="text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground font-semibold" }}>
              Sobre
            </Link>
          </nav>

          <Button asChild size="sm" className="ml-auto md:ml-0">
            <Link to="/denuncia">
              <ShieldAlert className="h-4 w-4" aria-hidden />
              Denunciar
            </Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Abrir menu de navegação">
                <Menu className="h-4 w-4" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] max-w-sm overflow-y-auto">
              <SheetTitle className="sr-only">Navegação do site</SheetTitle>
              <div className="pt-6">
                <SideNav onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-10 px-4 py-8">
        <main className="min-w-0 flex-1">{children}</main>
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-24">
            <SideNav />
          </div>
        </aside>
      </div>

      <footer className="border-t border-border bg-secondary/50">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
          <p className="font-display text-base text-foreground">Pata Vigilante</p>
          <p className="mt-2 max-w-2xl">
            Site independente de informação sobre tráfico e maus-tratos de animais. Denúncias recebidas
            aqui são anônimas e, quando aprovadas, encaminhadas à polícia pelo 190, com base nas leis nº
            9.605/1998 e nº 14.064/2020.
          </p>
          <p className="mt-4">Em caso de flagrante, ligue imediatamente para o 190.</p>
        </div>
      </footer>
    </div>
  );
}
