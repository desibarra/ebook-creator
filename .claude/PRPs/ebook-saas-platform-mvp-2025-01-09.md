# PRP: Plataforma SaaS para Creación y Venta de eBooks - MVP (Fase 1)

**Generated:** 2025-01-09
**Version:** 1.0
**Scope:** MVP - Fase 1 (Auth + Editor Básico + Export PDF + Project Management)

---

## Goal

Construir el **MVP de una plataforma SaaS** que permita a creadores de contenido crear, editar y exportar eBooks profesionales sin necesidad de habilidades de diseño.

**Estado Final MVP:**
- ✅ Usuarios pueden registrarse y autenticarse (email + OAuth Google)
- ✅ Editor visual drag & drop funcional con componentes básicos (texto, imágenes, títulos)
- ✅ Preview en tiempo real del eBook
- ✅ Export a PDF de alta calidad
- ✅ Gestión de proyectos (crear, listar, editar, eliminar)
- ✅ Storage seguro en Supabase con RLS
- ✅ Responsive design mobile-first

**Fases Posteriores (Fuera del scope del MVP):**
- 🔜 Phase 2: Templates profesionales + AI Assistant (OpenAI)
- 🔜 Phase 3: E-commerce (Stripe) + Landing pages automáticas
- 🔜 Phase 4: Analytics + White-label + Team collaboration

---

## Why

### Business Value
- **Time to Market**: MVP funcional permite validar el producto con usuarios reales antes de invertir en features avanzadas
- **Reduce Complexity**: Foco en core features (crear y exportar eBooks) sin distracciones
- **Proof of Concept**: Demuestra viabilidad técnica de editor visual + PDF export
- **Foundation Sólida**: Arquitectura extensible lista para agregar AI, e-commerce y analytics

### User Impact
- **Marketers**: Crear lead magnets profesionales en minutos
- **Coaches**: Publicar material premium sin contratar diseñadores
- **Creadores**: Monetizar contenido con herramienta profesional y asequible

### Problems Solved
1. ❌ Dificultad para crear eBooks sin habilidades de diseño → ✅ Editor visual intuitivo
2. ❌ Herramientas caras o complejas → ✅ Interfaz simple tipo Pooks.ai/Carrd
3. ❌ Falta de herramientas todo-en-uno → ✅ Crear, editar, exportar en un solo lugar

---

## What

### User-Visible Behavior

#### 1. **Authentication Flow**
- Landing page con CTA "Empezar gratis"
- Sign up con email/password o Google OAuth
- Email verification
- Login persistente con JWT tokens
- Logout con limpieza de sesión

#### 2. **Dashboard (Post-Login)**
- Lista de proyectos de eBooks del usuario
- Botón "Crear Nuevo eBook"
- Card por cada proyecto mostrando:
  - Thumbnail preview
  - Título del proyecto
  - Última modificación
  - Botones: Editar, Duplicar, Eliminar

#### 3. **Editor Visual**
- **Sidebar Izquierdo**: Componentes arrastrables
  - Text Block (párrafos)
  - Heading (H1, H2, H3)
  - Image
  - Divider
  - Spacer
- **Canvas Central**: Zona de trabajo drag & drop
  - Preview en tiempo real
  - Selección de elementos
  - Edición inline de texto
  - Configuración de propiedades (tamaño, color, alineación)
- **Panel Derecho**: Propiedades del elemento seleccionado
  - Font size, family, color
  - Margins, padding
  - Background color
- **Top Bar**:
  - Botón "Guardar"
  - Botón "Preview" (modo pantalla completa)
  - Botón "Exportar PDF"
  - Título del proyecto (editable)

#### 4. **PDF Export**
- Modal de confirmación "Generando PDF..."
- Generación server-side con Puppeteer
- Download automático del PDF
- Opción de re-export

#### 5. **Project Management**
- Crear proyecto: Modal con nombre del proyecto
- Editar: Navega al editor
- Duplicar: Crea copia con sufijo " (Copy)"
- Eliminar: Modal de confirmación + soft delete

---

### Success Criteria

**Functional Requirements:**
- [ ] Usuario puede registrarse y autenticarse sin fricción
- [ ] Editor permite arrastrar y soltar componentes funcionalmente
- [ ] Edición inline de texto funciona sin bugs
- [ ] Preview muestra exactamente lo que será el PDF
- [ ] Export a PDF genera documento profesional de alta calidad
- [ ] Proyectos se guardan automáticamente cada 30 segundos
- [ ] RLS asegura que usuarios solo ven sus propios proyectos

**Performance Requirements:**
- [ ] Editor mantiene 60fps durante drag & drop
- [ ] Autosave no bloquea la UI (debounced)
- [ ] PDF generation completa en <10 segundos para eBooks de 20 páginas
- [ ] Initial load del dashboard <2 segundos
- [ ] Mobile responsive en viewports 375px+

**Security Requirements:**
- [ ] Supabase RLS configurado correctamente
- [ ] No SQL injection posible
- [ ] Sessions expiran después de 7 días
- [ ] Passwords hasheados con bcrypt (Supabase Auth)
- [ ] CORS configurado solo para frontend domain

---

## All Needed Context

### Documentation & References

```yaml
MUST_READ:

# Next.js 15 App Router
- url: https://nextjs.org/docs/app/building-your-application/routing
  why: "Routing patterns para app/api/auth, app/dashboard, app/editor/[id]"
  critical: "Use 'use client' directive for interactive components"

- url: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
  why: "Server Actions para save/autosave de proyectos sin API routes"
  critical: "Server Actions son async by default, retornan JSON serializable"

# Supabase Integration
- url: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
  why: "Setup completo Supabase + Next.js con App Router"
  critical: "Usar @supabase/ssr para SSR, no @supabase/supabase-js directamente"

- url: https://supabase.com/docs/guides/database/postgres/row-level-security
  why: "RLS policies para asegurar proyectos por user_id"
  critical: "ALWAYS enable RLS en tablas user-facing. Policy: auth.uid() = user_id"

- url: https://supabase.com/docs/guides/auth/social-login/auth-google
  why: "Google OAuth setup"
  note: "Requiere Google Cloud Console OAuth client ID"

# Drag & Drop Implementation
- url: https://docs.dndkit.com/introduction/getting-started
  why: "@dnd-kit/core es la library moderna para drag & drop en React"
  critical: "Use <DndContext>, <Droppable>, <Draggable> wrappers"
  gotcha: "Requires unique IDs per item - use nanoid or crypto.randomUUID()"

- url: https://puckeditor.com/docs/integrating-puck
  why: "Puck es open-source page builder - reference implementation"
  note: "Puedes inspirarte pero NO copiar código directamente"

# PDF Generation
- url: https://medium.com/front-end-weekly/dynamic-html-to-pdf-generation-in-next-js-a-step-by-step-guide-with-puppeteer-dbcf276375d7
  why: "Complete guide para Puppeteer + Next.js API route"
  critical: "Use @sparticuz/chromium-min para Vercel serverless compatibility"

- url: https://github.com/vercel/next.js/discussions/70078
  why: "Best practices para PDFs grandes (optimización)"

# TypeScript & Validation
- url: https://zod.dev
  why: "Schema validation para project data, user input"
  pattern: "Define schemas en features/[feature]/types/schemas.ts"

# State Management
- url: https://docs.pmnd.rs/zustand/getting-started/introduction
  why: "Zustand para editor state (componentes, selected element, canvas state)"
  critical: "Use persist middleware para auto-save"

# Styling
- url: https://tailwindcss.com/docs/utility-first
  why: "Tailwind patterns"

- url: https://ui.shadcn.com/docs/components
  why: "shadcn/ui para components base (Button, Card, Modal, etc.)"
  note: "Install components individually: npx shadcn@latest add button"

INTERNAL_REFERENCES:

- file: "CLAUDE.md"
  why: "Principios de desarrollo, convenciones, arquitectura Feature-First"
  critical: "Seguir naming conventions: kebab-case files, PascalCase components"

- file: "README.md"
  why: "Project setup, comandos npm, estructura esperada"

- file: ".claude/PRPs/templates/prp_base.md"
  why: "Template structure a seguir"

- file: "saas-factory-setup/nextjs-claude-setup/"
  why: "Reference implementation de la misma arquitectura"
  note: "Puedes revisar patrones pero el proyecto actual está vacío"
```

