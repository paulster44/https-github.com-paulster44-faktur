import React from 'react';
import { type Invoice, type InvoiceStatus } from '../types';
import { PlusIcon, ClockIcon, CheckCircleIcon } from './icons';
import { type View } from '../App';

interface HomePageProps {
  invoices: Invoice[];
  onNavigate: (view: View) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const StatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
    const statusStyles: { [key in InvoiceStatus]: string } = {
      DRAFT: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
      SENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      PAID: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
            {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
        </span>
    );
};


const HomePage: React.FC<HomePageProps> = ({ invoices, onNavigate }) => {
    const outstanding = invoices
        .filter(inv => ['SENT', 'OVERDUE', 'PARTIALLY_PAID'].includes(inv.status))
        .reduce((sum, inv) => sum + (inv.total - inv.amountPaid), 0);
    
    const overdue = invoices
        .filter(inv => inv.status === 'OVERDUE')
        .reduce((sum, inv) => sum + (inv.total - inv.amountPaid), 0);

    const inDraft = invoices.filter(inv => inv.status === 'DRAFT').length;

    const recentInvoices = [...invoices].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()).slice(0, 5);
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Outstanding</h3>
                    <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">{formatCurrency(outstanding)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Overdue</h3>
                    <p className={`mt-1 text-3xl font-semibold ${overdue > 0 ? 'text-red-600 dark:text-red-500' : 'text-slate-900 dark:text-white'}`}>{formatCurrency(overdue)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">In Draft</h3>
                    <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">{inDraft}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Ready to get paid?</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Create and send a professional invoice in minutes.</p>
                </div>
                <button
                    onClick={() => onNavigate('create-invoice')}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5"/>
                    Create Invoice
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
                <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
                    <button onClick={() => onNavigate('invoices')} className="text-sm font-medium text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300">View All</button>
                </div>
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                    {recentInvoices.map(invoice => (
                        <li key={invoice.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <div className="flex items-center">
                                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                                    invoice.status === 'PAID' ? 'bg-green-100 dark:bg-green-900' : 
                                    invoice.status === 'OVERDUE' ? 'bg-red-100 dark:bg-red-900' : 'bg-slate-100 dark:bg-slate-700'
                                }`}>
                                    {invoice.status === 'PAID' ? <CheckCircleIcon className="h-6 w-6 text-green-500" /> : <ClockIcon className="h-6 w-6 text-slate-500"/>}
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{invoice.client.name}</div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">#{invoice.invoiceNumber} &bull; Due {invoice.dueDate}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(invoice.total)}</p>
                                <StatusBadge status={invoice.status} />
                            </div>
                        </li>
                    ))}
                     {recentInvoices.length === 0 && (
                        <li className="p-8 text-center text-sm text-slate-500">No recent invoices to display.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default HomePage;