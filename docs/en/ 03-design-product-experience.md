 
# 03 — Design and Product Experience

<p align="center">
  <img src="../assets/safefood-logo.gif" alt="SAFE FOOD AI — Animated identity" width="500">
</p>

**SAFE FOOD AI — Visual Identity, Creative Direction, and Digital Experience**

The design of SAFE FOOD AI was conceived as part of the product solution, rather than merely as a visual finishing touch. Faced with a problem involving the clear communication of food preferences and dietary needs, the proposal sought to build a direct, recognizable experience aligned with the purpose of the service: transforming individual information into more organized notices for human evaluation.

This chapter documents the choices related to identity, visual language, and interaction, including explored alternatives, adopted decisions, and limitations that have not yet been validated. The approach combines **design driven by real-world problems**, product thinking, and the responsible application of generative artificial intelligence.

**Chapter scope:** visual identity, creative exploration, typography, colors, animation, UX/UI, user journey, interfaces, feedback, and validation opportunities. Architecture, integrations, and detailed implementation are addressed in subsequent chapters.

---

## 3.1 Design Vision and Creative Direction

The design direction of SAFE FOOD AI was guided by the principle that **technology should simplify experiences, not add complexity to them**. From the outset, the proposal was to develop a *clean*, intuitive, and functional interface capable of transforming potentially complex dietary requests into a simple, organized, and accessible user experience.

Based on this premise, principles of **UX (User Experience) and UI (User Interface) Design** were adopted, considering different user profiles and usage contexts, including **older adults, users with limited familiarity with digital tools, and individuals who need to submit requests quickly in situations where time or attention is limited**.

From a UX perspective, the approach prioritized ease of navigation, user autonomy, and the reduction of unnecessary steps. In terms of UI, decisions focused on visual hierarchy, element organization, and the development of a clear and consistent interface, seeking to minimize cognitive overload and facilitate task completion without requiring prior technical knowledge.

The goal was to build a recognizable visual identity and an uncomplicated digital experience in which **clarity, functionality, inclusion, and trust** guide product decisions.

These principles represent design objectives and usability hypotheses whose effectiveness still depends on validation with real users.

---

## 3.2 Visual Research, References, and Moodboarding

The visual exploration brought together references from minimalist visual identities, expressive lettering, symbols constructed from familiar shapes, and editorial presentations of brand development processes.

---

## 3.3 Visual Identity and Symbol Development

<p align="center">
  <img src="../assets/safefood-logo-construction.png" alt="SAFE FOOD AI symbol construction" width="850">
</p>

The brand originated from the idea of incorporating a **spoon and knife** into the initial **S**, combining two elements directly associated with food into a single typographic form. The choice of utensils also connects with the product's focus on food preferences and dietary needs.

### 3.3.1 Concept and Composition

The process explored different designs for the letter S and different ways of positioning the utensils. The final direction prioritizes the **integration of these elements into the silhouette**, rather than presenting disconnected utensils alongside the name.

The visual concept can be summarized as:

**Initial S + spoon and knife references → integrated brand symbol.**

### 3.3.2 Robust Form and Personality

The letter S features thick strokes, broad curves, and rounded terminals. Within the intended visual language, this construction communicates **presence, stability, and approachability**, avoiding both excessive rigidity and a purely decorative appearance.

### 3.4 Color Palette

The brand presentation board features the following values:

| Color | Displayed Code | Proposed Visual Function |
|---|---|---|
| Red | `#E30613` | Identity, attention points, and highlighted elements |
| Pinkish white | `#FFF7F7` | Light surfaces and soft contrast |
| Graphite | `#1F1F1F` | Text and reading elements |

Red was chosen because of its recurring cultural associations with energy, visual emphasis, and the food industry.

---

## 3.5 Product Experience Principles

The SAFE FOOD AI experience was guided by decisions that connect interaction simplicity with information accuracy.

**Context per order.** Specifications are provided for the current request, without requiring registration, login, history, or a persistent dietary profile in the MVP.

**Instruction fidelity.** The interface should allow users to express items, quantities, modifications, and exclusions without automatically converting preferences into medical conditions.

**Clarity about the role of AI.** System-generated recommendations complement communication; they do not replace human evaluation or food safety protocols.

