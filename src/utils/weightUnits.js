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

const truncateDecimalPlaces = (value, decimalPlaces = 2) => {
  const [whole, decimal = ""] = String(value).split(".");
  if (!decimal || decimalPlaces <= 0) return whole;

  const truncatedDecimal = decimal.slice(0, decimalPlaces).replace(/0+$/, "");
  return truncatedDecimal ? `${whole}.${truncatedDecimal}` : whole;
};

export const formatWeightInputValue = (value, unit = "lbs", decimalPlaces = 2) => {
  const converted = fromStoredLbs(value, unit);
  if (converted === "") return "";
  const numericValue = Number(converted);
  if (!Number.isFinite(numericValue)) return "";

  const exactValue = numericValue.toString();
  if (!exactValue.includes("e")) {
    return truncateDecimalPlaces(exactValue, decimalPlaces);
  }

  // Only trims floating-point representation noise from unit conversion; it never rounds
  // normal user-entered decimals like 12.559 to display increments like 12.56.
  return truncateDecimalPlaces(Number(numericValue.toPrecision(12)).toString(), decimalPlaces);
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
