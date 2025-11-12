export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'PARTIALLY_PAID';

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  address?: Address;
  contactName?: string;
  notes?: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  client: Client;
  lineItems: InvoiceLineItem[];
  status: InvoiceStatus;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  total: number;
  amountPaid: number;
}