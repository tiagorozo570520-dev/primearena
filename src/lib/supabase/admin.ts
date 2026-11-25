import { createClient } from '@supabase/supabase-js'

/**
 * Admin client - ONLY use on the server.
 * Uses the Secret Key for full privileges (Storage, RLS bypass when needed).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY

  if (!url || !secretKey) {
    throw new Error('Missing Supabase admin environment variables')
  }

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
