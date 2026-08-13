import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Phone } from "lucide-react";

import { SiteLayout } from "@/components/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { CASE_TYPE_LABEL, formatarData, localLabel, slugify, type CaseRow, type ReportRow } from "@/lib/casos";
import { isAdminQuery, pendingCasesQuery, reportsQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Moderação — Pata Vigilante" },
      { name: "description", content: "Painel de revisão de casos e denúncias enviados ao Pata Vigilante." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Moderação — Pata Vigilante" },
      { property: "og:description", content: "Painel restrito de revisão de envios." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const admin = useQuery(isAdminQuery());

  async function sair() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (admin.isLoading) {
    return (
      <SiteLayout>
        <p className="text-muted-foreground">Carregando painel...</p>
      </SiteLayout>
    );
  }

  if (!admin.data) {
    return (
      <SiteLayout>
        <h1 className="font-display text-3xl font-semibold">Sem permissão</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Sua conta ainda não tem o papel de administrador. Peça a quem já administra o site para
          conceder o acesso.
        </p>
        <Button className="mt-4" variant="outline" onClick={sair}>
          Sair
        </Button>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">Moderação</h1>
        <Button variant="outline" size="sm" onClick={sair}>
          Sair
        </Button>
      </div>

      <Tabs defaultValue="casos" className="mt-6">
        <TabsList>
          <TabsTrigger value="casos">Casos enviados</TabsTrigger>
          <TabsTrigger value="denuncias">Denúncias anônimas</TabsTrigger>
        </TabsList>
        <TabsContent value="casos" className="mt-6">
          <CasosAdmin />
        </TabsContent>
        <TabsContent value="denuncias" className="mt-6">
          <DenunciasAdmin />
        </TabsContent>
      </Tabs>
    </SiteLayout>
  );
}

function CasosAdmin() {
  const queryClient = useQueryClient();
  const casos = useQuery(pendingCasesQuery());

  const atualizar = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<CaseRow> }) => {
      const { error } = await supabase.from("cases").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cases"] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("Caso atualizado.");
    },
    onError: () => toast.error("Não foi possível atualizar o caso."),
  });

  if (casos.isLoading) return <p className="text-muted-foreground">Carregando casos...</p>;

  const lista = casos.data ?? [];
  if (lista.length === 0) return <p className="text-muted-foreground">Nenhum caso enviado ainda.</p>;

  return (
    <div className="space-y-4">
      {lista.map((caso) => (
        <article key={caso.id} className="rounded-lg border border-border bg-card p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant={caso.status === "publicado" ? "default" : "secondary"}>{caso.status}</Badge>
            {caso.featured ? <Badge variant="outline">destaque</Badge> : null}
            {caso.case_type ? <span className="text-muted-foreground">{CASE_TYPE_LABEL[caso.case_type]}</span> : null}
            <span className="text-muted-foreground">{localLabel(caso.uf, caso.city)}</span>
            <span className="text-muted-foreground">· enviado em {formatarData(caso.created_at)}</span>
          </div>
          <h2 className="mt-2 font-display text-xl font-semibold">{caso.title}</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{caso.body.slice(0, 600)}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {caso.status !== "publicado" ? (
              <Button
                size="sm"
                onClick={() =>
                  atualizar.mutate({
                    id: caso.id,
                    patch: {
                      status: "publicado",
                      published_at: new Date().toISOString(),
                      slug: caso.slug ?? `${slugify(caso.title)}-${Date.now().toString(36)}`,
                    },
                  })
                }
              >
                Publicar
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => atualizar.mutate({ id: caso.id, patch: { status: "pendente" } })}
              >
                Despublicar
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => atualizar.mutate({ id: caso.id, patch: { featured: !caso.featured } })}
            >
              {caso.featured ? "Remover destaque" : "Destacar"}
            </Button>
            {caso.status !== "recusado" ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => atualizar.mutate({ id: caso.id, patch: { status: "recusado" } })}
              >
                Recusar
              </Button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function DenunciasAdmin() {
  const queryClient = useQueryClient();
  const denuncias = useQuery(reportsQuery());
  const [notas, setNotas] = useState<Record<string, string>>({});

  const atualizar = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<ReportRow> }) => {
      const { error } = await supabase.from("reports").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      toast.success("Denúncia atualizada.");
    },
    onError: () => toast.error("Não foi possível atualizar a denúncia."),
  });

  if (denuncias.isLoading) return <p className="text-muted-foreground">Carregando denúncias...</p>;

  const lista = denuncias.data ?? [];
  if (lista.length === 0) return <p className="text-muted-foreground">Nenhuma denúncia recebida ainda.</p>;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">
        <p className="font-semibold">Encaminhamento obrigatório</p>
        <p className="mt-1 text-muted-foreground">
          Toda denúncia aprovada deve ser comunicada à polícia pelo 190, com base nas leis nº 9.605/1998 e
          nº 14.064/2020. Registre abaixo o protocolo ou a confirmação do atendimento.
        </p>
      </div>

      {lista.map((denuncia) => (
        <article key={denuncia.id} className="rounded-lg border border-border bg-card p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant={denuncia.status === "publicado" ? "default" : "secondary"}>
              {denuncia.status === "publicado" ? "aprovada" : denuncia.status}
            </Badge>
            {denuncia.forwarded_at ? (
              <Badge variant="outline">encaminhada em {formatarData(denuncia.forwarded_at)}</Badge>
            ) : null}
            {denuncia.case_type ? (
              <span className="text-muted-foreground">{CASE_TYPE_LABEL[denuncia.case_type]}</span>
            ) : null}
            <span className="text-muted-foreground">{localLabel(denuncia.uf, denuncia.city)}</span>
            <span className="text-muted-foreground">· recebida em {formatarData(denuncia.created_at)}</span>
          </div>
          <p className="mt-3 whitespace-pre-line text-sm">{denuncia.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {denuncia.status !== "publicado" ? (
              <Button
                size="sm"
                onClick={() => atualizar.mutate({ id: denuncia.id, patch: { status: "publicado" } })}
              >
                Aprovar
              </Button>
            ) : null}
            {denuncia.status !== "recusado" ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => atualizar.mutate({ id: denuncia.id, patch: { status: "recusado" } })}
              >
                Recusar
              </Button>
            ) : null}
            <Button size="sm" variant="outline" asChild>
              <a href="tel:190">
                <Phone className="h-4 w-4" aria-hidden />
                Ligar 190
              </a>
            </Button>
          </div>

          {denuncia.status === "publicado" ? (
            <div className="mt-4 rounded-md border border-border p-3">
              <p className="text-sm font-semibold">Encaminhamento à polícia (190)</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Informe: local ({localLabel(denuncia.uf, denuncia.city)}), o relato acima e o enquadramento
                nas leis nº 9.605/1998 e nº 14.064/2020.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Input
                  className="max-w-xs"
                  placeholder="Protocolo ou observação"
                  value={notas[denuncia.id] ?? denuncia.forwarded_note ?? ""}
                  onChange={(event) => setNotas({ ...notas, [denuncia.id]: event.target.value })}
                />
                <Button
                  size="sm"
                  onClick={() =>
                    atualizar.mutate({
                      id: denuncia.id,
                      patch: {
                        forwarded_at: new Date().toISOString(),
                        forwarded_note: notas[denuncia.id] ?? denuncia.forwarded_note ?? null,
                      },
                    })
                  }
                >
                  {denuncia.forwarded_at ? "Atualizar encaminhamento" : "Marcar como encaminhada"}
                </Button>
              </div>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