---

### Current Codebase Tree

```bash
demoebook/
├── .claude/                      # Claude Code infrastructure (✅ ready)
│   ├── agents/                   # codebase-analyst, gestor-documentacion
│   ├── commands/                 # /explorador, /generar-prp, etc.
│   ├── PRPs/
│   │   └── templates/
│   │       └── prp_base.md
│   └── skills/                   # 7 skills disponibles
│
├── CLAUDE.md                     # System prompt (✅ complete)
├── README.md                     # Documentation (✅ complete)
├── package.json                  # Basic deps only (⚠️ needs more)
├── .gitignore
└── mcp.json                      # MCP servers config (⚠️ needs Supabase creds)

# ❌ NO SRC/ DIRECTORY YET - FRESH PROJECT
```

---

### Desired Codebase Tree (Post-MVP Implementation)

```bash
demoebook/
├── public/                       # NEW
│   ├── fonts/                    # Custom fonts para PDFs
│   └── images/                   # Default images, placeholders
│
├── src/                          # NEW - Main source directory
│   ├── app/                      # NEW - Next.js App Router
│   │   ├── (auth)/               # Route group - Auth layouts
│   │   │   ├── login/
│   │   │   │   └── page.tsx      # Login page
│   │   │   ├── signup/
│   │   │   │   └── page.tsx      # Signup page
│   │   │   └── layout.tsx        # Auth layout (centered, no nav)
│   │   │
│   │   ├── (main)/               # Route group - Main app layouts
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx      # Projects dashboard
│   │   │   ├── editor/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Editor page (dynamic route)
│   │   │   └── layout.tsx        # Main layout (navbar, user menu)
│   │   │
│   │   ├── api/                  # API Routes
│   │   │   ├── pdf/
│   │   │   │   └── generate/
│   │   │   │       └── route.ts  # POST /api/pdf/generate
│   │   │   └── health/
│   │   │       └── route.ts      # GET /api/health
│   │   │
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Landing page (/)
│   │   └── globals.css           # Global styles
│   │
│   ├── features/                 # NEW - Feature-First architecture
│   │   │
│   │   ├── auth/                 # Feature: Authentication
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── SignupForm.tsx
│   │   │   │   └── GoogleOAuthButton.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useSession.ts
│   │   │   ├── services/
│   │   │   │   └── authService.ts
│   │   │   ├── types/
│   │   │   │   ├── index.ts
│   │   │   │   └── schemas.ts    # Zod schemas
│   │   │   └── store/
│   │   │       └── authStore.ts  # Zustand store
│   │   │
│   │   ├── projects/             # Feature: Project Management
│   │   │   ├── components/
│   │   │   │   ├── ProjectCard.tsx
│   │   │   │   ├── ProjectList.tsx
│   │   │   │   ├── CreateProjectModal.tsx
│   │   │   │   └── DeleteProjectModal.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useProjects.ts
│   │   │   │   └── useProjectMutations.ts
│   │   │   ├── services/
│   │   │   │   └── projectService.ts
│   │   │   ├── types/
│   │   │   │   ├── index.ts      # Project, ProjectMetadata
│   │   │   │   └── schemas.ts
│   │   │   └── store/
│   │   │       └── projectsStore.ts
│   │   │
│   │   ├── editor/               # Feature: Visual Editor
│   │   │   ├── components/
│   │   │   │   ├── Editor.tsx    # Main editor component
│   │   │   │   ├── Canvas.tsx    # Drag & drop canvas
│   │   │   │   ├── Sidebar.tsx   # Component library
│   │   │   │   ├── PropertiesPanel.tsx
│   │   │   │   ├── TopBar.tsx
│   │   │   │   └── blocks/       # Draggable blocks
│   │   │   │       ├── TextBlock.tsx
│   │   │   │       ├── HeadingBlock.tsx
│   │   │   │       ├── ImageBlock.tsx
│   │   │   │       ├── DividerBlock.tsx
│   │   │   │       └── SpacerBlock.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useEditor.ts
│   │   │   │   ├── useDragDrop.ts
│   │   │   │   ├── useAutoSave.ts
│   │   │   │   └── useSelection.ts
│   │   │   ├── services/
│   │   │   │   └── editorService.ts
│   │   │   ├── types/
│   │   │   │   ├── index.ts      # Block, EditorState, Component
│   │   │   │   └── schemas.ts
│   │   │   └── store/
│   │   │       └── editorStore.ts # Canvas state, blocks, selected
│   │   │
│   │   └── pdf/                  # Feature: PDF Export
│   │       ├── components/
│   │       │   └── ExportModal.tsx
│   │       ├── hooks/
│   │       │   └── useExportPDF.ts
│   │       ├── services/
│   │       │   └── pdfService.ts
│   │       ├── types/
│   │       │   ├── index.ts
│   │       │   └── schemas.ts
│   │       └── templates/
│   │           └── pdf-template.html # HTML template para Puppeteer
│   │
│   └── shared/                   # NEW - Shared/reusable code
│       ├── components/           # UI components genéricos
│       │   ├── ui/               # shadcn/ui components
│       │   │   ├── button.tsx
│       │   │   ├── card.tsx
│       │   │   ├── input.tsx
│       │   │   ├── modal.tsx
│       │   │   ├── toast.tsx
│       │   │   └── dropdown-menu.tsx
│       │   ├── Layout/
│       │   │   ├── Navbar.tsx
│       │   │   └── Footer.tsx
│       │   └── Loading/
│       │       └── Spinner.tsx
│       │
│       ├── hooks/                # Hooks genéricos
│       │   ├── useDebounce.ts
│       │   ├── useLocalStorage.ts
│       │   └── useMediaQuery.ts
│       │
│       ├── lib/                  # External libraries config
│       │   ├── supabase/
│       │   │   ├── client.ts     # Browser client
│       │   │   ├── server.ts     # Server client
│       │   │   └── middleware.ts # Auth middleware
│       │   └── utils.ts          # cn() helper, etc.
│       │
│       ├── types/                # Global types
│       │   ├── api.ts
│       │   ├── database.ts       # Supabase generated types
│       │   └── global.ts
│       │
│       ├── utils/                # Utility functions
│       │   ├── formatters.ts     # Date, currency, text formatting
│       │   ├── validators.ts     # Common validations
│       │   └── errorHandlers.ts  # Error handling utilities
│       │
│       └── constants/            # App constants
│           ├── routes.ts         # Route paths
│           ├── config.ts         # App config
│           └── defaults.ts       # Default values
│
├── supabase/                     # NEW - Supabase config
│   ├── migrations/
│   │   ├── 001_create_users_table.sql
│   │   ├── 002_create_projects_table.sql
│   │   ├── 003_enable_rls.sql
│   │   └── 004_create_storage_buckets.sql
│   └── seed.sql                  # Seed data para desarrollo
│
├── tests/                        # NEW - Tests
│   ├── unit/
│   │   ├── auth.test.ts
│   │   ├── projects.test.ts
│   │   └── editor.test.ts
│   ├── integration/
│   │   └── api.test.ts
│   └── e2e/
│       └── user-flow.spec.ts
│
├── .env.local                    # NEW - Environment variables
├── .env.example                  # NEW - Example env file
├── next.config.js                # NEW - Next.js config
├── tsconfig.json                 # NEW - TypeScript config
├── tailwind.config.ts            # NEW - Tailwind config
├── postcss.config.js             # NEW - PostCSS config
├── components.json               # NEW - shadcn/ui config
├── jest.config.js                # NEW - Jest config
└── playwright.config.ts          # NEW - Playwright config (for e2e)
```

