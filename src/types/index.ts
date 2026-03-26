// Phase 1
export interface AppUser {
  uid: string;
  displayName: string;
  email: string;
  preferredUnit: 'lbs' | 'kg';
}

// Phase 2 — expanded here
export interface Exercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps: number;
  targetWeight: number;
  weightUnit: 'lbs' | 'kg';
  notes: string;
  imageUrl: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  exercises: Exercise[];
}
