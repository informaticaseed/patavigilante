# Site informativo sobre tráfico e maus-tratos de animais

Um blog de denúncia com envio anônimo de casos, moderação antes da publicação e navegação por região e tipo de crime.

## Estrutura de páginas

- **/** — Home: manchete, casos em destaque, últimos casos publicados.
- **/casos** — Todos os casos com filtros por região e tipo.
- **/casos/$slug** — Página do caso.
- **/destaques** — Casos em destaque.
- **/regioes** e **/regioes/$uf** — Casos agrupados por região/estado.
- **/tipos/$tipo** — Casos por tipo: caça, criação abusiva e intensiva, comercialização ilegal, crime por distinção de raças, sistema intensivo na agropecuária, animais utilizados para esporte.
- **/denuncia** — Formulário de denúncia anônima (não vira post; vai para a caixa de moderação).
- **/enviar-caso** — Post anônimo sobre um novo caso, pedindo apenas região (estado/município) além do relato.
- **/sobre** — O que é o projeto e como denunciar aos órgãos oficiais.
- **/admin** — Área protegida por login para aprovar, editar, destacar ou recusar envios.

## Barra lateral direita

Coluna fixa em todas as páginas (vira menu recolhível no celular), com:
denúncia anônima, postar novo caso, casos em destaque, casos por região e a lista dos seis tipos de caso.

## Fluxo de envio e moderação

1. Visitante envia denúncia ou caso sem se identificar — nenhum dado pessoal é pedido ou gravado.
2. O envio entra como "pendente" e não aparece no site.
3. No /admin, o responsável revisa, edita o texto, define tipo/região, publica ou recusa.
4. Só então o caso aparece nas listagens públicas.

## Visual

Paleta acolhedora e natural: verde profundo #254B3A, areia #FBF7F0, verde claro #7FA97A e âmbar #E0A33E, com tipografia editorial e boa legibilidade em textos longos. Sem tom sensacionalista; imagens de apoio ilustrativas.

## Detalhes técnicos

- Ativação do Lovable Cloud (banco + login do administrador).
- Tabelas: `cases` (título, relato, tipo, uf, município, status pendente/publicado/recusado, destaque, slug, datas), `reports` (denúncias anônimas, status), `user_roles` + função `has_role` para o papel de admin.
- RLS: leitura pública apenas de casos publicados; inserção anônima permitida com status forçado para pendente; leitura/edição total só para admin. Nenhum IP, e-mail ou identificador do denunciante é armazenado.
- Validação com zod no cliente e limites de tamanho no servidor; proteção simples contra envios repetidos.
- SEO por rota: título, descrição e og tags próprios em cada página; sitemap e dados estruturados de artigo nas páginas de caso.
- Conteúdo inicial: alguns casos de exemplo já publicados via migração para o site não nascer vazio.

## Fora deste escopo agora

Comentários de leitores, newsletter e mapa interativo — podem vir depois.
