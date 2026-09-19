import { PipelinePhase, SyllabusItem, ChatMessage, PresetDoc, DomainMetric, PricingPlan } from '../types';

export const LOGO_URL = 'https://lh3.googleusercontent.com/aida/AEtjO1WYwczPkwvvrbM_mKp0idv-ce66J2uGhfDKxLrhN9IQx7NQgfqZZ5ZSPO1aduFHFqXkVQbWCkSUVuNZzXWOejcmirxwtiMKDsZtzZ5Z1vq_2ohofI3H1AITYiGgpvymCTGFoOYoaWiIY_KiXxuLiCGt2NAtoZtodX3LnnA5hKzxFQIR_unR4kQZ9_B0VCRO3mmS4DR6GYYDA3AHFxzS8aSW2WgP9TBjll2OleuYs21DMEZsaOStEn7TVet4';

export const HERO_IMAGE_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_u-fGGyZVdZzUDxcAwM_I5W2fRKvalMxSLM10dhNL8Hu_FIOjACA95HmmgXeQUjGZDlFDXboRO5QST8xOpWL-qDrGZ90fXMw6GKUTCgUn6v276gkpNfUKsDWSGjoSLAAZjvoUyAbBXWs1XqBoNSVCLcDOUwyutisVHF3LFrJUjYrK-6PkYqWM3s7R0MtMsLK5kTOX6iQAfPvn5ba-pE1QqQY2JbVaN6R6n61g84muvWwCrRBl-Nhphw';

export const PIPELINE_PHASES: PipelinePhase[] = [
  {
    number: 'PHASE 01',
    badgeClass: 'bg-primary/10 text-primary',
    iconBgClass: 'bg-primary-container/15 text-primary',
    icon: 'upload_file',
    iconColor: 'text-primary',
    title: 'Ingestion & Parsing',
    description: 'Multi-format intake across dense PDFs, ArXiv papers, ePub textbooks, and recorded lecture audio. Custom OCR recovers complex LaTeX formulas, tables, and vector schematics cleanly.',
    highlight: 'Sub-second AST Document Chunking',
    dotColor: 'bg-primary',
    detailedSpecs: {
      algorithmicBase: 'Multi-modal Vision Parser + AST Tokenizer',
      throughput: '120 pages/sec with OCR preservation',
      targetArtifact: 'Semantic Knowledge Graph & Raw Vector Chunks'
    }
  },
  {
    number: 'PHASE 02',
    badgeClass: 'bg-secondary/15 text-secondary',
    iconBgClass: 'bg-secondary-container/25 text-secondary',
    icon: 'hub',
    iconColor: 'text-secondary',
    title: 'Concept Decomposition',
    description: 'Multi-layer clustering breaks dense topics into semantic prerequisite trees. Creates directional dependency graphs showing foundational theorems before advanced corollaries.',
    highlight: 'Topological Knowledge Ordering',
    dotColor: 'bg-secondary',
    detailedSpecs: {
      algorithmicBase: 'Directed Acyclic Graph (DAG) Prerequisite Parser',
      throughput: 'O(V + E) Topological Sort over 500+ topics',
      targetArtifact: 'Ordered Linear Learning Matrix'
    }
  },
  {
    number: 'PHASE 03',
    badgeClass: 'bg-tertiary-container/20 text-tertiary',
    iconBgClass: 'bg-tertiary-container/20 text-tertiary',
    icon: 'calendar_clock',
    iconColor: 'text-tertiary',
    title: 'Spaced Trajectory',
    description: 'Algorithmic study schedules calculated from individual recall decay rates, weighted against target board or final exam deadlines to eliminate last-minute cognitive overload.',
    highlight: 'FSRS-5 Scheduling Engine',
    dotColor: 'bg-tertiary',
    detailedSpecs: {
      algorithmicBase: 'Free Spaced Repetition Scheduler (FSRS-5)',
      throughput: 'Optimized retention interval calculation < 2ms',
      targetArtifact: 'Dynamic Daily Synapse Queue'
    }
  },
  {
    number: 'PHASE 04',
    badgeClass: 'bg-primary/10 text-primary',
    iconBgClass: 'bg-primary-container/15 text-primary',
    icon: 'psychology_alt',
    iconColor: 'text-primary',
    title: 'Socratic Inquiries',
    description: 'Rather than passive recitation, an adversarial Socratic mentor tests intuition through counter-factuals, code implementations, and multi-tier mental model analogies.',
    highlight: 'Interactive First-Principles Synthesis',
    dotColor: 'bg-primary',
    detailedSpecs: {
      algorithmicBase: 'Adversarial Socratic Dialog Engine',
      throughput: 'Sub-400ms multi-turn latency',
      targetArtifact: 'Targeted Conceptual Intuition Anchors'
    }
  },
  {
    number: 'PHASE 05',
    badgeClass: 'bg-secondary/15 text-secondary',
    iconBgClass: 'bg-secondary-container/25 text-secondary',
    icon: 'quiz',
    iconColor: 'text-secondary',
    title: 'Feynman Validation',
    description: 'Auto-generated high-stress clinical vignettes and coding challenges. You must teach concepts back in plain speech; the model detects logical gaps and missing edge cases.',
    highlight: 'Real-Time Conceptual Gap Detector',
    dotColor: 'bg-secondary',
    detailedSpecs: {
      algorithmicBase: 'Natural Language Logic Verifier',
      throughput: 'Real-time speech-to-text + semantic diffing',
      targetArtifact: 'Automated Blindspot Heatmap'
    }
  },
  {
    number: 'PHASE 06',
    badgeClass: 'bg-tertiary-container/20 text-tertiary',
    iconBgClass: 'bg-tertiary-container/20 text-tertiary',
    icon: 'auto_fix_high',
    iconColor: 'text-tertiary',
    title: 'Dynamic Reinforcement',
    description: 'Weakness vectors trigger automated micro-interventions: targeted flashcards generated on the fly, altered practice questions, and revised calendar density until complete mastery.',
    highlight: 'Closed-Loop Neuro-Plastic Alignment',
    dotColor: 'bg-tertiary',
    detailedSpecs: {
      algorithmicBase: 'Adaptive Memory Feedback Network',
      throughput: 'Instantaneous deck re-weighting',
      targetArtifact: 'Permanent Long-Term Memory Engrams'
    }
  }
];

