// src/simulations/subjects/astronomy/space/earth-orbit-lab/orbit.constants.js

export const OBJECT_INFO = {
  EARTH: {
    title: "Earth",
    subtitle: "Home Planet",
    category: "Planet",
    description:
      "Earth is the third planet from the Sun and the central body of this orbit lab. Satellites in this simulation are shown relative to Earth unless they orbit the Moon.",
    educationalNote:
      "Earth's gravity keeps satellites, the Moon, and many human-made spacecraft in orbit. In the simulation, Earth radius is the reference scale.",
    stats: [
      { label: "Radius", value: "6,371 km" },
      { label: "Day Length", value: "23h 56m" },
      { label: "Axial Tilt", value: "23.5°" },
      { label: "Gravity", value: "9.8 m/s²" },
    ],
    details: [
      { label: "Orbit Type", value: "Planet around Sun" },
      { label: "Natural Satellites", value: "1 Moon" },
      { label: "Role", value: "Reference body" },
      { label: "Atmosphere", value: "Yes" },
    ],
  },

  MOON: {
    title: "The Moon",
    subtitle: "Earth's Natural Satellite",
    category: "Natural Satellite",
    description:
      "The Moon is Earth's only natural satellite. Its orbit is calculated relative to Earth using orbital mechanics.",
    educationalNote:
      "The Moon is tidally locked, meaning the same side always faces Earth. In Real mode, its distance and size should follow the true Earth-Moon scale.",
    stats: [
      { label: "Radius", value: "1,737 km" },
      { label: "Period", value: "27.3 days" },
      { label: "Avg Distance", value: "384,400 km" },
      { label: "Gravity", value: "1.62 m/s²" },
    ],
    details: [
      { label: "Orbit Type", value: "Earth orbit" },
      { label: "Inclination", value: "~5.1°" },
      { label: "Rotation", value: "Tidally locked" },
      { label: "Exploration", value: "Apollo, Artemis" },
    ],
  },

  ISS: {
    title: "International Space Station",
    subtitle: "Human Research Station in Low Earth Orbit",
    category: "Space Station",
    description:
      "The ISS is a modular crewed space station in low Earth orbit. It is used for microgravity research, technology testing, Earth observation, and international cooperation.",
    educationalNote:
      "Astronauts on the ISS feel weightless because they and the station are continuously falling around Earth, not because gravity is absent.",
    stats: [
      { label: "First Module", value: "Nov 1998" },
      { label: "Orbit Type", value: "LEO" },
      { label: "Altitude", value: "~420 km" },
      { label: "Period", value: "~93 min" },
    ],
    details: [
      { label: "Speed", value: "~7.66 km/s" },
      { label: "Crew", value: "Usually 7" },
      { label: "Partners", value: "NASA, Roscosmos, ESA, JAXA, CSA" },
      { label: "Main Use", value: "Science & human spaceflight" },
    ],
  },

  Tiangong: {
    title: "Tiangong Space Station",
    subtitle: "Chinese Modular Space Station",
    category: "Space Station",
    description:
      "Tiangong is China's modular space station in low Earth orbit. Its core module Tianhe launched in 2021, and the station was assembled into a three-module configuration in 2022.",
    educationalNote:
      "Tiangong shows how multiple nations are building independent human-spaceflight infrastructure in low Earth orbit.",
    stats: [
      { label: "Core Launch", value: "Apr 2021" },
      { label: "Orbit Type", value: "LEO" },
      { label: "Altitude", value: "~390–450 km" },
      { label: "Inclination", value: "~41.5°" },
    ],
    details: [
      { label: "Country", value: "China" },
      { label: "Crew", value: "Typically 3" },
      { label: "Modules", value: "Tianhe, Wentian, Mengtian" },
      { label: "Use", value: "Research & crewed missions" },
    ],
  },

  Hubble: {
    title: "Hubble Space Telescope",
    subtitle: "Visible / UV / Near-Infrared Telescope",
    category: "Space Telescope",
    description:
      "Hubble is a NASA/ESA space telescope launched in 1990. It observes above Earth's atmosphere, producing high-resolution images in visible, ultraviolet, and near-infrared light.",
    educationalNote:
      "Hubble helped measure the expansion rate of the universe and produced some of the most important astronomical images ever taken.",
    stats: [
      { label: "Launch Date", value: "Apr 1990" },
      { label: "Orbit Type", value: "LEO" },
      { label: "Altitude", value: "~540 km" },
      { label: "Mirror", value: "2.4 m" },
    ],
    details: [
      { label: "Agencies", value: "NASA / ESA" },
      { label: "Wavelengths", value: "UV, visible, near-IR" },
      { label: "Period", value: "~95 min" },
      { label: "Servicing", value: "Space Shuttle missions" },
    ],
  },

  "James Webb": {
    title: "James Webb Space Telescope",
    subtitle: "Infrared Observatory near Sun-Earth L2",
    category: "Space Telescope",
    description:
      "JWST is an infrared space telescope operating near the Sun-Earth L2 region. In this simulation it is represented as a high-altitude Earth orbit to help students compare distances.",
    educationalNote:
      "JWST is not orbiting Earth like the ISS. It operates near the Sun-Earth L2 region, about 1.5 million km from Earth, where it can keep its sunshield facing the Sun.",
    stats: [
      { label: "Launch Date", value: "Dec 2021" },
      { label: "Location", value: "Sun-Earth L2" },
      { label: "Distance", value: "~1.5M km" },
      { label: "Mirror", value: "6.5 m" },
    ],
    details: [
      { label: "Agencies", value: "NASA, ESA, CSA" },
      { label: "Wavelength", value: "Infrared" },
      { label: "Reached L2", value: "Jan 2022" },
      { label: "Mission", value: "Early universe & exoplanets" },
    ],
  },

  GPS: {
    title: "GPS Satellite",
    subtitle: "Medium Earth Orbit Navigation Satellite",
    category: "Navigation Satellite",
    description:
      "GPS satellites orbit in medium Earth orbit and provide positioning, navigation, and timing signals for phones, vehicles, aircraft, ships, and scientific systems.",
    educationalNote:
      "A GPS receiver usually needs signals from at least four satellites to calculate position and time correction.",
    stats: [
      { label: "Orbit Type", value: "MEO" },
      { label: "Altitude", value: "~20,200 km" },
      { label: "Period", value: "~12 hours" },
      { label: "Use", value: "Navigation" },
    ],
    details: [
      { label: "Country", value: "United States" },
      { label: "Operator", value: "US Space Force" },
      { label: "Operational", value: "~31 satellites" },
      { label: "First Launch", value: "1978" },
    ],
  },

  Starlink: {
    title: "Starlink Satellite",
    subtitle: "Low Earth Orbit Internet Satellite",
    category: "Communication Satellite",
    description:
      "Starlink is a large SpaceX satellite constellation designed to provide broadband internet from low Earth orbit.",
    educationalNote:
      "Starlink satellites are often visible shortly after launch as a train of bright moving points before they spread into their operational orbits.",
    stats: [
      { label: "Orbit Type", value: "LEO" },
      { label: "Altitude", value: "~550 km" },
      { label: "Use", value: "Internet" },
      { label: "Operator", value: "SpaceX" },
    ],
    details: [
      { label: "Project Start", value: "2015 / first test 2018" },
      { label: "First Large Launch", value: "2019" },
      { label: "In Orbit", value: "~10,400+" },
      { label: "Planned Scale", value: "Tens of thousands" },
    ],
  },

  "Lunar Gateway": {
    title: "Lunar Gateway",
    subtitle: "Planned Moon-Orbiting Space Station",
    category: "Lunar Space Station",
    description:
      "Lunar Gateway is a planned space station around the Moon. It is designed to support Artemis lunar missions, science, docking, communications, and future deep-space exploration.",
    educationalNote:
      "Gateway will not orbit Earth like the ISS. It is intended to operate near the Moon and support missions to the lunar surface and beyond.",
    stats: [
      { label: "Orbit", value: "Near Moon" },
      { label: "Mission", value: "Artemis support" },
      { label: "Status", value: "Planned / in development" },
      { label: "Type", value: "Lunar station" },
    ],
    details: [
      { label: "Lead Agency", value: "NASA" },
      { label: "Partners", value: "ESA, JAXA, CSA, MBRSC" },
      { label: "Use", value: "Docking, science, lunar missions" },
      { label: "Region", value: "Moon orbit" },
    ],
  },

  GENERIC: {
    title: "Satellite",
    subtitle: "Artificial Orbiter",
    category: "Artificial Satellite",
    description:
      "An object intentionally placed into orbit. Satellites can support communication, navigation, Earth observation, science, defense, or human spaceflight.",
    educationalNote:
      "A satellite stays in orbit because its forward motion and gravity balance into continuous free fall around a larger body.",
    stats: [
      { label: "Type", value: "Artificial satellite" },
      { label: "Orbit", value: "Depends on mission" },
      { label: "Use", value: "Science / services" },
      { label: "Status", value: "Active object" },
    ],
    details: [
      { label: "LEO", value: "Low Earth Orbit" },
      { label: "MEO", value: "Medium Earth Orbit" },
      { label: "GEO", value: "Geostationary Orbit" },
      { label: "Deep Space", value: "Beyond Earth orbit" },
    ],
  },
  L1: {
    title: "L1 Lagrange Point",
    subtitle: "Earth–Moon Gravitational Balance",
    category: "Lagrange Point",
    description:
      "L1 lies between Earth and the Moon. At this location the gravitational pulls of Earth and Moon combine to create a special equilibrium region.",
    educationalNote:
      "Spacecraft near Earth-Moon L1 can provide communication relay services and support lunar exploration missions.",
    stats: [
      { label: "System", value: "Earth–Moon" },
      { label: "Location", value: "Between Earth & Moon" },
      { label: "Stability", value: "Unstable" },
      { label: "Use", value: "Relay & science missions" },
    ],
  },

  L2: {
    title: "L2 Lagrange Point",
    subtitle: "Beyond the Moon",
    category: "Lagrange Point",
    description:
      "L2 lies beyond the Moon on the Earth-Moon line. It is useful for deep-space communications and lunar exploration support.",
    educationalNote:
      "Do not confuse Earth-Moon L2 with the Sun-Earth L2 region used by JWST.",
    stats: [
      { label: "System", value: "Earth–Moon" },
      { label: "Location", value: "Beyond Moon" },
      { label: "Stability", value: "Unstable" },
      { label: "Use", value: "Exploration support" },
    ],
  },

  L3: {
    title: "L3 Lagrange Point",
    subtitle: "Opposite Side of Earth",
    category: "Lagrange Point",
    description:
      "L3 lies on the opposite side of Earth from the Moon within the Earth-Moon system.",
    educationalNote:
      "L3 is mostly important for understanding the geometry of the Earth-Moon gravitational system.",
    stats: [
      { label: "System", value: "Earth–Moon" },
      { label: "Location", value: "Opposite Earth" },
      { label: "Stability", value: "Unstable" },
      { label: "Use", value: "Educational" },
    ],
  },

  L4: {
    title: "L4 Lagrange Point",
    subtitle: "Leading Stable Region",
    category: "Lagrange Point",
    description:
      "L4 forms an equilateral triangle with Earth and the Moon and leads the Moon in its orbit.",
    educationalNote: "L4 is one of the two stable Earth-Moon Lagrange regions.",
    stats: [
      { label: "System", value: "Earth–Moon" },
      { label: "Angle", value: "+60°" },
      { label: "Stability", value: "Stable" },
      { label: "Type", value: "Triangular point" },
    ],
  },

  L5: {
    title: "L5 Lagrange Point",
    subtitle: "Trailing Stable Region",
    category: "Lagrange Point",
    description:
      "L5 forms an equilateral triangle with Earth and the Moon and trails the Moon in its orbit.",
    educationalNote:
      "L5 is another stable Earth-Moon Lagrange region and is often discussed as a possible future location for space infrastructure.",
    stats: [
      { label: "System", value: "Earth–Moon" },
      { label: "Angle", value: "-60°" },
      { label: "Stability", value: "Stable" },
      { label: "Type", value: "Triangular point" },
    ],
  },
  Kepler: {
    title: "Kepler Space Telescope",
    subtitle: "Exoplanet Hunter",
    category: "Space Telescope",
    description:
      "Kepler was a NASA space telescope designed to discover Earth-sized planets orbiting other stars. It monitored the brightness of thousands of stars to detect tiny dips caused by planets passing in front of them.",
    educationalNote:
      "In this simulation Kepler is shown as a deep-space telescope. Its real mission used a heliocentric Earth-trailing orbit, but because this Orbit Lab does not yet include the Sun, Kepler is represented as a distant fixed object.",
    stats: [
      { label: "Launch", value: "2009" },
      { label: "Mission End", value: "2018" },
      { label: "Main Goal", value: "Find exoplanets" },
      { label: "Orbit Type", value: "Earth-trailing solar orbit" },
    ],
    details: [
      { label: "Agency", value: "NASA" },
      { label: "Discovery Method", value: "Transit photometry" },
      { label: "Legacy", value: "Thousands of planet candidates" },
      { label: "Status", value: "Retired" },
    ],
  },
};