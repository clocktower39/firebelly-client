import { useCallback, useMemo, useRef } from "react";
import deepEqual from "fast-deep-equal/react";
import { normalizeCardio } from "../utils/workoutUtils";

const normalizeWorkoutSnapshot = (obj) => {
  const clone = typeof structuredClone === "function" ? structuredClone(obj) : JSON.parse(JSON.stringify(obj ?? {}));

  delete clone?._id;
  delete clone?.user;

  if (Array.isArray(clone?.training)) {
    clone.training = clone.training.map((block) =>
      Array.isArray(block)
        ? block.map((set) => {
            if (set?.exercise && typeof set.exercise === "object" && set.exercise._id) {
              set.exercise = String(set.exercise._id);
            }
            return set;
          })
        : block
    );
  }

  if (Array.isArray(clone?.category)) {
    clone.category = [...clone.category].map(String).sort((a, b) => a.localeCompare(b));
  }

  if (clone?.workoutFeedback?.comments) {
    clone.workoutFeedback.comments = clone.workoutFeedback.comments.map((comment) => ({
      ...comment,
      _id: undefined,
      timestamp: comment?.timestamp ? new Date(comment.timestamp).toISOString() : null,
    }));
  }

  clone.complete = !!clone.complete;
  clone.title = clone.title ?? "";
  clone.category = clone.category ?? [];
  clone.workoutFeedback = clone.workoutFeedback ?? { difficulty: 1, comments: [] };
  clone.training = clone.training ?? [];
  clone.workoutType = clone.workoutType ?? "Strength";
  clone.cardio = normalizeCardio(clone.cardio);

  return clone;
};

export default function useWorkoutDirtyState({
  cardioDetails,
  localTraining,
  trainingCategory,
  trainingTitle,
  workoutCompleteStatus,
  workoutFeedback,
  workoutType,
}) {
  const baselineRef = useRef(null);

  const normalize = useCallback((obj) => normalizeWorkoutSnapshot(obj), []);

  const buildLocalComposite = useCallback(
    () => ({
      title: trainingTitle,
      category: trainingCategory,
      complete: workoutCompleteStatus,
      workoutFeedback,
      training: localTraining,
      workoutType,
      cardio: cardioDetails,
    }),
    [
      cardioDetails,
      localTraining,
      trainingCategory,
      trainingTitle,
      workoutCompleteStatus,
      workoutFeedback,
      workoutType,
    ]
  );

  const isDirty = useMemo(() => {
    if (!baselineRef.current) return false;
    return !deepEqual(baselineRef.current, normalize(buildLocalComposite()));
  }, [buildLocalComposite, normalize]);

  const setBaseline = useCallback(
    (snapshot) => {
      baselineRef.current = normalize(snapshot);
    },
    [normalize]
  );

  return {
    buildLocalComposite,
    isDirty,
    setBaseline,
  };
}
