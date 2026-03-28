// Phase 1
export interface AppUser {
  uid: string;
  displayName: string;
  email: string;
  preferredUnit: 'lbs' | 'kg';
}

// Phase 2
export interface Exercise {
  id: string;
  name: string;
  shared?: boolean;
  // Main set (1 set)
  mainWeight: number;
  mainRepTarget: number;    // rep goal
  // Backoff set (1 set)
  backoffWeight: number;
  backoffRepTarget: number; // rep goal
  // Progression
  weightIncrement: number;  // lbs/kg to add when progressing
  readyToProgress: boolean;
  // Meta
  weightUnit: 'lbs' | 'kg';
  notes: string;
  imageUrl: string;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Split {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseTemplate {
  id: string;    // free-exercise-db id, used to build CDN image URL
  name: string;
  muscle: string;
  hasImage: boolean;
}
