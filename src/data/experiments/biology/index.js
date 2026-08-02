import BiotechRoundedIcon from '@mui/icons-material/BiotechRounded';

export const biologyExperiments = [
  {
    id: 'evolution-of-life',
    slug: 'evolution-of-life',
    domain: 'biology',
    topic: 'evolution',
    name: 'Evolution of Life',
    title: 'Evolution of Life',
    desc: 'Explore major transitions in the history of life from the earliest cells to modern humans.',
    description: 'Explore major transitions in the history of life from the earliest cells to modern humans.',
    Icon: BiotechRoundedIcon,
    gradient: 'linear-gradient(135deg, #0f766e, #7c3aed)',
    route: '/experiments/evolution-of-life',
    demo: true,
    simulationType: 'timeline',
    engine: 'timeline',
    renderingModel: 'timeline-dom',
    standardRole: 'Timeline reference implementation',
    verifiedCapabilities: {
      interactive: {
        supported: true,
        verified: true,
        confidence: 'verified',
        source: 'evolution-runtime-playwright-052',
        reason: 'Desktop and mobile runtime tests verified stage navigation, journey selection, details controls, and playback.',
      },
      timeline: {
        supported: true,
        verified: true,
        confidence: 'verified',
        source: 'evolution-runtime-playwright-052',
        reason: 'Runtime tests verified timeline events, eras, stage changes, autoplay, and responsive presentation.',
      },
    },
    status: 'development',
    responsive: true,
    mobileFriendly: true,
    subject: 'Biology',
  },
];
