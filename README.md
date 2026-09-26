# Claude CRM | Interactive AI Sales Pipeline & Deal Intelligence

An interactive AI-powered CRM assistant and sales pipeline builder inspired by Claude's conversational interface. Powered by **Next.js 16**, **Mastra Agent Framework**, **Google Gemini** (`gemini-3.1-flash-lite`), and **Prisma SQLite**.

## Overview

Claude CRM allows sales teams to interactively query deal intelligence, analyze revenue metrics, and build bespoke sales pipelines either from predefined sales motions or completely from scratch using visual builder widgets and natural language prompts.

## Key Features

- **Claude-like Conversational UI**: Interactive single-choice cards, multi-stage selection checkboxes, expandable reasoning blocks, and visual preview cards.
- **Custom Pipeline Architect (From Scratch)**: Design bespoke sales pipelines with custom names, custom stages, and configurable win conversion probabilities.
- **Mastra Agent Framework**: Live database tool calling (`createPipeline`, `getDeals`, `getCrmStats`, `getContacts`, `updateDeal`) to query and mutate SQLite without context stuffing.
- **Prisma & SQLite Database**: Persistent relational database schema (`prisma/schema.prisma`) tracking pipelines, stages, deals, and contacts.
- **CRM Records Explorer**: Dedicated page at `/records` with financial KPIs, stage filtering, and deals table, alongside a sliding drawer inspector on `/`.

## Branches

- **`main`**: Repository baseline documentation.
- **`dev`**: Active development branch containing the complete application codebase.

## Quick Start (Development)

1. **Clone and checkout the `dev` branch**:
   ```bash
   git clone https://github.com/iftesam15/ai-crm-chat.git
   cd ai-crm-chat
   git checkout dev
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env.local
   cp .env.example .env
   # Set your Gemini API key in .env.local:
   # GEMINI_API_KEY="your-gemini-api-key"
   # Prisma CLI reads DATABASE_URL from .env (not .env.local).
   ```

4. **Initialize SQLite Database**:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.
