import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRand(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function daysBetween(from: string, to = new Date()) {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  return Math.floor((end.getTime() - start.getTime()) / 86_400_000);
}

export function margin(sellingPrice: number, purchasePrice: number) {
  if (!purchasePrice) return 0;
  return ((sellingPrice - purchasePrice) / purchasePrice) * 100;
}

export function vehicleLabel(vehicle: {
  year: number;
  make: string;
  model: string;
  variant: string;
}) {
  return `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.variant}`.trim();
}
