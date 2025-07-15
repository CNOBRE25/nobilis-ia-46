-- Create enums
CREATE TYPE public.user_role AS ENUM ('admin', 'lawyer', 'client');
CREATE TYPE public.opinion_status AS ENUM ('draft', 'review', 'finalized', 'archived');
CREATE TYPE public.interaction_type AS ENUM ('generation', 'refinement', 'summary', 'question');

-- Create users table (profiles linked to auth.users)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'lawyer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  phone_number VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create legal_areas table
CREATE TABLE public.legal_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create legal_opinions table
CREATE TABLE public.legal_opinions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status opinion_status NOT NULL DEFAULT 'draft',
  client_id UUID NOT NULL REFERENCES public.clients(id),
  author_id UUID NOT NULL REFERENCES public.users(id),
  legal_area_id UUID NOT NULL REFERENCES public.legal_areas(id),
  finalized_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create opinion_versions table
CREATE TABLE public.opinion_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opinion_id UUID NOT NULL REFERENCES public.legal_opinions(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  editor_id UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(opinion_id, version_number)
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opinion_id UUID REFERENCES public.legal_opinions(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by_id UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ai_interactions table
CREATE TABLE public.ai_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opinion_id UUID REFERENCES public.legal_opinions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  prompt_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  model_used VARCHAR(100) NOT NULL,
  interaction_type interaction_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_auth_id ON public.users(auth_id);
CREATE INDEX idx_legal_areas_name ON public.legal_areas(name);
CREATE INDEX idx_legal_opinions_client_id ON public.legal_opinions(client_id);
CREATE INDEX idx_legal_opinions_author_id ON public.legal_opinions(author_id);
CREATE INDEX idx_legal_opinions_legal_area_id ON public.legal_opinions(legal_area_id);
CREATE INDEX idx_legal_opinions_status ON public.legal_opinions(status);
CREATE INDEX idx_documents_opinion_id ON public.documents(opinion_id);
CREATE INDEX idx_ai_interactions_opinion_id ON public.ai_interactions(opinion_id);
CREATE INDEX idx_ai_interactions_user_id ON public.ai_interactions(user_id);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_opinions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opinion_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id);

-- Clients policies (lawyers and admins can manage)
CREATE POLICY "Lawyers and admins can view clients" ON public.clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() 
      AND role IN ('lawyer', 'admin')
    )
  );

CREATE POLICY "Lawyers and admins can manage clients" ON public.clients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() 
      AND role IN ('lawyer', 'admin')
    )
  );

-- Legal areas policies (all authenticated users can view, only admins can modify)
CREATE POLICY "Authenticated users can view legal areas" ON public.legal_areas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage legal areas" ON public.legal_areas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Legal opinions policies
CREATE POLICY "Users can view opinions they authored or are assigned to" ON public.legal_opinions
  FOR SELECT USING (
    author_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Lawyers can create opinions" ON public.legal_opinions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() 
      AND role IN ('lawyer', 'admin')
      AND id = author_id
    )
  );

CREATE POLICY "Authors can update their opinions" ON public.legal_opinions
  FOR UPDATE USING (
    author_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Opinion versions policies
CREATE POLICY "Users can view versions of accessible opinions" ON public.opinion_versions
  FOR SELECT USING (
    opinion_id IN (
      SELECT id FROM public.legal_opinions
      WHERE author_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.users 
        WHERE auth_id = auth.uid() 
        AND role = 'admin'
      )
    )
  );

CREATE POLICY "Users can create versions for accessible opinions" ON public.opinion_versions
  FOR INSERT WITH CHECK (
    opinion_id IN (
      SELECT id FROM public.legal_opinions
      WHERE author_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.users 
        WHERE auth_id = auth.uid() 
        AND role = 'admin'
      )
    )
    AND editor_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

-- Documents policies
CREATE POLICY "Users can view documents for accessible opinions" ON public.documents
  FOR SELECT USING (
    opinion_id IS NULL 
    OR opinion_id IN (
      SELECT id FROM public.legal_opinions
      WHERE author_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.users 
        WHERE auth_id = auth.uid() 
        AND role = 'admin'
      )
    )
  );

CREATE POLICY "Users can upload documents" ON public.documents
  FOR INSERT WITH CHECK (
    uploaded_by_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

-- AI interactions policies
CREATE POLICY "Users can view their own AI interactions" ON public.ai_interactions
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can create AI interactions" ON public.ai_interactions
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legal_areas_updated_at
  BEFORE UPDATE ON public.legal_areas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legal_opinions_updated_at
  BEFORE UPDATE ON public.legal_opinions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_opinion_versions_updated_at
  BEFORE UPDATE ON public.opinion_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Create storage policies
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view documents they have access to"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Insert some default legal areas
INSERT INTO public.legal_areas (name, description) VALUES
  ('Direito Civil', 'Questões relacionadas a direitos e obrigações de pessoas físicas e jurídicas'),
  ('Direito Penal', 'Matéria criminal e infrações penais'),
  ('Direito Tributário', 'Questões fiscais e tributárias'),
  ('Direito Trabalhista', 'Relações de trabalho e direitos do trabalhador'),
  ('Direito Empresarial', 'Questões societárias e empresariais'),
  ('Direito Administrativo', 'Relações com a administração pública'),
  ('Direito Constitucional', 'Questões constitucionais e direitos fundamentais');