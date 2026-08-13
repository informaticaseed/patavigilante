import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CASE_TYPES, LEIS, UFS, isCaseType } from "@/lib/casos";

const title = "Denúncia anônima — Pata Vigilante";
const description =
  "Envie uma denúncia anônima de maus-tratos ou tráfico de animais. Nenhum dado pessoal é solicitado ou guardado.";

export const Route = createFileRoute("/denuncia")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: DenunciaPage,
});

const schema = z.object({
  description: z
    .string()
    .trim()
    .min(30, { message: "Descreva o ocorrido com pelo menos 30 caracteres." })
    .max(4000, { message: "O relato deve ter no máximo 4000 caracteres." }),
  uf: z.string().length(2, { message: "Selecione o estado." }),
  city: z.string().trim().max(120, { message: "Município muito longo." }).optional(),
  case_type: z.string().optional(),
});

function DenunciaPage() {
  const [uf, setUf] = useState("");
  const [tipo, setTipo] = useState("nao_sei");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = schema.safeParse({
      description: String(form.get("description") ?? ""),
      uf,
      city: String(form.get("city") ?? ""),
      case_type: tipo,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Verifique os campos.");
      return;
    }

    setEnviando(true);
    const { error } = await supabase.from("reports").insert({
      description: parsed.data.description,
      uf: parsed.data.uf,
      city: parsed.data.city ? parsed.data.city : null,
      case_type: isCaseType(tipo) ? tipo : null,
      status: "pendente",
    });
    setEnviando(false);

    if (error) {
      toast.error("Não foi possível enviar a denúncia. Tente novamente em instantes.");
      return;
    }
    setEnviado(true);
  }

  if (enviado) {
    return (
      <SiteLayout>
        <div className="rounded-xl border border-primary/30 bg-card p-8 text-center shadow-[var(--shadow-soft)]">
          <ShieldCheck className="mx-auto h-10 w-10 text-primary" aria-hidden />
          <h1 className="mt-4 font-display text-2xl font-semibold">Denúncia recebida</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Sua denúncia foi registrada de forma anônima e entrou para análise. Depois de aprovada, ela é
            encaminhada à polícia pelo 190, com base nas leis nº 9.605/1998 e nº 14.064/2020.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Se o crime estiver acontecendo agora, ligue imediatamente para o 190.
          </p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <h1 className="font-display text-3xl font-semibold">Denúncia anônima</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Não pedimos nome, e-mail ou telefone, e nenhum dado de identificação é armazenado. Informe apenas
        a região e o que você presenciou.
      </p>

      <div className="mt-4 rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">
        <p className="font-semibold">Encaminhamento às autoridades</p>
        <p className="mt-1 text-muted-foreground">
          Denúncias aprovadas na análise são encaminhadas à polícia pelo 190, com base nas leis nº
          9.605/1998 (crimes ambientais) e nº 14.064/2020 (maus-tratos a cães e gatos).
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="uf">Estado *</Label>
            <Select value={uf} onValueChange={setUf}>
              <SelectTrigger id="uf">
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {UFS.map((u) => (
                  <SelectItem key={u.uf} value={u.uf}>
                    {u.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Município ou região (opcional)</Label>
            <Input id="city" name="city" maxLength={120} placeholder="Ex.: zona rural de Caruaru" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de caso</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger id="tipo">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nao_sei">Não sei classificar</SelectItem>
              {CASE_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">O que está acontecendo? *</Label>
          <Textarea
            id="description"
            name="description"
            required
            rows={8}
            maxLength={4000}
            placeholder="Descreva o local aproximado, os animais envolvidos, há quanto tempo acontece e o que você viu."
          />
          <p className="text-xs text-muted-foreground">
            Não escreva seu nome nem dados que possam identificar você.
          </p>
        </div>

        <Button type="submit" size="lg" disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar denúncia anônima"}
        </Button>
      </form>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {LEIS.map((lei) => (
          <div key={lei.titulo} className="rounded-lg border border-border bg-card p-4">
            <p className="font-semibold">{lei.titulo}</p>
            <p className="mt-1 text-sm text-muted-foreground">{lei.texto}</p>
          </div>
        ))}
      </div>
    </SiteLayout>
  );
}
