/**
 * saveTestResult
 * ─────────────────────────────────────────────────────────────────────────────
 * Saves a completed typing test attempt to the Supabase `TestAttempts` table.
 *
 * REQUIRED SUPABASE TABLE  (run once in the SQL Editor):
 * ─────────────────────────────────────────────────────
 * create table public."TestAttempts" (
 *   id              uuid primary key default gen_random_uuid(),
 *   user_id         text        not null,
 *   exercise_id     text        not null,
 *   wpm             numeric     not null,
 *   accuracy        numeric     not null,
 *   mistakes_count  int         not null default 0,
 *   attempted_text  text        not null,
 *   original_text   text        not null,
 *   created_at      timestamptz not null default now()
 * );
 *
 * -- Enable Row-Level Security (recommended)
 * alter table public."TestAttempts" enable row level security;
 *
 * -- Allow authenticated users to insert and read their own rows
 * create policy "Users can insert own attempts"
 *   on public."TestAttempts" for insert
 *   with check (auth.uid()::text = user_id);
 *
 * create policy "Users can view own attempts"
 *   on public."TestAttempts" for select
 *   using (auth.uid()::text = user_id);
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{
 *   userId:        string,
 *   exerciseId:    string,
 *   wpm:           number,
 *   accuracy:      number,
 *   attemptedText: string,
 *   originalText:  string,
 *   mistakesCount: number,
 * }} params
 *
 * @returns {Promise<{ attemptId: string }>}
 * @throws  {Error} with a descriptive message when the insert fails
 */
export async function saveTestResult(supabase, {
  userId,
  exerciseId,
  wpm,
  accuracy,
  attemptedText,
  originalText,
  mistakesCount,
}) {
  /* ── Input validation ──────────────────────────────────────── */
  if (!userId)        throw new Error('saveTestResult: userId is required.');
  if (!exerciseId)    throw new Error('saveTestResult: exerciseId is required.');
  if (typeof wpm !== 'number')      throw new Error('saveTestResult: wpm must be a number.');
  if (typeof accuracy !== 'number') throw new Error('saveTestResult: accuracy must be a number.');
  if (!attemptedText) throw new Error('saveTestResult: attemptedText is required.');
  if (!originalText)  throw new Error('saveTestResult: originalText is required.');

  /* ── Build row ─────────────────────────────────────────────── */
  const row = {
    user_id:        userId,
    exercise_id:    exerciseId,
    wpm:            Math.round(wpm),
    accuracy:       parseFloat(accuracy.toFixed(2)),
    mistakes_count: mistakesCount ?? 0,
    attempted_text: attemptedText,
    original_text:  originalText,
    // created_at is auto-set by Supabase default
  };

  /* ── Insert into Supabase ─────────────────────────────────── */
  const { data, error } = await supabase
    .from('TestAttempts')
    .insert(row)
    .select('id')          // return only the new row's id
    .single();             // expect exactly one row back

  if (error) {
    console.error('[saveTestResult] Supabase error:', error);
    throw new Error(error.message || 'Failed to save test result.');
  }

  return { attemptId: data.id };
}

/**
 * fetchTestResult
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches a single attempt row by its UUID primary key.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} attemptId  UUID of the TestAttempts row
 * @returns {Promise<Object>} The raw row from Supabase
 */
export async function fetchTestResult(supabase, attemptId) {
  if (!attemptId) throw new Error('fetchTestResult: attemptId is required.');

  const { data, error } = await supabase
    .from('TestAttempts')
    .select('*')
    .eq('id', attemptId)
    .single();

  if (error) {
    console.error('[fetchTestResult] Supabase error:', error);
    throw new Error(error.message || 'Failed to fetch test result.');
  }

  return data;
}
