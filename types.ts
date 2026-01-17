
export interface StudySegment {
  id: string;
  topic: string;
  unit: string;
  importance: number; // 1-10
  estimatedDuration: number; // minutes
  description: string;
  status: 'pending' | 'completed' | 'skipped' | 'redo';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: [string, string, string];
  correctIndex: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface StudyPlan {
  segments: StudySegment[];
}

export interface MaterialData {
  data: string;
  mimeType: string;
}

export interface Unit {
  id: string;
  name: string;
  material: MaterialData;
  plan: StudyPlan;
  score: number;
  progress: number; // 0-100
  createdAt: number;
}

// Added missing Subject interface to satisfy imports in legacy components
export interface Subject {
  id: string;
  name: string;
  units: Unit[];
}

export interface AppState {
  view: 'home' | 'planning' | 'timer' | 'game' | 'summary';
  theme: 'light' | 'dark';
  units: Unit[]; // Flattened: direct files/notes
  currentUnitId: string | null;
  currentSegmentIndex: number;
  lastQuizScore: number;
  playerColor: string;
}