# Scholarverse AI / SIWES AI Pro

Scholarverse is a Next.js-based academic writing platform designed for Nigerian university students. It helps users generate SIWES reports, term papers, and other academic documents using AI-assisted content generation, live preview editing, profile customization, and Firebase-backed account management.

The project combines a polished front-end experience with structured data capture, Genkit AI workflows, and Firebase services to simplify academic report generation while keeping the process fast, tailored, and easy to manage.

## Project Summary

This application is built to solve a common university problem: turning raw student data, attachment experience, skills, and company information into a polished academic document that follows academic standards and university reporting expectations.

Users can:

- Register and log in to a personal account
- Fill out student, company, and technical details
- Generate AI-written report content
- Preview the document in real time
- Save draft progress
- Purchase or unlock generated documents
- View wallet and transaction information
- Manage account and referral-related activity
- Access an admin dashboard for user and report oversight

The app is centered around the idea of reducing writing fatigue, improving consistency, and making report preparation more accessible to students.

## Product Positioning

The product is marketed as:

- "The #1 AI Academic & SIWES Generator for Nigerian Students"
- A tool for generating defense-ready reports and term papers in minutes
- An application designed for UNN and broader Nigerian academic standards

In other words, it targets students who need structured academic reports without spending long hours on formatting, writing, and research arrangement.

## Core Features

### 1. Student and Academic Information Capture
The system gathers a student profile, including:

- full name
- registration number
- university
- faculty
- department
- course code
- academic level
- report details like month and year

This supports personalized document generation and helps build a consistent academic identity in the final output.

### 2. Attachment and Company Information Collection
Users enter the place of attachment, company or organization profile, supervisor details, and location information.

This includes fields such as:

- place of attachment
- attachment location
- supervisor names
- CEO or company representative name
- company mission, values, and vision
- company specialization and profile description

This data allows the AI to generate a realistic and contextual report narrative.

### 3. Technical and Career Profiling
The app captures technical details that influence the report text, such as:

- field of study
- primary skill acquired
- technologies used
- programming language
- framework(s)
- career path

This is used to tailor the generated report to the user's discipline and practical training.

### 4. AI-Powered Report Generation
At the heart of the project are Genkit-powered AI flows. These flows generate key sections of student reports, such as:

- acknowledgement text
- abstract text
- skills chapter content
- challenges narrative
- conclusion text
- references
- report sections tailored by document type

The AI can create output based on a structured set of academic inputs and optimize it for the selected document type.

### 5. Live Preview and Editing Experience
Users can edit the generated content while seeing a formatted preview of the document as they work. The app includes controls for:

- page count selection
- cover theme selection
- text alignment
- font family and font size
- margin settings
- page numbering
- reference style
- report layout settings

This creates a document authoring workflow rather than a simple one-shot generation tool.

### 6. AI Suggestions and Content Enrichment
The project includes suggestion logic that can recommend values based on contextual fields such as department, field of study, and academic background.

This helps users complete forms faster and creates more consistent and relevant AI output.

### 7. Draft Persistence and User Workflows
The application stores user drafts in Firestore so that progress can be restored later.

This is important for a step-based report builder, especially when users leave and come back to continue editing.

### 8. Wallet, Payments, and Reward Features
The product includes monetization and account features such as:

- wallet balance tracking
- report purchase flows
- top-up support
- referral support
- payout / withdrawal logic
- transaction tracking

The project includes referral-based commission logic and payout thresholds for financial administration.

### 9. Admin Dashboard and Monitoring
The app has admin routes and functions for viewing users, reports, balances, and referral data. This supports operations management and moderation.

### 10. Testimonials and Social Proof
The interface includes testimonials and university leaderboard components to support trust-building and conversion.

## Target Users

This application is built primarily for:

- final-year university students
- industrial training / SIWES participants
- students writing term papers and academic reports
- departments or academic workflows that need standardized report generation
- users who want a faster, guided way to produce academic writing

## Technology Stack

### Frontend
- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Custom UI components
- Radix UI primitives for accessible interface elements
- Lucide React icons

### Backend and Data
- Firebase Authentication
- Firestore Database
- Firebase App Hosting configuration
- Firebase storage integration

### AI Layer
- Genkit
- Google AI / Gemini model integration
- Prompt-driven generation flows for academic text creation

### Additional Libraries
- Zod for schema validation
- React Hook Form and resolvers
- date-fns
- recharts
- mermaid
- react-paystack
- embla-carousel
- clsx / tailwind-merge

