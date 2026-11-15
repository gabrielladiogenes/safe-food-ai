
# SAFE FOOD AI — AI-Assisted Technical Audit

**Project:** SAFE FOOD AI  
**Development tool:** Cursor AI  
**Framework:** Next.js 16, React, TypeScript  
**Testing framework:** Vitest 5.1.0  
**Audit date:** November 14, 2026  
**Status:** Implemented and locally validated

---

## 1. Executive Summary

This document describes an AI-assisted technical audit and refactoring initiative conducted on SAFE FOOD AI using Cursor AI.

The objective was to investigate the application's asynchronous restaurant-alert processing flow, identify reliability risks, and implement a more controlled polling mechanism.

The resulting changes introduced explicit time limits, request cancellation, error handling, and automated tests.

The implementation was validated through 37 passing automated tests, a successful production build, and ESLint verification.

## 2. Project Context

SAFE FOOD AI is a functional MVP designed to transform customer-provided food restrictions and order instructions into structured restaurant alerts.

The application integrates:

- Next.js and TypeScript for the application interface and API routes.
- Make for workflow automation.
- Gemini for contextual AI-generated guidance.
- WhatsApp for test-message delivery.
- Upstash Redis for request-state management and API protection.

The system generates operational guidance related to food preparation, assembly, identification, packaging, and transportation.

The application does not guarantee allergen-free preparation or eliminate the need for human verification.

## 3. Technical Problem

The restaurant-alert generation process involves asynchronous communication between the application and external automation services.

The original polling implementation required additional safeguards against prolonged waiting and interrupted requests.

Potential reliability concerns included:

- Polling continuing longer than intended.
- Requests remaining active after a user leaves the page.
- Temporary network failures.
- Unsuccessful processing states.
- Lack of a clearly enforced maximum waiting period.

These were reliability risks identified during the AI-assisted review, not evidence of a confirmed production incident.

## 4. AI-Assisted Development Workflow

Cursor AI was used to support the technical review and refactoring process.

The workflow involved:

1. Reviewing the existing asynchronous polling logic.
2. Identifying potential reliability and cancellation issues.
3. Refactoring polling into a dedicated TypeScript module.
4. Introducing explicit timeout and cancellation mechanisms.
5. Reviewing the implementation through automated tests and build validation.

AI-generated changes were subject to developer review and verification rather than being accepted as inherently correct.

## 5. Implemented Solution

### 5.1 Dedicated Polling Module

The polling logic was extracted into:

`app/pollRestaurantAlert.ts`

This separation improves testability and keeps the application interface focused on user interaction.

### 5.2 Maximum Polling Duration

The implementation defines a maximum polling duration of 90 seconds.

```typescript
export const POLL_DEADLINE_MS = 90_000;
```

The polling interval is set to three seconds, subject to the remaining deadline.

### 5.3 Request Cancellation

An `AbortController` is used to cancel pending operations.

The application also performs cleanup when the relevant component unmounts, reducing the risk of unnecessary requests continuing after navigation.

### 5.4 Error Handling

The polling mechanism distinguishes between:

- Successful AI-generated responses.
- Processing states that require another check.
- Explicit processing failures.
- Temporary network failures.
- Deadline expiration.
- Interrupted requests.
- Unexpected server responses.

### 5.5 Deadline-Aware Waiting

The implementation uses an abort-aware sleep function and calculates the remaining time before scheduling additional polling.

This prevents scheduling further polling intervals after the deadline has expired.

## 6. Automated Testing

A dedicated test suite was created:

`app/pollRestaurantAlert.test.ts`

The suite includes eight tests covering:

1. Successful Gemini response retrieval.
2. Polling timeout after 90 seconds.
3. Cancellation of a pending request when the deadline expires.
4. Explicit processing failure.
5. Recovery from a temporary network failure.
6. Continued polling while processing.
7. Interruption and cancellation behavior.
8. Polling interval calculation.

All tests use controlled simulations and mocked responses rather than making live requests to Make, Gemini, or WhatsApp.

### Test Results

| Test Suite | Tests | Result |
|---|---:|---|
| Restaurant alert polling | 8 | Passed |
| Order interpretation | 21 | Passed |
| Restaurant alert API protection | 8 | Passed |
| **Total** | **37** | **Passed** |

Validation commands:

```bash
npx vitest run
npm run build
npm run lint
```

All three commands completed successfully during local validation.

## 7. Dependency Review

The development environment was updated to use Vitest 5.1.0 and Node.js type definitions from version 22.

An npm security review identified vulnerabilities in development tooling.

The latest recorded results were:

- No critical vulnerabilities reported.
- Seven moderate-severity advisories associated with the `typescript-eslint` and `minimatch` dependency chain.
- A production-dependency audit previously returned zero reported vulnerabilities.

The remaining advisories were not automatically resolved by `npm audit fix`.

These findings are documented as residual development-dependency risks, not as proof that the application is free of security vulnerabilities.

## 8. Version Control Evidence

The polling refactor, automated tests, and dependency updates were recorded in Git commit:

`761f349`

Commit message:

`fix: harden restaurant alert polling with timeout and cancellation`

The commit includes changes to:

- `app/demo/page.tsx`
- `app/pollRestaurantAlert.ts`
- `app/pollRestaurantAlert.test.ts`
- `package.json`
- `package-lock.json`

## 9. Scope and Limitations

The audit focused on the reliability of asynchronous polling and request cancellation.

It does not constitute a complete application security assessment.

In particular:

- Automated tests do not prove that all production conditions are covered.
- External integrations require validation after deployment.
- The review did not establish a formal performance benchmark.
- The review did not resolve every development-dependency advisory.
- Additional server-side validation and security hardening may be addressed in future iterations.

## 10. Engineering Outcomes

This initiative demonstrates practical experience with:

- AI-assisted code review and refactoring.
- Asynchronous JavaScript and TypeScript.
- AbortController and request lifecycle management.
- Timeout and retry behavior.
- Automated testing with Vitest.
- Dependency auditing.
- Production-build validation.
- Git-based change tracking.
- Human verification of AI-assisted development work.

## 11. Conclusion

The Cursor AI-assisted review resulted in a more controlled and testable polling implementation for SAFE FOOD AI.

The changes passed the project's automated tests, TypeScript compilation, production build, and lint checks.

This case documents the use of AI-assisted development tools as part of a structured engineering workflow, combining code review, implementation, testing, and technical documentation.

---

**Project repository:**  
https://github.com/gabrielladiogenes/safe-food-ai

**Live demo:**  
https://safe-food-ai-mu.vercel.app/demo

**Technical commit:**  
https://github.com/gabrielladiogenes/safe-food-ai/commit/761f349

