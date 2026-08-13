CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TYPE public.case_type AS ENUM (
  'caca',
  'criacao_abusiva',
  'comercializacao_ilegal',
  'distincao_racas',
  'agropecuaria_intensiva',
  'esporte'
);

CREATE TYPE public.case_status AS ENUM ('pendente', 'publicado', 'recusado');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Usuarios veem os proprios papeis"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  title text NOT NULL,
  summary text,
  body text NOT NULL,
  case_type public.case_type NOT NULL,
  uf text NOT NULL,
  city text,
  source_url text,
  status public.case_status NOT NULL DEFAULT 'pendente',
  featured boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.cases TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cases TO authenticated;
GRANT ALL ON public.cases TO service_role;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Casos publicados sao publicos"
ON public.cases FOR SELECT TO anon, authenticated
USING (status = 'publicado');

CREATE POLICY "Admins veem todos os casos"
ON public.cases FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Qualquer um pode enviar caso pendente"
ON public.cases FOR INSERT TO anon, authenticated
WITH CHECK (status = 'pendente' AND featured = false AND published_at IS NULL);

CREATE POLICY "Admins editam casos"
ON public.cases FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins apagam casos"
ON public.cases FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  case_type public.case_type,
  uf text NOT NULL,
  city text,
  status public.case_status NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.reports TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode denunciar"
ON public.reports FOR INSERT TO anon, authenticated
WITH CHECK (status = 'pendente');

CREATE POLICY "Admins leem denuncias"
ON public.reports FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins atualizam denuncias"
ON public.reports FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins apagam denuncias"
ON public.reports FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER cases_set_updated_at
BEFORE UPDATE ON public.cases
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.cases (slug, title, summary, body, case_type, uf, city, status, featured, published_at) VALUES
('rede-de-trafico-de-aves-silvestres-desarticulada-no-agreste', 'Rede de tráfico de aves silvestres é desarticulada no agreste', 'Mais de 300 pássaros silvestres foram apreendidos em uma operação que investigava a captura e venda de animais em feiras livres da região.', E'Uma operação de fiscalização ambiental interrompeu uma rota de tráfico de aves silvestres que abastecia feiras livres da região. Foram apreendidos mais de 300 pássaros, entre eles espécies ameaçadas de extinção, mantidos em gaiolas superlotadas e sem água.\n\nSegundo relatos de moradores, a captura acontecia de madrugada em áreas de mata próximas a pequenas propriedades rurais. As aves eram transportadas em caixas fechadas, o que provoca alta mortalidade antes mesmo da venda.\n\nOs animais resgatados passaram por avaliação veterinária e os que apresentaram condições de sobrevivência foram encaminhados para soltura monitorada. O caso segue sob investigação.', 'comercializacao_ilegal', 'PE', 'Caruaru', 'publicado', true, now() - interval '2 days'),
('caes-encontrados-em-criadouro-clandestino-sem-agua-nem-abrigo', 'Cães encontrados em criadouro clandestino sem água nem abrigo', 'Denúncia anônima levou fiscais a um criadouro com dezenas de fêmeas mantidas em reprodução contínua.', E'Uma denúncia anônima levou equipes de fiscalização a um criadouro clandestino onde dezenas de fêmeas eram mantidas em reprodução contínua, sem descanso entre as ninhadas.\n\nOs animais estavam alojados em baias sem cobertura adequada, expostos ao sol e à chuva, e vários apresentavam desnutrição, feridas e doenças de pele. Filhotes eram separados das mães precocemente para venda pela internet.\n\nO local foi interditado e os animais encaminhados a protetores independentes. A criação intensiva de animais de companhia para venda é uma das formas mais comuns de maus-tratos e costuma passar despercebida por acontecer dentro de propriedades privadas.', 'criacao_abusiva', 'SP', 'Sorocaba', 'publicado', true, now() - interval '6 days'),
('rinha-de-galo-interrompida-em-propriedade-rural', 'Rinha de galo é interrompida em propriedade rural', 'Prática criminosa movimentava apostas e deixou dezenas de aves feridas.', E'Uma rinha de galos em andamento foi interrompida em uma propriedade rural. As aves são treinadas para o confronto e recebem esporas artificiais, o que provoca ferimentos profundos e morte durante as lutas.\n\nO uso de animais em atividades de entretenimento e apostas é crime no Brasil, mas continua acontecendo em eventos clandestinos organizados por grupos fechados.\n\nAs aves sobreviventes foram recolhidas e receberam atendimento veterinário. Denúncias sobre esse tipo de evento podem ser feitas de forma totalmente anônima.', 'esporte', 'MG', 'Uberaba', 'publicado', false, now() - interval '11 days'),
('caca-ilegal-de-mamiferos-em-area-de-protecao-ambiental', 'Caça ilegal de mamíferos em área de proteção ambiental', 'Armadilhas foram localizadas dentro dos limites de uma unidade de conservação.', E'Armadilhas artesanais foram localizadas dentro dos limites de uma unidade de conservação, indicando atividade de caça ilegal de mamíferos de médio porte.\n\nAs armadilhas causam sofrimento prolongado: o animal fica preso por horas ou dias até a chegada do caçador. Filhotes que dependem da mãe morrem em seguida, mesmo sem terem sido capturados.\n\nA fiscalização reforçou o monitoramento na área. Informações sobre movimentação suspeita podem ser enviadas de forma anônima por este site.', 'caca', 'MT', 'Chapada dos Guimarães', 'publicado', false, now() - interval '20 days'),
('galpao-de-producao-intensiva-e-autuado-por-superlotacao', 'Galpão de produção intensiva é autuado por superlotação', 'Animais sem espaço para se movimentar e ventilação insuficiente motivaram a autuação.', E'Um galpão de produção animal foi autuado após inspeção constatar superlotação, ventilação insuficiente e ausência de manejo adequado de animais doentes.\n\nNo sistema intensivo, os animais passam a vida inteira confinados em espaços onde não conseguem se virar ou esticar o corpo. Lesões, estresse crônico e mortalidade elevada são consequências diretas do modelo.\n\nA autuação prevê prazo para adequação das instalações. O caso reacende o debate sobre bem-estar animal na cadeia produtiva.', 'agropecuaria_intensiva', 'PR', 'Cascavel', 'publicado', false, now() - interval '30 days'),
('abandono-em-massa-de-caes-sem-raca-definida-em-estrada-vicinal', 'Abandono em massa de cães sem raça definida em estrada vicinal', 'Animais foram descartados por não terem valor comercial de revenda.', E'Um grupo de cães sem raça definida foi abandonado em uma estrada vicinal, aparentemente descartado por não ter valor comercial de revenda.\n\nA distinção por raça é um motor silencioso da violência contra animais: cães e gatos considerados "de raça" são supervalorizados e criados de forma abusiva, enquanto os demais são descartados, envenenados ou deixados à própria sorte.\n\nMoradores da região resgataram parte dos animais. Os demais seguem desaparecidos.', 'distincao_racas', 'BA', 'Feira de Santana', 'publicado', false, now() - interval '45 days');