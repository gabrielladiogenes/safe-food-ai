
# 06 — Testing, Validation, and Quality

SAFE FOOD AI's validation process was conducted incrementally, combining **manual testing, automated testing, functional scenarios, and integration verification**.

The process aimed to evaluate not only the technical execution of the MVP but also interpretation fidelity, the quality of AI-generated recommendations, and the system's ability to handle failures and ambiguous situations.

The adopted strategy distinguished between **technical correctness, functional behavior, and the reliability of generative responses**, making it possible to identify issues that would not necessarily be detected through traditional software testing.

## 6.1 Evolution of the Testing Strategy

### Initial Manual Validation

Before implementing the automated test suite with Vitest, SAFE FOOD AI underwent an initial phase of **12 manual tests executed in the VS Code development environment**.

This phase aimed to observe the application's actual behavior, identify inconsistencies, and guide the first functional refinements.

The verification process covered aspects such as:

- **Request interpretation:** identifying declared dietary information and distinguishing restrictions from ingredient exclusions.
- **Context preservation:** correctly associating items, ingredients, and order-specific modifications.
- **AI behavior:** evaluating the relevance of generated recommendations and their fidelity to the information provided.
- **Ambiguity handling:** identifying situations requiring clarification or human confirmation.
- **Functional workflow:** observing request processing and the presentation of results.

The observed behaviors contributed to refining the business rules and model instructions, establishing a foundation for the subsequent development of automated tests.

### Automation and Test Coverage Evolution

The test suite was subsequently structured using **Vitest**, expanding the ability to perform reproducible checks and identify regressions throughout code development.

Test coverage included interpretation rules, input validation, API protection, and asynchronous request tracking.

| Indicator | Recorded Result |
|---|---|
| Automated tests | 37/37 passed |
| Framework | Vitest 3.2.7 |
| TypeScript verification | Passed |
| Production build | Passed |
| Redis unavailability simulation | Expected behavior validated |

The evolution of testing prioritized three dimensions:

- **Data integrity:** preserving original order information, including ingredients, quantities, exclusions, and modifications.
- **Rule consistency:** preventing incorrect classifications and validating expected behaviors for different dietary declarations.
- **Operational resilience:** verifying responses to invalid inputs, communication failures, and external dependency unavailability.

The use of mocked dependencies made it possible to evaluate specific behaviors in isolation without requiring real calls to external services during every test.

## 6.2 Functional Validation and Use Cases

Functional validation covered **10 documented scenarios**, including situations involving multiple instructions, declared restrictions, and orders requiring contextual interpretation.

The consolidated record showed **four scenarios passed without reservations and six with reservations**, which served as references for further refinements.

| Scenario | Evaluated Behavior |
|---|---|
| Declared allergy | Identifying the condition without altering the original information |
| Declared intolerance | Distinguishing intolerance from other restrictions |
| Ingredient exclusion | Preserving the exclusion without clinical inference |
| Orders with multiple items | Correctly associating modifications with each item |
| Pizza with different halves | Preserving ingredients and exclusions specific to each half |
| Ambiguous requests | Recognizing insufficient information and the need for confirmation |

One of the most relevant cases involved a pizza with different compositions on each half. The scenario required preserving the association between ingredients and specific portions of the order, preventing an exclusion from being incorrectly interpreted as a restriction applying to the entire product.

This type of validation helped identify limitations in natural language interpretation and guided refinements to system instructions and rules.

## 6.3 Evaluation of Generative Responses

In addition to functional execution, the testing process considered the quality of recommendations produced by Google Gemini.

The analysis was guided by four criteria:

- **Fidelity:** correspondence between the original request and the information used in the response.
- **Relevance:** suitability of recommendations to the specific context of each order.
- **Consistency:** adherence to business rules and the boundaries established for the model.
- **Communication safety:** absence of unjustified guarantees regarding preparation, ingredients, or cross-contact prevention.

Behaviors identified during testing guided iterative prompt adjustments, focusing on reducing generic recommendations, incorrect interpretations, and overly conclusive statements.

This evaluation was qualitative and scenario-based and did not constitute a statistical certification of model accuracy.

## 6.4 Integration Testing and Failure Handling

Development also involved validating the demonstration workflow between **Next.js, Make, Google Gemini, GREEN-API, and WhatsApp**, including successful notification delivery in a test environment.

The main technical challenges addressed included:

- **Latency:** identifying Gemini responses that exceeded the application's timeout.
- **Asynchronous processing:** evolving the workflow to reduce dependence on immediate responses from external services.
- **Service communication:** adjusting authentication, data structures, and response mapping.
- **Unavailability:** verifying application behavior when external dependencies were simulated as unavailable.

Redis integration contributed to the request-tracking structure, while automated tests enabled verification of specific behaviors without continuously relying on connected services.

## 6.5 Validation Results and Limitations

The testing process contributed to the evolution of SAFE FOOD AI in three main areas:

1. **Greater predictability:** consolidation of interpretation rules and expected behaviors.
2. **Continuous improvement:** using identified failures and inconsistencies to guide technical adjustments and prompt refinements.
3. **Operational reliability:** developing validation and failure-handling mechanisms within an integrated AI workflow.

Passing automated tests does not eliminate the reservations identified during functional validation. Likewise, the successful execution of a demonstration integration does not constitute validation of a commercial production environment.

SAFE FOOD AI remains a **demonstration MVP**, without food safety certification, guarantees of zero cross-contact, or operational validation involving real establishments.

The testing documentation establishes a foundation for future quantitative evaluations, expanded functional coverage, and monitoring of generative response quality.
