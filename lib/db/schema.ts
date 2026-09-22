import { boolean, date, integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";

export const fuelEnum = pgEnum("fuel", ["Petrol", "Diesel", "Hybrid", "Electric"]);
export const transmissionEnum = pgEnum("transmission", ["Manual", "Automatic"]);
export const vehicleStatusEnum = pgEnum("vehicle_status", ["Available", "Reserved", "Sold"]);
export const leadSourceEnum = pgEnum("lead_source", [
  "AutoTrader",
  "Cars.co.za",
  "WhatsApp",
  "Facebook",
  "Website",
  "Walk-in",
  "Google",
]);
export const leadStatusEnum = pgEnum("lead_status", [
  "New",
  "Contacted",
  "Qualified",
  "Test Drive",
  "Negotiation",
  "Finance",
  "Sold",
  "Lost",
]);

export const salespeople = pgTable("salespeople", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
});

export const vehicles = pgTable("vehicles", {
  id: text("id").primaryKey(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  variant: text("variant").notNull(),
  year: integer("year").notNull(),
  mileage: integer("mileage").notNull(),
  fuel: fuelEnum("fuel").notNull(),
  transmission: transmissionEnum("transmission").notNull(),
  purchasePrice: integer("purchase_price").notNull(),
  sellingPrice: integer("selling_price").notNull(),
  dateAcquired: date("date_acquired", { mode: "string" }).notNull(),
  salesperson: text("salesperson").notNull(),
  status: vehicleStatusEnum("status").notNull(),
});

export const leads = pgTable("leads", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  vehicleId: text("vehicle_id").notNull(),
  budget: integer("budget").notNull(),
  financeRequired: boolean("finance_required").notNull(),
  tradeIn: boolean("trade_in").notNull(),
  source: leadSourceEnum("source").notNull(),
  salesperson: text("salesperson").notNull(),
  lastContactDate: date("last_contact_date", { mode: "string" }).notNull(),
  nextFollowUp: date("next_follow_up", { mode: "string" }).notNull(),
  status: leadStatusEnum("status").notNull(),
  testDrive: boolean("test_drive").notNull(),
  outcome: text("outcome"),
});

export const sales = pgTable("sales", {
  id: text("id").primaryKey(),
  vehicleId: text("vehicle_id").notNull(),
  vehicleName: text("vehicle_name").notNull(),
  sellingPrice: integer("selling_price").notNull(),
  purchasePrice: integer("purchase_price").notNull(),
  dateSold: date("date_sold", { mode: "string" }).notNull(),
  salesperson: text("salesperson").notNull(),
  customer: text("customer").notNull(),
});
