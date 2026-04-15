export interface HistoryEvent {
  year: number; // HE
  title: string;
  description: string;
  importance: number; // 1-3 for adaptive labeling
}

export const events: HistoryEvent[] = [
  {
    year: 0,
    title: 'Beginning of Agriculture',
    description: 'Transition from hunter-gatherer to agricultural societies.',
    importance: 3,
  },
  {
    year: 6800,
    title: 'Invention of Writing',
    description: 'Sumerians in Mesopotamia develop cuneiform.',
    importance: 3,
  },
  {
    year: 7400,
    title: 'Great Pyramid of Giza',
    description: 'Construction of the oldest and largest of the Giza pyramids.',
    importance: 2,
  },
  {
    year: 9224,
    title: 'Founding of Rome',
    description: 'Traditional date for the founding of Rome (753 BC).',
    importance: 2,
  },
  {
    year: 10000,
    title: 'Common Era Begins',
    description: 'The year 1 AD in the Gregorian calendar.',
    importance: 3,
  },
  {
    year: 11450,
    title: 'Gutenberg Press',
    description: 'Invention of the movable type printing press in Europe.',
    importance: 2,
  },
  {
    year: 11769,
    title: 'Industrial Revolution',
    description: 'The beginning of the transition to new manufacturing processes.',
    importance: 3,
  },
  {
    year: 11969,
    title: 'Moon Landing',
    description: 'Humans land on the Moon for the first time.',
    importance: 2,
  },
  {
    year: 12026.3,
    title: 'Present Day',
    description: 'Today in the Holocene calendar.',
    importance: 1,
  },
];