---

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Next.js 15 App Router
// 1. Server Components are DEFAULT - No useState/useEffect unless 'use client'
'use client' // MUST be at top of file for client components

// 2. Server Actions require 'use server' directive
'use server'
export async function saveProject(formData: FormData) {
  // This runs on server
}

// 3. Dynamic routes require export of generateMetadata
export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `Editor - ${params.id}` }
}

// GOTCHA: Supabase RLS
// 1. RLS policies MUST be created BEFORE inserting data, otherwise queries fail silently
// Example policy:
CREATE POLICY "Users can only view their own projects"
ON projects FOR SELECT
USING (auth.uid() = user_id);

// 2. @supabase/ssr is required for App Router, NOT @supabase/supabase-js
import { createServerClient } from '@supabase/ssr'

// 3. Browser client needs different initialization
import { createBrowserClient } from '@supabase/ssr'

// CRITICAL: @dnd-kit/core
// 1. Every draggable item NEEDS unique ID - use crypto.randomUUID()
const block = {
  id: crypto.randomUUID(), // NOT Date.now() or incremental IDs
  type: 'text',
  content: 'Hello'
}

// 2. DndContext must wrap BOTH <Draggable> and <Droppable>
<DndContext onDragEnd={handleDragEnd}>
  <Draggable id="item-1">Drag me</Draggable>
  <Droppable id="canvas">Drop here</Droppable>
</DndContext>

// 3. Sensors are required for touch/mouse support
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates
  })
)

// GOTCHA: Puppeteer on Vercel
// 1. MUST use @sparticuz/chromium-min (not puppeteer regular)
import chromium from '@sparticuz/chromium-min'
import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  args: chromium.args,
  executablePath: await chromium.executablePath(),
  headless: chromium.headless
})

// 2. Vercel serverless functions timeout at 10s (Hobby) or 60s (Pro)
// Keep PDF generation under timeout

// 3. For large PDFs, use Vercel Blob to store and return URL instead of buffer

// PATTERN: Zustand with Persistence
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// CRITICAL: Use persist ONLY for user preferences, NOT for large editor state
// Editor state should be in DB via auto-save
const useSettingsStore = create(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme })
    }),
    {
      name: 'user-settings' // localStorage key
    }
  )
)

// GOTCHA: Zod validation
// 1. Schemas throw by default - always wrap in safeParse
const result = projectSchema.safeParse(data)
if (!result.success) {
  console.error(result.error.errors)
  return
}

// 2. Transform dates from Supabase (strings) to Date objects
const projectSchema = z.object({
  created_at: z.string().transform((str) => new Date(str))
})

// PATTERN: Error Handling in Next.js
// Always use error boundaries for client components
// error.tsx and global-error.tsx for route-level errors

// CRITICAL: TypeScript in Next.js
// 1. Use interfaces for React component props
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
}

// 2. Use types for unions and primitives
type Theme = 'light' | 'dark'
type ProjectStatus = 'draft' | 'published'

// 3. Generate Supabase types automatically
// npx supabase gen types typescript --local > src/shared/types/database.ts
```

---

## Implementation Blueprint

### Data Models & Database Schema

#### Supabase Tables

```sql
-- Migration 001: Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration 002: Create projects table
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled eBook',
  content JSONB NOT NULL DEFAULT '{"blocks": []}',
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL -- Soft delete
);

-- Create index for user queries
CREATE INDEX idx_projects_user_id ON projects(user_id) WHERE deleted_at IS NULL;

-- Migration 003: Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- RLS Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- RLS Policy: Users can only see their own projects
CREATE POLICY "Users can view own projects"
ON projects FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- RLS Policy: Users can insert their own projects
CREATE POLICY "Users can create projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own projects
CREATE POLICY "Users can update own projects"
ON projects FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policy: Users can soft delete their own projects
CREATE POLICY "Users can delete own projects"
ON projects FOR UPDATE
USING (auth.uid() = user_id);

-- Migration 004: Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('project-thumbnails', 'project-thumbnails', true),
  ('user-uploads', 'user-uploads', false);

-- Storage RLS: Users can upload to their own folder
CREATE POLICY "Users can upload own thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-thumbnails' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### TypeScript Types

```typescript
// src/shared/types/database.ts (auto-generated from Supabase)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Row, 'created_at' | 'updated_at'>
        Update: Partial<Insert>
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          content: EditorContent
          thumbnail_url: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Row, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
        Update: Partial<Insert>
      }
    }
  }
}

// src/features/editor/types/index.ts
export type BlockType = 'text' | 'heading' | 'image' | 'divider' | 'spacer'

export interface Block {
  id: string // crypto.randomUUID()
  type: BlockType
  content: string | null
  properties: BlockProperties
}

export interface BlockProperties {
  // Typography
  fontSize?: number // 12-72
  fontFamily?: string // 'Inter' | 'Roboto' | 'Lora'
  fontWeight?: number // 400, 500, 600, 700
  color?: string // hex color
  textAlign?: 'left' | 'center' | 'right' | 'justify'

  // Spacing
  marginTop?: number // 0-100
  marginBottom?: number // 0-100
  paddingTop?: number // 0-100
  paddingBottom?: number // 0-100

  // Images
  src?: string // URL
  alt?: string
  width?: number | 'auto' // px or 'auto'
  height?: number | 'auto'

  // Divider
  thickness?: number // 1-10
  style?: 'solid' | 'dashed' | 'dotted'

  // Spacer
  height?: number // 10-200
}

export interface EditorContent {
  blocks: Block[]
  version: number // Schema version for migrations
}

export interface EditorState {
  blocks: Block[]
  selectedBlockId: string | null
  isDirty: boolean
  isSaving: boolean
  lastSavedAt: Date | null
}

// src/features/projects/types/schemas.ts
import { z } from 'zod'

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long')
})

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  content: z.object({
    blocks: z.array(z.any()), // Validate structure later
    version: z.number()
  }).optional()
})

export const blockSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['text', 'heading', 'image', 'divider', 'spacer']),
  content: z.string().nullable(),
  properties: z.record(z.any()) // Dynamic based on block type
})
```

---

### Task List (Implementation Order)

