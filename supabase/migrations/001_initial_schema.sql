-- ============================================
-- RUNASTY - Schema Inicial do Banco de Dados
-- Issue #2: Modelagem do Banco de Dados
-- ============================================
-- NOTA: Usamos NextAuth para autenticação (não Supabase Auth)
-- Por isso, strava_id é a chave primária (não UUID de auth.users)
-- ============================================

-- ============================================
-- RESET: Dropar objetos existentes para fresh start
-- ============================================
DROP VIEW IF EXISTS public.current_leaders;
DROP VIEW IF EXISTS public.current_rankings;
DROP TABLE IF EXISTS public.ranking_history CASCADE;
DROP TABLE IF EXISTS public.records CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ============================================
-- TABELA: profiles
-- Armazena dados do atleta vindos do Strava
-- Usa strava_id como identificador único (NextAuth)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    -- strava_id como chave primária (não depende de auth.users)
    strava_id BIGINT PRIMARY KEY,
    
    -- Dados do atleta do Strava
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    sex CHAR(1) CHECK (sex IN ('M', 'F') OR sex IS NULL), -- M = Masculino, F = Feminino, NULL = Não informado
    
    -- Tokens OAuth do Strava (gerenciados pelo NextAuth, mas guardamos para sync)
    strava_access_token TEXT,
    strava_refresh_token TEXT,
    strava_token_expires_at TIMESTAMPTZ,
    
    -- Controle de sincronização
    last_sync_at TIMESTAMPTZ,
    
    -- Consentimento para ranking público (Strava API Agreement Section 2.10)
    -- NULL = não perguntado, TRUE = consentiu, FALSE = recusou
    consent_public_ranking BOOLEAN DEFAULT NULL,
    consent_at TIMESTAMPTZ DEFAULT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para buscas frequentes
CREATE INDEX IF NOT EXISTS idx_profiles_sex ON public.profiles(sex);
CREATE INDEX IF NOT EXISTS idx_profiles_consent ON public.profiles(consent_public_ranking) 
    WHERE consent_public_ranking = TRUE;

-- ============================================
-- TABELA: records
-- Armazena os recordes pessoais (RPs) de cada atleta
-- Distâncias: 5k, 10k, 21k (half-marathon)
-- ============================================
CREATE TABLE IF NOT EXISTS public.records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strava_id BIGINT NOT NULL REFERENCES public.profiles(strava_id) ON DELETE CASCADE,
    
    -- Tipo de distância
    distance_type TEXT NOT NULL CHECK (distance_type IN ('5k', '10k', '21k')),
    
    -- Tempo em segundos (facilita ordenação e cálculos)
    time_seconds INTEGER NOT NULL CHECK (time_seconds > 0),
    
    -- Data em que o recorde foi alcançado (vindo do Strava)
    achieved_at DATE,
    
    -- ID da atividade no Strava (para referência)
    strava_activity_id BIGINT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Cada usuário tem apenas um recorde por distância
    UNIQUE(strava_id, distance_type)
);

-- Índices para ranking e filtros
CREATE INDEX IF NOT EXISTS idx_records_distance_type ON public.records(distance_type);
CREATE INDEX IF NOT EXISTS idx_records_time_seconds ON public.records(time_seconds);
CREATE INDEX IF NOT EXISTS idx_records_strava_distance ON public.records(strava_id, distance_type);

-- ============================================
-- TABELA: ranking_history
-- Histórico de liderança ("Rei da Montanha")
-- Registra quem foi líder e por quanto tempo
-- ============================================
CREATE TABLE IF NOT EXISTS public.ranking_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Líder e distância
    strava_id BIGINT NOT NULL REFERENCES public.profiles(strava_id) ON DELETE CASCADE,
    distance_type TEXT NOT NULL CHECK (distance_type IN ('5k', '10k', '21k')),
    
    -- Filtro de gênero (NULL = ranking geral)
    gender_filter CHAR(1) CHECK (gender_filter IN ('M', 'F') OR gender_filter IS NULL),
    
    -- Período de liderança
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ended_at TIMESTAMPTZ, -- NULL = ainda é líder
    
    -- Tempo que deu a liderança (para referência)
    record_time_seconds INTEGER NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para consultas de liderança
