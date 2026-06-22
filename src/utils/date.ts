import type { Timestamp } from "firebase/firestore";

export function toDate(value: Date | Timestamp | string | number | undefined | null) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "object" && "toDate" in value) {
    return value.toDate();
  }

  return new Date(value);
}

export function formatShortDate(value: Date | Timestamp | string | number | undefined | null) {
  const date = toDate(value);
  return date ? new Intl.DateTimeFormat("en-ZA", { day: "2-digit", month: "short", year: "numeric" }).format(date) : "Not set";
}
