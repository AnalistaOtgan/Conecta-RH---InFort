// services/supabaseClient.ts

// @ts-ignore - Supabase is loaded via script tag
const { createClient } = supabase;

// Cole sua URL e chave anon aqui
const supabaseUrl = 'https://esbdbddnfzvujquiotim.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzYmRiZGRuZnp2dWpxdWlvdGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3OTg2MzQsImV4cCI6MjA3NTM3NDYzNH0.VUcUB71-7mtWTCUwaUc56AgK8TWknZbhIfNI_m9s0tU';

// ATENÇÃO: Em um projeto real com um sistema de build,
// estas chaves deveriam estar em variáveis de ambiente (.env).
// Nunca envie estas chaves para um repositório público.

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