CREATE INDEX IF NOT EXISTS idx_ranking_history_current ON public.ranking_history(distance_type, gender_filter) 
    WHERE ended_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ranking_history_strava ON public.ranking_history(strava_id);

-- ============================================
-- FUNÇÃO: Atualizar updated_at automaticamente
-- SECURITY INVOKER + search_path fixo para segurança
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_records_updated ON public.records;
CREATE TRIGGER on_records_updated
    BEFORE UPDATE ON public.records
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Usamos service_role key para operações do backend
-- RLS permite leitura pública, escrita APENAS via service_role
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranking_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES: Apenas leitura pública
-- Escrita bloqueada para anon (só service_role pode escrever)
-- ============================================
CREATE POLICY "profiles_select_policy"
    ON public.profiles FOR SELECT
    USING (true);

-- NOTA: Sem políticas de INSERT/UPDATE/DELETE = bloqueado para anon
-- service_role bypassa RLS automaticamente

-- ============================================
-- RECORDS: Apenas leitura pública
-- Escrita bloqueada para anon (só service_role pode escrever)
-- ============================================
CREATE POLICY "records_select_policy"
    ON public.records FOR SELECT
    USING (true);

-- NOTA: Sem políticas de INSERT/UPDATE/DELETE = bloqueado para anon
-- service_role bypassa RLS automaticamente

-- ============================================
-- RANKING_HISTORY: Apenas leitura pública
-- Escrita bloqueada para anon (só service_role pode escrever)
-- ============================================
CREATE POLICY "ranking_history_select_policy"
    ON public.ranking_history FOR SELECT
    USING (true);

-- NOTA: Sem políticas de INSERT/UPDATE/DELETE = bloqueado para anon
-- service_role bypassa RLS automaticamente

-- ============================================
-- VIEWS ÚTEIS
-- Usando security_invoker para respeitar RLS
-- ============================================

-- View: Ranking atual por distância (SECURITY INVOKER)
CREATE OR REPLACE VIEW public.current_rankings
WITH (security_invoker = true)
AS
SELECT 
    r.id,
    r.strava_id,
    r.distance_type,
    r.time_seconds,
    r.achieved_at,
    p.full_name,
    p.username,
    p.avatar_url,
    p.sex,
    ROW_NUMBER() OVER (
        PARTITION BY r.distance_type 
        ORDER BY r.time_seconds ASC
    ) as position
FROM public.records r
JOIN public.profiles p ON r.strava_id = p.strava_id
ORDER BY r.distance_type, r.time_seconds;

-- View: Líderes atuais (Reis da Montanha) (SECURITY INVOKER)
CREATE OR REPLACE VIEW public.current_leaders
WITH (security_invoker = true)
AS
SELECT 
    rh.id,
    rh.strava_id,
    rh.distance_type,
    rh.gender_filter,
    rh.started_at,
    rh.record_time_seconds,
    p.full_name,
    p.username,
    p.avatar_url,
    NOW() - rh.started_at as time_as_leader
FROM public.ranking_history rh
JOIN public.profiles p ON rh.strava_id = p.strava_id
WHERE rh.ended_at IS NULL;

-- ============================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================
COMMENT ON TABLE public.profiles IS 'Perfis dos atletas, identificados pelo strava_id (NextAuth)';
COMMENT ON TABLE public.records IS 'Recordes pessoais (RPs) dos atletas por distância';
COMMENT ON TABLE public.ranking_history IS 'Histórico de liderança no ranking (Rei da Montanha)';

COMMENT ON COLUMN public.profiles.strava_id IS 'ID do atleta no Strava, usado como chave primária';
COMMENT ON COLUMN public.profiles.sex IS 'Gênero: M=Masculino, F=Feminino, NULL=Não informado';
COMMENT ON COLUMN public.profiles.consent_public_ranking IS 'Consentimento explícito para exibição no ranking público. NULL=não perguntado, TRUE=consentiu, FALSE=recusou';
COMMENT ON COLUMN public.profiles.consent_at IS 'Data/hora em que o usuário deu ou revogou o consentimento';
COMMENT ON COLUMN public.records.time_seconds IS 'Tempo do recorde em segundos para facilitar ordenação';
COMMENT ON COLUMN public.ranking_history.ended_at IS 'NULL indica que ainda é o líder atual';
