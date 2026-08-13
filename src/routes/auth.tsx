import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Pata Vigilante" },
      { name: "description", content: "Acesso restrito à equipe de moderação do Pata Vigilante." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Entrar — Pata Vigilante" },
      { property: "og:description", content: "Acesso restrito à equipe de moderação." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!email || password.length < 6) {
      toast.error("Informe um e-mail válido e uma senha com pelo menos 6 caracteres.");
      return;
    }

    setCarregando(true);
    const resultado =
      modo === "entrar"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/admin` },
          });
    setCarregando(false);

    if (resultado.error) {
      toast.error(resultado.error.message);
      return;
    }
    if (modo === "criar" && !resultado.data.session) {
      toast.success("Conta criada. Confirme o e-mail para entrar.");
      return;
    }
    navigate({ to: "/admin" });
  }

  async function entrarComGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Não foi possível entrar com o Google.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/admin" });
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-3xl font-semibold">Acesso da moderação</h1>
        <p className="mt-2 text-muted-foreground">
          Área restrita para revisar denúncias e casos enviados pelo público.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete={modo === "entrar" ? "current-password" : "new-password"}
            />
          </div>
          <Button type="submit" className="w-full" disabled={carregando}>
            {carregando ? "Aguarde..." : modo === "entrar" ? "Entrar" : "Criar conta"}
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={entrarComGoogle}>
            Entrar com o Google
          </Button>
          <button
            type="button"
            onClick={() => setModo(modo === "entrar" ? "criar" : "entrar")}
            className="w-full text-sm text-muted-foreground hover:text-foreground"
          >
            {modo === "entrar" ? "Não tem conta? Criar acesso" : "Já tem conta? Entrar"}
          </button>
        </form>
      </div>
    </SiteLayout>
  );
}
