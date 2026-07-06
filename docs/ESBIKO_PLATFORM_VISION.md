# ESBIKO PLATFORM VISION

Version: 0.1

Status: Active Design

Project: Esbiko Science Web Lab

---

# Vision

Esbiko is evolving from a React educational application into a Scientific Simulation Platform.

The Platform API is not the final goal.

The API is one interface to the platform.

Future interfaces include:

- React Website
- Mobile Applications
- Desktop Applications
- AI Chatbot
- Python SDK
- External Research Tools
- Future Keynu Runtime

Students should never need to know REST APIs.

Teachers should never need programming knowledge.

The Platform API exists so software systems can communicate with Esbiko.

The human interface will eventually be provided by the Esbiko Chatbot.

The chatbot will translate natural language into Platform API requests.

Example:

```text
Student:

"Create a Doppler experiment with an ambulance moving at 80 km/h."

-> AI
-> Platform API
-> Simulation Adapter
-> Simulation Engine
-> Simulation Result
```

The same Platform API should later allow:

- running simulations
- reading simulation state
- controlling simulation parameters
- exporting reports
- recording videos
- generating screenshots
- integrating with LMS systems
- automation through AI

The Platform API should become the stable foundation for all future Esbiko clients.

---

# Architectural Meaning

Esbiko should be designed as a platform first and a website second.

The React website remains the primary current product interface, but it should not be the only way to use Esbiko.

Future clients should communicate through stable platform contracts instead of reaching into React components, route loaders, local component state, or rendering internals.

The long-term architecture is:

```text
Human or Software Client
-> Platform Interface
-> Platform API
-> Platform Services
-> Simulation Adapter
-> Simulation Engine
```

Platform interfaces may include:

- React Website
- AI Chatbot
- Mobile Apps
- Desktop Apps
- Python SDK
- Keynu Runtime
- External Research Tools
- LMS Integrations

---

# Role Of The Platform API

The Platform API is the machine-facing interface.

It should provide stable, versioned, JSON-safe access to Esbiko platform resources.

The API should support software systems that need to:

- discover simulations
- inspect capabilities
- read metadata
- read simulation state in future phases
- request commands in future phases
- export artifacts in future phases
- generate reports in future phases
- integrate with external systems

The API should not expose:

- React components
- JSX
- lazy imports
- UI-only icons
- UI gradients
- DOM refs
- canvas contexts
- Three.js object references
- internal simulation implementation details

---

# Role Of The Esbiko Chatbot

The Esbiko Chatbot is the future human-facing interface.

Students and teachers should interact with Esbiko through natural language and guided educational workflows.

The chatbot should not bypass the platform architecture.

The chatbot should use the Platform API and Simulation Adapter contracts to understand what simulations exist, what they support, and what actions are safe.

The chatbot must not execute arbitrary simulation control until command contracts, permissions, validation, and safety rules are explicitly designed.

---

# Role Of Simulation Adapters

Simulation Adapters are the bridge between platform contracts and simulation engines.

They allow the Platform API and future clients to understand simulations without depending on React implementation details.

Adapters should expose:

- metadata
- verified capabilities
- safe state snapshots in future phases
- command schemas in future phases
- recording descriptors in future phases
- export descriptors in future phases
- report descriptors in future phases

Adapters should keep unknown features explicit.

If a feature is not verified, it should be reported as unsupported with unknown confidence.

---

# Long-Term Product Direction

Esbiko should eventually support:

- natural language experiment creation
- guided student investigations
- teacher-authored assignments
- reproducible scientific simulations
- report generation
- video and screenshot generation
- research workflows
- LMS integration
- automation through safe AI agents
- SDK-driven simulations
- cross-platform simulation clients

This vision depends on stable platform contracts.

The Platform API, Platform Catalog, Capability Contract, and Simulation Adapter Architecture are the foundation.

---

# Non-Goals

This document does not approve implementation of:

- AI chatbot features
- command execution
- state API endpoints
- report generation
- recording automation
- new REST endpoints
- simulation runtime refactors

Those features require separate architecture and implementation phases.

---

End of Document