export const SYLLABUS_MODULES: SyllabusItem[] = [
  {
    id: 'sec-1',
    section: '§ 4.1',
    title: 'Pure States vs Mixed Ensembles',
    status: 'mastered',
    formula: 'ρ = Σ p_i |ψ_i⟩⟨ψ_i|',
    description: 'Density operator definition where trace equals unity and eigenvalues are non-negative.',
    recallRate: '98%'
  },
  {
    id: 'sec-2',
    section: '§ 4.2',
    title: 'Von Neumann Entropy & Entanglement',
    status: 'in-focus',
    formula: 'S(ρ) = -Tr(ρ ln ρ)',
    description: 'Evaluating the von Neumann entropy across bipartite Hilbert spaces to quantify subsystem non-separability.',
    progressPercent: 65
  },
  {
    id: 'sec-3',
    section: '§ 4.3',
    title: 'Lindblad Master Equation',
    status: 'locked',
    formula: 'dρ/dt = -i[H, ρ] + Σ (L_k ρ L_k† - ½{L_k† L_k, ρ})',
    description: 'Markovian open system dynamics and environmental coupling tensors.'
  },
  {
    id: 'sec-4',
    section: '§ 4.4',
    title: 'Quantum Decoherence Time (T_2*)',
    status: 'locked',
    description: 'Phase damping mechanisms and exponential decay of off-diagonal coherence terms.'
  }
];

export const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'user',
    time: '10:42 AM',
    text: 'Why does tracing out subsystem B yield a mixed state even if the global state |Ψ_AB⟩ is pure?'
  },
  {
    id: 'm2',
    sender: 'ai',
    time: '10:42 AM',
    text: 'Think of entanglement as information dispersed into the correlation itself. When you take the partial trace:',
    formula: 'ρ_A = Tr_B(|Ψ_AB⟩⟨Ψ_AB|)',
    secondaryText: "You discard Phase information held exclusively in the joint amplitudes. Without access to subsystem B's degrees of freedom, quantum superposition mathematically degrades into classical statistical uncertainty.",
    flashcardGenerated: {
      id: 'fc-042',
      title: 'Flashcard Auto-Generated',
      subtitle: '"Partial trace as information erasure" added to Deck.',
      difficulty: 'Rating: High Difficulty',
      front: 'What is the physical meaning of tracing out subsystem B in an entangled composite state |Ψ_AB⟩?',
      back: 'The partial trace ρ_A = Tr_B(|Ψ_AB⟩⟨Ψ_AB|) discards joint phase correlations stored between subsystems, converting quantum coherent superposition into an improper classical mixed state statistical density matrix.',
      formula: 'ρ_A = Tr_B(|Ψ_AB⟩⟨Ψ_AB|)'
    }
  }
];

