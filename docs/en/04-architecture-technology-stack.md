
# 04 — Architecture and Technology Stack

**SAFE FOOD AI — Application Architecture, Artificial Intelligence Integration, and Process Automation**

SAFE FOOD AI was developed as a web application that combines **software development, structured information interpretation, generative artificial intelligence, and process automation**.

The architecture was designed to transform individual food-related requests into organized notices, connecting the consumer interface to an automated processing and communication workflow.

The Minimum Viable Product (MVP) uses a modular structure that separates the user experience, interpretation rules, communication with external services, and result presentation. This separation makes it possible to understand each component's responsibilities, test specific behaviors, and identify opportunities for further development.

This chapter presents the implemented architecture, technologies used, data flow, technical decisions, and known limitations of the solution.

---

## 4.1 Architecture Overview

The SAFE FOOD AI architecture integrates four main layers:

1. **Interface and experience:** Web application responsible for consumer interaction and the demonstration interface for establishments.
2. **Interpretation and processing:** Business rules and Application Programming Interfaces (APIs) responsible for structuring requests, validating data, and coordinating processing.
3. **Artificial intelligence and automation:** External workflow using Make and Google Gemini to generate complementary recommendations.
4. **Communication and presentation:** Delivery of results through the demonstration interface and transmission to a WhatsApp testing destination.

The processing workflow combines deterministic rules and generative artificial intelligence. This separation aims to preserve the accuracy of consumer-provided information while allowing AI to generate contextual recommendations without taking over decisions that require human evaluation.

### 4.1.1 Conceptual Workflow

~~~text
CONSUMER
    |
    v
APPLICATION INTERFACE
Next.js + React + TypeScript
    |
    v
ORDER INTERPRETATION
Business Rules
    |
    v
APPLICATION PROGRAMMING INTERFACE
Request Validation and Management
    |
    v
MAKE
Automation Orchestration
    |
    v
GOOGLE GEMINI
Generation of Complementary Recommendations
    |
    v
STRUCTURED RESULT
    |
    +----> Restaurant Demonstration Interface
    |
    +----> WhatsApp Testing Destination
~~~

This workflow represents the functional architecture of the prototype rather than a commercial integration with restaurants or food delivery platforms.

---

## 4.2 Technology Stack

The technologies were selected according to their responsibilities in application development, processing, automation, testing, and MVP deployment.

| Technology | Category | Application in the Project |
|---|---|---|
| <img src="https://cdn.simpleicons.org/nextdotjs" width="22" height="22" alt="Next.js"> **Next.js 16** | Web Framework | Application structure, pages, and API routes |
| <img src="https://cdn.simpleicons.org/react" width="22" height="22" alt="React"> **React** | User Interface | Component development and interaction management |
| <img src="https://cdn.simpleicons.org/typescript" width="22" height="22" alt="TypeScript"> **TypeScript** | Programming Language | Type definitions and application logic organization |
| <img src="https://cdn.simpleicons.org/tailwindcss" width="22" height="22" alt="Tailwind CSS"> **Tailwind CSS** | Styling | Visual interface development and responsive design |
| <img src="https://cdn.simpleicons.org/googlegemini" width="22" height="22" alt="Google Gemini"> **Google Gemini** | Generative AI | Generation of complementary recommendations for food-related requests |
| <img src="https://cdn.simpleicons.org/make" width="22" height="22" alt="Make"> **Make** | Automation | Workflow orchestration between the application, AI, and communication destinations |
| <img src="https://cdn.simpleicons.org/zod" width="22" height="22" alt="Zod"> **Zod** | Validation | Structured validation of data received through API endpoints |
| <img src="https://cdn.simpleicons.org/upstash" width="22" height="22" alt="Upstash"> **Upstash Redis** | Infrastructure | Request management and asynchronous processing support |
| <img src="https://cdn.simpleicons.org/vitest" width="22" height="22" alt="Vitest"> **Vitest** | Testing | Automated test execution |
| <img src="https://cdn.simpleicons.org/vercel" width="22" height="22" alt="Vercel"> **Vercel** | Hosting | Application deployment and web availability |
| <img src="https://cdn.simpleicons.org/git" width="22" height="22" alt="Git"> **Git** / <img src="https://cdn.simpleicons.org/github" width="22" height="22" alt="GitHub"> **GitHub** | Version Control | Change tracking and technical documentation |

WhatsApp was used as a **testing destination for automated communication**, representing an official integration with registered establishments.

---

## 4.3 Web Application Architecture

The core of SAFE FOOD AI was developed using Next.js with its App Router architecture, React, and TypeScript.

This combination allows the user interface, application logic, and communication endpoints to coexist within a single project while maintaining clearly separated responsibilities.

### 4.3.1 User Interface

The presentation layer is responsible for collecting consumer information, communicating request progress, and displaying available results.

Its main responsibilities include:

