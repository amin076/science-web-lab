export const SIMULATION_CAPABILITY_CONTRACT_VERSION =
  "simulation-capabilities.v1";

export const SIMULATION_CAPABILITY_DEFINITIONS = Object.freeze({
  interactive: {
    label: "Interactive",
    description: "The simulation exposes user-controllable runtime behavior.",
  },
  physics: {
    label: "Physics",
    description: "The simulation models a physics concept or process.",
  },
  audio: {
    label: "Audio",
    description: "The simulation can produce or control audio.",
  },
  camera: {
    label: "Camera",
    description: "The simulation exposes camera controls or camera state.",
  },
  recording: {
    label: "Recording",
    description: "The simulation can record media through a verified API.",
  },
  export: {
    label: "Export",
    description: "The simulation can export artifacts through a verified API.",
  },
  timeline: {
    label: "Timeline",
    description: "The simulation exposes timeline or playback controls.",
  },
  presets: {
    label: "Presets",
    description: "The simulation exposes verified preset loading.",
  },
  stateRead: {
    label: "State Read",
    description: "The simulation exposes a verified read-only state adapter.",
  },
  commandExecution: {
    label: "Command Execution",
    description: "The simulation exposes verified command execution.",
  },
  agentReady: {
    label: "Agent Ready",
    description: "The simulation is verified for external agent usage.",
  },
});

export const SIMULATION_CAPABILITY_KEYS = Object.freeze(
  Object.keys(SIMULATION_CAPABILITY_DEFINITIONS),
);

const SAFE_DEFAULT_SOURCE = "safe-default";
const LEGACY_METADATA_SOURCE = "legacy-experiment-capabilities";
const VERIFIED_METADATA_SOURCE = "verified-platform-metadata";

function createSafeCapability(key) {
  const definition = SIMULATION_CAPABILITY_DEFINITIONS[key];

  return {
    key,
    label: definition.label,
    supported: false,
    verified: false,
    confidence: "unknown",
    source: SAFE_DEFAULT_SOURCE,
    declared: null,
    reason: "No verified capability source is registered for this simulation.",
  };
}

function normalizeCapabilityObject(key, rawCapability, sourceName) {
  const supported =
    rawCapability.supported === true ||
    rawCapability.enabled === true ||
    rawCapability.value === true;
  const unsupported =
    rawCapability.supported === false ||
    rawCapability.enabled === false ||
    rawCapability.value === false;
  const verified =
    rawCapability.verified === true || rawCapability.confidence === "verified";
  const source = rawCapability.source || sourceName;
  const declared = supported ? true : unsupported ? false : null;

  if (supported && verified) {
    return {
      ...createSafeCapability(key),
      supported: true,
      verified: true,
      confidence: "verified",
      source,
      declared: true,
      reason: rawCapability.reason || null,
    };
  }

  if (supported) {
    return {
      ...createSafeCapability(key),
      source,
      declared: true,
      reason:
        rawCapability.reason ||
        "Capability was declared but is not verified, so the public API reports safe unsupported.",
    };
  }

  if (unsupported) {
    return {
      ...createSafeCapability(key),
      verified,
      confidence: verified ? "verified" : "unknown",
      source,
      declared: false,
      reason:
        rawCapability.reason ||
        (verified
          ? "Capability is verified as unsupported."
          : "Capability is declared unsupported but not independently verified."),
    };
  }

  return createSafeCapability(key);
}

function normalizeLegacyCapability(key, value) {
  if (value === true) {
    return {
      ...createSafeCapability(key),
      source: LEGACY_METADATA_SOURCE,
      declared: true,
      reason:
        "Legacy experiment metadata declared support, but it is not a verified capability source.",
    };
  }

  if (value === false) {
    return {
      ...createSafeCapability(key),
      source: LEGACY_METADATA_SOURCE,
      declared: false,
      reason: "Legacy experiment metadata declared this capability unsupported.",
    };
  }

  return createSafeCapability(key);
}

function readVerifiedCapabilitySource(experiment) {
  return (
    experiment.platform?.capabilities ||
    experiment.platformCapabilities ||
    experiment.verifiedCapabilities ||
    null
  );
}

function createCapabilityForKey(experiment, key) {
  const verifiedSource = readVerifiedCapabilitySource(experiment);

  if (
    verifiedSource &&
    Object.prototype.hasOwnProperty.call(verifiedSource, key)
  ) {
    const rawCapability = verifiedSource[key];

    if (rawCapability && typeof rawCapability === "object") {
      return normalizeCapabilityObject(
        key,
        rawCapability,
        VERIFIED_METADATA_SOURCE,
      );
    }

    return normalizeCapabilityObject(
      key,
      { value: rawCapability, verified: false },
      VERIFIED_METADATA_SOURCE,
    );
  }

  if (
    experiment.capabilities &&
    Object.prototype.hasOwnProperty.call(experiment.capabilities, key)
  ) {
    return normalizeLegacyCapability(key, experiment.capabilities[key]);
  }

  return createSafeCapability(key);
}

export function createSimulationCapabilityContract(experiment = {}) {
  const capabilities = SIMULATION_CAPABILITY_KEYS.reduce((acc, key) => {
    acc[key] = createCapabilityForKey(experiment, key);
    return acc;
  }, {});

  const capabilityValues = Object.values(capabilities);
  const verifiedCount = capabilityValues.filter(
    (capability) => capability.verified === true,
  ).length;
  const supportedCount = capabilityValues.filter(
    (capability) => capability.supported === true,
  ).length;

  return {
    version: SIMULATION_CAPABILITY_CONTRACT_VERSION,
    status: verifiedCount > 0 ? "partially-verified" : "unverified",
    sourceModel: "verified-metadata-or-safe-default",
    capabilities,
    summary: {
      total: SIMULATION_CAPABILITY_KEYS.length,
      supported: supportedCount,
      verified: verifiedCount,
      unknown: SIMULATION_CAPABILITY_KEYS.length - verifiedCount,
    },
  };
}

export function createLegacyCapabilityFlags(capabilityContract) {
  const contractCapabilities = capabilityContract?.capabilities || {};

  return SIMULATION_CAPABILITY_KEYS.reduce((acc, key) => {
    acc[key] = contractCapabilities[key]?.supported === true;
    return acc;
  }, {});
}
