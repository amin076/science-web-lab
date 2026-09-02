# Esbiko — Interactive Science and Mathematics Learning Platform

**Esbiko** is an interactive educational platform for exploring science and mathematics through simulations, visual experiments, virtual classrooms, scientific challenges, educational games, and content-creation tools.

The platform combines interactive **2D and 3D simulations** with teacher and student workflows, helping learners observe scientific systems, change parameters, test ideas, and understand concepts through direct experimentation.

🌐 **Live platform:** [https://www.esbiko.com](https://www.esbiko.com)

🧪 **WebMCP Doppler demo:** [https://www.esbiko.com/experiments/physics.acoustics.doppler/run](https://www.esbiko.com/experiments/physics.acoustics.doppler/run)

---

## About Esbiko

Many scientific and mathematical concepts are difficult to understand through text, formulas, or static diagrams alone.

Esbiko makes these concepts interactive.

Students can manipulate variables, observe physical and mathematical relationships, explore virtual environments, repeat experiments, and compare results without requiring access to expensive laboratory equipment.

Teachers can use Esbiko to support classroom demonstrations, assignments, guided activities, independent exploration, and the creation of visual educational content.

Esbiko is designed as a growing multidisciplinary platform covering:

- Physics
- Mathematics
- Astronomy and space science
- Biology
- Chemistry
- Geology and Earth science
- Engineering and technology
- Interdisciplinary STEM education

Some subject areas currently contain more simulations than others. The simulation catalog is continuously expanding.

## Why I Built Esbiko

Before becoming a software developer, I spent several years teaching science, especially physics and astronomy, at high school and university levels.

During those years, I saw the same challenge repeatedly: many students struggled to understand scientific concepts when they were presented only through textbooks, formulas, static diagrams, or verbal explanations. Many schools also had limited laboratory resources, making hands-on experimentation difficult or impossible.

As a teacher, I learned that students understand science much more effectively when they can interact with experiments, change variables, observe results, and explore concepts for themselves.

Later, after moving into web development, I realised that modern web technologies could help bridge this educational gap.

Esbiko was created to combine my experience as both a science teacher and a software developer into a platform where students can learn through exploration, experimentation, and discovery instead of memorisation.

---

## Core Capabilities

### Interactive 2D Simulations

Esbiko includes interactive two-dimensional simulations for visualising scientific systems, relationships, motion, waves, forces, optics, and other concepts.

Depending on the simulation, learners may be able to:

- Change physical or mathematical parameters
- Start, pause, reset, and repeat experiments
- Move sources, objects, observers, or measuring points
- Compare different configurations
- Observe vectors, paths, fields, waves, and graphs
- Study cause-and-effect relationships
- Explore systems that are difficult to reproduce in a classroom

### Interactive 3D Simulations

Esbiko uses browser-based 3D rendering to create interactive scientific environments.

Current and evolving 3D experiences include topics such as:

- The Solar System
- Planets and moons
- Orbital motion
- Earth and satellite systems
- Gravity
- Electromagnetic interactions
- Optical systems
- Gyroscopic motion
- Doppler-effect visualisations
- Spacecraft and astronomical environments

The 3D architecture supports interactive cameras, scientific objects, textures, lighting, animation, model loading, and cinematic educational presentation.

### Scientific Visualisation

Esbiko is not limited to reproducing traditional laboratory experiments. It also provides visual tools for systems that are too large, too small, too fast, too slow, too dangerous, or too expensive to observe directly.

Examples include:

- Planetary systems
- Satellite orbits
- Field interactions
- Wave interference
- Sound propagation
- Light and optical behaviour
- Large-scale astronomical comparisons
- Abstract mathematical and scientific patterns

---

## Teacher and Student Platform

Esbiko includes role-based educational workflows for teachers and students.

### Teacher Dashboard

The teacher experience is designed to support classroom organisation and guided learning.

Teachers can work with features such as:

- Creating and managing classes
- Organising learning activities
- Sharing experiments and educational materials
- Managing classroom participation
- Reviewing student-related activity
- Preparing simulation-based lessons
- Using visual tools for classroom demonstrations

### Student Dashboard

Students can use their dashboard to:

- Join available classes
- Access assigned learning activities
- Open simulations and experiments
- Explore scientific concepts independently
- Work with classroom materials
- Participate in interactive educational experiences

### Virtual Classroom Structure

Esbiko combines simulations with classroom-style workflows rather than treating each simulation as an isolated webpage.

The long-term objective is to connect:

- Classes
- Teachers
- Students
- Simulations
- Activities
- Challenges
- Results
- Educational resources

into one coherent learning environment.

---

## Scientific Challenges and Educational Games

Esbiko is expanding beyond open-ended simulations into scientific challenges and game-based learning.

These experiences are intended to help learners apply scientific reasoning to achieve a goal rather than only observe a model.

Planned and developing formats include:

- Parameter-based challenges
- Prediction and verification activities
- Physics and mathematics games
- Mission-based scientific tasks
- Score-based learning experiences
- Guided problem-solving activities
- Interactive experiments with measurable objectives

This area is under active development.

---

## Video Recording and Educational Content Creation

Many Esbiko experiences include integrated recording capabilities for producing educational media directly from the browser.

Recording tools can support:

- Simulation demonstrations
- Classroom explanation videos
- Scientific short-form videos
- Landscape educational videos
- Square-format content
- Vertical mobile videos
- Visual experiment documentation

Supported output layouts include:

- `16:9` landscape
- `9:16` vertical
- `1:1` square

The recording architecture is designed to work with simulation canvases, overlays, captions, animation, audio, narration, and selected interface elements.

---

## Art, Motion, and Scientific Media Tools

Esbiko also contains creative tools that combine science, visual communication, animation, and educational media production.

### Art & Science Studio

The Art & Science area supports the creation of animated visual sequences using images, captions, camera-style movement, timing controls, and different output formats.

Its purpose is to help educators and creators produce:

- Scientific explainers
- Space and astronomy presentations
- Animated image sequences
- Classroom media
- Short educational videos
- Visual storytelling projects

### Pattern and Wave Tools

Esbiko includes creative scientific pattern tools and multi-source wave visualisations.

These tools can be used for:

- Wave interference exploration
- Abstract scientific backgrounds
- Ambient educational visuals
- Mathematical pattern generation
- Motion-based media
- Recorded visual sequences

---

## Mobile and Progressive Web App Support

Esbiko is being developed as a responsive and installable web platform.

Current mobile-related capabilities include:

- Responsive teacher, student, and administration interfaces
- Mobile navigation
- Touch-friendly controls
- Orientation guidance for simulations
- Responsive simulation layouts
- Progressive Web App support
- Service-worker-based caching
- Runtime caching for images, audio, textures, and 3D models
- Improved offline access to the application shell and selected resources

Some advanced simulations remain easier to use in landscape orientation or on larger screens because they contain complex controls and detailed visual environments.

Mobile usability remains an active development mission.

---

## Esbiko Platform API

Esbiko is evolving from a standalone website into an extensible educational platform.

The **Esbiko Platform API** provides a foundation for external applications and services to discover and interact with platform capabilities.

Current API foundations include:

- Platform health information
- Platform metadata
- Simulation discovery
- Individual simulation metadata
- Simulation capability discovery
- Registry-backed catalog data

The API is designed to support future integration with:

- Mobile applications
- Desktop applications
- Learning Management Systems
- School platforms
- Research and educational software
- Automation tools
- External content systems
- AI-assisted educational tools
- Agent runtimes

The HTTP Platform API is primarily read-only. Authentication, classroom operations, broader remote command execution, and private-user operations remain part of the longer-term roadmap.

---

## OpenAI WebMCP Challenge 2026

For the **OpenAI WebMCP Challenge**, Esbiko was extended with a client-side agent interaction layer that allows an AI agent and a human to operate the **same visible Doppler Effect experiment** together.

This is not DOM-click automation and it is not an embedded chatbot. Esbiko registers semantic website tools through `document.modelContext.registerTool(...)`. The tools call validated application adapters and update the same React runtime state and scientific engine used by the human interface.

WebMCP is therefore a new interaction layer on top of the existing Esbiko platform rather than a replacement for the platform, simulations, dashboards, Platform API, or human controls.

### 11 WebMCP tools

**Site tools**

- `list_science_simulations`
- `open_science_simulation`

**Doppler tools**

- `get_doppler_state`
- `configure_doppler`
- `configure_doppler_scene`
- `set_doppler_playback`
- `reset_doppler`
- `create_doppler_video`
- `get_doppler_video_status`
- `stop_doppler_video`
- `download_doppler_video`

The scientific values returned by the tools are calculated by Esbiko's Doppler physics functions rather than generated by an LLM.

### AI Doppler Director

The default `create_doppler_video` plan is a **30-second, two-vehicle, 9:16 WebM** at `440 Hz` and `60 m/s`, with the observer stationary at `500 m`.

The default instruments are:

- Vehicle 1: `esbiko_voice`
- Vehicle 2: `ambulance_siren`

The timeline is calculated from `distance = speed × time`:

| Time | Source | Motion | Position |
| --- | --- | --- | --- |
| `0–7.5 s` | Vehicle 1 | approaching | `50 → 500 m` |
| `7.5–15 s` | Vehicle 1 | receding | `500 → 950 m` |
| `15–22.5 s` | Vehicle 2 | approaching | `950 → 500 m` |
| `22.5–30 s` | Vehicle 2 | receding | `500 → 50 m` |

At `60 m/s` with a speed of sound of `343 m/s`, a `440 Hz` source is approximately **533.29 Hz while approaching** and **374.49 Hz while receding**.

For the clearest judge/demo comparison, the production-verified payload uses two distinctly different recordings:

```json
{
  "storyMode": "two_vehicle",
  "durationSeconds": 30,
  "speedMps": 60,
  "emittedFrequencyHz": 440,
  "firstInstrument": "car_engine",
  "secondInstrument": "ambulance_siren"
}
```

The Real Car Engine passes the observer at **7.5 s** and the Ambulance Siren passes from the opposite direction at **22.5 s**. The audible pitch changes are synchronized with those visual pass moments.

An optional `single_pass` mode keeps one continuous sound active for a complete 10-second crossing, reaching the observer at exactly `5 s`.

### Shared deterministic audio/visual clock

During an AI-directed recording, Esbiko derives the live browser source, recorded motion, and Doppler audio from the same deterministic director plan and elapsed-time clock.

```text
WebMCP create_doppler_video
          │
          ▼
  Validated Director Plan
          │
          ▼
 Shared deterministic clock
      ┌───┼──────────────┐
      ▼   ▼              ▼
 browser  recorded       audio pitch /
 motion   WebM motion    volume / pan
      └───┴──────┬───────┘
                 ▼
        downloadable WebM
```

This prevents video encoding load from making the audio physics clock lag behind the visible vehicle crossing.

### Audio and recording safeguards

Before MediaRecorder starts, Esbiko:

1. initializes or resumes the browser `AudioContext`;
2. preloads the selected real audio samples;
3. routes the Web Audio mix to both the speakers and a `MediaStreamDestination`;
4. performs a short audio preflight;
5. verifies a measurable RMS signal;
6. pauses and restores the exact `t=0` scene;
7. starts the 1080×1920 recording and directed motion together.

If browser autoplay policy blocks audio, WebMCP returns `AUDIO_ACTIVATION_REQUIRED`. If no real signal reaches the recording bus, it returns `AUDIO_SIGNAL_MISSING` rather than producing a silent success file.

### Pre-existing platform vs challenge extension

Before the challenge, Esbiko already included the website, simulation catalog, teacher/student workflows, Doppler scientific model and human UI, 2D/3D architecture, Firebase deployment, Platform API foundations, recording/media tools, and public assets.

The challenge extension added:

- WebMCP registration lifecycle and feature detection
- 11 semantic website tools
- JSON-safe Doppler adapters and validation
- one/two-source scene control
- shared human/agent runtime state
- exact speed×time AI Director timelines
- `two_vehicle` and `single_pass` story modes
- deterministic 1080×1920 WebM recording
- Web Audio capture and real-signal verification
- silent-file rejection and autoplay recovery errors
- live browser mirroring of directed recording motion
- a shared deterministic audio/visual director clock
- structured recording status and download operations
- automated WebMCP contract/physics tests
- hackathon architecture, testing, compliance, evidence, and submission documentation

Final synchronized runtime commit: `adb0d6a89ebb454f85c151058cc0f84f00a10038`.

Firebase deployment run #121: **PASS**.

📘 **Detailed WebMCP architecture, testing, production evidence, compliance, and submission package:** [`docs/hackathon/webmcp/`](docs/hackathon/webmcp/README.md)

---

## Architecture

Esbiko uses a modular web-platform architecture.

```text
Users
├── Students
├── Teachers
├── Administrators
└── Content creators
        │
        ▼
React Application
├── Public platform pages
├── Simulation catalog
├── 2D simulation interfaces
├── 3D simulation interfaces
├── Teacher dashboard
├── Student dashboard
├── Admin tools
├── Classroom workflows
├── Creative tools
└── Recording tools
        │
        ├───────────────┐
        ▼               ▼
Firebase Services    Platform Services
├── Authentication  ├── Simulation registry
├── Firestore       ├── Platform catalog
├── Storage         ├── Capability metadata
├── Hosting         └── Public Platform API
└── Functions
        │
        ▼
External Integrations
├── Mobile and desktop applications
├── School and LMS integrations
├── Educational automation
├── Research tools
└── Future AI and agent systems
```

### Frontend Layer

The frontend is built around React and Vite.

It contains:

- Reusable interface components
- Route-based pages
- Role-aware dashboards
- Simulation-specific modules
- Shared layouts
- Recording components
- Responsive navigation
- Creative and visualisation tools

### Simulation Layer

Simulations are organised as independent modules while sharing common platform infrastructure.

A simulation may contain:

- Rendering engine
- Scientific model
- State and parameter controls
- Camera controls
- Visual overlays
- Educational explanations
- Recording integration
- Responsive behaviour
- Metadata and capability definitions

Different simulations may use:

- HTML Canvas
- SVG
- DOM-based visualisation
- Three.js
- React Three Fiber
- Custom physics and mathematical models

### Platform Catalog and Registry

Esbiko uses a central platform catalog to describe simulations and expose platform-safe metadata.

Catalog records may include:

- Simulation identifier
- Title
- Description
- Scientific domain
- Topic
- Route
- Rendering engine
- Tags
- Available capabilities

The catalog is used by both the user interface and the Platform API, reducing duplicated simulation definitions.

### Backend Layer

Firebase provides the main hosted backend infrastructure.

Backend responsibilities include:

- User authentication
- Role-based access
- Classroom data
- User and activity records
- File storage
- Hosting
- Serverless API functions
- Security rules

### Recording Architecture

Recording components are shared across compatible simulations and creative tools.

The recording system coordinates:

- Target canvas or visual element
- Output dimensions
- Frame rate
- Audio sources
- Narration
- Interface overlays
- Recording state
- Export workflow

### Integration Architecture

The Platform API is intentionally designed independently from any single AI provider or external runtime.

This allows Esbiko to support different clients and integration methods without coupling the educational platform to one vendor.

Future integrations may interact through documented platform capabilities rather than directly controlling internal React components.

The WebMCP implementation follows the same principle: it exposes explicit, validated website capabilities while preserving the existing human interface and scientific state ownership.

---

## Technology Stack

| Area | Technology |
|---|---|
| Frontend | React |
| Build system | Vite |
| Languages | JavaScript and TypeScript |
| User interface | Material UI, CSS, responsive components |
| 3D rendering | Three.js, React Three Fiber, Drei |
| Animation | Framer Motion and simulation-specific animation systems |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| File storage | Firebase Storage |
| Hosting | Firebase Hosting |
| Serverless backend | Firebase Functions |
| API | HTTP-based Esbiko Platform API |
| Agent integration | WebMCP Imperative API |
| Progressive Web App | Vite PWA tooling and Workbox |
| Deployment | GitHub Actions and Firebase |
| Media | Browser canvas, Web Audio, MediaRecorder, and recording APIs |

Individual simulations may use additional specialised libraries or custom mathematical engines.

---

## Project Structure

The repository continues to evolve, but its main responsibilities can be understood through the following conceptual structure:

```text
science-web-lab/
├── src/
│   ├── components/       # Shared interface and platform components
│   ├── pages/            # Public pages and application routes
│   ├── simulations/      # Simulation modules and scientific experiences
│   ├── dashboard/        # Teacher, student, and administration interfaces
│   ├── services/         # Platform and application services
│   ├── hooks/            # Shared React hooks
│   ├── contexts/         # Authentication and application context
│   ├── lib/              # Firebase and shared utilities
│   ├── agent/            # Integration and agent-facing foundations
│   ├── webmcp/           # WebMCP registration and site-level tools
│   └── assets/           # Application assets
├── public/
│   ├── models/           # 3D models
│   ├── textures/         # Scientific and visual textures
│   ├── audio/            # Narration and simulation audio
│   └── images/           # Public images and media
├── functions/            # Firebase Functions and Platform API
├── docs/                 # Architecture, roadmap, API, and project documents
├── scripts/              # Build, verification, and maintenance scripts
└── .github/workflows/    # Continuous integration and deployment
```

The exact directory structure may change as the architecture is refined.

## AI-Assisted Development

Esbiko was developed with the assistance of OpenAI GPT-5.6 and OpenAI Codex.

These tools became valuable engineering partners throughout development. They helped accelerate implementation, review application architecture, generate and refactor React and TypeScript code, debug complex issues, improve documentation, and prototype new interactive simulations.

Rather than replacing software development, AI assistance allowed more time to focus on educational design, scientific accuracy, user experience, performance, and the creation of engaging learning activities.

During OpenAI Build Week and the WebMCP Challenge, GPT-5.6 and Codex were also used to review the project, improve its presentation, refine documentation, debug the WebMCP/audio/recording integration, and support preparation of the final submission.

---

## Current Development Missions

### Mobile Experience

Ongoing work includes:

- Improving simulation controls on small screens
- Reducing horizontal overflow
- Refining touch interactions
- Improving portrait and landscape behaviour
- Expanding responsive testing
- Improving mobile performance for 3D environments
- Making advanced control panels easier to use on tablets and phones

### Platform API

Upcoming API work may include:

- Authentication and permission models
- Classroom endpoints
- Experiment and simulation state
- Preset discovery
- Command execution
- Recording and export operations
- Activity and reporting endpoints
- Versioned API contracts
- External developer documentation

### Teacher-Created Simulations

A major long-term objective is to allow teachers to create or configure their own interactive activities from the Esbiko dashboard.

Possible capabilities include:

- Selecting a scientific template
- Defining variables and ranges
- Adding instructions and learning objectives
- Creating challenges
- Saving reusable presets
- Sharing activities with classes
- Collecting student results
- Using AI assistance for simulation planning and configuration

This capability is not yet complete and remains a major research and development mission.

### Scientific Games and Challenges

Ongoing development includes:

- Goal-driven simulations
- Scoring systems
- Scientific missions
- Timed challenges
- Prediction tasks
- Classroom competitions
- Progress and achievement tracking

### Integration and Intelligent Assistance

Esbiko is preparing for controlled integration with AI systems and software agents.

Current WebMCP work demonstrates one verified public scientific interaction path. Future uses may include:

- Helping teachers design scientific activities
- Explaining simulation results
- Suggesting parameter combinations
- Generating classroom questions
- Guiding students through experiments
- Automating educational media production
- Connecting Esbiko to external applications

Any intelligent layer should operate through explicit platform capabilities, permission controls, and verifiable actions.

---

## Local Development

### Requirements

- Node.js
- npm
- A Firebase project for backend features

### Clone the Repository

```bash
git clone https://github.com/amin076/science-web-lab.git
cd science-web-lab
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create the required local environment file based on the project's Firebase configuration.

Do not commit private credentials, API keys, service-account files, or production environment files.

### Start the Development Server

```bash
npm run dev
```

### Create a Production Build

```bash
npm run build
```

### Run WebMCP and Platform Checks

```bash
npm run test:webmcp
npm run test:platform-api
```

### Preview the Production Build

```bash
npm run preview
```

Some Firebase Function operations may require installing dependencies inside the `functions` directory.

---

## Deployment

Esbiko uses a GitHub-based development and deployment workflow.

A typical workflow is:

1. Create a feature branch.
2. Implement and test the change locally.
3. Run the production build.
4. Push the branch to GitHub.
5. Open a pull request.
6. Review and merge the pull request.
7. Allow the configured GitHub Actions and Firebase workflow to deploy the approved version.

Production deployment requirements may differ between the frontend, Firebase Functions, Firestore rules, and Storage rules.

---

## Security and Privacy

Esbiko uses Firebase authentication and role-aware application routes.

Security-related areas include:

- Teacher, student, and administrator roles
- Firestore security rules
- Firebase Storage rules
- Protected classroom routes
- Validation of platform operations
- Separation of public and private data
- Environment-variable protection
- Restricted administrative functionality

Security should be reviewed whenever new APIs, classroom features, external integrations, or automation capabilities are introduced.

The current WebMCP tools are deliberately limited to a public educational simulation. They do not expose account, classroom, administrator, or private-user-data operations.

Never commit:

- `.env` files
- Private Firebase credentials
- Service-account keys
- Authentication tokens
- Local runtime memory
- User data exports

---

## Accessibility and Educational Design

Esbiko aims to improve accessibility and usability through:

- Responsive layouts
- Clear visual controls
- Repeatable experiments
- Visual feedback
- Adjustable parameters
- Multiple learning formats
- Classroom and independent-learning workflows

Accessibility remains an ongoing process. Future work includes improved keyboard navigation, screen-reader support, colour contrast, captions, reduced-motion options, and broader usability testing.

---

## Project Status

Esbiko is a live and actively developed platform.

Some areas are mature and publicly usable, while others remain experimental or under active development.

The project currently includes:

- A growing catalog of interactive simulations
- 2D and 3D educational experiences
- Teacher and student dashboards
- Classroom workflows
- Scientific recording tools
- Creative visual tools
- Progressive Web App infrastructure
- Mobile-responsive platform improvements
- A public Platform API foundation
- A verified WebMCP agent-operable Doppler workflow
- Scientific challenge and game development

Development priorities continue to evolve based on educational needs, technical validation, user feedback, and platform stability.

---

## Roadmap

Major roadmap areas include:

- Expand mathematics, biology, chemistry, and geology content
- Improve mobile usability across all simulations
- Add more scientific challenges and educational games
- Expand classroom assessment capabilities
- Enable teacher-configurable scientific activities
- Improve accessibility
- Add richer experiment reporting
- Expand the Esbiko Platform API
- Expand WebMCP support to additional simulations after validating the Doppler reference implementation
- Support controlled external integrations
- Improve simulation validation and scientific documentation
- Add multilingual educational content
- Improve offline availability
- Develop AI-assisted teaching and learning tools
- Continue performance optimisation for complex 3D simulations

## Educational Vision

Esbiko is not intended to replace teachers.

Its goal is to empower teachers by providing interactive tools that make science easier to explain, easier to explore, and eventually easier to create.

My experience as a teacher taught me that every classroom is different. Instead of expecting teachers to adapt to fixed educational software, I want Esbiko to adapt to teachers.

One of the platform's most important long-term goals is to enable teachers and students to create, customise, and publish their own interactive scientific simulations without requiring advanced programming knowledge.

The long-term vision is to make simulation creation as accessible to educators as preparing presentation slides, allowing teachers to build and share learning experiences suited to their own students and classrooms.

---

## Contributing

Contributions, educational feedback, scientific review, and collaboration proposals are welcome.

A standard contribution workflow is:

1. Fork the repository.
2. Create a feature branch.
3. Make focused changes.
4. Test the application.
5. Run the production build.
6. Commit with a clear message.
7. Push the branch.
8. Open a pull request.

For scientific simulations, contributions should clearly document:

- Scientific assumptions
- Equations or models used
- Units
- Parameter limits
- Data sources
- Validation approach
- Known limitations

---

## Documentation

Additional project documentation is available in the `docs/` directory and may include:

- Architecture documents
- Platform API documentation
- Mobile development plans
- Security reviews
- Project status
- Simulation protocols
- Development roadmaps
- Integration specifications
- WebMCP challenge architecture, testing, compliance, production evidence, and submission documents

Documentation should be updated whenever platform behaviour or architecture changes.

---

## License

MIT License © Amin Nazari

See the repository license file for details.

---

## Acknowledgements

Esbiko is built with open-source technologies and is inspired by the work of educators, scientists, developers, students, and visual communicators who make scientific knowledge more accessible.

Special acknowledgement to the communities supporting:

- React
- Vite
- Firebase
- Material UI
- Three.js
- React Three Fiber
- Open educational software

---

**Esbiko — explore science by interacting with it.**
