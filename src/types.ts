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
