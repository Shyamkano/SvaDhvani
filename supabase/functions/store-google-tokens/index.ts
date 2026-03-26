import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    // 1. Create a Supabase client with the user's authentication token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 2. Get the user from the token
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("User not found");

    // 3. Get the tokens from the request body
    const { access_token, refresh_token, expires_in } = await req.json();
    if (!refresh_token) throw new Error("Missing refresh token");
    
    const expires_at = new Date(Date.now() + expires_in * 1000).toISOString();

    // 4. Upsert (insert or update) the tokens into the database
    // The RPC call will automatically encrypt the refresh token
    const { error } = await supabaseClient.rpc('store_google_refresh_token', {
      user_id: user.id,
      p_access_token: access_token,
      p_refresh_token: refresh_token,
      p_expires_at: expires_at
    });
    
    if (error) throw error;

    return new Response(JSON.stringify({ message: "Tokens stored successfully" }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})