**Friction reduction.** The form seeks to collect the information necessary for the request without introducing account creation or permanent configuration steps that are outside the initial scope.

---

## 3.6 Information Architecture and User Journey

The conceptual MVP flow was organized to keep the order as the central unit of the experience.

| Stage | Main Action or Information | UX Intention |
|---|---|---|
| Entry | Access the SAFE FOOD AI interface | Quickly understand the tool's purpose |
| Specification | Provide items, quantities, and dietary needs | Record the context of a specific order |
| Submission | Submit the information | Initiate processing with clear feedback |
| Processing | Wait for interpretation and guidance generation | Make the system's status understandable |
| Result | Present or forward the structured notice | Organize information for human evaluation |
| Demonstrative communication | View the representation intended for the establishment | Show continuity between the order and operational guidance |

The journey does not represent a commercial integration with a food delivery platform. The MVP demonstrates an independent workflow and its testing destinations.

### 3.6.1 Information Hierarchy

The organization prioritizes the distinction between **consumer-provided data**, **structured interpretation**, and **AI-generated supplementary guidance**. This separation is essential to prevent a suggestion from being mistaken for an original user statement or a restaurant confirmation.

### 3.6.2 Key Considerations

Orders containing multiple items may include instructions that apply only to a specific unit or portion. The experience must preserve these relationships. It must also recognize when the available information is insufficient to produce reliable guidance, directing the request toward human confirmation.

---

## 3.7 Consumer Interface and Form Design

The consumer interface combines brand presentation with the collection of dietary information. The animated title and form were refined throughout development, preserving a structure focused on recording specific requests.

### 3.8 Order-Oriented Form

The design prioritizes entering relevant information at the time of the request. This supports the scope decision not to maintain a persistent dietary profile: an exclusion or preference in one order should not be assumed to be a permanent rule for all future orders.

### 3.8.1 Language and Prevention of Inferences

The product distinguishes **ingredient exclusions** from **explicitly declared allergies and intolerances**. For example, requesting an item without a particular ingredient does not authorize the system to conclude that the consumer has an allergy or intolerance.

This distinction is not merely a processing rule; it is a decision related to experience and trust. The design must clearly communicate what was provided, what was interpreted, and what remains subject to confirmation.

### 3.8.2 Balancing Personality and Function

The brand and motion bring personality to the opening experience, while fields and messages must retain functional priority. The objective is to make the experience expressive while ensuring that critical information remains easy to locate and understand.

---

## 3.9 Establishment Interface and Communication Experience

The solution also includes a **demonstrative restaurant viewing interface** and the forwarding of notices to a **WhatsApp testing destination**, triggered simultaneously with the simulation. These elements were developed to demonstrate information continuity between consumer input and its presentation in an operational format.

### 3.9.1 From Request to Notice

The establishment experience should facilitate the identification of items, quantities, exclusions, and relevant guidance. The presentation format seeks to reduce dependence on lengthy free-form text while keeping information requiring attention visible.

### 3.9.2 WhatsApp Representation

The development records include refinements to message presentation within a smartphone visual context. The purpose of the simulation is to make the demonstration easier to understand, not to suggest that an official integration with restaurants or food delivery platforms exists.

### 3.9.3 Operational Responsibility

The interface does not confirm that the establishment has read, accepted, or executed the guidance. Preparation feasibility, ingredients, internal procedures, and food safety precautions remain subject to human evaluation and responsibility.

---

## 3.10 Interaction States, Feedback, and Errors

A product that processes information through AI and automation needs to make its states visible. The MVP records include attention to processing, submission, completion, failures, timeouts, and cancellation.

| State | Communication Requirement |
|---|---|
| Before submission | Explain what information is requested |
| Processing | Indicate that the request is in progress |
| Completion | Distinguish completed processing from an order that has actually been fulfilled |
| Failure | Inform users that the workflow could not be completed without simulating success |
| Timeout | Prevent indefinite waiting and guide users toward another attempt when appropriate |
| Cancellation | End the waiting state in an understandable way |
| Insufficient information | Signal the need for clarification or human evaluation |

---

## 3.11 Responsiveness and Accessibility

The project was conceived as a web experience, with functional presentation of its interfaces across different viewing contexts, such as desktop computers, smartphones, and tablets.
