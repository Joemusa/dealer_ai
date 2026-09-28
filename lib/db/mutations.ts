"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { ensureSchema } from "@/lib/db/ensure-schema";
import { leads, sales, salespeople, vehicles } from "@/lib/db/schema";
import {
  FUELS,
  isOneOf,
  LEAD_SOURCES,
  OPEN_VEHICLE_STATUSES,
  TRANSMISSIONS,
  WORKING_LEAD_STATUSES,
} from "@/lib/options";
import { vehicleLabel } from "@/lib/utils";

export type FormState = { error?: string };

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function fail(error: string): FormState {
  return { error };
}

type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

function money(formData: FormData, key: string, label: string): Parsed<number> {
  const raw = text(formData, key).replace(/[R\s,]/g, "");
  if (!raw) return { ok: false, error: `${label} is required.` };
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    return { ok: false, error: `${label} must be a whole rand amount.` };
  }
  return { ok: true, value };
}

function whole(formData: FormData, key: string, label: string): Parsed<number> {
  const raw = text(formData, key).replace(/[\s,]/g, "");
  if (!raw) return { ok: false, error: `${label} is required.` };
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) return { ok: false, error: `${label} must be a whole number.` };
  return { ok: true, value };
}

function dateField(formData: FormData, key: string, label: string): Parsed<string> {
  const value = text(formData, key);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return { ok: false, error: `${label} is required.` };
  return { ok: true, value };
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function dbError(error: unknown) {
  if (error instanceof Error && error.message.includes("DATABASE_URL")) {
    return "Database is not connected. Add DATABASE_URL before saving.";
  }
  return error instanceof Error ? error.message : "Could not save.";
}

function nextId(ids: string[], prefix: string) {
  const numbers = ids.map((id) => {
    const match = new RegExp(`^${prefix}-(\\d+)$`).exec(id);
    return match ? Number(match[1]) : 0;
  });
  return `${prefix}-${Math.max(0, ...numbers) + 1}`;
}

async function ready() {
  await ensureSchema();
  return getDb();
}

async function releaseReserved(
  db: Awaited<ReturnType<typeof ready>>,
  vehicleId: string,
  leadId: string
) {
  const [candidate] = await db.select().from(vehicles).where(eq(vehicles.id, vehicleId)).limit(1);
  if (!candidate || candidate.status !== "Reserved") return;
  const others = await db
    .select({ id: leads.id, status: leads.status })
    .from(leads)
    .where(eq(leads.vehicleId, vehicleId));
  const stillFinancing = others.some((row) => row.id !== leadId && row.status === "Finance");
  if (!stillFinancing) {
    await db.update(vehicles).set({ status: "Available" }).where(eq(vehicles.id, vehicleId));
  }
}

function finish(path: string): never {
  revalidatePath("/");
  revalidatePath("/staff");
  revalidatePath("/stock/new");
  revalidatePath("/leads/new");
  revalidatePath("/sales/new");
  redirect(path);
}

async function knownSalesperson(name: string) {
  const db = getDb();
  const rows = await db.select({ name: salespeople.name }).from(salespeople);
  return rows.some((row) => row.name === name);
}

export async function createVehicle(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = readVehicle(formData, true);
  if ("error" in parsed && parsed.error) return parsed;
  if (!("vehicle" in parsed)) return fail("Could not read the vehicle.");

  try {
    const db = await ready();
    if (!(await knownSalesperson(parsed.vehicle.salesperson))) {
      return fail("Choose a salesperson from the staff list.");
    }
    const existing = await db.select({ id: vehicles.id }).from(vehicles);
    await db.insert(vehicles).values({
      ...parsed.vehicle,
      id: nextId(existing.map((row) => row.id), "V"),
    });
  } catch (error) {
    return fail(dbError(error));
  }

  finish("/?tab=stock");
}

export async function updateVehicle(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = text(formData, "id");
  if (!id) return fail("Vehicle is missing.");
  const parsed = readVehicle(formData, false);
  if ("error" in parsed && parsed.error) return parsed;
  if (!("vehicle" in parsed)) return fail("Could not read the vehicle.");

  try {
    const db = await ready();
    const [current] = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
    if (!current) return fail("That vehicle is no longer on the floor.");
    if (!(await knownSalesperson(parsed.vehicle.salesperson))) {
      return fail("Choose a salesperson from the staff list.");
    }
    if (current.status === "Sold" && parsed.vehicle.status !== "Sold") {
      return fail("A sold vehicle stays sold. The sale record keeps the deal.");
    }
    if (parsed.vehicle.status === "Sold" && current.status !== "Sold") {
      return fail("Record a completed deal from the sale page.");
    }
    await db
      .update(vehicles)
      .set({
        ...parsed.vehicle,
        status: current.status === "Sold" ? "Sold" : parsed.vehicle.status,
      })
      .where(eq(vehicles.id, id));
  } catch (error) {
    return fail(dbError(error));
  }

  finish("/?tab=stock");
}

export async function createLead(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = readLead(formData, false);
  if ("error" in parsed && parsed.error) return parsed;
  if (!("lead" in parsed)) return fail("Could not read the lead.");

  try {
    const db = await ready();
    if (!(await knownSalesperson(parsed.lead.salesperson))) {
      return fail("Choose a salesperson from the staff list.");
    }
    const [vehicle] = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.id, parsed.lead.vehicleId))
      .limit(1);
    if (!vehicle) return fail("Choose a vehicle that is in stock.");
    if (vehicle.status === "Sold") return fail("That vehicle is already sold.");
    const existing = await db.select({ id: leads.id }).from(leads);
    await db.insert(leads).values({
      ...parsed.lead,
      id: nextId(existing.map((row) => row.id), "L"),
      status: "New",
      lastContactDate: parsed.lead.date,
      outcome: null,
    });
  } catch (error) {
    return fail(dbError(error));
  }

  finish("/?tab=leads");
}

