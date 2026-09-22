import { neon } from "@neondatabase/serverless";

export async function ensureSchema() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  const sql = neon(url);

  await sql`DO $$ BEGIN CREATE TYPE fuel AS ENUM ('Petrol', 'Diesel', 'Hybrid', 'Electric'); EXCEPTION WHEN duplicate_object THEN null; END $$;`;
  await sql`DO $$ BEGIN CREATE TYPE transmission AS ENUM ('Manual', 'Automatic'); EXCEPTION WHEN duplicate_object THEN null; END $$;`;
  await sql`DO $$ BEGIN CREATE TYPE vehicle_status AS ENUM ('Available', 'Reserved', 'Sold'); EXCEPTION WHEN duplicate_object THEN null; END $$;`;
  await sql`DO $$ BEGIN CREATE TYPE lead_source AS ENUM ('AutoTrader', 'Cars.co.za', 'WhatsApp', 'Facebook', 'Website', 'Walk-in', 'Google'); EXCEPTION WHEN duplicate_object THEN null; END $$;`;
  await sql`DO $$ BEGIN CREATE TYPE lead_status AS ENUM ('New', 'Contacted', 'Qualified', 'Test Drive', 'Negotiation', 'Finance', 'Sold', 'Lost'); EXCEPTION WHEN duplicate_object THEN null; END $$;`;

  await sql`
    CREATE TABLE IF NOT EXISTS salespeople (
      id text PRIMARY KEY,
      name text NOT NULL,
      phone text NOT NULL,
      email text NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS vehicles (
      id text PRIMARY KEY,
      make text NOT NULL,
      model text NOT NULL,
      variant text NOT NULL,
      year integer NOT NULL,
      mileage integer NOT NULL,
      fuel fuel NOT NULL,
      transmission transmission NOT NULL,
      purchase_price integer NOT NULL,
      selling_price integer NOT NULL,
      date_acquired date NOT NULL,
      salesperson text NOT NULL,
      status vehicle_status NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id text PRIMARY KEY,
      name text NOT NULL,
      phone text NOT NULL,
      email text NOT NULL,
      date date NOT NULL,
      vehicle_id text NOT NULL,
      budget integer NOT NULL,
      finance_required boolean NOT NULL,
      trade_in boolean NOT NULL,
      source lead_source NOT NULL,
      salesperson text NOT NULL,
      last_contact_date date NOT NULL,
      next_follow_up date NOT NULL,
      status lead_status NOT NULL,
      test_drive boolean NOT NULL,
      outcome text
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS sales (
      id text PRIMARY KEY,
      vehicle_id text NOT NULL,
      vehicle_name text NOT NULL,
      selling_price integer NOT NULL,
      purchase_price integer NOT NULL,
      date_sold date NOT NULL,
      salesperson text NOT NULL,
      customer text NOT NULL
    )
  `;
}
