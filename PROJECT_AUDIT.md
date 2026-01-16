# PROJECT_AUDIT

## The One-Liner
A sophisticated financial dashboard merging a custom encrypted PDF decryption engine with real-time visualizations to transform raw bank data into actionable wealth insights.

## The 'Technical Hook' (Crucial)
**Custom Encrypted PDF Ingestion Pipeline**
The codebase relies on a high-value, custom-patched implementation of `pdf-parse` to bypass standard limitations and handle **password-protected** bank statements directly. This decryption layer is tightly coupled with a deterministic extraction engine (`sbi.ts`) and an AI-fallback (`gemini.ts`), creating a robust pipeline that solves the hardest problem in fintech: getting clean data from legacy banking PDFs.

**Location**: 
- `src/lib/pdf-parse-custom.js` (Proprietary patch for encrypted document handling)
- `src/lib/parsers/sbi.ts` (High-precision Regex extraction logic)

## The True Stack (Evidence-Based)
**Core Framework**: Next.js 16.1.1 (App Router), React 19 (Cutting Edge)
**Styling System**: Tailwind CSS v4, Lucide React
**Backend Architecture**: Firebase (Firestore, Auth)
**Visualization**: Recharts
**Intelligence Layer**: Google Generative AI (Gemini 2.5), Groq SDK, Zod, Custom PDF Decryption
**State Primitive**: React Hook Form, React Context
**Financial Math**: Dinero.js (Precise monetary calculations)

## Architecture & Scale Indicators
- **Serverless Data Layer**: **Firebase Firestore** handles persistence, with schema validation occurring at the application boundary.
- **Identity Management**: **Firebase Authentication** guards the application, creating a secure user-context sandbox.
- **Secure Mutations**: **Next.js Server Actions** (`use server`) are strictly employed for database writes (`server.ts`), isolating sensitive logic from the client bundle.
- **Environment Rigor**: Strictly typed environment variables ensure production stability.

## Product Features
1. **Secure Encrypted Statement Parsing**: Solves the friction of manual data entry by decrypting and parsing password-protected bank PDFs on the fly.
2. **Automated Vendor Classification**: A server-side heuristic engine (`src/lib/firebase/server.ts`) instantly categorizes transactions (e.g., 'Swiggy' → 'Food'), eliminating manual tagging.
3. **Adaptive Viewport Intelligence**: The UI delivers two distinct, optimized experiences—a streamlined transaction list for mobile and a comprehensive analytics command center for desktop—driven by conditional rendering strategies.
