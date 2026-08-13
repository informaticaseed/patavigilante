import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const BUCKET_IMAGENS = "imagens-casos";

export function useImagemUrl(path: string | null | undefined) {
  const { data } = useQuery({
    queryKey: ["imagem", path],
    enabled: Boolean(path),
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(BUCKET_IMAGENS)
        .createSignedUrl(path as string, 60 * 60);
      if (error) return null;
      return data?.signedUrl ?? null;
    },
  });
  return data ?? null;
}

export async function enviarImagemCaso(file: File) {
  const extensao = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const nome = `${crypto.randomUUID()}.${extensao}`;
  const { error } = await supabase.storage.from(BUCKET_IMAGENS).upload(nome, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return nome;
}
