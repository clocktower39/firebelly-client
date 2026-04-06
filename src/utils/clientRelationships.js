export const ENGAGEMENT_STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "success" },
  { value: "paused", label: "Paused", color: "warning" },
  { value: "inactive", label: "Inactive", color: "default" },
];

export const SERVICE_TAG_OPTIONS = [
  { value: "in_person", label: "In-Person" },
  { value: "online", label: "Online" },
  { value: "programming", label: "Programming" },
];

const engagementStatusLabelMap = Object.fromEntries(
  ENGAGEMENT_STATUS_OPTIONS.map((option) => [option.value, option.label])
);

const engagementStatusColorMap = Object.fromEntries(
  ENGAGEMENT_STATUS_OPTIONS.map((option) => [option.value, option.color])
);

const serviceTagLabelMap = Object.fromEntries(
  SERVICE_TAG_OPTIONS.map((option) => [option.value, option.label])
);

export const getRelationshipEngagementStatus = (relationship) =>
  relationship?.engagementStatus || "active";

export const getRelationshipServiceTags = (relationship) =>
  Array.isArray(relationship?.serviceTags) ? relationship.serviceTags : [];

export const getEngagementStatusLabel = (value) =>
  engagementStatusLabelMap[value] || engagementStatusLabelMap.active;

export const getEngagementStatusColor = (value) =>
  engagementStatusColorMap[value] || engagementStatusColorMap.active;

export const getServiceTagLabel = (value) => serviceTagLabelMap[value] || value;

export const isRelationshipActivelyCoached = (relationship) =>
  Boolean(relationship?.accepted) && getRelationshipEngagementStatus(relationship) === "active";
