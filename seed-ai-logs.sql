-- ============================================================
-- Northlane AI Conversation Logs Table Setup & Seed Script
-- Run this in Supabase SQL Editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ai_conversation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text,
  topic text NOT NULL,
  user_prompt text NOT NULL,
  ai_summary text NOT NULL,
  recommended_products text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS Security Policies
ALTER TABLE public.ai_conversation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI logs"
  ON public.ai_conversation_logs FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own AI logs"
  ON public.ai_conversation_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Seed Initial AI Logs
INSERT INTO public.ai_conversation_logs (topic, user_prompt, ai_summary, recommended_products)
VALUES
  (
    'Minimalist Coding Setup',
    'Recommend silent mechanical keyboards under $250 with warm backlighting for night coding',
    'Matched Monolith Low-Profile Mechanical Keyboard with linear silent switches and CNC aluminum body.',
    ARRAY['Monolith Low-Profile Keyboard', 'Northlane Solid Oak Wool Desk Mat']
  ),
  (
    'Studio Audio & Headphone Specs',
    'Compare planar magnetic headphones vs closed-back acoustic monitors',
    'Analyzed spatial audio resolution, bass response curve, and acoustic isolation properties.',
    ARRAY['Acoustic Noise-Isolating Headphones']
  )
ON CONFLICT DO NOTHING;
