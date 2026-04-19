import { TODAY_HE } from '../constants';

export interface HistoryEvent {
  year: number; // HE
  title: string;
  description: string;
  importance: number; // 1-3 for adaptive labeling
  isToday?: boolean;
}

export const events: HistoryEvent[] = [
  // THE DAWN
  {
    year: 0,
    title: 'Beginning of Agriculture',
    description: 'Transition from hunter-gatherer to agricultural societies.',
    importance: 3,
  },
  {
    year: 1,
    title: 'Sabretooth Tiger Extinct',
    description: 'The Smilodon goes extinct at the very beginning of the Holocene.',
    importance: 2,
  },
  {
    year: 1000,
    title: 'Göbekli Tepe',
    description: 'Construction of the worlds oldest known megalithic structures in Turkey.',
    importance: 3,
  },
  {
    year: 4000,
    title: 'First Irrigation',
    description: 'Mesopotamians begin using organized irrigation for crops.',
    importance: 2,
  },
  {
    year: 5000,
    title: 'Copper Age Starts',
    description: 'Humans begin working with copper, the transition between Stone and Bronze.',
    importance: 3,
  },

  // ANCIENT CIVILIZATION
  {
    year: 6500,
    title: 'Invention of Glass',
    description: 'Core-manufactured glass appears in Mesopotamia.',
    importance: 2,
  },
  {
    year: 6700,
    title: 'Bronze Age Starts',
    description: 'The use of bronze becomes widespread in the Near East.',
    importance: 3,
  },
  {
    year: 6701,
    title: 'Ötzi the Iceman',
    description: 'Life of the famous mummy found naturally preserved in the Alps.',
    importance: 2,
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
    description: 'The oldest and largest of the Giza pyramids is completed.',
    importance: 3,
  },
  {
    year: 8351,
    title: 'Woolly Mammoth Extinct',
    description: 'The last isolated population dies out on Wrangel Island.',
    importance: 2,
  },
  {
    year: 8800,
    title: 'Iron Age Starts',
    description: 'Smelting of iron begins to spread across Europe and Asia.',
    importance: 3,
  },

  // CLASSICAL & MYSTERY
  {
    year: 9224,
    title: 'Founding of Rome',
    description: 'Traditional date for the founding of Rome (753 BC).',
    importance: 2,
  },
  {
    year: 9666,
    title: 'Aristotle / The Lyceum',
    description: 'Aristotle founds his school in Athens after studying under Plato.',
    importance: 2,
  },
  {
    year: 9671,
    title: 'Alexander the Great',
    description: 'Alexander conquers the Persian Empire, reaching the peak of his rule.',
    importance: 2,
  },
  {
    year: 9731,
    title: 'Heliocentric View (Early)',
    description: 'Aristarchus of Samos proposes that the Earth revolves around the Sun.',
    importance: 2,
  },
  {
    year: 9901,
    title: 'Antikythera Mechanism',
    description: 'Creation of an ancient Greek analog computer of mysterious complexity.',
    importance: 3,
  },
  {
    year: 9950,
    title: 'Cleopatra takes the Throne',
    description: 'Cleopatra VII begins her reign as the last pharaoh of Egypt.',
    importance: 2,
  },
  {
    year: 9957,
    title: 'Betrayal of Caesar',
    description: 'Julius Caesar is assassinated on the Ides of March.',
    importance: 2,
  },
  {
    year: 10000,
    title: 'Common Era Begins',
    description: 'The transition from BC to AD in the Gregorian calendar.',
    importance: 3,
  },
  {
    year: 10060,
    title: 'Heros Steam Engine',
    description: 'Hero of Alexandria describes the Aeolipile, the first steam engine.',
    importance: 2,
  },
  {
    year: 10200,
    title: 'Baghdad Battery',
    description: 'Clay jars from the Parthian period containing copper and iron rods.',
    importance: 2,
  },

  // MIDDLE AGES & RENAISSANCE
  {
    year: 11227,
    title: 'Height of Genghis Khan',
    description: 'The Mongol Empire reaches its peak expansion.',
    importance: 2,
  },
  {
    year: 11284,
    title: 'First Eyeglasses',
    description: 'Wearable spectacles for correcting vision are developed in Italy.',
    importance: 2,
  },
  {
    year: 11420,
    title: 'Voynich Manuscript',
    description: 'Carbon dating of the most mysterious encrypted book in history.',
    importance: 3,
  },
  {
    year: 11450,
    title: 'Gutenberg Press',
    description: 'Invention of the movable type printing press.',
    importance: 3,
  },
  {
    year: 11543,
    title: 'Heliocentrism (Copernicus)',
    description: 'Nicolas Copernicus publishes De revolutionibus orbium coelestium.',
    importance: 2,
  },
  {
    year: 11608,
    title: 'The First Telescope',
    description: 'Hans Lippershey applies for the patent for the spyglass.',
    importance: 2,
  },
  {
    year: 11662,
    title: 'Dodo Bird Extinct',
    description: 'The last confirmed sighting of the Dodo on Mauritius.',
    importance: 2,
  },

  // MODERN AGE
  {
    year: 11760,
    title: 'Industrial Age Starts',
    description: 'The transition to new manufacturing processes begins.',
    importance: 3,
  },
  {
    year: 11769,
    title: 'Watt Steam Engine',
    description: 'James Watt patents his efficient steam engine design.',
    importance: 2,
  },
  {
    year: 11831,
    title: 'Electricity (Induction)',
    description: 'Michael Faraday discovers electromagnetic induction.',
    importance: 2,
  },
  {
    year: 11861,
    title: 'Germ Theory',
    description: 'Louis Pasteur publishes his experiments on spontaneous generation.',
    importance: 2,
  },
  {
    year: 11886,
    title: 'The First Car',
    description: 'Karl Benz patents the Benz Patent-Motorwagen.',
    importance: 2,
  },
  {
    year: 11903,
    title: 'Wright Flyer',
    description: 'First controlled, powered flight of a heavier-than-air aircraft.',
    importance: 2,
  },
  {
    year: 11911,
    title: 'South Pole Reached',
    description: 'Roald Amundsen becomes the first human to reach the geographic South Pole.',
    importance: 2,
  },
  {
    year: 11958,
    title: 'The Microchip',
    description: 'Jack Kilby demonstrates the first integrated circuit.',
    importance: 3,
  },
  {
    year: 11969,
    title: 'Moon Landing',
    description: 'Humans land on the Moon for the first time.',
    importance: 3,
  },
  {
    year: 11970,
    title: 'Information Age Starts',
    description: 'The beginning of the shift from industrial to digital economies.',
    importance: 3,
  },
  {
    year: TODAY_HE,
    title: 'Present Day',
    description: 'Today in the Holocene calendar.',
    importance: 1,
    isToday: true,
  },
];