```yaml
PHASE 1: Project Setup & Configuration
===================================

Task 1: Initialize Project Dependencies
  COMMAND: npm install (from root)
  INSTALL_ADDITIONAL:
    - "@supabase/ssr" "@supabase/supabase-js"
    - "zustand"
    - "zod"
    - "@dnd-kit/core" "@dnd-kit/sortable" "@dnd-kit/utilities"
    - "puppeteer-core" "@sparticuz/chromium-min"
    - "@vercel/blob"
    - "nanoid"
    - "date-fns"
  INSTALL_DEV:
    - "jest" "@testing-library/react" "@testing-library/jest-dom"
    - "prettier" "eslint-config-prettier"
  VALIDATE: package.json updated, node_modules populated

Task 2: Create Configuration Files
  CREATE:
    - next.config.js (with experimental features)
    - tsconfig.json (strict mode, path aliases)
    - tailwind.config.ts (custom colors, fonts)
    - postcss.config.js
    - .env.example (template for vars)
    - .env.local (add to .gitignore)
  TEMPLATE: Copy from saas-factory-setup/nextjs-claude-setup/ if available
  VALIDATE: npm run dev works (even with empty src/)

Task 3: Setup Supabase Project
  MANUAL_STEPS:
    1. Create project at supabase.com
    2. Get Project URL and Anon Key
    3. Update .env.local with credentials
    4. Update mcp.json with project-ref
  VALIDATE: Supabase dashboard accessible

Task 4: Install shadcn/ui Components
  COMMAND: npx shadcn@latest init
  INSTALL_COMPONENTS:
    - button
    - card
    - input
    - label
    - modal (dialog)
    - dropdown-menu
    - toast (sonner)
    - form
  VALIDATE: components.json created, src/shared/components/ui/ populated

---

PHASE 2: Database & Auth Setup
==============================

Task 5: Create Database Migrations
  CREATE: supabase/migrations/001_create_profiles_table.sql
  CREATE: supabase/migrations/002_create_projects_table.sql
  CREATE: supabase/migrations/003_enable_rls.sql
  CREATE: supabase/migrations/004_create_storage_buckets.sql
  CONTENT: Copy SQL from "Data Models & Database Schema" above
  VALIDATE: Run migrations via Supabase dashboard SQL editor

Task 6: Generate TypeScript Types from Supabase
  COMMAND: npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/shared/types/database.ts
  VALIDATE: File created with types matching schema

Task 7: Create Supabase Client Utils
  CREATE: src/shared/lib/supabase/client.ts
  CREATE: src/shared/lib/supabase/server.ts
  CREATE: src/shared/lib/supabase/middleware.ts
  PATTERN: Use @supabase/ssr patterns
  GOTCHA: Server client needs cookies() from 'next/headers'
  VALIDATE: TypeScript compiles, no errors

Task 8: Implement Auth Feature
  CREATE: src/features/auth/components/LoginForm.tsx
  CREATE: src/features/auth/components/SignupForm.tsx
  CREATE: src/features/auth/components/GoogleOAuthButton.tsx
  CREATE: src/features/auth/hooks/useAuth.ts
  CREATE: src/features/auth/services/authService.ts
  CREATE: src/features/auth/types/index.ts
  CREATE: src/features/auth/types/schemas.ts
  PATTERN: Use Server Actions for signup/login
  VALIDATE: User can signup, login, logout

Task 9: Create Auth Pages
  CREATE: src/app/(auth)/login/page.tsx
  CREATE: src/app/(auth)/signup/page.tsx
  CREATE: src/app/(auth)/layout.tsx
  PATTERN: Centered layout, no navbar
  VALIDATE: Pages render, forms work

Task 10: Setup Auth Middleware
  CREATE: src/middleware.ts
  PATTERN: Redirect unauthenticated users from /dashboard to /login
  VALIDATE: Protected routes work

---

PHASE 3: Projects Feature (CRUD)
================================

Task 11: Create Projects Feature Structure
  CREATE: src/features/projects/types/index.ts
  CREATE: src/features/projects/types/schemas.ts
  CREATE: src/features/projects/services/projectService.ts
  PATTERN: Use Zod schemas for validation
  VALIDATE: Types compile

Task 12: Implement Project Service
  FILE: src/features/projects/services/projectService.ts
  FUNCTIONS:
    - createProject(title: string): Promise<Project>
    - getProjects(): Promise<Project[]>
    - getProject(id: string): Promise<Project | null>
    - updateProject(id: string, updates: Partial<Project>): Promise<Project>
    - deleteProject(id: string): Promise<void> // Soft delete
    - duplicateProject(id: string): Promise<Project>
  PATTERN: Use Supabase client, wrap in try/catch
  VALIDATE: Unit tests pass

Task 13: Create Projects Components
  CREATE: src/features/projects/components/ProjectCard.tsx
  CREATE: src/features/projects/components/ProjectList.tsx
  CREATE: src/features/projects/components/CreateProjectModal.tsx
  CREATE: src/features/projects/components/DeleteProjectModal.tsx
  PATTERN: Use shadcn/ui components
  VALIDATE: Storybook or visual test

Task 14: Create Dashboard Page
  CREATE: src/app/(main)/dashboard/page.tsx
  CREATE: src/app/(main)/layout.tsx (with Navbar)
  LOGIC:
    - Fetch user's projects on load
    - Show ProjectList component
    - Handle create/delete/duplicate actions
  VALIDATE: Dashboard shows projects, CRUD works

---

PHASE 4: Editor Feature (Core MVP)
===================================

Task 15: Setup Editor Store (Zustand)
  CREATE: src/features/editor/store/editorStore.ts
  STATE:
    - blocks: Block[]
    - selectedBlockId: string | null
    - isDirty: boolean
    - isSaving: boolean
    - lastSavedAt: Date | null
  ACTIONS:
    - addBlock(block: Block)
    - removeBlock(id: string)
    - updateBlock(id: string, updates: Partial<Block>)
    - selectBlock(id: string | null)
    - reorderBlocks(oldIndex: number, newIndex: number)
    - loadContent(content: EditorContent)
    - markSaved()
  VALIDATE: Store works in isolation

Task 16: Create Editor Block Components
  CREATE: src/features/editor/components/blocks/TextBlock.tsx
  CREATE: src/features/editor/components/blocks/HeadingBlock.tsx
  CREATE: src/features/editor/components/blocks/ImageBlock.tsx
  CREATE: src/features/editor/components/blocks/DividerBlock.tsx
  CREATE: src/features/editor/components/blocks/SpacerBlock.tsx
  PATTERN: Each block uses 'use client', renders based on properties
  PATTERN: Inline editing with contentEditable
  VALIDATE: Blocks render correctly

Task 17: Implement Drag & Drop with dnd-kit
  CREATE: src/features/editor/hooks/useDragDrop.ts
  CREATE: src/features/editor/components/Canvas.tsx
  LOGIC:
    - Wrap Canvas in <DndContext>
    - Use <SortableContext> for blocks
    - Handle onDragEnd to reorder blocks
  CRITICAL: Use useSensors for mouse + touch
  GOTCHA: Every block needs unique ID
  VALIDATE: Drag & drop works smoothly (60fps target)

Task 18: Create Sidebar (Component Library)
  CREATE: src/features/editor/components/Sidebar.tsx
  CONTENT:
    - List of draggable block types
    - Each item is <Draggable>
    - On drop to Canvas, create new block
  VALIDATE: Can drag from Sidebar to Canvas

Task 19: Create Properties Panel
  CREATE: src/features/editor/components/PropertiesPanel.tsx
  LOGIC:
    - Show properties of selectedBlock
    - Editable fields (font size, color, alignment, etc.)
    - On change, update block in store
  PATTERN: Dynamic form based on block type
  VALIDATE: Editing properties updates block visually

Task 20: Create Top Bar (Save, Preview, Export)
  CREATE: src/features/editor/components/TopBar.tsx
  BUTTONS:
    - Save (manual save)
    - Preview (full-screen modal)
    - Export PDF (trigger API call)
  FEATURES:
    - Editable project title (inline)
    - Auto-save indicator
  VALIDATE: Buttons trigger correct actions

Task 21: Implement Auto-Save
  CREATE: src/features/editor/hooks/useAutoSave.ts
  LOGIC:
    - Watch editorStore.blocks changes
    - Debounce 30 seconds
    - Call projectService.updateProject()
    - Update lastSavedAt
  GOTCHA: Don't save if not dirty
  VALIDATE: Auto-save works without blocking UI

Task 22: Create Main Editor Component
  CREATE: src/features/editor/components/Editor.tsx
  STRUCTURE:
    - <div className="flex h-screen">
        <Sidebar />
        <Canvas />
        <PropertiesPanel />
      </div>
    - <TopBar /> fixed at top
  VALIDATE: All components work together

Task 23: Create Editor Page
  CREATE: src/app/(main)/editor/[id]/page.tsx
  LOGIC:
    - Fetch project by ID (Server Component)
    - Pass initial content to <Editor> (Client Component)
    - Handle 404 if project not found
  VALIDATE: Editor loads with project data

---

PHASE 5: PDF Export Feature
============================

Task 24: Create PDF HTML Template
  CREATE: src/features/pdf/templates/pdf-template.html
  CONTENT:
    - HTML structure with {{blocks}} placeholder
    - Embedded CSS for print styles
    - Use @page CSS for PDF formatting
  PATTERN: Keep simple, avoid complex layouts
  VALIDATE: Template renders correctly

Task 25: Create PDF Generation API Route
  CREATE: src/app/api/pdf/generate/route.ts
  LOGIC:
    - POST endpoint
    - Receive project ID in body
    - Fetch project from Supabase
    - Render HTML with blocks
    - Use Puppeteer to generate PDF
    - Return PDF buffer or Blob URL
  CRITICAL: Use @sparticuz/chromium-min for Vercel
  GOTCHA: Timeout 60s max (Vercel Pro), 10s (Hobby)
  VALIDATE: API returns valid PDF

Task 26: Implement usePDFExport Hook
  CREATE: src/features/pdf/hooks/useExportPDF.ts
  LOGIC:
    - Call /api/pdf/generate
    - Show loading state
    - Download PDF or handle error
  VALIDATE: Hook works in Editor

Task 27: Create Export Modal
  CREATE: src/features/pdf/components/ExportModal.tsx
  UI:
    - Loading spinner during generation
    - Success message with download button
    - Error handling
  VALIDATE: Modal shows during export

Task 28: Integrate Export in Editor
  FILE: src/features/editor/components/TopBar.tsx
  MODIFY: Wire "Export PDF" button to usePDFExport
  VALIDATE: End-to-end PDF export works

---

PHASE 6: Shared Components & Polish
====================================

Task 29: Create Shared UI Components
  CREATE: src/shared/components/Layout/Navbar.tsx
  CREATE: src/shared/components/Layout/Footer.tsx
  CREATE: src/shared/components/Loading/Spinner.tsx
  PATTERN: Use shadcn/ui primitives
  VALIDATE: Components render

Task 30: Create Landing Page
  FILE: src/app/page.tsx
  CONTENT:
    - Hero section with CTA
    - Features list
    - Pricing (future)
    - Footer
  VALIDATE: Landing page looks professional

Task 31: Implement Error Handling
  CREATE: src/app/error.tsx
  CREATE: src/app/(main)/error.tsx
  PATTERN: User-friendly error messages
  VALIDATE: Errors display nicely

Task 32: Add Loading States
  CREATE: src/app/(main)/dashboard/loading.tsx
  CREATE: src/app/(main)/editor/[id]/loading.tsx
  PATTERN: Skeleton loaders
  VALIDATE: Loading states show during navigation

Task 33: Mobile Responsive Styles
  MODIFY: All components with Tailwind responsive classes
  TEST: Mobile (375px), Tablet (768px), Desktop (1024px+)
  VALIDATE: UI works on all screen sizes

Task 34: Add Toast Notifications
  INTEGRATE: Sonner for toast notifications
  USE_IN:
    - Project created/deleted
    - Save success/failure
    - PDF export success/failure
  VALIDATE: Toasts appear correctly

---

PHASE 7: Testing & Quality Assurance
=====================================

Task 35: Write Unit Tests for Services
  CREATE: tests/unit/auth.test.ts
  CREATE: tests/unit/projects.test.ts
  CREATE: tests/unit/editor.test.ts
  COVERAGE: 80%+ for services
  VALIDATE: npm test passes

Task 36: Write Integration Tests for API
  CREATE: tests/integration/api.test.ts
  TEST:
    - /api/pdf/generate
    - /api/health
  VALIDATE: All API endpoints work

Task 37: Write E2E Test for User Flow
  CREATE: tests/e2e/user-flow.spec.ts
  FLOW:
    1. Signup
    2. Create project
    3. Add blocks in editor
    4. Save
    5. Export PDF
    6. Logout
  TOOL: Playwright
  VALIDATE: E2E test passes

Task 38: Run Linting & Type Checking
  COMMAND: npm run lint
  COMMAND: npm run typecheck (if configured)
  FIX: All errors
  VALIDATE: Zero linting/type errors

Task 39: Performance Audit
  TOOL: Lighthouse
  TARGETS:
    - Performance: 90+
    - Accessibility: 100
    - SEO: 90+
  FIX: Issues found
  VALIDATE: Scores meet targets

Task 40: Security Audit
  CHECK:
    - RLS policies correct
    - No secrets in code
    - CORS configured
    - Input validation with Zod
    - No SQL injection possible
  VALIDATE: No security vulnerabilities

---

PHASE 8: Deployment & Documentation
====================================

Task 41: Create Deployment Configuration
  CREATE: vercel.json (if needed)
  CONFIGURE: Environment variables in Vercel dashboard
  VALIDATE: Build succeeds locally

Task 42: Deploy to Vercel
  COMMAND: vercel --prod
  OR: Connect GitHub repo to Vercel
  VALIDATE: Site is live, no errors

Task 43: Update Documentation
  UPDATE: README.md with setup instructions
  CREATE: CONTRIBUTING.md (if open source)
  CREATE: API.md (API documentation)
  VALIDATE: Docs are accurate

Task 44: Create User Guide
  CREATE: docs/USER_GUIDE.md
  CONTENT:
    - How to create a project
    - How to use the editor
    - How to export PDF
  VALIDATE: Non-technical users can follow

Task 45: Final Manual Testing
  TEST_FLOW:
    1. Signup/Login
    2. Create project
    3. Use editor extensively
    4. Export PDF
    5. Create multiple projects
    6. Delete project
  DEVICES: Desktop, Mobile
  BROWSERS: Chrome, Firefox, Safari
  VALIDATE: Everything works as expected
```

