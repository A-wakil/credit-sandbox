# AI Credit Sandbox

A virtual sandbox where users learn how different financial actions could *hypothetically* impact their U.S. credit score. This interactive platform allows users to experiment with financial decisions in a risk-free environment without affecting their real credit history.

## Team Members & Roles

- **Project Manager & AI Integrator:** Abdulwakil Abdulkadir
- **Front-End Developer:** Gavino Vargas
- **Back-End Developer:** Jadyn Gray
- **Data & Testing Specialist:** Jiashu Hu

## What Makes This Project Novel?

The **AI Credit Builder Simulator** introduces a truly unique approach to credit education: a *credit score flight simulator*. Instead of giving generic financial advice, the system allows users to test actions—like opening a secured card or paying down a loan—and instantly see how a hypothetical credit score might change. The AI explains the reasoning, risks, and projected timeline for each scenario. This hands-on, sandbox-style learning experience transforms complex credit concepts into intuitive, interactive experimentation, offering a level of personalization and safety that traditional credit tools do not provide.

### Core Features

- AI-powered interactive credit score simulator
- User-created "what-if" financial scenarios
- Hypothetical score change projections
- Detailed explanations and reasoning
- Timeline of expected score movement
- Risk analysis for each decision
- Personalized improvement plans
- Dashboard showing simulated credit evolution

## Tech Stack

- **Front-End:** React / Next.js
- **Back-End:** Node.js
- **Database:** Supabase
- **AI/ML:** OpenAI API, rule-based credit scoring engine
- **Tools:** GitHub, Vercel, Figma

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** package manager
- **Git** - [Download here](https://git-scm.com/)

## Getting Started

Follow these steps to set up and run the project locally:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd credit-sandbox
```

### 2. Install Dependencies

Install all required packages using npm:

```bash
npm install
```

Alternatively, you can use yarn:

```bash
yarn install
```

### 3. Set Up Database

This application uses Supabase for authentication and data persistence. Follow the complete database setup guide:

**📖 [Complete Database Setup Guide](./DATABASE_SETUP_GUIDE.md)**

Quick summary:
1. Create a free Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run the SQL scripts to create tables (see [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md))
4. Get your API keys from Supabase dashboard

### 4. Set Up Environment Variables

Create a `.env.local` file in the root directory and add your environment variables:

```bash
# Supabase Configuration (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI API (optional)
OPENAI_API_KEY=your_openai_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed instructions on getting these values.

### 5. Run the Development Server

Start the development server:

```bash
npm run dev
```

Or with yarn:

```bash
yarn dev
```

Or with pnpm:

```bash
pnpm dev
```

Or with bun:

```bash
bun dev
```

### 6. Open in Browser

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Database Documentation

This project uses Supabase (PostgreSQL) for data persistence and authentication:

- **[DATABASE_SETUP_GUIDE.md](./DATABASE_SETUP_GUIDE.md)** - Step-by-step setup instructions
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Complete schema documentation, tables, and relationships
- **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** - Environment variables configuration

### Database Tables

The application includes the following tables:
- `user_profiles` - User account information and preferences
- `credit_profiles` - User's credit profile data (payment history, utilization, etc.)
- `simulations` - Saved simulation sessions
- `scenarios` - Individual financial scenarios in simulations
- `timeline_projections` - Projected credit score timelines
- `user_activity_log` - User action tracking and analytics
- `saved_improvement_plans` - Personalized improvement plans

All tables include Row Level Security (RLS) policies to ensure users can only access their own data.

## Learn More

To learn more about Next.js, the framework powering this project:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
- [Next.js GitHub repository](https://github.com/vercel/next.js)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
