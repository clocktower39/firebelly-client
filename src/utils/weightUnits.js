export const WEIGHT_UNIT_OPTIONS = [
  { value: "lbs", label: "lb" },
  { value: "kg", label: "kg" },
];

const LB_PER_KG = 2.2046226218;

export const normalizeWeightUnit = (unit) => (unit === "kg" ? "kg" : "lbs");

export const displayWeightUnit = (unit = "lbs") =>
  normalizeWeightUnit(unit) === "kg" ? "kg" : "lb";

export const toStoredLbs = (value, unit = "lbs") => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return null;
  return normalizeWeightUnit(unit) === "kg" ? numericValue * LB_PER_KG : numericValue;
};

export const fromStoredLbs = (value, unit = "lbs") => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "";
  return normalizeWeightUnit(unit) === "kg" ? numericValue / LB_PER_KG : numericValue;
};

export const formatWeightValue = (value, unit = "lbs", precision = 1) => {
  const converted = fromStoredLbs(value, unit);
  if (converted === "") return "";
  const numericValue = Number(converted);
  if (!Number.isFinite(numericValue)) return "";
  return Number(numericValue.toFixed(precision)).toString();
};

export const formatWeightWithUnit = (value, unit = "lbs", precision = 1) => {
  const formattedValue = formatWeightValue(value, unit, precision);
  return formattedValue === "" ? "" : `${formattedValue} ${displayWeightUnit(unit)}`;
};

export const formatWeightList = (values = [], unit = "lbs", precision = 1) =>
  values
    .filter((value) => value !== null && value !== undefined && value !== "" && Number(value) !== 0)
    .map((value) => formatWeightValue(value, unit, precision))
    .filter(Boolean)
    .join(", ");
