import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteLayout } from "@/components/SiteLayout";
import { LEIS } from "@/lib/casos";

const title = "Sobre o projeto — Pata Vigilante";
const description =
  "Como funciona o Pata Vigilante: envio anônimo, revisão dos casos e encaminhamento das denúncias às autoridades.";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: SobrePage,
});

function SobrePage() {
  return (
    <SiteLayout>
      <h1 className="font-display text-3xl font-semibold">Sobre o projeto</h1>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-foreground">
        <p>
          O Pata Vigilante é um site informativo, no formato de blog, dedicado a casos de tráfico e
          maus-tratos de animais no Brasil. Reunimos relatos, contextualizamos e organizamos as
          ocorrências por região e por tipo de crime.
        </p>
        <p>
          Qualquer pessoa pode contribuir de forma anônima: nenhum campo do site pede nome, e-mail ou
          telefone, e não guardamos dados que identifiquem quem envia.
        </p>
      </div>

      <h2 className="mt-10 font-display text-2xl font-semibold">Como funciona</h2>
      <ol className="mt-4 space-y-3 text-base">
        <li className="rounded-lg border border-border bg-card p-4">
          <span className="font-semibold">1. Envio anônimo.</span> Você envia uma denúncia ou um relato de
          caso informando apenas a região.
        </li>
        <li className="rounded-lg border border-border bg-card p-4">
          <span className="font-semibold">2. Revisão.</span> Todo envio entra como pendente e passa por
          análise antes de aparecer no site.
        </li>
        <li className="rounded-lg border border-border bg-card p-4">
          <span className="font-semibold">3. Publicação e encaminhamento.</span> Casos aprovados são
          publicados; denúncias aprovadas são encaminhadas à polícia pelo 190, com base nas leis nº
          9.605/1998 e nº 14.064/2020.
        </li>
      </ol>

      <h2 className="mt-10 font-display text-2xl font-semibold">A legislação</h2>
      <ul className="mt-4 space-y-3">
        {LEIS.map((lei) => (
          <li key={lei.titulo} className="rounded-lg border border-border bg-card p-4">
            <p className="font-semibold">{lei.titulo}</p>
            <p className="mt-1 text-sm text-muted-foreground">{lei.texto}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 font-display text-2xl font-semibold">Onde denunciar diretamente</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-base">
        <li>Polícia Militar: 190 (flagrante e emergências).</li>
        <li>Polícia Ambiental do seu estado.</li>
        <li>IBAMA: linha verde 0800 61 8080 (crimes ambientais e fauna silvestre).</li>
        <li>Ministério Público estadual, por meio da ouvidoria.</li>
      </ul>

      <p className="mt-8">
        <Link to="/denuncia" className="font-semibold text-primary hover:underline">
          Fazer uma denúncia anônima
        </Link>
      </p>
    </SiteLayout>
  );
}
