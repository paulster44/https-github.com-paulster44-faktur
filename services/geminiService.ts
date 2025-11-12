import { GoogleGenAI, Type } from "@google/genai";
import { type Invoice, type Client, type InvoiceLineItem, type Address, type Item, type PaymentRecord } from '../types';

const mockAddresses: Address[] = [
    { street: '123 Innovation Dr', city: 'Techville', state: 'CA', postalCode: '94043', country: 'USA' },
    { street: '456 Solutions Ave', city: 'Metropolis', state: 'NY', postalCode: '10001', country: 'USA' },
    { street: '789 Alpha Blvd', city: 'Future City', state: 'TX', postalCode: '75001', country: 'USA' },
];


export const mockClients: Client[] = [
  { 
    id: 'client-1', 
    name: 'Innovate LLC', 
    email: 'contact@innovate.com', 
    address: mockAddresses[0],
    contactName: 'Jane Doe',
    notes: 'Primary contact for all billing inquiries. Prefers communication via email.'
  },
  { 
    id: 'client-2', 
    name: 'Solutions Co.', 
    email: 'billing@solutions.co', 
    address: mockAddresses[1],
    contactName: 'John Smith',
    notes: 'Met at the 2024 Tech Conference. Interested in our new enterprise package.'
  },
  { 
    id: 'client-3', 
    name: 'Alpha Tech', 
    email: 'accounts@alphatech.io', 
    address: mockAddresses[2],
    contactName: 'Alex Ray',
    notes: 'Long-term client, always pays on time.'
  },
];

export const mockItems: Item[] = [
    { id: 'item-1', name: 'Web Design', description: 'Responsive website design and development.', unitPrice: 2500 },
    { id: 'item-2', name: 'Consulting', description: 'Strategic business consulting services.', unitPrice: 150 },
    { id: 'item-3', name: 'SEO Package', description: 'Monthly SEO optimization and reporting.', unitPrice: 800 },
    { id: 'item-4', name: 'Content Writing', description: 'Per 1000 words of content.', unitPrice: 200 },
];

const createLineItems = (count: number): InvoiceLineItem[] => {
    return Array.from({length: count}, (_, i) => ({
        id: `li-${Math.random()}`,
        description: `Service Item ${i + 1}`,
        quantity: Math.floor(Math.random() * 5) + 1,
        unitPrice: Math.floor(Math.random() * 200) + 50,
    }));
}

const calculateTotal = (items: InvoiceLineItem[]): number => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: '2024-001',
    client: mockClients[0],
    lineItems: createLineItems(2),
    status: 'PAID',
    issueDate: '2024-07-15',
    dueDate: '2024-08-14',
    total: 450.00,
    amountPaid: 450.00,
    paymentRecords: [{ date: '2024-07-20', amount: 450.00, method: 'Credit Card' }],
  },
  {
    id: 'inv-002',
    invoiceNumber: '2024-002',
    client: mockClients[1],
    lineItems: createLineItems(1),
    status: 'SENT',
    issueDate: '2024-07-20',
    dueDate: '2024-08-19',
    total: 1200.50,
    amountPaid: 0,
    paymentRecords: [],
  },
  {
    id: 'inv-003',
    invoiceNumber: '2024-003',
    client: mockClients[2],
    lineItems: createLineItems(3),
    status: 'OVERDUE',
    issueDate: '2024-06-10',
    dueDate: '2024-07-10',
    total: 230.00,
    amountPaid: 0,
    paymentRecords: [],
  },
  {
    id: 'inv-004',
    invoiceNumber: '2024-004',
    client: mockClients[0],
    lineItems: createLineItems(1),
    status: 'DRAFT',
    issueDate: '2024-07-28',
    dueDate: '2024-08-27',
    total: 800.00,
    amountPaid: 0,
    paymentRecords: [],
  },
  {
    id: 'inv-005',
    invoiceNumber: '2024-005',
    client: mockClients[1],
    lineItems: createLineItems(2),
    status: 'PARTIALLY_PAID',
    issueDate: '2024-07-25',
    dueDate: '2024-08-24',
    total: 620.75,
    amountPaid: 300,
    paymentRecords: [{ date: '2024-07-30', amount: 300, method: 'Bank Transfer' }],
  },
];

// Dynamically set totals for mock data
mockInvoices.forEach(inv => {
    inv.total = calculateTotal(inv.lineItems);
    if (inv.status === 'PAID') {
        inv.amountPaid = inv.total;
    } else if (inv.status === 'PARTIALLY_PAID') {
        // do nothing
    } else {
       inv.amountPaid = 0;
       inv.paymentRecords = [];
    }
});


// --- AI Service ---
let ai: GoogleGenAI | null = null;

async function getAi() {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }
  return ai;
}

export async function generateInvoiceStyle(prompt: string, includeBackground: boolean): Promise<{css: string} | null> {
    const ai = await getAi();
    const model = 'gemini-2.5-flash';

    let finalPrompt = prompt;
    if (includeBackground) {
        finalPrompt += " Please also include a subtle, professional background for the invoice body.";
    }

    const systemInstruction = `You are an expert CSS designer. Your task is to generate a complete, responsive CSS stylesheet for an invoice based on the user's prompt. The CSS must look great on both desktop and mobile devices. You MUST return only a JSON object with a single key "css" containing the full CSS code as a string.

    Target this HTML structure. It uses a mobile-first responsive layout. Your CSS should be pure CSS, using media queries for responsiveness.
    
    <div class="invoice-preview">
        <!-- The header stacks vertically on mobile and becomes a row on medium screens -->
        <header class="invoice-header">
            <!-- This div contains the company logo (if any) and the word "INVOICE" -->
            <div>
                <img src="..." alt="Company Logo" class="company-logo" />
                <h1>Invoice</h1>
                <p>#INV-1001</p>
            </div>
            <!-- This div contains the company's name, address, and tax info -->
            <div class="company-details">
                <h2>Your Company Inc.</h2>
                <p>123 Business Rd.</p>
                <div class="tax-details">
                    <p>GST/HST Number: 12345</p>
                </div>
            </div>
        </header>

        <!-- This section also stacks on mobile -->
        <section class="client-details">
            <!-- Bill To info -->
            <div>...</div>
            <!-- Dates info -->
            <div>...</div>
        </section>

        <table class="invoice-items">...</table>

        <footer class="invoice-footer">
            <!-- Totals section -->
            <div>...</div>
        </footer>
    </div>
    
    IMPORTANT:
    1.  Your CSS must be responsive. Use @media (min-width: 768px) { ... } for desktop styles, and mobile-first styles outside of it.
    2.  Style all elements for a cohesive design: .company-logo, h1, h2, tables (th, tr, td), and footers.
    3.  The .tax-details class contains the company's business tax number.
    4.  If the user requests a background, apply it to the .invoice-preview class.
    5.  Do not include any markdown formatting like \`\`\`css in your response.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: finalPrompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        css: {
                            type: Type.STRING,
                            description: 'The complete CSS stylesheet for the invoice.',
                        },
                    },
                    required: ['css'],
                },
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating invoice style:", error);
        return null;
    }
}