const simulationManifest = {
  schemaVersion: "0.1",
  standardVersion: "0.1",
  simulationVersion: "0.2.0",
  simulationType: "timeline",
  renderer: {
    primary: "dom",
    secondary: [],
  },
  engine: "timeline",
  renderingModel: "timeline-dom",
  standardRole: "Timeline reference implementation",
  id: "evolution-of-life",
  slug: "evolution-of-life",
  title: "Evolution of Life",
  subject: "biology",
  category: "evolution",
  topic: "Evolution",
  route: "/experiments/evolution-of-life",
  description: "Explore major transitions in the history of life through reusable scientific timeline journeys.",
  status: "development",
  version: "0.2.0",
  responsive: true,
  mobileFriendly: true,
  capabilities: [
    "timeline-navigation",
    "journey-selection",
    "autoplay",
    "stage-information",
    "responsive-layout",
  ],
  learningObjectives: [
    "Order major evolutionary transitions.",
    "Relate environmental change to biological diversification.",
    "Understand evolution as branching lineages rather than a ladder.",
  ],
};

export default simulationManifest;
