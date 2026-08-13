import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CaseRow, CaseType } from "@/lib/casos";

const LIST_COLUMNS =
  "id, slug, title, summary, case_type, uf, city, featured, published_at, image_path";

export type CaseListItem = Pick<
  CaseRow,
  | "id"
  | "slug"
  | "title"
  | "summary"
  | "case_type"
  | "uf"
  | "city"
  | "featured"
  | "published_at"
  | "image_path"
>;

async function listCases(filters: { type?: CaseType; uf?: string; featured?: boolean; limit?: number }) {
  let query = supabase
    .from("cases")
    .select(LIST_COLUMNS)
    .eq("status", "publicado")
    .order("published_at", { ascending: false });

  if (filters.type) query = query.eq("case_type", filters.type);
  if (filters.uf) query = query.eq("uf", filters.uf);
  if (filters.featured) query = query.eq("featured", true);
  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CaseListItem[];
}

export const casesQuery = (filters: { type?: CaseType; uf?: string; featured?: boolean; limit?: number } = {}) =>
  queryOptions({
    queryKey: ["cases", filters],
    queryFn: () => listCases(filters),
  });

export const caseBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["case", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("status", "publicado")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const isAdminQuery = () =>
  queryOptions({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return false;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },
  });

export const pendingCasesQuery = () =>
  queryOptions({
    queryKey: ["admin", "cases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const reportsQuery = () =>
  queryOptions({
    queryKey: ["admin", "reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
