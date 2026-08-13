import type { Database } from "@/integrations/supabase/types";

export type CaseType = Database["public"]["Enums"]["case_type"];
export type CaseStatus = Database["public"]["Enums"]["case_status"];
export type CaseRow = Database["public"]["Tables"]["cases"]["Row"];
export type ReportRow = Database["public"]["Tables"]["reports"]["Row"];

export const CASE_TYPES: { value: CaseType; label: string; short: string; description: string }[] = [
  {
    value: "caca",
    label: "Caça",
    short: "Caça",
    description: "Captura e abate de animais silvestres, armadilhas e caça esportiva.",
  },
  {
    value: "criacao_abusiva",
    label: "Criação abusiva e intensiva",
    short: "Criação abusiva",
    description: "Criadouros clandestinos, reprodução forçada e confinamento de animais de companhia.",
  },
  {
    value: "comercializacao_ilegal",
    label: "Comercialização ilegal",
    short: "Comércio ilegal",
    description: "Tráfico e venda de animais silvestres em feiras, rodovias e pela internet.",
  },
  {
    value: "distincao_racas",
    label: "Crime por distinção de raças",
    short: "Distinção de raças",
    description: "Violência e descarte motivados pela valorização de determinadas raças.",
  },
  {
    value: "agropecuaria_intensiva",
    label: "Sistema intensivo na agropecuária",
    short: "Agropecuária intensiva",
    description: "Confinamento extremo, superlotação e manejo cruel na produção animal.",
  },
  {
    value: "esporte",
    label: "Animais utilizados para esporte",
    short: "Esporte",
    description: "Rinhas, vaquejadas, corridas e outras práticas de entretenimento com animais.",
  },
];

export const CASE_TYPE_LABEL: Record<CaseType, string> = CASE_TYPES.reduce(
  (acc, t) => ({ ...acc, [t.value]: t.label }),
  {} as Record<CaseType, string>,
);

export function isCaseType(value: string): value is CaseType {
  return CASE_TYPES.some((t) => t.value === value);
}

export const UFS: { uf: string; nome: string; regiao: string }[] = [
  { uf: "AC", nome: "Acre", regiao: "Norte" },
  { uf: "AL", nome: "Alagoas", regiao: "Nordeste" },
  { uf: "AP", nome: "Amapá", regiao: "Norte" },
  { uf: "AM", nome: "Amazonas", regiao: "Norte" },
  { uf: "BA", nome: "Bahia", regiao: "Nordeste" },
  { uf: "CE", nome: "Ceará", regiao: "Nordeste" },
  { uf: "DF", nome: "Distrito Federal", regiao: "Centro-Oeste" },
  { uf: "ES", nome: "Espírito Santo", regiao: "Sudeste" },
  { uf: "GO", nome: "Goiás", regiao: "Centro-Oeste" },
  { uf: "MA", nome: "Maranhão", regiao: "Nordeste" },
  { uf: "MT", nome: "Mato Grosso", regiao: "Centro-Oeste" },
  { uf: "MS", nome: "Mato Grosso do Sul", regiao: "Centro-Oeste" },
  { uf: "MG", nome: "Minas Gerais", regiao: "Sudeste" },
  { uf: "PA", nome: "Pará", regiao: "Norte" },
  { uf: "PB", nome: "Paraíba", regiao: "Nordeste" },
  { uf: "PR", nome: "Paraná", regiao: "Sul" },
  { uf: "PE", nome: "Pernambuco", regiao: "Nordeste" },
  { uf: "PI", nome: "Piauí", regiao: "Nordeste" },
  { uf: "RJ", nome: "Rio de Janeiro", regiao: "Sudeste" },
  { uf: "RN", nome: "Rio Grande do Norte", regiao: "Nordeste" },
  { uf: "RS", nome: "Rio Grande do Sul", regiao: "Sul" },
  { uf: "RO", nome: "Rondônia", regiao: "Norte" },
  { uf: "RR", nome: "Roraima", regiao: "Norte" },
  { uf: "SC", nome: "Santa Catarina", regiao: "Sul" },
  { uf: "SP", nome: "São Paulo", regiao: "Sudeste" },
  { uf: "SE", nome: "Sergipe", regiao: "Nordeste" },
  { uf: "TO", nome: "Tocantins", regiao: "Norte" },
];

export const REGIOES = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"] as const;

export function ufNome(uf: string) {
  return UFS.find((u) => u.uf === uf)?.nome ?? uf;
}

export function localLabel(uf: string, city: string | null) {
  return city ? `${city} — ${uf}` : ufNome(uf);
}

export function formatarData(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(
    new Date(value),
  );
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const LEIS = [
  {
    titulo: "Lei nº 9.605/1998",
    texto:
      "Lei de Crimes Ambientais. Praticar abuso, maus-tratos, ferir ou mutilar animais silvestres, domésticos, nativos ou exóticos é crime.",
  },
  {
    titulo: "Lei nº 14.064/2020",
    texto:
      "Aumenta a pena para maus-tratos contra cães e gatos: reclusão de 2 a 5 anos, multa e proibição de guarda.",
  },
];
