# Maj — My Application Journal

A personal job application tracker built with Next.js, Supabase, and TypeScript.

## Features

- **Track applications** — log jobs you apply to with title, company, location, status, job description, notes, contacts and a link to the job posting
- **Update status** — move applications through applied → assessment → interview → offer / rejected / withdrawn
- **Dashboard** — visualize your job search with stat cards and a donut chart
- **Contacts** — store contact information per application
- **Search & filter** — search by role or company, filter by status, sort by any column

## Tech Stack

- [Next.js 16](https://nextjs.org/) — App Router, server components, middleware
- [Supabase](https://supabase.com/) — PostgreSQL, Auth, Row Level Security
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/) — dashboard chart
- [Lucide React](https://lucide.dev/) — icons

## Getting Started

1. Clone the repo
2. Install dependencies: `npm install`
3. Create a Supabase project and add your environment variables to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

4. Run the development server: `npm run dev`

## TODO

- [ ] Mobile responsive layout — collapsible sidebar with hamburger menu
- [ ] Demo account with sample data
- [ ] Dark mode (CSS variables already set up)