---

### Pseudocode per Task (Critical Tasks Only)

#### Task 8: Implement Auth Feature

```typescript
// src/features/auth/services/authService.ts
'use server'

import { createServerClient } from '@/shared/lib/supabase/server'
import { signupSchema } from '../types/schemas'

// PATTERN: Server Actions for auth operations
export async function signup(formData: FormData) {
  // PATTERN: Always validate input first
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName')
  }

  const result = signupSchema.safeParse(rawData)
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const { email, password, fullName } = result.data

  // CRITICAL: Use server client (has cookies access)
  const supabase = createServerClient()

  // GOTCHA: Supabase Auth signup returns user immediately
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName } // Store in user metadata
    }
  })

  if (error) {
    // PATTERN: Standardized error format
    return { error: error.message }
  }

  // PATTERN: Create profile entry (triggered by DB trigger ideally)
  // Or manually:
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: data.user!.id,
      email,
      full_name: fullName
    })

  if (profileError) {
    // GOTCHA: User created but profile failed - cleanup or handle
    console.error('Profile creation failed:', profileError)
  }

  // CRITICAL: Return redirect URL for client-side navigation
  return { success: true, redirectTo: '/dashboard' }
}

// src/features/auth/hooks/useAuth.ts
'use client'

import { createBrowserClient } from '@/shared/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function useAuth() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [isLoading, setIsLoading] = useState(false)

  // PATTERN: Client-side session check
  async function getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  async function logout() {
    setIsLoading(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh() // CRITICAL: Refresh to clear server cache
  }

  return { getSession, logout, isLoading }
}
```

#### Task 12: Implement Project Service

