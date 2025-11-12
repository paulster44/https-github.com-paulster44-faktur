import { type Invoice, type Client, type LineItem, type Address } from '../types';

const mockAddresses: Address[] = [
    { street: '123 Innovation Dr', city: 'Techville', state: 'CA', postalCode: '94043', country: 'USA' },
    { street: '456 Solutions Ave', city: 'Metropolis', state: 'NY', postalCode: '10001', country: 'USA' },
    { street: '789 Alpha Blvd', city: 'Future City', state: 'TX', postalCode: '75001', country: 'USA' },
];


export const mockClients: Client[] = [
  { id: 'client-1', name: 'Innovate LLC', email: 'contact@innovate.com', address: mockAddresses[0] },
  { id: 'client-2', name: 'Solutions Co.', email: 'billing@solutions.co', address: mockAddresses[1] },
  { id: 'client-3', name: 'Alpha Tech', email: 'accounts@alphatech.io', address: mockAddresses[2] },
];

const createLineItems = (count: number): LineItem[] => {
    return Array.from({length: count}, (_, i) => ({
        id: `li-${Math.random()}`,
        description: `Service Item ${i + 1}`,
        quantity: Math.floor(Math.random() * 5) + 1,
        unitPrice: Math.floor(Math.random() * 200) + 50,
    }));
}

const calculateTotal = (items: LineItem[]): number => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

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
  },
  {
    id: 'inv-005',
    invoiceNumber: '2024-005',
    client: mockClients[1],
    lineItems: createLineItems(2),
    status: 'SENT',
    issueDate: '2024-07-25',
    dueDate: '2024-08-24',
    total: 620.75,
    amountPaid: 0,
  },
];

// Dynamically set totals for mock data
mockInvoices.forEach(inv => {
    inv.total = calculateTotal(inv.lineItems);
    if (inv.status === 'PAID') {
        inv.amountPaid = inv.total;
    }
});