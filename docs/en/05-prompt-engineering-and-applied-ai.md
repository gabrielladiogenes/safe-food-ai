
# 05 — Prompt Engineering and Applied Artificial Intelligence

The development of SAFE FOOD AI's artificial intelligence evolved from a contextual recommendation generation approach into a workflow guided by **advanced prompt engineering, business rules, and explicit safety criteria**.

The objective was to guide Google Gemini in producing individualized and preventive recommendations while preserving consumer-provided information and the operational boundaries of AI.

## 5.1 Advanced Prompt Engineering

The evolution of the system instructions, documented through version **3.0**, consolidated guidelines for controlling the behavior of the generative model.

The structure includes:

- **Role and context definition:** operating as a preventive food communication assistant, focusing on the specific characteristics of each order.
- **Explicit instructions and constraints:** preserving items, quantities, modifications, and declared conditions without making clinical inferences.
- **Contextual generation:** specific recommendations for preparation, assembly, identification, packaging, and transportation, even when no dietary restrictions are declared.
- **Ambiguity handling:** recognizing insufficient information and directing cases toward human confirmation.

This approach establishes a separation between **consumer-provided information, deterministic interpretation, and AI-generated content**.

## 5.2 Evolution of Interpretation Rules

The functional refinement, consolidated in version **1.5**, prioritized classification accuracy and the prevention of inappropriate interpretations.

| Identified Situation | Defined Behavior |
|---|---|
| "I have a shrimp allergy" | Declared allergy |
| "I have lactose intolerance" | Declared intolerance |
| "No shrimp" | Ingredient exclusion, without inferring an allergy |
| "No cheese" | Ingredient exclusion, without inferring an intolerance |

The rules were refined to maintain the association between ingredients and specific items, including orders with multiple modifications.

## 5.3 AI Control and Responsibility

The system's evolution also involved adjustments to instructions, response structure, and communication between Gemini and Make, aiming for greater processing consistency.

The model was directed to **suggest precautions, not certify food safety**. Its responses do not verify ingredient availability, the establishment's operational conditions, or the absence of cross-contact.

The approach combines **generative AI, deterministic logic, and human supervision**, establishing clear boundaries for automation and a foundation for future quality and reliability assessments.

## 5.4 Iterative Refinement and Response Quality

Development adopted an iterative prompt engineering approach, with progressive adjustments to the model's instructions based on behaviors identified during testing.

The refinements prioritized three criteria:

- **Fidelity:** preserving declared information while avoiding inappropriate alterations or inferences.
- **Contextual relevance:** generating specific recommendations for each request, reducing generic or redundant guidance.
- **Reliability:** recognizing uncertainties, respecting operational constraints, and preserving the need for human confirmation.

This evolution established a foundation for future evaluations of consistency, interpretation accuracy, and the quality of generated recommendations.

## 5.5 Orchestration Between Business Rules and Generative AI

SAFE FOOD AI combines deterministic interpretation rules with Google Gemini's generative capabilities, establishing distinct responsibilities in request processing.

- **Business rules:** guide the identification of declared conditions, information preservation, and the application of classification criteria.
- **Generative AI:** produces contextual recommendations considering the items, modifications, and specific needs of each order.
- **Human supervision:** remains necessary when the available information does not allow for sufficiently reliable guidance.

This separation reduces dependence on exclusively generative interpretations and promotes greater predictability, control, and product maintainability.

## 5.6 Evolution of Reliability and AI Integration

The evolution of SAFE FOOD AI included refining the processing workflow to address operational limitations of generative models and external integrations.

The main technical challenges addressed include:

- **AI latency:** identifying Gemini responses that exceeded the application's timeout, motivating the adoption of an asynchronous workflow.
- **Orchestration:** integrating Next.js, Make, Gemini, and Redis for request processing and tracking.
- **Resilience:** handling communication failures, validating inputs and responses, and addressing unavailability scenarios.
- **Automated delivery:** validating the demonstration workflow through the receipt of notifications on a test WhatsApp account.

These improvements represent the evolution from a generative feature into an AI workflow integrated with business processes, with greater attention to reliability and operational continuity.
