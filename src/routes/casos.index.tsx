import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { SiteLayout } from "@/components/SiteLayout";
import { CaseList } from "@/components/CaseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CASE_TYPES, UFS, isCaseType, type CaseType } from "@/lib/casos";
import { casesQuery } from "@/lib/queries";

const title = "Todos os casos — Pata Vigilante";
const description =
  "Lista completa de casos publicados de tráfico e maus-tratos de animais, com filtros por estado e tipo de crime.";

export const Route = createFileRoute("/casos/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: CasosPage,
});

function CasosPage() {
  const [tipo, setTipo] = useState<string>("todos");
  const [uf, setUf] = useState<string>("todos");

  const filtros: { type?: CaseType; uf?: string } = {};
  if (isCaseType(tipo)) filtros.type = tipo;
  if (uf !== "todos") filtros.uf = uf;

  const casos = useQuery(casesQuery(filtros));

  return (
    <SiteLayout>
      <h1 className="font-display text-3xl font-semibold">Todos os casos</h1>
      <p className="mt-2 text-muted-foreground">
        Casos publicados após revisão. Use os filtros para encontrar ocorrências por tipo ou estado.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="w-60">
            <SelectValue placeholder="Tipo de caso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {CASE_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={uf} onValueChange={setUf}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os estados</SelectItem>
            {UFS.map((u) => (
              <SelectItem key={u.uf} value={u.uf}>
                {u.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6">
        {casos.isLoading ? (
          <div className="grid gap-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <CaseList items={casos.data ?? []} empty="Nenhum caso encontrado com esses filtros." />
        )}
      </div>
    </SiteLayout>
  );
}
