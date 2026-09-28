export const FUELS = ["Petrol", "Diesel", "Hybrid", "Electric"] as const;
export const TRANSMISSIONS = ["Manual", "Automatic"] as const;
export const OPEN_VEHICLE_STATUSES = ["Available", "Reserved"] as const;
export const LEAD_SOURCES = [
  "AutoTrader",
  "Cars.co.za",
  "WhatsApp",
  "Facebook",
  "Website",
  "Walk-in",
  "Google",
] as const;
export const WORKING_LEAD_STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Test Drive",
  "Negotiation",
  "Finance",
  "Lost",
] as const;

export function isOneOf<T extends string>(value: string, allowed: readonly T[]): value is T {
  return (allowed as readonly string[]).includes(value);
}
