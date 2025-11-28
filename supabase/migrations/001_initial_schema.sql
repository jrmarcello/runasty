-- ============================================
-- RUNASTY - Schema Inicial do Banco de Dados
-- Issue #2: Modelagem do Banco de Dados
-- ============================================

-- ============================================
-- TABELA: profiles
-- Extensão da tabela auth.users do Supabase
-- Armazena dados do atleta vindos do Strava
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Dados do Strava
    strava_id BIGINT UNIQUE,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    sex CHAR(1) CHECK (sex IN ('M', 'F') OR sex IS NULL), -- M = Masculino, F = Feminino, NULL = Não informado
    
    -- Tokens OAuth do Strava (para sincronização futura)
    strava_access_token TEXT,
    strava_refresh_token TEXT,
    strava_token_expires_at TIMESTAMPTZ,
    
    -- Controle de sincronização
    last_sync_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para buscas frequentes
CREATE INDEX IF NOT EXISTS idx_profiles_strava_id ON public.profiles(strava_id);
CREATE INDEX IF NOT EXISTS idx_profiles_sex ON public.profiles(sex);

-- ============================================
-- TABELA: records
-- Armazena os recordes pessoais (RPs) de cada atleta
-- Distâncias: 5k, 10k, 21k (half-marathon)
-- ============================================
CREATE TABLE IF NOT EXISTS public.records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
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
    UNIQUE(user_id, distance_type)
);

-- Índices para ranking e filtros
CREATE INDEX IF NOT EXISTS idx_records_distance_type ON public.records(distance_type);
CREATE INDEX IF NOT EXISTS idx_records_time_seconds ON public.records(time_seconds);
CREATE INDEX IF NOT EXISTS idx_records_user_distance ON public.records(user_id, distance_type);

-- ============================================
-- TABELA: ranking_history
-- Histórico de liderança ("Rei da Montanha")
-- Registra quem foi líder e por quanto tempo
-- ============================================
CREATE TABLE IF NOT EXISTS public.ranking_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Líder e distância
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_ranking_history_user ON public.ranking_history(user_id);

-- ============================================
-- FUNÇÃO: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
-- FUNÇÃO: Criar perfil automaticamente após signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil após signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranking_history ENABLE ROW LEVEL SECURITY;

-- PROFILES: Usuários podem ver todos os perfis, mas só editar o próprio
CREATE POLICY "Perfis são visíveis para todos"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Usuários podem editar próprio perfil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- RECORDS: Todos podem ver, apenas o próprio usuário pode modificar
CREATE POLICY "Records são visíveis para todos"
    ON public.records FOR SELECT
    USING (true);

CREATE POLICY "Usuários podem inserir próprios records"
    ON public.records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar próprios records"
    ON public.records FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar próprios records"
    ON public.records FOR DELETE
    USING (auth.uid() = user_id);

-- RANKING_HISTORY: Apenas leitura para todos (sistema gerencia)
CREATE POLICY "Histórico de ranking é visível para todos"
    ON public.ranking_history FOR SELECT
    USING (true);

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View: Ranking atual por distância
CREATE OR REPLACE VIEW public.current_rankings AS
SELECT 
    r.id,
    r.user_id,
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
JOIN public.profiles p ON r.user_id = p.id
ORDER BY r.distance_type, r.time_seconds;

-- View: Líderes atuais (Reis da Montanha)
CREATE OR REPLACE VIEW public.current_leaders AS
SELECT 
    rh.id,
    rh.user_id,
    rh.distance_type,
    rh.gender_filter,
    rh.started_at,
    rh.record_time_seconds,
    p.full_name,
    p.username,
    p.avatar_url,
    NOW() - rh.started_at as time_as_leader
FROM public.ranking_history rh
JOIN public.profiles p ON rh.user_id = p.id
WHERE rh.ended_at IS NULL;

-- ============================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================
COMMENT ON TABLE public.profiles IS 'Perfis dos atletas, extensão de auth.users';
COMMENT ON TABLE public.records IS 'Recordes pessoais (RPs) dos atletas por distância';
COMMENT ON TABLE public.ranking_history IS 'Histórico de liderança no ranking (Rei da Montanha)';

COMMENT ON COLUMN public.profiles.sex IS 'Gênero: M=Masculino, F=Feminino, NULL=Não informado';
COMMENT ON COLUMN public.records.time_seconds IS 'Tempo do recorde em segundos para facilitar ordenação';
COMMENT ON COLUMN public.ranking_history.ended_at IS 'NULL indica que ainda é o líder atual';