```typescript
// src/features/projects/services/projectService.ts
'use server'

import { createServerClient } from '@/shared/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Project } from '../types'

// PATTERN: All DB operations through service layer
export async function getProjects(): Promise<Project[]> {
  const supabase = createServerClient()

  // CRITICAL: RLS automatically filters by auth.uid()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .is('deleted_at', null) // Only non-deleted
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch projects:', error)
    throw new Error('Failed to load projects')
  }

  // PATTERN: Transform database types to app types
  return data.map(transformProject)
}

export async function createProject(title: string): Promise<Project> {
  const supabase = createServerClient()

  // CRITICAL: Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // PATTERN: Default empty content
  const defaultContent = {
    blocks: [],
    version: 1
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      title,
      content: defaultContent
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create project:', error)
    throw new Error('Failed to create project')
  }

  // CRITICAL: Revalidate dashboard cache
  revalidatePath('/dashboard')

  return transformProject(data)
}

export async function updateProject(
  id: string,
  updates: Partial<Pick<Project, 'title' | 'content'>>
): Promise<Project> {
  const supabase = createServerClient()

  // GOTCHA: Only pass fields that exist in DB
  const { data, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Failed to update project:', error)
    throw new Error('Failed to save changes')
  }

  // PATTERN: Revalidate specific paths
  revalidatePath(`/editor/${id}`)
  revalidatePath('/dashboard')

  return transformProject(data)
}

// PATTERN: Soft delete
export async function deleteProject(id: string): Promise<void> {
  const supabase = createServerClient()

  const { error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    throw new Error('Failed to delete project')
  }

  revalidatePath('/dashboard')
}

// HELPER: Transform DB row to app type
function transformProject(row: any): Project {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    content: row.content,
    thumbnailUrl: row.thumbnail_url,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }
}
```

#### Task 17: Implement Drag & Drop

```typescript
// src/features/editor/hooks/useDragDrop.ts
'use client'

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useEditorStore } from '../store/editorStore'

export function useDragDrop() {
  const { blocks, reorderBlocks, addBlock } = useEditorStore()

  // CRITICAL: Configure sensors for mouse + touch
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8 // Prevent accidental drags
      }
    })
  )

  // PATTERN: Handle reorder on drag end
  function handleDragEnd(event: any) {
    const { active, over } = event

    if (!over) return

    // CASE 1: Dragging from sidebar (new block)
    if (active.id.startsWith('sidebar-')) {
      const blockType = active.id.replace('sidebar-', '')
      const newBlock = createBlock(blockType)

      // GOTCHA: Insert at drop position, not end
      const overIndex = blocks.findIndex(b => b.id === over.id)
      addBlock(newBlock, overIndex)
      return
    }

    // CASE 2: Reordering existing blocks
    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id)
      const newIndex = blocks.findIndex(b => b.id === over.id)

      // CRITICAL: Use arrayMove from dnd-kit
      reorderBlocks(oldIndex, newIndex)
    }
  }

  return { sensors, handleDragEnd }
}

// HELPER: Create default block based on type
function createBlock(type: BlockType): Block {
  const id = crypto.randomUUID() // CRITICAL: Unique ID

  const defaults: Record<BlockType, Partial<Block>> = {
    text: {
      content: 'Start typing...',
      properties: { fontSize: 16, color: '#000000' }
    },
    heading: {
      content: 'Heading',
      properties: { fontSize: 32, fontWeight: 700 }
    },
    image: {
      content: null,
      properties: { src: '', width: 'auto', height: 'auto' }
    },
    divider: {
      content: null,
      properties: { thickness: 2, style: 'solid', color: '#cccccc' }
    },
    spacer: {
      content: null,
      properties: { height: 40 }
    }
  }

  return {
    id,
    type,
    content: defaults[type].content ?? null,
    properties: defaults[type].properties ?? {}
  }
}
```

#### Task 21: Implement Auto-Save

```typescript
// src/features/editor/hooks/useAutoSave.ts
'use client'

import { useEffect, useRef } from 'react'
import { useEditorStore } from '../store/editorStore'
import { updateProject } from '@/features/projects/services/projectService'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { toast } from 'sonner'

export function useAutoSave(projectId: string) {
  const { blocks, isDirty, markSaved, setIsSaving } = useEditorStore()
  const lastSaveRef = useRef<string>('')

  // CRITICAL: Debounce to avoid excessive saves
  const debouncedBlocks = useDebounce(blocks, 30000) // 30 seconds

  useEffect(() => {
    // GOTCHA: Don't save if not dirty or blocks unchanged
    if (!isDirty) return

    const currentState = JSON.stringify(debouncedBlocks)
    if (currentState === lastSaveRef.current) return

    // PATTERN: Async save without blocking UI
    async function save() {
      setIsSaving(true)

      try {
        await updateProject(projectId, {
          content: { blocks: debouncedBlocks, version: 1 }
        })

        lastSaveRef.current = currentState
        markSaved()

        // PATTERN: Subtle success feedback
        toast.success('Saved', { duration: 1000 })
      } catch (error) {
        console.error('Auto-save failed:', error)

        // CRITICAL: Notify user of save failure
        toast.error('Failed to save. Please try manually.')
      } finally {
        setIsSaving(false)
      }
    }

    save()
  }, [debouncedBlocks, isDirty, projectId])

  // PATTERN: Manual save function
  async function saveNow() {
    if (!isDirty) return

    setIsSaving(true)
    try {
      await updateProject(projectId, {
        content: { blocks, version: 1 }
      })
      markSaved()
      toast.success('Saved successfully')
    } catch (error) {
      toast.error('Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  return { saveNow }
}
```

#### Task 25: Create PDF Generation API

```typescript
// src/app/api/pdf/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/shared/lib/supabase/server'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'
import { renderTemplate } from '@/features/pdf/services/pdfService'

// CRITICAL: Configure for Vercel serverless
export const maxDuration = 60 // Vercel Pro: 60s, Hobby: 10s
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // PATTERN: Validate auth
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // PATTERN: Parse and validate input
    const { projectId } = await request.json()
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    // PATTERN: Fetch project data
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // CRITICAL: Verify ownership via RLS (already handled by RLS, but double-check)
    if (project.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // PATTERN: Render HTML from blocks
    const html = renderTemplate(project.content.blocks, project.title)

    // CRITICAL: Launch Puppeteer with Vercel-compatible chromium
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    })

    const page = await browser.newPage()

    // GOTCHA: Use setContent instead of goto for HTML strings
    await page.setContent(html, { waitUntil: 'networkidle0' })

    // PATTERN: Generate PDF with high-quality settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
    })

    await browser.close()

    // PATTERN: Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${project.title}.pdf"`
      }
    })

  } catch (error) {
    console.error('PDF generation failed:', error)
    return NextResponse.json(
      { error: 'PDF generation failed' },
      { status: 500 }
    )
  }
}

// src/features/pdf/services/pdfService.ts
import type { Block } from '@/features/editor/types'