## Project Architecture

The app is organized around a Next.js App Router structure with feature-focused domains:

- app/ contains pages and route-level UI
- components/ contains reusable interface elements and document editing controls
- ai/ contains Genkit setup and flow definitions
- firebase/ contains Firebase initialization and config logic
- lib/ contains shared pricing, standards, types, utilities, and document policy logic
- context/ contains UI state providers for notifications and loading
- public/ contains static assets such as brand images and robots/sitemap files

## Main Application Flow

### User Journey
1. User signs up or logs in.
2. A draft is created or restored from Firestore.
3. User enters academic and attachment data.
4. The app uses AI to generate or improve report sections.
5. The user tweaks formatting, structure, and page settings.
6. The document is previewed in the app.
7. User finalizes and pays if needed.
8. The generated report is made available or downloaded based on project logic.

### Document Generation Focus
The app supports several document categories:

- SIWES / IT Report
- Term Paper
- Essay

Pricing and page limits are controlled centrally in:

- src/lib/config.ts

These settings define:

- minimum and maximum page counts
- default page counts
- price per document type
- word budget allocation per chapter
- page structure planning logic

## AI Generation Design

The project includes AI flows such as:

- generate-report-sections.ts
- generate-company-profile.ts
- generate-technical-details.ts
- generate-skills-chapter.ts
- generate-chapter-four.ts
- generate-chapter-five.ts
- provide-ai-suggestions.ts
- normalize-university-name.ts
- moderate-testimonial.ts
- enhance-testimonial-text.ts

These flows handle different parts of the academic generation pipeline, from standardizing university names to generating discipline-specific chapter material.

The app uses Genkit with Google AI integration:

- src/ai/genkit.ts sets up the AI instance
- AI flows are defined using schema-driven prompts and typed outputs

This makes the generation process easier to manage and more predictable than freeform prompt handling.

## Core Project Files

### Package and scripts
- package.json contains the project scripts and dependencies

Key scripts:

- npm run dev — start the Next.js development server
- npm run build — create a production build
- npm run start — serve the built app
- npm run lint — run lint checks
- npm run typecheck — run TypeScript checks
- npm run genkit:dev — start the Genkit development process
- npm run genkit:watch — watch mode for Genkit flows

### Firebase config
- src/firebase/config.ts contains the Firebase client configuration
- src/firebase/init.ts initializes the Firebase app and services
- src/firebase/admin-init.ts initializes the Admin SDK using Application Default Credentials and the same project configuration
- firestore.rules defines Firestore database access rules

### App hosting
- apphosting.yaml contains Firebase App Hosting configuration

### Styles and UI
- src/app/globals.css contains global styling and theme configuration
- tailwind.config.ts configures Tailwind
- components.json defines UI component metadata

### Domain logic and settings
- src/lib/config.ts contains document price and page limit configuration
- src/lib/types.ts defines data models used by the report builder and user profile

## Local Development Setup

### Requirements
Before running the project, make sure you have:

- Node.js 18+ or a compatible version
- npm or yarn
- access to a Firebase project, if you intend to use auth/database features
- a valid Google AI API key for Genkit generation features

### Install dependencies
```bash
npm install
```

### Start the app
```bash
npm run dev
```

The app is configured to run on port 9002:

```bash
http://localhost:9002
```

### Build for production
```bash
npm run build
```

### Run the production build
```bash
npm run start
```

## Required Environment and Configuration Notes

The client and Admin SDK configurations in `src/firebase/config.ts` and `src/firebase/admin-init.ts` must target the same Firebase project. The Admin SDK uses Application Default Credentials; for local development, configure Google Application Default Credentials, and in production, grant the hosting runtime identity the required Firebase permissions.

Changing the configured project does not copy Firestore data or Firebase Authentication users. Existing data remains in the previous project unless you migrate it separately. Enable the required Firebase Authentication providers and configure Firestore, Storage, and their security rules in the destination project before deploying.

Relevant file:
- src/firebase/config.ts
- src/firebase/admin-init.ts

If your deployment requires AI generation, the Genkit setup may also need model credentials and environment configuration. The app expects a proper Google AI integration to be available in the runtime environment.

Common configuration items to review:

- Firebase project ID
- Firebase web config details
- authentication settings
- Firestore rules and indexes
- AI provider key(s)
- Paystack secret key for payouts / payment flows

