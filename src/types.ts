export type ActiveScreen = 'all' | 'pipeline' | 'ai-workspace' | 'pdf-transformer' | 'mastery-dashboard' | 'pricing';

export interface PipelinePhase {
  number: string;
  badgeClass: string;
  iconBgClass: string;
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  highlight: string;
  dotColor: string;
  detailedSpecs?: {
    algorithmicBase: string;
    throughput: string;
    targetArtifact: string;
  };
}

export interface SyllabusItem {
  id: string;
  section: string;
  title: string;
  status: 'mastered' | 'in-focus' | 'locked';
  formula?: string;
  description: string;
  recallRate?: string;
  progressPercent?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  time: string;
  text: string;
  formula?: string;
  secondaryText?: string;
  flashcardGenerated?: {
    id: string;
    title: string;
    subtitle: string;
    difficulty: string;
    front: string;
    back: string;
    formula?: string;
  };
}

export interface PresetDoc {
  id: string;
  filename: string;
  size: string;
  pages: number;
  mode: string;
  modulesCount: number;
  cardsCount: number;
  estimatedHours: number;
  blocksCount: number;
  sampleQuestion: string;
  sampleFormula: string;
}

export interface DomainMetric {
  name: string;
  percent: number;
  colorClass: string;
  barColor: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  billing: string;
  description: string;
  popular?: boolean;
  features: string[];
  cta: string;
}
