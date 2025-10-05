BEGIN;

-- 1️⃣ Cria o tipo ENUM, se ainda não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'appointment_status_type'
    ) THEN
        CREATE TYPE appointment_status_type AS ENUM ('Agendado', 'Concluído', 'Cancelado', 'No-Show');
    END IF;
END$$;

-- 2️⃣ Remove o DEFAULT temporariamente (para evitar o erro)
ALTER TABLE appointments
    ALTER COLUMN status DROP DEFAULT;

-- 3️⃣ Altera a coluna "status" para usar o novo tipo ENUM
ALTER TABLE appointments
    ALTER COLUMN status TYPE appointment_status_type USING
        CASE
            WHEN status ILIKE 'Agendado' THEN 'Agendado'::appointment_status_type
            WHEN status ILIKE 'Concluído' THEN 'Concluído'::appointment_status_type
            WHEN status ILIKE 'Cancelado' THEN 'Cancelado'::appointment_status_type
            WHEN status ILIKE 'No-Show' THEN 'No-Show'::appointment_status_type
            ELSE 'Agendado'::appointment_status_type
        END;

-- 4️⃣ Define novamente o DEFAULT já no novo tipo ENUM
ALTER TABLE appointments
    ALTER COLUMN status SET DEFAULT 'Agendado'::appointment_status_type;

-- 5️⃣ Cria (se não existir) a coluna de rastreio de mudança de status
ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 6️⃣ Atualiza registros antigos sem data
UPDATE appointments
SET status_changed_at = NOW()
WHERE status_changed_at IS NULL;

-- 7️⃣ Documenta a coluna (opcional)
COMMENT ON COLUMN appointments.status IS
'Status do agendamento: Agendado, Concluído, Cancelado, ou No-Show';

COMMIT;