- Collecting food items, quantities, modifications, and reported needs.
- Displaying processing states.
- Presenting completion or failure messages.
- Providing a demonstration view of the information intended for the establishment.

The interface was developed according to the user experience and interface design principles documented in Chapter 03.

### 4.3.2 Interpretation Rules

The application includes a deterministic interpretation layer, separate from AI-generated text.

This layer establishes important distinctions between preferences, ingredient exclusions, and explicitly declared dietary conditions.

For example, a request to remove a particular ingredient must not automatically be interpreted as a declaration of allergy or intolerance.

This architectural decision reduces reliance on generative inference when classifying sensitive information.

### 4.3.3 API Communication and Validation

Application Programming Interfaces act as intermediaries between the consumer interface and automation services.

Validation using Zod helps verify the structure of incoming information before forwarding it to the external workflow.

The project also incorporates request management mechanisms and asynchronous state handling, allowing processing progress to be monitored without relying exclusively on an immediate response.

---

## 4.4 Generative Artificial Intelligence Integration

Google Gemini participates in the workflow as the component responsible for generating complementary recommendations related to each food request.

Artificial intelligence operates as a **layer of care and attention to the unique characteristics of each food request**, using consumer-provided context to generate preventive suggestions and complementary guidance for the establishment.

Regardless of the food ordered, the AI seeks to identify opportunities for additional care during preparation, assembly, identification, packaging, and transportation, taking into account the specific requirements of each order.

Its approach was designed to prioritize **attentive, personalized, and responsible communication**, recognizing individual consumer needs without replacing human evaluation or the establishment's food safety protocols.

### 4.4.1 Separation Between Rules and Generation

A central architectural decision was to distinguish between two types of processing:

**Deterministic processing:** Applies explicit rules to interpret declared information and preserve important distinctions, such as ingredient exclusions and affirmatively reported dietary conditions.

**Generative processing:** Uses structured context to produce complementary recommendations related to preparation, assembly, identification, packaging, and transportation.

This separation allows the application to benefit from the flexibility of generative AI without delegating the entire interpretation of critical information to the model.

### 4.4.2 Artificial Intelligence Limitations

Generated results do not confirm that a restaurant has suitable ingredients, maintains appropriate preparation conditions, or can prevent cross-contact.

When information is insufficient or depends on the establishment's actual operating conditions, communication must preserve the need for human confirmation.

Interpretation criteria, AI instructions, and evaluation mechanisms will be explored in greater detail in Chapter 05.

---

## 4.5 Automation and Communication Between Services

Make was used to connect the application to generative processing and demonstration communication destinations.

This integration allows a request initiated through the interface to move through an automated workflow, reducing the need to manually transfer information between systems.

### 4.5.1 Orchestration

The automation workflow includes receiving information forwarded by the application, processing it through Gemini, and communicating the results.

The integration was tested end-to-end in a demonstration environment, including result presentation within the application and delivery to a WhatsApp testing destination.

This demonstrates communication between different components but does not constitute public operation with real restaurants.

---

## 4.6 Persistence and Request Management

The MVP was developed without requiring consumer registration, authentication, or a permanent dietary profile.

Each request maintains its own context, preventing preferences or exclusions from one order from being automatically applied to future requests.

The infrastructure uses Upstash Redis to support request management and asynchronous processing.

This implementation should not be confused with maintaining a persistent consumer dietary history.

Data storage and retention practices associated with external services must be considered separately when evaluating system privacy.

---

## 4.7 Deployment and Development Environment

Development was carried out in a local environment using Visual Studio Code, programming tools, testing resources, and version control.

The application was deployed through **Vercel**, making the functional MVP accessible and demonstrable through a web browser.

---

## 4.8 Architectural Decisions and Rationale

The main technical decisions reflect the objective of building a functional, demonstrable MVP with clearly identifiable responsibilities.

| Decision | Rationale |
|---|---|
| Web application using Next.js | Combine the user interface and application routes within an integrated structure |
| TypeScript | Improve data consistency and code organization |
| Deterministic interpretation | Prevent critical classifications from depending exclusively on generative inference |
| Gemini for complementary recommendations | Apply generative AI within a clearly defined responsibility |
| Make for automation | Connect application components and external services |
| Asynchronous processing | Handle variable processing times across external operations |
| Independent requests | Avoid assuming permanent consumer preferences |
| Restaurant simulation and WhatsApp testing | Demonstrate the workflow without depending on commercial integration |

These decisions prioritized the development of a verifiable solution within the scope of the MVP.

---

## 4.11 Technical Summary

SAFE FOOD AI demonstrates the integration of **web application development, business rules, generative artificial intelligence, APIs, and process automation** in a solution designed to address a food-related communication challenge.

The architecture aims to establish clear boundaries between consumer-declared information, structured interpretation, AI-generated recommendations, and decisions that remain under human responsibility.

Beyond connecting technologies, the development process involved decisions concerning separation of responsibilities, error handling, user experience, and the defined role of artificial intelligence.
