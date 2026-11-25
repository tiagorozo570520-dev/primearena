# PRIME ARENA — Plataforma de Competiciones

Plataforma profesional y futurista para administrar torneos de eFootball.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Supabase** (PostgreSQL + Auth + Storage) — nuevas API Keys (`sb_publishable_` / `sb_secret_`)
- **Tailwind CSS** + diseño glassmorphism / HUD
- **Lucide React** (iconos)

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Copia `.env.example` a `.env.local` (ya contiene tus keys):

```bash
cp .env.example .env.local
```

### 3. Base de datos

1. Ve a Supabase → **SQL Editor**
2. Ejecuta el contenido de `supabase/schema.sql`

### 4. Crear usuario administrador

1. En Supabase → **Authentication** → **Users** → **Add user**
2. Crea un usuario con email + password (ese será tu acceso al panel)
3. (Opcional) Desactiva "Confirm email" si quieres entrar inmediatamente

### 5. Arrancar

```bash
npm run dev
```

- Sitio público: [http://localhost:3000](http://localhost:3000)
- Panel admin: [http://localhost:3000/admin](http://localhost:3000/admin) (redirige a login)

## Estructura actual

```
src/
  app/
    page.tsx                 # Sitio público
    login/page.tsx           # Login administrador
    admin/
      layout.tsx             # Layout protegido del panel
      page.tsx               # Dashboard admin
      players/               # (próximo módulo)
      clubs/
      national-teams/
      tournaments/
      history/
      settings/
  components/admin/          # Sidebar + Header
  lib/supabase/              # Clientes (browser / server / admin)
  middleware.ts              # Protección de rutas /admin/*
supabase/schema.sql
public/logo-titans.png
```

## Estado de módulos

1. ✅ Arquitectura + esquema DB
2. ✅ Autenticación administrativa + Panel base
3. ⏳ Biblioteca de jugadores
4. ⏳ Biblioteca de clubes
5. ⏳ Biblioteca de selecciones
6. ⏳ Storage de imágenes
7. ⏳ Creación de torneos
8. ⏳ Motor de formatos
9. ⏳ Resultados y clasificaciones
10. ⏳ Historial + estadísticas
11. ⏳ Diseño futurista completo

## Seguridad

- La **Secret Key** solo se usa en el servidor (`admin.ts`).
- Las rutas `/admin/*` están protegidas por middleware + verificación de sesión.
- RLS activado: lectura pública, escritura solo autenticada/admin.

## Actualización v3 — Biblioteca de Jugadores

### Pasos adicionales

1. Ejecuta el archivo `supabase/rls-admin-policies.sql` en el SQL Editor de Supabase  
   (permite que el usuario autenticado pueda crear/editar/eliminar registros).

2. Reinicia el servidor si es necesario:

```bash
npm run dev
```

3. Entra a **Admin → Jugadores** y prueba agregar, editar y eliminar jugadores.