Company profile generation uses the configured Gemini model directly and does not require Google Custom Search credentials. Gemini may not know current or lesser-known company details, so verify generated information before using it.

## Firebase and App Hosting Notes

The project is prepared for Firebase App Hosting:

- apphosting.yaml exists in the root
- Firebase rules and app config are integrated into the project structure
- the app is designed to run as a Next.js app with Firebase services behind it

If you deploy to Firebase App Hosting or Firebase Hosting, make sure the environment and project settings are aligned with the app configuration before launching.

## Document Generation Rules and Page Budgeting

The app includes built-in logic for academic reporting constraints, such as:

- minimum page counts per document type
- maximum page counts per document type
- default page counts
- word budgets for sections like abstract, skills chapter, and conclusion

This configuration can be found in:

- src/lib/config.ts

The logic supports:

- term paper budgets
- essay budgets
- SIWES / IT report budgets

This is especially important because the application is designed to generate credible academic output and not just generic text.

## User Roles and Functional Areas

The app blends multiple product areas:

- Student self-service generation
- Account authentication and profile creation
- AI document drafting
- File-ready preview/editing
- Wallet and purchase flow
- Referral and payout logic
- Admin monitoring

This makes the codebase larger than a simple form page. It is more accurately described as a full academic-writing SaaS product.

## Directory Overview

```text
.
├── README.md
├── apphosting.yaml
├── components.json
├── firestore.rules
├── next-env.d.ts
├── next.config.js
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── docs/
│   └── blueprint.md
├── pages/
│   └── api/
│       └── initiateWithdrawal.ts
├── public/
│   ├── robots.txt
│   ├── schverse-loader.gif
│   ├── schverse-logo.png
│   └── sitemap.xml
├── src/
│   ├── ai/
│   │   ├── dev.ts
│   │   ├── genkit.ts
│   │   └── flows/
│   ├── app/
│   │   ├── about/
│   │   ├── auth/
│   │   ├── generate/
│   │   ├── home/
│   │   ├── login/
│   │   ├── profile/
│   │   ├── scholarverse/
│   │   ├── signup/
│   │   ├── verify-email/
│   │   └── ...
│   ├── components/
│   ├── context/
│   ├── firebase/
│   ├── hooks/
│   ├── lib/
│   └── ...
└── ...
```

## Notes on the Current Codebase

This project is a working academic SaaS prototype with multiple product features layered together. It uses:

- a polished landing page for marketing and conversion
- a report builder with rich form inputs
- AI-generated academic content
- Firebase-backed persistence and auth
- payment and referral logic
- admin monitoring

Because of this broad feature set, the repository is best treated as a full application rather than a simple demo or starter template.

## Recommended Development Workflow

For changes and enhancements, the usual workflow is:

1. Install dependencies.
2. Configure Firebase / AI keys.
3. Run the app locally with `npm run dev`.
4. Work on the relevant route or component.
5. Validate with TypeScript and lint checks.
6. Build production files before deployment.

Typical validation commands:

```bash
npm run typecheck
npm run lint
npm run build
```

## Security and Production Readiness Considerations

Before production deployment, review the following:

- Firebase security rules for auth and Firestore access
- AI provider credentials and usage limits
- payment integration safety and secret handling
- user data retention policies
- admin access restrictions
- environment variable management
- withdrawal and balance logic validation

The current codebase is feature-rich and useful as a product foundation, but it should be hardened before being used in a live production environment without review.

## Summary

Scholarverse is a full-stack AI-powered academic report generation platform focused on helping students create professional SIWES and academic documents faster. It combines:

- structured academic data capture
- AI generation workflows
- live editing and styling controls
- Firebase persistence
- wallet/referral management
- admin monitoring

It is best understood as an academic SaaS application designed to streamline the production of school reports, industrial training documentation, and term papers with minimal manual effort.

## Useful Starting Points

If you are new to the project, start with these files:

- README.md — project overview and onboarding
- src/app/page.tsx — landing page and product positioning
- src/app/generate/page.tsx — main report-generation workflow
- src/ai/genkit.ts — AI service setup
- src/ai/flows/ — generation logic
- src/lib/config.ts — document rules and pricing
- src/firebase/config.ts — Firebase configuration

## License

No explicit license file is included in the repository at the moment. If this project is intended for public or commercial distribution, add an appropriate license before release.
#   s c g l m m 7 6 6 6 5 4 3 w e e s  
 