// PATTERN: Render blocks to HTML
export function renderTemplate(blocks: Block[], title: string): string {
  const blocksHtml = blocks.map(renderBlock).join('\n')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @page {
          size: A4;
          margin: 20mm 15mm;
        }
        body {
          font-family: 'Inter', 'Helvetica', sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .block {
          margin-bottom: 1em;
        }
        /* Add more styles based on block properties */
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${blocksHtml}
    </body>
    </html>
  `
}

function renderBlock(block: Block): string {
  const { type, content, properties } = block

  // PATTERN: Render based on block type
  switch (type) {
    case 'text':
      return `<p class="block" style="font-size: ${properties.fontSize}px; color: ${properties.color};">${content}</p>`

    case 'heading':
      return `<h2 class="block" style="font-size: ${properties.fontSize}px; font-weight: ${properties.fontWeight};">${content}</h2>`

    case 'image':
      return `<img class="block" src="${properties.src}" alt="${properties.alt || ''}" style="width: ${properties.width}; height: ${properties.height};" />`

    case 'divider':
      return `<hr class="block" style="border: none; border-top: ${properties.thickness}px ${properties.style} ${properties.color};" />`

    case 'spacer':
      return `<div class="block" style="height: ${properties.height}px;"></div>`

    default:
      return ''
  }
}
```

---

### Integration Points

```yaml
SUPABASE:
  database:
    - tables: profiles, projects
    - RLS policies: Enable on all tables
    - indexes: idx_projects_user_id

  auth:
    - providers: email, google
    - session: JWT tokens, 7 days expiry
    - middleware: Check auth on protected routes

  storage:
    - buckets: project-thumbnails, user-uploads
    - policies: Users can upload to own folder

  realtime:
    - NOT USED in MVP (future: collaborative editing)

NEXT.JS:
  routing:
    - (auth): /login, /signup
    - (main): /dashboard, /editor/[id]
    - api: /api/pdf/generate, /api/health

  middleware:
    - Check auth status
    - Redirect logic

  server_actions:
    - Auth: signup, login, logout
    - Projects: create, update, delete
    - Editor: auto-save

EXTERNAL_APIS:
  none_in_mvp:
    - OpenAI: Phase 2 (AI assistant)
    - Stripe: Phase 3 (payments)
    - Resend: Phase 3 (email delivery)

VERCEL:
  deployment:
    - Auto-deploy from GitHub
    - Environment variables in dashboard
    - @sparticuz/chromium-min for Puppeteer

  blob_storage:
    - NOT USED in MVP (future: store PDFs)

ENVIRONMENT_VARIABLES:
  required:
    - NEXT_PUBLIC_SUPABASE_URL
    - NEXT_PUBLIC_SUPABASE_ANON_KEY
    - SUPABASE_SERVICE_ROLE_KEY (for admin operations, if needed)

  optional:
    - NODE_ENV (development/production)
    - NEXT_PUBLIC_APP_URL (for redirects)
```

---

## Validation Loop

### Level 1: Syntax & Style

```bash
# ALWAYS run these FIRST before committing

# 1. Linting (auto-fix what's possible)
npm run lint
# Expected: No errors

# 2. Type checking
npx tsc --noEmit
# Expected: No type errors

# 3. Prettier (if configured)
npx prettier --check "src/**/*.{ts,tsx}"
# If errors: npx prettier --write "src/**/*.{ts,tsx}"

# 4. Check for console.log (cleanup)
grep -r "console.log" src/ --exclude-dir=node_modules
# Expected: Only intentional logs remain
```

### Level 2: Unit Tests

```typescript
// tests/unit/projects.test.ts
import { getProjects, createProject, updateProject, deleteProject } from '@/features/projects/services/projectService'

describe('Project Service', () => {
  // PATTERN: AAA - Arrange, Act, Assert

  test('createProject creates a new project', async () => {
    // Arrange
    const title = 'Test eBook'

    // Act
    const project = await createProject(title)

    // Assert
    expect(project).toBeDefined()
    expect(project.title).toBe(title)
    expect(project.content.blocks).toEqual([])
  })

  test('updateProject updates title and content', async () => {
    // Arrange
    const project = await createProject('Original Title')
    const newTitle = 'Updated Title'
    const newContent = { blocks: [{ id: '1', type: 'text', content: 'Hello', properties: {} }], version: 1 }

    // Act
    const updated = await updateProject(project.id, { title: newTitle, content: newContent })

    // Assert
    expect(updated.title).toBe(newTitle)
    expect(updated.content.blocks.length).toBe(1)
  })

  test('deleteProject soft deletes project', async () => {
    // Arrange
    const project = await createProject('To Delete')

    // Act
    await deleteProject(project.id)
    const projects = await getProjects()

    // Assert
    expect(projects.find(p => p.id === project.id)).toBeUndefined()
  })
})

// tests/unit/editor.test.ts
import { useEditorStore } from '@/features/editor/store/editorStore'
import { renderHook, act } from '@testing-library/react'

describe('Editor Store', () => {
  test('addBlock adds a new block', () => {
    const { result } = renderHook(() => useEditorStore())

    act(() => {
      result.current.addBlock({
        id: '1',
        type: 'text',
        content: 'Hello',
        properties: {}
      })
    })

    expect(result.current.blocks).toHaveLength(1)
    expect(result.current.blocks[0].content).toBe('Hello')
  })

  test('reorderBlocks changes block order', () => {
    const { result } = renderHook(() => useEditorStore())

    act(() => {
      result.current.addBlock({ id: '1', type: 'text', content: 'First', properties: {} })
      result.current.addBlock({ id: '2', type: 'text', content: 'Second', properties: {} })
      result.current.reorderBlocks(0, 1)
    })

    expect(result.current.blocks[0].content).toBe('Second')
    expect(result.current.blocks[1].content).toBe('First')
  })
})
```

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage

# Expected: 80%+ coverage for services, 60%+ for components
```

### Level 3: Integration Test

```bash
# 1. Start dev server
npm run dev
# Wait for "Ready on http://localhost:3000"

# 2. Test health endpoint
curl http://localhost:3000/api/health
# Expected: {"status": "ok"}

# 3. Test signup (manual)
# Open http://localhost:3000/signup
# Fill form and submit
# Expected: Redirect to /dashboard

# 4. Test project creation
# Click "Create New Project"
# Expected: Modal opens, project created, navigates to editor

# 5. Test editor
# Add blocks via drag & drop
# Edit text inline
# Change properties in panel
# Expected: Changes reflect immediately

# 6. Test auto-save
# Make changes, wait 30 seconds
# Expected: "Saved" toast appears

# 7. Test PDF export
# Click "Export PDF" button
# Expected: Modal shows, PDF downloads after <10s

# 8. Test PDF content (manual)
# Open downloaded PDF
# Expected: Content matches editor exactly
```

### Level 4: E2E Tests

```typescript
// tests/e2e/user-flow.spec.ts
import { test, expect } from '@playwright/test'

test('complete user flow: signup to PDF export', async ({ page }) => {
  // 1. Signup
  await page.goto('http://localhost:3000/signup')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'SecurePass123!')
  await page.fill('input[name="fullName"]', 'Test User')
  await page.click('button[type="submit"]')

  // Should redirect to dashboard
  await expect(page).toHaveURL(/\/dashboard/)

  // 2. Create project
  await page.click('button:has-text("Create New Project")')
  await page.fill('input[name="title"]', 'My First eBook')
  await page.click('button:has-text("Create")')

  // Should navigate to editor
  await expect(page).toHaveURL(/\/editor\/[a-f0-9-]+/)

  // 3. Add blocks
  await page.dragAndDrop('[data-block-type="text"]', '[data-canvas]')
  await page.fill('[data-block-id] [contenteditable]', 'This is my first paragraph.')

  await page.dragAndDrop('[data-block-type="heading"]', '[data-canvas]')
  await page.fill('[data-block-id]:nth-child(2) [contenteditable]', 'Chapter 1')

  // 4. Wait for auto-save
  await expect(page.locator('text=Saved')).toBeVisible({ timeout: 35000 })

  // 5. Export PDF
  await page.click('button:has-text("Export PDF")')

  // Wait for download
  const download = await page.waitForEvent('download', { timeout: 15000 })
  expect(download.suggestedFilename()).toContain('.pdf')

  // 6. Logout
  await page.click('[data-user-menu]')
  await page.click('button:has-text("Logout")')
  await expect(page).toHaveURL('/login')
})
```

```bash
# Run E2E tests
npx playwright test

# Run with UI (debugging)
npx playwright test --ui

# Expected: All tests pass
```

---

## Final Validation Checklist

**Before marking MVP as complete:**

- [ ] All tests pass: `npm test` (unit + integration)
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npx tsc --noEmit`
- [ ] E2E flow works: `npx playwright test`
- [ ] Manual testing on 3 browsers (Chrome, Firefox, Safari)
- [ ] Mobile responsive verified on real device
- [ ] Performance: Lighthouse score 90+ (Performance)
- [ ] Accessibility: Lighthouse score 100 (Accessibility)
- [ ] Security: RLS policies tested, no secrets exposed
- [ ] Error handling: All user-facing errors display friendly messages
- [ ] Loading states: All async operations show spinners/skeletons
- [ ] Toast notifications: Success/error feedback on all actions
- [ ] Documentation updated: README.md, API.md, USER_GUIDE.md
- [ ] Deployment successful: Vercel build passes, site live
- [ ] Environment variables configured in Vercel dashboard
- [ ] Supabase production instance configured (not dev)

---

## Anti-Patterns to Avoid

### Architecture
- ❌ **Don't mix Server and Client Components incorrectly**
  - Server Components can import Client Components
  - Client Components CANNOT import Server Components
  - Use composition pattern to pass Server Components as children

- ❌ **Don't bypass Supabase RLS**
  - Never use service role key in client-side code
  - Always test RLS policies with different user IDs

- ❌ **Don't store sensitive data in localStorage/Zustand persist**
  - Only persist UI preferences (theme, sidebar state)
  - Never persist auth tokens (Supabase handles this)

### Performance
- ❌ **Don't fetch data in useEffect when Server Components are available**
  - Use Server Components for initial data fetching
  - Only use useEffect for client-side mutations

- ❌ **Don't re-render entire canvas on every block change**
  - Memoize individual blocks with React.memo
  - Use Zustand selectors to subscribe to specific blocks

- ❌ **Don't generate PDFs synchronously in API route**
  - Use proper async/await patterns
  - Consider background jobs for large PDFs (future)

### Security
- ❌ **Don't trust client-side validation alone**
  - Always validate on server (Zod schemas in Server Actions)
  - RLS is last line of defense

- ❌ **Don't expose project IDs without ownership check**
  - RLS handles this automatically
  - But verify in API routes if bypassing RLS

- ❌ **Don't allow XSS in user content**
  - Sanitize HTML if using innerHTML
  - Prefer React's JSX (auto-escapes)

### Code Quality
- ❌ **Don't create God components**
  - Max 500 lines per file, 50 lines per function
  - Break into smaller, focused components

- ❌ **Don't use `any` type**
  - Use `unknown` if type is truly unknown
  - Define proper types/interfaces

- ❌ **Don't skip error handling**
  - Every async operation needs try/catch or .catch()
  - Display user-friendly error messages

### UX
- ❌ **Don't block UI during saves**
  - Use optimistic updates
  - Show loading states without disabling entire form

- ❌ **Don't lose user work on errors**
  - Implement draft/recovery system
  - localStorage backup before major operations

- ❌ **Don't make users wait without feedback**
  - Loading spinners for all async operations
  - Progress indicators for long operations (PDF gen)

---

## Confidence Score: 8.5/10

### Justification

#### ✅ Factors that Increase Confidence

**Well-Documented Stack:**
- Next.js 15 has extensive official documentation and recent guides (2024-2025)
- Supabase RLS patterns are well-established with clear examples
- @dnd-kit is mature and widely used for drag & drop
- Puppeteer on Vercel is documented with @sparticuz/chromium-min solution

**Clear Architecture:**
- Feature-First structure is well-defined in CLAUDE.md
- Reference implementation available in saas-factory-setup/
- Patterns are consistent and repeatable

**Proven Technologies:**
- All chosen libraries are production-tested (Supabase, Next.js, Puppeteer)
- No experimental or alpha dependencies
- Large community support for troubleshooting

**Comprehensive PRP:**
- Every task has clear acceptance criteria
- Critical gotchas documented with examples
- Validation loops are executable and specific
- Pseudocode provides implementation guidance

**Strong Foundation:**
- Claude Code infrastructure (commands, agents) already configured
- System prompt (CLAUDE.md) defines all conventions
- Testing strategy defined from start

#### ⚠️ Factors that Reduce Confidence

**Puppeteer Performance Risk (- 1 point):**
- PDF generation on Vercel serverless has timeouts (10s Hobby, 60s Pro)
- Large eBooks (50+ pages with images) might exceed limits
- **Mitigation:** Keep MVP eBooks simple (<20 pages), optimize HTML template
- **Future:** Move to background jobs with queues (Bull, Inngest)

**Drag & Drop Complexity (- 0.5 points):**
- Building a smooth, 60fps drag & drop editor is non-trivial
- Touch support on mobile can be finicky
- **Mitigation:** Use @dnd-kit's proven patterns, extensive testing
- **Fallback:** If performance issues, simplify to click-to-add initially

**First Implementation (no legacy code) (+ 0 / - 0 points):**
- Fresh project means no technical debt ✅
- But also no reference implementation to copy ⚠️
- **Mitigation:** Reference saas-factory-setup template, well-defined patterns

#### 🎯 Risk Mitigation Strategies

1. **Start Simple:**
   - MVP focuses on core features only
   - Templates, AI, e-commerce in later phases
   - Reduces scope and complexity

2. **Incremental Validation:**
   - Test each feature immediately after implementation
   - Don't wait until end to test integration

3. **Performance Budget:**
   - Set Lighthouse targets upfront (90+ performance)
   - Test on real devices early

4. **PDF Generation Fallback:**
   - If Puppeteer fails, offer HTML export initially
   - Users can print to PDF from browser
   - Upgrade to proper solution once proven

5. **Use TodoWrite Tool:**
   - Track all tasks systematically
   - Mark completed only when validated
   - Prevents missing critical steps

### Expected Challenges & Solutions

| Challenge | Likelihood | Impact | Solution |
|-----------|------------|--------|----------|
| PDF timeout on large eBooks | Medium | High | Optimize HTML, use Vercel Pro, or background jobs |
| Drag & drop performance | Medium | Medium | Use React.memo, virtual scrolling if needed |
| Supabase RLS misconfiguration | Low | High | Test policies with multiple user IDs |
| Mobile responsiveness | Low | Medium | Use Tailwind responsive utilities, test early |
| Auto-save race conditions | Low | Low | Debounce + optimistic updates |

### Recommendation

**Proceed with MVP implementation** with the following conditions:

1. ✅ **Start immediately** - All dependencies and patterns are documented
2. ⚠️ **Test PDF generation early** - Build a spike to validate Puppeteer on Vercel
3. ✅ **Follow task order strictly** - Each task builds on previous
4. ⚠️ **Budget extra time for editor polish** - Drag & drop UX is critical
5. ✅ **Use validation loops after every task** - Catch issues early

**Time Estimate:**
- Experienced developer: 2-3 weeks full-time
- Mid-level developer: 3-4 weeks full-time
- AI-assisted (Claude Code): Potentially faster with good prompts and validation

**Success Probability:** 85%+ if following PRP task list systematically

---

## Next Steps

1. **Execute this PRP:**
   ```bash
   /ejecutar-prp .claude/PRPs/ebook-saas-platform-mvp-2025-01-09.md
   ```

2. **Or start manually with Task 1:**
   ```bash
   npm install
   npm install @supabase/ssr @supabase/supabase-js zustand zod @dnd-kit/core ...
   ```

3. **Create GitHub project board** with tasks from this PRP

4. **Set up Supabase project** and configure environment variables

5. **Start coding** - follow task order, validate after each task

---

**PRP Generated by:** Claude Code (Sonnet 4.5)
**Reference Documentation:** Next.js 15, Supabase, @dnd-kit, Puppeteer (2024-2025)
**Review Status:** Ready for execution ✅
**Estimated Completion:** 3-4 weeks (mid-level developer, full-time)