export async function updateLead(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = text(formData, "id");
  if (!id) return fail("Lead is missing.");
  const parsed = readLead(formData, true);
  if ("error" in parsed && parsed.error) return parsed;
  if (!("lead" in parsed)) return fail("Could not read the lead.");

  try {
    const db = await ready();
    const [current] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
    if (!current) return fail("That lead is no longer on the book.");
    if (current.status === "Sold") return fail("This lead was closed by a sale.");
    if (!(await knownSalesperson(parsed.lead.salesperson))) {
      return fail("Choose a salesperson from the staff list.");
    }
    const [vehicle] = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.id, parsed.lead.vehicleId))
      .limit(1);
    if (!vehicle) return fail("Choose a vehicle that is in stock.");
    if (vehicle.status === "Sold" && parsed.lead.status !== "Lost") {
      return fail("That vehicle is already sold.");
    }
    if (parsed.lead.status === "Lost" && !parsed.lead.outcome) {
      return fail("Add an outcome for a lost lead.");
    }

    await db
      .update(leads)
      .set({
        name: parsed.lead.name,
        phone: parsed.lead.phone,
        email: parsed.lead.email,
        date: parsed.lead.date,
        vehicleId: parsed.lead.vehicleId,
        budget: parsed.lead.budget,
        financeRequired: parsed.lead.financeRequired,
        tradeIn: parsed.lead.tradeIn,
        source: parsed.lead.source,
        salesperson: parsed.lead.salesperson,
        lastContactDate: parsed.lead.lastContactDate,
        nextFollowUp: parsed.lead.nextFollowUp,
        status: parsed.lead.status,
        testDrive: parsed.lead.testDrive,
        outcome: parsed.lead.outcome,
      })
      .where(eq(leads.id, id));

    if (parsed.lead.status === "Finance" && vehicle.status === "Available") {
      await db.update(vehicles).set({ status: "Reserved" }).where(eq(vehicles.id, vehicle.id));
    }
    if (parsed.lead.status === "Lost") {
      await releaseReserved(db, vehicle.id, id);
      if (current.vehicleId !== vehicle.id) await releaseReserved(db, current.vehicleId, id);
    } else if (current.vehicleId !== vehicle.id) {
      await releaseReserved(db, current.vehicleId, id);
    }
  } catch (error) {
    return fail(dbError(error));
  }

  finish("/?tab=leads");
}

export async function recordSale(_prev: FormState, formData: FormData): Promise<FormState> {
  const vehicleId = text(formData, "vehicleId");
  const customer = text(formData, "customer");
  const salesperson = text(formData, "salesperson");
  const leadId = text(formData, "leadId");
  const outcome = text(formData, "outcome") || "Delivered";
  const selling = money(formData, "sellingPrice", "Selling price");
  const purchase = money(formData, "purchasePrice", "Purchase price");
  const dateSold = dateField(formData, "dateSold", "Date sold");

  if (!vehicleId) return fail("Choose the vehicle that was sold.");
  if (!customer) return fail("Customer name is required.");
  if (!salesperson) return fail("Choose who recorded the sale.");
  if (!selling.ok) return fail(selling.error);
  if (!purchase.ok) return fail(purchase.error);
  if (!dateSold.ok) return fail(dateSold.error);

  try {
    const db = await ready();
    if (!(await knownSalesperson(salesperson))) {
      return fail("Choose a salesperson from the staff list.");
    }
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, vehicleId)).limit(1);
    if (!vehicle) return fail("That vehicle is no longer on the floor.");
    if (vehicle.status === "Sold") return fail("This vehicle is already sold.");

    const [existingSale] = await db
      .select({ id: sales.id })
      .from(sales)
      .where(eq(sales.vehicleId, vehicle.id))
      .limit(1);
    if (existingSale) return fail("This vehicle already has a sale record.");

    let leadToClose: string | null = null;
    if (leadId) {
      const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
      if (!lead) return fail("That lead is no longer on the book.");
      if (lead.status === "Sold" || lead.status === "Lost") {
        return fail("That lead is already closed.");
      }
      leadToClose = lead.id;
    }

    const existing = await db.select({ id: sales.id }).from(sales);
    await db.insert(sales).values({
      id: nextId(existing.map((row) => row.id), "S"),
      vehicleId: vehicle.id,
      vehicleName: vehicleLabel(vehicle),
      sellingPrice: selling.value,
      purchasePrice: purchase.value,
      dateSold: dateSold.value,
      salesperson,
      customer,
    });
    await db.update(vehicles).set({ status: "Sold" }).where(eq(vehicles.id, vehicle.id));
    if (leadToClose) {
      await db
        .update(leads)
        .set({
          status: "Sold",
          outcome,
          lastContactDate: dateSold.value,
          salesperson,
          vehicleId: vehicle.id,
        })
        .where(eq(leads.id, leadToClose));
    }
  } catch (error) {
    return fail(dbError(error));
  }

  finish("/?tab=sales");
}

