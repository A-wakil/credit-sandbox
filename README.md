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

### 4. Set Up Environment Variables

Create a `.env.local` file in the root directory and add your environment variables:

```bash
# Supabase Configuration (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI API (optional)
OPENAI_API_KEY=your_openai_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

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