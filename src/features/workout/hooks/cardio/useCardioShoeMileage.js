import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  convertDistanceToMiles,
  normalizeCardio,
  normalizeShoeName,
} from "../../utils/workoutUtils";

const EMPTY_WORKOUTS = [];

export default function useCardioShoeMileage({ activeCardio, training, user }) {
  const workoutsForMileage = useSelector((state) => {
    const accountId = training?.user?._id || user?._id;
    return state.workouts?.[accountId]?.workouts || EMPTY_WORKOUTS;
  });

  const shoeMileage = useMemo(() => {
    const shoeName = normalizeShoeName(activeCardio.shoes);
    if (!shoeName) return null;
    let totalMiles = 0;
    let matchingWorkouts = 0;

    workoutsForMileage.forEach((workout) => {
      const cardio = normalizeCardio(workout?.cardio);
      const workoutTypeValue = workout?.workoutType || (cardio?.plan || cardio?.actual ? "Cardio" : "");
      if (workoutTypeValue !== "Cardio") return;
      const mode = cardio?.actual?.distance ? "actual" : "plan";
      const entry = cardio?.[mode] || {};
      if (normalizeShoeName(entry.shoes) !== shoeName) return;
      const distance = Number(entry.distance);
      if (!distance) return;
      const unit = entry.distanceUnit || "mi";
      const miles = convertDistanceToMiles(distance, unit);
      totalMiles += miles;
      matchingWorkouts += 1;
    });

    const displayValue =
      activeCardio.distanceUnit === "km" ? (totalMiles * 1.60934).toFixed(2) : totalMiles.toFixed(2);

    return {
      value: displayValue,
      unit: activeCardio.distanceUnit,
      workouts: matchingWorkouts,
    };
  }, [activeCardio.distanceUnit, activeCardio.shoes, workoutsForMileage]);

  const shoeMileageHelper = useMemo(() => {
    if (!activeCardio.shoes) return "";
    if (!shoeMileage) return "Mileage updates as workouts load.";
    const workoutLabel = shoeMileage.workouts === 1 ? "workout" : "workouts";
    return `Loaded mileage: ${shoeMileage.value} ${shoeMileage.unit} (${shoeMileage.workouts} ${workoutLabel} loaded)`;
  }, [activeCardio.shoes, shoeMileage]);

  return {
    shoeMileage,
    shoeMileageHelper,
  };
}
