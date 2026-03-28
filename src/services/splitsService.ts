import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type { Split, Workout, Exercise } from '../types';

// ── Splits ────────────────────────────────────────────────────────────────────

export async function createSplit(
  uid: string,
  data: { name: string; description: string }
): Promise<string> {
  const ref_ = await addDoc(collection(db, 'users', uid, 'splits'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref_.id;
}

export async function updateSplit(
  uid: string,
  splitId: string,
  data: { name: string; description: string }
): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'splits', splitId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSplit(uid: string, split: Split): Promise<void> {
  // Delete all workouts (and their exercises' Storage images) first
  const workoutsSnap = await getDocs(
    collection(db, 'users', uid, 'splits', split.id, 'workouts')
  );
  await Promise.allSettled(
    workoutsSnap.docs.map(d => {
      const exercises: Exercise[] = d.data().exercises ?? [];
      return deleteWorkoutData(uid, split.id, d.id, exercises);
    })
  );
  await deleteDoc(doc(db, 'users', uid, 'splits', split.id));
}

// ── Workouts ──────────────────────────────────────────────────────────────────

export async function createWorkout(
  uid: string,
  splitId: string,
  data: { name: string; description: string }
): Promise<string> {
  const ref_ = await addDoc(
    collection(db, 'users', uid, 'splits', splitId, 'workouts'),
    {
      ...data,
      exercises: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );
  return ref_.id;
}

export async function updateWorkout(
  uid: string,
  splitId: string,
  workoutId: string,
  data: { name: string; description: string }
): Promise<void> {
  await updateDoc(
    doc(db, 'users', uid, 'splits', splitId, 'workouts', workoutId),
    { ...data, updatedAt: serverTimestamp() }
  );
}

export async function deleteWorkout(
  uid: string,
  splitId: string,
  workoutId: string,
  exercises: Exercise[]
): Promise<void> {
  await deleteWorkoutData(uid, splitId, workoutId, exercises);
}

async function deleteWorkoutData(
  uid: string,
  splitId: string,
  workoutId: string,
  exercises: Exercise[]
): Promise<void> {
  const storageDeletes = exercises
    .filter(e => e.imageUrl?.includes('firebasestorage.googleapis.com'))
    .map(e => deleteObject(ref(storage, e.imageUrl)).catch(() => {}));
  await Promise.allSettled(storageDeletes);
  await deleteDoc(doc(db, 'users', uid, 'splits', splitId, 'workouts', workoutId));
}

// ── Exercises ─────────────────────────────────────────────────────────────────

export async function saveExercises(
  uid: string,
  splitId: string,
  workoutId: string,
  exercises: Exercise[]
): Promise<void> {
  await updateDoc(
    doc(db, 'users', uid, 'splits', splitId, 'workouts', workoutId),
    { exercises, updatedAt: serverTimestamp() }
  );
}

export async function removeExercise(
  uid: string,
  splitId: string,
  workoutId: string,
  exercise: Exercise,
  allExercises: Exercise[]
): Promise<void> {
  if (exercise.imageUrl?.includes('firebasestorage.googleapis.com')) {
    await deleteObject(ref(storage, exercise.imageUrl)).catch(() => {});
  }
  const updated = allExercises.filter(e => e.id !== exercise.id);
  await saveExercises(uid, splitId, workoutId, updated);
}

export async function markExerciseReady(
  uid: string,
  splitId: string,
  workoutId: string,
  exerciseId: string,
  allExercises: Exercise[],
  ready: boolean
): Promise<void> {
  const updated = allExercises.map(e =>
    e.id === exerciseId ? { ...e, readyToProgress: ready } : e
  );
  await saveExercises(uid, splitId, workoutId, updated);
}

export async function syncSharedExercise(
  uid: string,
  splitId: string,
  exerciseId: string,
  updatedFields: Partial<Exercise>,
  allWorkouts: Workout[]
): Promise<void> {
  const writes = allWorkouts
    .filter(w => w.exercises.some(e => e.id === exerciseId))
    .map(w => {
      const updatedExercises = w.exercises.map(e =>
        e.id === exerciseId ? { ...e, ...updatedFields } : e
      );
      return saveExercises(uid, splitId, w.id, updatedExercises);
    });
  await Promise.all(writes);
}

export async function progressMainWeight(
  uid: string,
  splitId: string,
  workoutId: string,
  exerciseId: string,
  allExercises: Exercise[],
  allWorkouts?: Workout[]
): Promise<void> {
  const exercise = allExercises.find(e => e.id === exerciseId);
  if (!exercise) return;
  const updatedFields = {
    mainWeight: Math.round((exercise.mainWeight + exercise.weightIncrement) * 100) / 100,
    readyToProgress: false,
  };
  if (exercise.shared && allWorkouts) {
    await syncSharedExercise(uid, splitId, exerciseId, updatedFields, allWorkouts);
  } else {
    const updated = allExercises.map(e => e.id === exerciseId ? { ...e, ...updatedFields } : e);
    await saveExercises(uid, splitId, workoutId, updated);
  }
}

export async function progressBackoffWeight(
  uid: string,
  splitId: string,
  workoutId: string,
  exerciseId: string,
  allExercises: Exercise[],
  allWorkouts?: Workout[]
): Promise<void> {
  const exercise = allExercises.find(e => e.id === exerciseId);
  if (!exercise) return;
  const updatedFields = {
    backoffWeight: Math.round((exercise.backoffWeight + exercise.weightIncrement) * 100) / 100,
    readyToProgress: false,
  };
  if (exercise.shared && allWorkouts) {
    await syncSharedExercise(uid, splitId, exerciseId, updatedFields, allWorkouts);
  } else {
    const updated = allExercises.map(e => e.id === exerciseId ? { ...e, ...updatedFields } : e);
    await saveExercises(uid, splitId, workoutId, updated);
  }
}

export async function uploadExerciseImage(
  uid: string,
  exerciseId: string,
  localUri: string
): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const storageRef = ref(storage, `users/${uid}/exercises/${exerciseId}`);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

const CDN_PREFIX = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db';

export async function mirrorCdnImageToStorage(
  uid: string,
  exerciseId: string,
  cdnUrl: string
): Promise<string> {
  if (!cdnUrl || cdnUrl.includes('firebasestorage.googleapis.com')) return cdnUrl;
  if (!cdnUrl.startsWith(CDN_PREFIX)) return cdnUrl;

  const response = await fetch(cdnUrl);
  const blob = await response.blob();
  const storageRef = ref(storage, `users/${uid}/exercises/${exerciseId}`);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}
