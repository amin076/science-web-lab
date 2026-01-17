export const HUD_DATA = [
  {
    id: "general",
    title: "Planet Earth",
    icon: "🌍",
    image: "/textures/earth/diffuse.jpg", // Using existing texture as preview
    description:
      "The third planet from the Sun and the only astronomical object known to harbor life. Earth formed over 4.5 billion years ago. Its interior remains active, with a solid iron inner core creating a magnetic field that protects the atmosphere.",
    stats: [
      { label: "Age", value: "4.54 Ga" },
      { label: "Radius", value: "6,371 km" },
      { label: "Surface Area", value: "510.1 M km²" },
      { label: "Gravity", value: "9.8 m/s²" },
    ],
  },
  {
    id: "crust",
    title: "The Crust",
    icon: "🪨",
    // In a real app, use a specific illustration. Using a placeholder color for now.
    colorPlaceholder: "#5c4033", 
    description:
      "The outermost solid shell of Earth. It is extremely thin compared to the rest of the planet (like the skin of an apple). There are two types: Continental (granite, thick) and Oceanic (basalt, thin).",
    stats: [
      { label: "Thickness", value: "5 - 70 km" },
      { label: "Temperature", value: "200°C - 400°C" },
      { label: "State", value: "Solid Rock" },
      { label: "Composition", value: "Silicates" },
    ],
  },
  {
    id: "mantle",
    title: "The Mantle",
    icon: "🔥",
    colorPlaceholder: "#8B0000",
    description:
      "The widest layer of Earth. While solid, the rock is hot enough to flow slowly over geological time (plasticity). Convection currents here drive the movement of tectonic plates above.",
    stats: [
      { label: "Thickness", value: "~2,900 km" },
      { label: "Temperature", value: "500°C - 4,000°C" },
      { label: "State", value: "Viscous Solid" },
      { label: "Key Mineral", value: "Olivine" },
    ],
  },
  {
    id: "outer_core",
    title: "Outer Core",
    icon: "🌊",
    colorPlaceholder: "#FF8C00",
    description:
      "A fluid layer composed of iron and nickel. The churning motion of this liquid metal acts like a giant dynamo, generating Earth's protective magnetic field.",
    stats: [
      { label: "Thickness", value: "~2,200 km" },
      { label: "Temperature", value: "4,000°C - 5,700°C" },
      { label: "State", value: "Liquid Metal" },
      { label: "Composition", value: "Fe + Ni" },
    ],
  },
  {
    id: "inner_core",
    title: "Inner Core",
    icon: "⚪",
    colorPlaceholder: "#FFFF00",
    description:
      "The dense center of the Earth. Despite temperatures higher than the surface of the Sun, extreme pressure prevents the iron from melting, keeping it in a solid state.",
    stats: [
      { label: "Radius", value: "~1,220 km" },
      { label: "Temperature", value: "~5,400°C" },
      { label: "State", value: "Solid Metal" },
      { label: "Pressure", value: "330 - 360 GPa" },
    ],
  },
  {
    id: "atmosphere",
    title: "Atmosphere",
    icon: "☁️",
    colorPlaceholder: "#4fa1c4",
    description:
      "A layer of gases retained by gravity. It protects life by absorbing UV radiation, warming the surface (greenhouse effect), and reducing temperature extremes.",
    stats: [
      { label: "Extend", value: "~10,000 km" },
      { label: "Nitrogen", value: "78%" },
      { label: "Oxygen", value: "21%" },
      { label: "Argon", value: "0.9%" },
    ],
  },
];