export async function createSalesperson(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = text(formData, "name");
  const phone = text(formData, "phone");
  const email = text(formData, "email");
  if (!name) return fail("Name is required.");
  if (!phone) return fail("Phone is required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Email is not valid.");

  try {
    const db = await ready();
    const existing = await db.select().from(salespeople);
    if (existing.some((person) => person.name.toLowerCase() === name.toLowerCase())) {
      return fail("That salesperson is already on the staff list.");
    }
    await db.insert(salespeople).values({
      id: nextId(existing.map((person) => person.id), "sp"),
      name,
      phone,
      email,
    });
  } catch (error) {
    return fail(dbError(error));
  }

  finish("/staff");
}

function readVehicle(formData: FormData, editing: boolean) {
  const make = text(formData, "make");
  const model = text(formData, "model");
  const variant = text(formData, "variant");
  const fuel = text(formData, "fuel");
  const transmission = text(formData, "transmission");
  const salesperson = text(formData, "salesperson");
  const status = text(formData, "status") || "Available";
  const year = whole(formData, "year", "Year");
  const mileage = whole(formData, "mileage", "Mileage");
  const purchasePrice = money(formData, "purchasePrice", "Purchase price");
  const sellingPrice = money(formData, "sellingPrice", "Asking price");
  const dateAcquired = dateField(formData, "dateAcquired", "Date acquired");

  if (!make) return fail("Make is required.");
  if (!model) return fail("Model is required.");
  if (!variant) return fail("Variant is required.");
  if (!isOneOf(fuel, FUELS)) return fail("Fuel is not valid.");
  if (!isOneOf(transmission, TRANSMISSIONS)) return fail("Transmission is not valid.");
  if (!salesperson) return fail("Choose a salesperson.");
  if (!isOneOf(status, OPEN_VEHICLE_STATUSES) && !(editing && status === "Sold")) {
    return fail("Record a completed deal from the sale page.");
  }
  if (!year.ok) return fail(year.error);
  if (year.value < 1970 || year.value > new Date().getFullYear() + 1) return fail("Year is not valid.");
  if (!mileage.ok) return fail(mileage.error);
  if (!purchasePrice.ok) return fail(purchasePrice.error);
  if (!sellingPrice.ok) return fail(sellingPrice.error);
  if (!dateAcquired.ok) return fail(dateAcquired.error);

  return {
    vehicle: {
      make,
      model,
      variant,
      year: year.value,
      mileage: mileage.value,
      fuel,
      transmission,
      purchasePrice: purchasePrice.value,
      sellingPrice: sellingPrice.value,
      dateAcquired: dateAcquired.value,
      salesperson,
      status: status as "Available" | "Reserved" | "Sold",
    },
  };
}

function readLead(formData: FormData, editing: boolean) {
  const name = text(formData, "name");
  const phone = text(formData, "phone");
  const email = text(formData, "email");
  const vehicleId = text(formData, "vehicleId");
  const source = text(formData, "source");
  const salesperson = text(formData, "salesperson");
  const status = editing ? text(formData, "status") : "New";
  const outcome = text(formData, "outcome");
  const budget = money(formData, "budget", "Budget");
  const date = dateField(formData, "date", "Enquiry date");
  const nextFollowUp = dateField(formData, "nextFollowUp", "Next follow-up");
  const lastContact = editing
    ? dateField(formData, "lastContactDate", "Last contact")
    : date;

  if (!name) return fail("Name is required.");
  if (!phone) return fail("Phone is required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Email is not valid.");
  if (!vehicleId) return fail("Choose the vehicle they asked about.");
  if (!isOneOf(source, LEAD_SOURCES)) return fail("Source is not valid.");
  if (!salesperson) return fail("Choose a salesperson.");
  if (!isOneOf(status, WORKING_LEAD_STATUSES)) {
    return fail("Mark the lead sold from the sale page.");
  }
  if (!budget.ok) return fail(budget.error);
  if (!date.ok) return fail(date.error);
  if (!nextFollowUp.ok) return fail(nextFollowUp.error);
  if (!lastContact.ok) return fail(lastContact.error);

  return {
    lead: {
      name,
      phone,
      email,
      date: date.value,
      vehicleId,
      budget: budget.value,
      financeRequired: checked(formData, "financeRequired"),
      tradeIn: checked(formData, "tradeIn"),
      source,
      salesperson,
      lastContactDate: lastContact.value,
      nextFollowUp: nextFollowUp.value,
      status,
      testDrive: checked(formData, "testDrive"),
      outcome: outcome || null,
    },
  };
}
