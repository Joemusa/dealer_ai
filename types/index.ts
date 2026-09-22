export interface Vehicle {
  id: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  mileage: number;
  fuel: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  transmission: 'Manual' | 'Automatic';
  purchasePrice: number;
  sellingPrice: number;
  dateAcquired: string;
  salesperson: string;
  status: 'Available' | 'Reserved' | 'Sold';
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  vehicleId: string;
  budget: number;
  financeRequired: boolean;
  tradeIn: boolean;
  source: 'AutoTrader' | 'Cars.co.za' | 'WhatsApp' | 'Facebook' | 'Website' | 'Walk-in' | 'Google';
  salesperson: string;
  lastContactDate: string;
  nextFollowUp: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Test Drive' | 'Negotiation' | 'Finance' | 'Sold' | 'Lost';
  testDrive: boolean;
  outcome?: string;
}

export interface Sale {
  id: string;
  vehicleId: string;
  vehicleName: string;
  sellingPrice: number;
  purchasePrice: number;
  dateSold: string;
  salesperson: string;
  customer: string;
}

export interface Salesperson {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface Opportunity {
  id: string;
  priorityLevel: 'HIGH' | 'MEDIUM' | 'MONITOR';
  priorityScore: number;
  badgeText: string;
  badgeColor: string;
  title: string;
  affectedCount: number;
  affectedLabel: string;
  targetTab: 'stock' | 'leads' | 'assistant';
  filterPayload: Record<string, string>;
  records: any[];
  whyItMatters: string;
  evidence: string[];
  recommendedAction: string;
  potentialImpact: string;
}
