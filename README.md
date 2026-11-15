
<div align="right">

**English** | [Português](README.pt-BR.md)

</div>

<p align="center">
  <img src="docs/assets/SAFEFOOD-MOTION.gif" alt="SAFE FOOD AI — Animated Introduction" width="100%">
</p>

<p>
  <strong><big><big>SAFE FOOD AI</big></big></strong>
</p>

<h3>AI-Powered Food Order Communication & Restaurant Alerts</h3>

is a functional MVP that transforms customer-provided dietary requirements and food order instructions into structured, actionable restaurant alerts.

The project explores how generative AI, workflow automation, and application development can improve communication between customers and food preparation teams.

[**Live Demo**](https://safe-food-ai-mu.vercel.app/demo) | [**Technical Audit**](docs/CURSOR_TECHNICAL_AUDIT.md)

---

<h2>Project Documentation</h2>

The project documentation provides an in-depth account of the product's origin, design decisions, technical implementation, validation, limitations, and future development.

Documentation is being organized in two languages:

- **Português (pt-BR):** Technical report and development documentation in Portuguese.
- **English (en):** Technical documentation and development report in English.

<h3>Documentation Chapters</h3>

1. Project Overview and Origin
2. Problem and Opportunity
3. Product Experience and Design
4. System Architecture and Integrations
5. Development Journey
6. AI Engineering and Automation
7. Testing and Validation
8. Security, Ethics, and Limitations
9. Results and Impact
10. Roadmap and Retrospective

*Chapter links will be added as the corresponding documentation files are published.*

---

<h2>1. The Problem</h2>

Food delivery orders may include allergies, intolerances, ingredient exclusions, and special preparation requests.

These instructions can be difficult to interpret consistently, particularly when they involve multiple items, modifications, and operational considerations.

Incomplete or ambiguous communication may create additional risks during food preparation, packaging, and transportation.

SAFE FOOD AI explores a structured approach to communicating these requirements.

<h2>2. The Solution</h2>

SAFE FOOD AI converts order information into restaurant-oriented alerts and contextual operational guidance.

The MVP combines:

- Structured customer input.
- Rule-based interpretation of dietary declarations.
- Generative AI recommendations.
- Automated workflow execution.
- Restaurant-alert delivery through a simulated application interface and a WhatsApp test destination.

Each request is processed independently, without requiring a customer account or persistent dietary profile.

The application is a communication-support tool, not a food safety certification system.

---

<h2>Customer Interface</h2>

The customer-facing interface allows users to provide order details, dietary specifications, ingredient exclusions, and special preparation requests.

Each submission is processed independently, without requiring an account or persistent dietary profile.

<!-- Customer interface screenshot will be added here. -->

<h2>Restaurant View & WhatsApp Test Delivery</h2>

Generated restaurant alerts are displayed in the application's simulated restaurant interface and delivered to a WhatsApp test destination through the integrated workflow.

These outputs demonstrate how structured order information and contextual AI-generated guidance can support restaurant communication.

<!-- Restaurant view screenshot will be added here. -->

---

<h2>3. Key Features</h2>

<h3>Structured Order Interpretation</h3>

Processes customer-provided information about:

- Ordered items and quantities.
- Ingredient exclusions.
- Special preparation requests.
- Explicitly declared allergies.
- Explicitly declared intolerances.

The application distinguishes between an ingredient exclusion and a declared medical or dietary condition.

For example, requesting an item "without cheese" does not automatically mean the customer has a milk allergy.

<h3>Contextual AI Guidance</h3>

Gemini generates contextual suggestions to support restaurant operations, including:

- Food preparation.
- Order assembly.
- Item identification.
- Packaging.
- Transportation.
- Precautions related to declared dietary restrictions.

AI-generated suggestions supplement, rather than replace, human verification.

<h3>Workflow Automation</h3>

Make orchestrates the external AI-processing workflow.

The application communicates with the automation flow and retrieves the resulting restaurant alert.

<h3>WhatsApp Test Delivery</h3>

The integrated workflow has been tested to deliver the generated alert to:

1. The application's simulated restaurant interface.
2. A WhatsApp test destination.

These outputs were validated within the MVP's test environment.

<h3>Controlled Asynchronous Polling</h3>

The application includes a dedicated polling module with:

- A maximum polling duration of 90 seconds.
- Three-second polling intervals.
- AbortController-based request cancellation.
- Handling for temporary network errors.
- Explicit processing-failure handling.
- Cleanup when the component unmounts.

<h2>4. Technology Stack</h2>

| Layer | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Generative AI | Google Gemini |
| Workflow automation | Make |
| Messaging integration | WhatsApp test destination |
| Request-state management | Upstash Redis |
| Automated testing | Vitest |
| AI-assisted development | Cursor AI |
| Deployment | Vercel |
| Version control | Git, GitHub |

<h2>5. System Architecture</h2>

The MVP follows an asynchronous processing workflow.

<h3>Visual Architecture</h3>

<!-- Add the architecture diagram after uploading it to docs/assets/ -->

<h3>Technical Workflow</h3>

```text
Customer
  |
  v
SAFE FOOD AI
Next.js Application
  |
  v
Order Interpretation
& Restaurant Alert Request
  |
  v
Application API
  |
  v
Make Automation
  |
  v
Gemini
Contextual AI Guidance
  |
  v
Generated Restaurant Alert
  |
  +------------------------+
  |                        |
  v                        v
Application Demo       WhatsApp Test
Restaurant View        Destination
```

The application uses asynchronous status checks to retrieve the generated alert.

The polling implementation includes timeout, cancellation, and failure-handling safeguards.

<h2>6. AI Integration and Human Oversight</h2>

Generative AI is used to produce contextual operational recommendations based on order information.

The system is designed to avoid unsupported assumptions about a customer's dietary condition.

Important principles include:

- Allergy labels require an affirmative allergy declaration.
- Intolerance labels require an affirmative intolerance declaration.
- Ingredient exclusions alone do not establish a diagnosis.
- AI-generated precautions do not guarantee the absence of cross-contact.
- Uncertainty and food safety concerns require human verification.

The MVP does not independently verify restaurant ingredients, kitchen conditions, or food handling practices.

<h2>7. Testing and Validation</h2>

The project includes automated tests for order interpretation, API protection, and asynchronous restaurant-alert polling.

| Test Suite | Tests | Result |
|---|---:|---|
| Order interpretation | 21 | Passed |
| Restaurant alert API protection | 8 | Passed |
| Restaurant alert polling | 8 | Passed |
| **Total** | **37** | **Passed** |

Local validation also included:

- Successful Next.js production build.
- Successful TypeScript compilation.
- Successful ESLint checks.

The automated tests use controlled scenarios and mocks. They do not independently verify live third-party integrations.

The Make, Gemini, and WhatsApp workflow was also tested end-to-end in the MVP environment.

<h2>8. AI-Assisted Engineering with Cursor</h2>

Cursor AI was used to support a focused technical audit of the restaurant-alert polling implementation.

The audit identified reliability risks associated with prolonged polling, request cancellation, and error handling.

The resulting refactor introduced:

- A dedicated polling module.
- Deadline-aware asynchronous operations.
- AbortController-based cancellation.
- Explicit failure handling.
- Automated regression tests.

The implementation passed 37 automated tests and local build and lint validation.

**Read the full technical case study:**

[Cursor AI — Technical Audit and Validation](docs/CURSOR_TECHNICAL_AUDIT.md)

Implementation commit: `761f349`

<h2>9. Running Locally</h2>

<h3>Prerequisites</h3>

- Node.js compatible with the project's Next.js version.
- npm.
- Access to the required external services and credentials for integrated workflows.

<h3>Installation</h3>

Clone the repository:

```bash
git clone https://github.com/gabrielladiogenes/safe-food-ai.git
cd safe-food-ai
```

Install dependencies:

```bash
npm install
```

Configure the required environment variables using your own authorized credentials.

Do not commit `.env.local` or API secrets.

Start the development server:

```bash
npm run dev
```

Open:

http://localhost:3000

<h3>Run Automated Tests</h3>

```bash
npx vitest run
```

<h3>Run Build and Lint Checks</h3>

```bash
npm run build
npm run lint
```

Some integrated functionality requires correctly configured external services.

<h2>10. Current Scope and Limitations</h2>

SAFE FOOD AI is a portfolio MVP and technical demonstration.

Current limitations include:

- No customer registration or persistent dietary profile.
- No independent verification of ingredient composition.
- No guarantee of allergen-free food preparation.
- No confirmed public production adoption or usage metrics.
- External service availability affects integrated workflows.
- Human confirmation remains necessary for uncertain or safety-critical situations.

The application should not be used as the sole basis for decisions about food allergy safety.

<h2>11. Future Improvements</h2>

Potential next steps include:

- Expanded integration and failure-recovery tests.
- More systematic evaluation of AI-generated recommendations.
- Prompt versioning and regression evaluation.
- Additional observability for automation failures.
- Stronger server-side input validation.
- More comprehensive accessibility and usability testing.
- Further security hardening before any public production rollout.

These items represent potential improvements, not completed features.

<h2>12. Project Purpose</h2>

SAFE FOOD AI was developed as a practical exploration of the intersection between generative AI, business processes, workflow automation, and application development.

The project demonstrates the design and validation of an AI-enabled workflow, from structured input to automated processing and delivery of operational information.

---

**Developed by Gabriella Diógenes**

[GitHub Profile](https://github.com/gabrielladiogenes) | [Live Demo](https://safe-food-ai-mu.vercel.app/demo)
