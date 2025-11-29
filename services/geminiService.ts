
import { GoogleGenAI, Type } from '@google/genai';
import { type Invoice, type Client, type InvoiceLineItem, type Address, type Item, type PaymentRecord, type Expense } from '../types';

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
    phone: '+1 555-0101',
    address: mockAddresses[0],
    contactName: 'Jane Doe',
    notes: 'Primary contact for all billing inquiries. Prefers communication via email.'
  },
  { 
    id: 'client-2', 
    name: 'Solutions Co.', 
    email: 'billing@solutions.co', 
    phone: '+1 555-0102',
    address: mockAddresses[1],
    contactName: 'John Smith',
    notes: 'Met at the 2024 Tech Conference. Interested in our new enterprise package.'
  },
  { 
    id: 'client-3', 
    name: 'Alpha Tech', 
    email: 'accounts@alphatech.io', 
    phone: '+1 555-0103',
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
];

const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

export const generateInvoiceStyle = async (prompt: string, includeBackground: boolean): Promise<{css: string}> => {
    const model = 'gemini-2.5-flash';

    const fullPrompt = `
You are an expert CSS designer. Generate CSS code for a modern invoice template based on the following user request.
The CSS should only target classes within the '.invoice-preview' parent class.
Do not include any selectors outside of '.invoice-preview'.
The generated CSS should be clean, modern, and readable.
Only output the raw CSS code, without any explanation, comments, or markdown formatting like \`\`\`css ... \`\`\`.

User request: "${prompt}"

${includeBackground ? "Include a subtle, professional background for the invoice body." : "Do not add any background images or complex background gradients to the main invoice body."}
`;
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: fullPrompt,
        });

        const css = response.text.trim();
        
        if (css && css.includes('{') && css.includes('}')) {
             return { css };
        } else {
            console.error("Gemini did not return valid CSS:", css);
            return { css: '' };
        }

    } catch (error) {
        console.error("Error generating invoice style with Gemini:", error);
        throw new Error("Failed to generate CSS from Gemini.");
    }
}

export const analyzeReceipt = async (base64Image: string): Promise<Partial<Expense>> => {
    const model = 'gemini-2.5-flash';

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: base64Image
                        }
                    },
                    {
                        text: `You are an expert OCR and receipt analysis AI. Analyze this receipt image and extract the data into JSON.
                        
                        CRITICAL EXTRACTION RULES:
                        1. **Merchant**: Identify the main store or merchant name clearly.
                        2. **Date**: Extract the date (YYYY-MM-DD). If year is missing, assume 2024/2025.
                        3. **Amount**: Find the GRAND TOTAL.
                        4. **Taxes**: 
                           - Look for ALL individual tax lines (e.g., "Tax", "VAT", "GST", "HST", "City Tax").
                           - Extract each tax name and its specific amount.
                           - Also calculate the 'tax' field as the SUM of these amounts.
                        5. **Category**: Choose from: Meals, Transport, Supplies, Utilities, Software, Rent, Other.
                        6. **Description**: Short summary of items.
                        
                        Return JSON.`
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        merchant: { type: Type.STRING },
                        date: { type: Type.STRING },
                        amount: { type: Type.NUMBER },
                        tax: { type: Type.NUMBER, description: "Sum of all tax amounts" },
                        taxDetails: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    amount: { type: Type.NUMBER }
                                }
                            }
                        },
                        category: { type: Type.STRING },
                        description: { type: Type.STRING },
                    },
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from Gemini");
        
        return JSON.parse(text) as Partial<Expense>;
    } catch (error) {
        console.error("Error analyzing receipt with Gemini:", error);
        throw new Error("Failed to analyze receipt.");
    }
}
