import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CASE_TYPES, UFS, isCaseType, slugify } from "@/lib/casos";
import { enviarImagemCaso } from "@/lib/imagens";

const title = "Postar sobre um novo caso — Pata Vigilante";
const description =
  "Conte de forma anônima um caso de tráfico ou maus-tratos de animais. Pedimos apenas a região onde ocorreu.";

export const Route = createFileRoute("/enviar-caso")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: EnviarCasoPage,
});

const schema = z.object({
  title: z.string().trim().max(160, { message: "O título deve ter no máximo 160 caracteres." }).optional(),
  body: z
    .string()
    .trim()
    .min(30, { message: "Conte o caso com pelo menos 30 caracteres." })
    .max(8000, { message: "O relato deve ter no máximo 8000 caracteres." }),
  uf: z.string().length(2, { message: "Selecione o estado onde o caso ocorreu." }),
  city: z.string().trim().max(120).optional(),
  source_url: z
    .string()
    .trim()
    .max(500)
    .url({ message: "A fonte precisa ser um endereço válido." })
    .optional()
    .or(z.literal("")),
});

const TIPOS_IMAGEM = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const TAMANHO_MAX = 5 * 1024 * 1024;

function EnviarCasoPage() {
  const [uf, setUf] = useState("");
  const [tipo, setTipo] = useState("nao_sei");
  const [imagem, setImagem] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = schema.safeParse({
      title: String(form.get("title") ?? ""),
      body: String(form.get("body") ?? ""),
      uf,
      city: String(form.get("city") ?? ""),
      source_url: String(form.get("source_url") ?? ""),
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Verifique os campos.");
      return;
    }

    if (imagem && (!TIPOS_IMAGEM.includes(imagem.type) || imagem.size > TAMANHO_MAX)) {
      toast.error("A imagem deve ser JPG, PNG, WEBP ou GIF com até 5 MB.");
      return;
    }

    setEnviando(true);

    let imagePath: string | null = null;
    if (imagem) {
      try {
        imagePath = await enviarImagemCaso(imagem);
      } catch {
        setEnviando(false);
        toast.error("Não foi possível enviar a imagem. Tente outro arquivo.");
        return;
      }
    }

    const titulo = parsed.data.title
      ? parsed.data.title
      : `${parsed.data.body.slice(0, 70).trim()}${parsed.data.body.length > 70 ? "..." : ""}`;

    const { error } = await supabase.from("cases").insert({
      title: titulo,
      slug: `${slugify(titulo)}-${Date.now().toString(36)}`,
      body: parsed.data.body,
      case_type: isCaseType(tipo) ? tipo : null,
      uf: parsed.data.uf,
      city: parsed.data.city ? parsed.data.city : null,
      source_url: parsed.data.source_url ? parsed.data.source_url : null,
      image_path: imagePath,
      status: "pendente",
      featured: false,
      published_at: null,
    });
    setEnviando(false);

    if (error) {
      toast.error("Não foi possível enviar o caso. Tente novamente em instantes.");
      return;
    }
    setEnviado(true);
  }

  if (enviado) {
    return (
      <SiteLayout>
        <div className="rounded-xl border border-primary/30 bg-card p-8 text-center shadow-[var(--shadow-soft)]">
          <CheckCircle2 className="mx-auto h-10 w-10 text-primary" aria-hidden />
          <h1 className="mt-4 font-display text-2xl font-semibold">Caso enviado para análise</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Seu relato foi recebido de forma anônima. Ele será revisado antes de aparecer no site, para
            evitar informações falsas ou que exponham pessoas.
          </p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <h1 className="font-display text-3xl font-semibold">Postar sobre um novo caso</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Conte um caso que você presenciou ou acompanhou. O envio é anônimo e o único dado obrigatório é a
        região onde o caso ocorreu — título, tipo, fonte e imagem são opcionais. Todo relato passa por
        revisão antes de ser publicado.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <div className="space-y-2">
          <Label htmlFor="title">Título do caso (opcional)</Label>
          <Input id="title" name="title" maxLength={160} placeholder="Ex.: Aves silvestres vendidas em feira livre" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="uf">Estado onde ocorreu *</Label>
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
            <Input id="city" name="city" maxLength={120} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de caso (opcional)</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger id="tipo">
              <SelectValue placeholder="Selecione o tipo" />
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
          <Label htmlFor="body">Relato do caso *</Label>
          <Textarea id="body" name="body" required rows={10} maxLength={8000} placeholder="Descreva o que aconteceu, quando, com quais animais e qual a situação atual." />
          <p className="text-xs text-muted-foreground">
            Não inclua seu nome nem dados pessoais de terceiros.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="source_url">Link de uma fonte (opcional)</Label>
          <Input id="source_url" name="source_url" type="url" maxLength={500} placeholder="https://" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="imagem">Imagem do caso (opcional)</Label>
          <Input
            id="imagem"
            name="imagem"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(event) => setImagem(event.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WEBP ou GIF, até 5 MB. Evite imagens que identifiquem pessoas.
          </p>
        </div>

        <Button type="submit" size="lg" disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar caso para análise"}
        </Button>
      </form>
    </SiteLayout>
  );
}