export const PRESET_DOCUMENTS: PresetDoc[] = [
  {
    id: 'doc-qed',
    filename: 'Quantum_Electrodynamics_v2.pdf',
    size: '14.8 MB',
    pages: 342,
    mode: 'Multi-Pass Ingestion',
    modulesCount: 48,
    cardsCount: 324,
    estimatedHours: 18,
    blocksCount: 21,
    sampleQuestion: 'What is the mathematical condition for gauge invariance in the Lagrangian density of quantum electrodynamics?',
    sampleFormula: 'L_QED = ψ̄(iγ^μ D_μ - m)ψ - ¼ F_μν F^μν'
  },
  {
    id: 'doc-biochem',
    filename: 'USMLE_Biochem_Core.pdf',
    size: '22.4 MB',
    pages: 410,
    mode: 'Clinical Vignette Synthesis',
    modulesCount: 64,
    cardsCount: 512,
    estimatedHours: 26,
    blocksCount: 32,
    sampleQuestion: 'What is the rate-limiting regulatory enzyme of the pentose phosphate pathway, and which cofactor inhibits it?',
    sampleFormula: 'Glucose-6-Phosphate + NADP+ → 6-Phosphoglucono-δ-lactone + NADPH'
  },
  {
    id: 'doc-cs229',
    filename: 'CS229_Machine_Learning.pdf',
    size: '11.2 MB',
    pages: 280,
    mode: 'Algorithmic Proof Decomposition',
    modulesCount: 36,
    cardsCount: 280,
    estimatedHours: 14,
    blocksCount: 18,
    sampleQuestion: 'Derive the closed-form normal equation solution for ordinary least squares with full-rank design matrix X.',
    sampleFormula: 'θ* = (X^T X)^(-1) X^T y'
  }
];

export const DOMAIN_METRICS: DomainMetric[] = [
  {
    name: 'Statistical Physics & Decoherence',
    percent: 96,
    colorClass: 'text-primary',
    barColor: 'bg-primary'
  },
  {
    name: 'Differential Geometry & Tensors',
    percent: 88,
    colorClass: 'text-secondary',
    barColor: 'bg-secondary'
  },
  {
    name: 'Algorithmic Complexity (NP-Hard Reductions)',
    percent: 74,
    colorClass: 'text-tertiary',
    barColor: 'bg-tertiary'
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Scholar Core',
    price: '$0',
    billing: 'Forever free for students',
    description: 'Essential neural extraction and spaced repetition engine for self-guided technical study.',
    features: [
      'Up to 3 active textbook/PDF ingests',
      'FSRS-5 algorithmic spaced repetition schedule',
      'Dual-Pane Socratic dialogue (30 queries/day)',
      'Direct Anki (.apkg) card export',
      'Standard formula OCR detection'
    ],
    cta: 'Start Free'
  },
  {
    id: 'pro',
    name: 'Researcher Pro',
    price: '$19',
    billing: 'billed monthly or $190/yr',
    description: 'High-throughput multimodal ingestion, unlimited Feynman validation, and custom vector context.',
    popular: true,
    features: [
      'Unlimited dense PDFs, ArXiv & lecture audio uploads',
      'Unlimited Socratic inquiries with 128k GPU context',
      'Automatic LaTeX proof & cloze generation',
      'Bipartite Concept Decomposition graphs',
      'Direct Notion & Obsidian bidirectional sync',
      'Priority inference queue (<300ms latency)'
    ],
    cta: 'Get Started with Pro'
  },
  {
    id: 'institutional',
    name: 'Institutional Lab',
    price: 'Custom',
    billing: 'For universities & lab cohorts',
    description: 'Departmental knowledge repositories, private on-prem vector storage, and curriculum compliance.',
    features: [
      'SOC2 Type II & GDPR enterprise agreements',
      'Zero model training on proprietary institutional data',
      'SSO & Canvas / Blackboard LMS integration',
      'Cohort-wide retention curves & empirical telemetry',
      'Dedicated support & custom OCR training'
    ],
    cta: 'Contact Lab Sales'
  }
];
