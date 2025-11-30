
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'PARTIALLY_PAID';
export type TemplateId = 'modern' | 'classic' | 'minimalist';

export interface Template {
    id: TemplateId;
    name: string;
    css: string;
}

declare global {
    interface Window {
        html2canvas: any;
        jspdf: any;
    }
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface TaxSetting {
    name: string;
    rate: number; // percentage, e.g., 5 for 5%
}

export interface CompanyProfile {
    name: string;
    address: Address;
    email: string;
    phone?: string;
    logo?: string; // base64 encoded image
    invoiceNumberPrefix: string;
    nextInvoiceNumber: number;
    taxType?: string; // Label for the Tax ID (e.g. "GST/QST Number")
    taxNumber?: string; // The ID itself
    defaultTaxes: TaxSetting[]; // Array of default tax rates
    template: TemplateId;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
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

export interface PaymentRecord {
    date: string; // YYYY-MM-DD
    amount: number;
    method?: 'Credit Card' | 'Bank Transfer' | 'Cash' | 'Other';
    note?: string;
}

export interface InvoiceTaxDetail {
    name: string;
    rate: number;
    amount: number;
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
  subtotal?: number;
  taxDetails: InvoiceTaxDetail[]; // Detailed breakdown saved with the invoice
  amountPaid: number;
  paymentRecords: PaymentRecord[];
}

export interface TaxDetail {
    name: string;
    amount: number;
}

export interface Expense {
    id: string;
    merchant: string;
    date: string; // YYYY-MM-DD
    amount: number;
    tax?: number; // Total Tax amount
    taxDetails?: TaxDetail[]; // Breakdown of taxes
    category: string;
    description?: string;
    receiptImage?: string; // base64
}
