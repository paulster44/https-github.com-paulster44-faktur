import React, { useState } from 'react';
import { type Invoice, type InvoiceStatus, type CompanyProfile } from '../types';
import { PlusIcon } from './icons';
import { type View } from '../App';
import InvoiceDesignStudio from './InvoiceDesignStudio';
import InvoiceDetailsModal from './InvoiceDetailsModal';

interface InvoicesPageProps {
    invoices: Invoice[];
    onNavigate: (view: View) => void;
    onUpdateInvoice: (invoiceId: string, updatedData: Partial<Invoice>) => void;
    companyProfile: CompanyProfile;
}

const formatCurrency = (amount: number | null) => {
    if (amount === null || isNaN(amount)) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
    } catch {
        return dateString;
    }
}

const StatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
    const statusStyles: { [key in InvoiceStatus]: string } = {
      DRAFT: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
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

const InvoiceList: React.FC<{ invoices: Invoice[]; onInvoiceSelect: (invoice: Invoice) => void; }> = ({ invoices, onInvoiceSelect }) => {
     return (
        <>
        {invoices.length === 0 ? (
            <div className="p-12 text-center">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">No invoices yet</h3>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Number</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Client</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Due Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {invoices.map(invoice => (
                            <tr key={invoice.id} onClick={() => onInvoiceSelect(invoice)} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-sky-600 dark:text-sky-400">#{invoice.invoiceNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{invoice.client.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{formatDate(invoice.dueDate)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={invoice.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">{formatCurrency(invoice.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
        </>
     );
}


const InvoicesPage: React.FC<InvoicesPageProps> = ({ invoices, onNavigate, onUpdateInvoice, companyProfile }) => {
    const [activeTab, setActiveTab] = useState('list');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    const handleCloseModal = () => setSelectedInvoice(null);

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                         <h2 className="text-xl font-bold">Invoices</h2>
                         <div className="border-l border-slate-300 dark:border-slate-600 h-6 mx-4"></div>
                         <nav className="flex space-x-1 rounded-md bg-slate-200 dark:bg-slate-900 p-1">
                            <button onClick={() => setActiveTab('list')} className={`px-3 py-1 text-sm font-medium rounded-md ${activeTab === 'list' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}>
                                All Invoices
                            </button>
                            <button onClick={() => setActiveTab('design')} className={`px-3 py-1 text-sm font-medium rounded-md ${activeTab === 'design' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}>
                                Design Studio
                            </button>
                        </nav>
                    </div>
                    <button 
                        onClick={() => onNavigate('create-invoice')}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5"/>
                        New Invoice
                    </button>
                </div>
                
                <div className={activeTab === 'list' ? "p-0" : "p-4 md:p-6"}>
                    {activeTab === 'list' && <InvoiceList invoices={invoices} onInvoiceSelect={setSelectedInvoice} />}
                    {activeTab === 'design' && <InvoiceDesignStudio companyProfile={companyProfile} />}
                </div>
            </div>
             {selectedInvoice && (
                <InvoiceDetailsModal 
                    invoice={selectedInvoice}
                    onClose={handleCloseModal}
                    onUpdateInvoice={onUpdateInvoice}
                    companyProfile={companyProfile}
                />
            )}
        </>
    );
};

export default InvoicesPage;