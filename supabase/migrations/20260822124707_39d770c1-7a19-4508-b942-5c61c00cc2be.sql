CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TYPE public.resource_category AS ENUM ('notes','files','pyqs','syllabus');

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
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  semester integer NOT NULL DEFAULT 1,
  description text,
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subjects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT ALL ON public.subjects TO service_role;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subjects are public" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Admins manage subjects" ON public.subjects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  category public.resource_category NOT NULL,
  file_path text,
  file_url text NOT NULL,
  file_type text,
  file_size bigint,
  description text,
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.resources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resources TO authenticated;
GRANT ALL ON public.resources TO service_role;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Resources are public" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Admins manage resources" ON public.resources FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX resources_subject_idx ON public.resources(subject_id);
CREATE INDEX resources_category_idx ON public.resources(category);
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;
CREATE INDEX resources_title_trgm_idx ON public.resources USING gin (title extensions.gin_trgm_ops);
CREATE INDEX subjects_name_trgm_idx ON public.subjects USING gin (name extensions.gin_trgm_ops);

INSERT INTO public.subjects (name, code, semester, description, is_sample) VALUES
('Data Structures & Algorithms','DSA',3,'Linear and non-linear data structures, complexity analysis, sorting and graph algorithms.',true),
('Object Oriented Programming','OOP',3,'Classes, inheritance, polymorphism and design principles in Java and C++.',true),
('Database Management Systems','DBMS',4,'Relational modelling, SQL, normalization, transactions and indexing.',true),
('Engineering Mathematics','MATH',3,'Matrices, calculus, probability and numerical methods.',true);

INSERT INTO public.resources (subject_id, title, category, file_url, file_type, file_size, description, is_sample)
SELECT s.id, r.title, r.category::public.resource_category, r.url, r.ftype, r.fsize, r.descr, true
FROM public.subjects s
JOIN (VALUES
 ('DSA','Unit 1 — Arrays, Linked Lists & Complexity','notes','https://arxiv.org/pdf/1802.03426v3','pdf',1840000,'Sample lecture notes covering asymptotic analysis and linear structures.'),
 ('DSA','Unit 3 — Trees & Binary Search Trees','notes','https://arxiv.org/pdf/1802.03426v3','pdf',2210000,'Sample notes on binary trees, traversals and BST operations.'),
 ('DSA','Graph Algorithms Cheat Sheet','files','https://arxiv.org/pdf/1802.03426v3','pdf',420000,'Sample quick-reference sheet for BFS, DFS, Dijkstra and MST.'),
 ('DSA','End Sem 2024 Question Paper','pyqs','https://arxiv.org/pdf/1802.03426v3','pdf',680000,'Sample previous year end semester paper.'),
 ('DSA','DSA Official Syllabus','syllabus','https://arxiv.org/pdf/1802.03426v3','pdf',180000,'Sample university syllabus document.'),
 ('OOP','Unit 2 — Inheritance & Polymorphism','notes','https://arxiv.org/pdf/1802.03426v3','pdf',1520000,'Sample notes on OOP inheritance hierarchies.'),
 ('OOP','Lab Programs Collection','files','https://arxiv.org/pdf/1802.03426v3','pdf',960000,'Sample lab program bundle.'),
 ('OOP','Mid Sem 2023 OOP Paper','pyqs','https://arxiv.org/pdf/1802.03426v3','pdf',540000,'Sample previous year mid semester paper.'),
 ('OOP','OOP Official Syllabus','syllabus','https://arxiv.org/pdf/1802.03426v3','pdf',175000,'Sample syllabus document.'),
 ('DBMS','Unit 3 — Normalization & Functional Dependencies','notes','https://arxiv.org/pdf/1802.03426v3','pdf',1980000,'Sample notes on 1NF through BCNF.'),
 ('DBMS','SQL Practice Workbook','files','https://arxiv.org/pdf/1802.03426v3','pdf',730000,'Sample SQL exercises workbook.'),
 ('DBMS','End Sem 2024 DBMS Paper','pyqs','https://arxiv.org/pdf/1802.03426v3','pdf',610000,'Sample previous year paper.'),
 ('DBMS','DBMS Official Syllabus','syllabus','https://arxiv.org/pdf/1802.03426v3','pdf',168000,'Sample syllabus document.'),
 ('MATH','Unit 1 — Matrices & Linear Algebra','notes','https://arxiv.org/pdf/1802.03426v3','pdf',1420000,'Sample notes on matrices, rank and eigenvalues.'),
 ('MATH','Formula Handbook','files','https://arxiv.org/pdf/1802.03426v3','pdf',390000,'Sample formula reference.'),
 ('MATH','End Sem 2023 Mathematics Paper','pyqs','https://arxiv.org/pdf/1802.03426v3','pdf',520000,'Sample previous year paper.'),
 ('MATH','Mathematics Official Syllabus','syllabus','https://arxiv.org/pdf/1802.03426v3','pdf',160000,'Sample syllabus document.')
) AS r(code,title,category,url,ftype,fsize,descr) ON r.code = s.code;