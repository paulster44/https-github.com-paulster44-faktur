import React, { useState } from 'react';
import { type Invoice, type InvoiceStatus, type CompanyProfile } from '../types';
import { PlusIcon, TrashIcon, CheckCircleIcon } from './icons';
import { type View } from '../App';
import InvoiceDesignStudio from './InvoiceDesignStudio';
import InvoiceDetailsModal from './InvoiceDetailsModal';
import ConfirmationModal from './ConfirmationModal';
import { useLanguage } from '../i18n/LanguageProvider';

interface InvoicesPageProps {
    invoices: Invoice[];
    onNavigate: (view: View) => void;
    onUpdateInvoice: (invoiceId: string, updatedData: Partial<Invoice>) => void;
    onDeleteInvoices: (invoiceIds: string[]) => void;
    onBulkMarkAsPaid: (invoiceIds: string[]) => void;
    onEditInvoice: (invoice: Invoice) => void;
    companyProfile: CompanyProfile;
}

const formatCurrency = (amount: number | null) => {
    if (amount === null || isNaN(amount)) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
    } catch {
        return dateString;
    }
}

const StatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
    const { t } = useLanguage();
    const statusStyles: { [key in InvoiceStatus]: string } = {
      DRAFT: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
      SENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      PAID: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
            {t(`status.${status.toLowerCase()}`)}
        </span>
    );
};

interface InvoiceListProps {
    invoices: Invoice[];
    onInvoiceSelect: (invoice: Invoice) => void;
    selectedInvoices: string[];
    onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectOne: (invoiceId: string) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, onInvoiceSelect, selectedInvoices, onSelectAll, onSelectOne }) => {
    const { t } = useLanguage();
    const isAllSelected = invoices.length > 0 && selectedInvoices.length === invoices.length;

     return (
        <>
        {invoices.length === 0 ? (
            <div className="p-12 text-center">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">{t('invoices.noInvoicesYet')}</h3>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                <input 
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                    checked={isAllSelected}
                                    ref={input => {
                                        if (input) input.indeterminate = selectedInvoices.length > 0 && !isAllSelected;
                                    }}
                                    onChange={onSelectAll}
                                />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('invoices.number')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('invoices.client')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('common.dueDate')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('invoices.status')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('common.total')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {invoices.map(invoice => (
                            <tr key={invoice.id} className={`${selectedInvoices.includes(invoice.id) ? 'bg-sky-50 dark:bg-sky-900/50' : ''} hover:bg-slate-50 dark:hover:bg-slate-700/50`}>
                                <td className="px-6 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                        checked={selectedInvoices.includes(invoice.id)}
                                        onChange={() => onSelectOne(invoice.id)}
                                    />
                                </td>
                                <td onClick={() => onInvoiceSelect(invoice)} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-sky-600 dark:text-sky-400 cursor-pointer">#{invoice.invoiceNumber}</td>
                                <td onClick={() => onInvoiceSelect(invoice)} className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white cursor-pointer">{invoice.client.name}</td>
                                <td onClick={() => onInvoiceSelect(invoice)} className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 cursor-pointer">{formatDate(invoice.dueDate)}</td>
                                <td onClick={() => onInvoiceSelect(invoice)} className="px-6 py-4 whitespace-nowrap text-sm cursor-pointer"><StatusBadge status={invoice.status} /></td>
                                <td onClick={() => onInvoiceSelect(invoice)} className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium cursor-pointer">{formatCurrency(invoice.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
        </>
     );
}


const InvoicesPage: React.FC<InvoicesPageProps> = ({ invoices, onNavigate, onUpdateInvoice, onDeleteInvoices, onBulkMarkAsPaid, onEditInvoice, companyProfile }) => {
    const [activeTab, setActiveTab] = useState('list');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const { t } = useLanguage();

    const handleSelectOne = (invoiceId: string) => {
        setSelectedInvoices(prev =>
            prev.includes(invoiceId)
                ? prev.filter(id => id !== invoiceId)
                : [...prev, invoiceId]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedInvoices(invoices.map(inv => inv.id));
        } else {
            setSelectedInvoices([]);
        }
    };

    const handleConfirmDelete = () => {
        onDeleteInvoices(selectedInvoices);
        setSelectedInvoices([]);
        setIsConfirmModalOpen(false);
    };

    const handleBulkPaid = () => {
        onBulkMarkAsPaid(selectedInvoices);
        setSelectedInvoices([]);
    };

    const handleCloseModal = () => setSelectedInvoice(null);

    const BulkActionsBar = () => (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-4 z-20 w-full max-w-fit animate-fade-in-down">
            <div className="flex items-center space-x-2 bg-white dark:bg-slate-700 shadow-lg rounded-full px-3 py-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 px-2">{t('invoices.selected', { count: selectedInvoices.length })}</span>
                <button onClick={handleBulkPaid} className="inline-flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-600 px-3 py-1.5 text-sm font-medium text-slate-800 dark:text-slate-100 shadow-sm hover:bg-slate-200 dark:hover:bg-slate-500">
                    <CheckCircleIcon className="mr-2 h-4 w-4 text-green-500" />
                    {t('invoices.markAsPaid')}
                </button>
                <button onClick={() => setIsConfirmModalOpen(true)} className="inline-flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-600 px-3 py-1.5 text-sm font-medium text-slate-800 dark:text-slate-100 shadow-sm hover:bg-slate-200 dark:hover:bg-slate-500">
                    <TrashIcon className="mr-2 h-4 w-4 text-red-500" />
                    {t('common.delete')}
                </button>
            </div>
        </div>
    );

    return (
        <>
            <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                {selectedInvoices.length > 0 && <BulkActionsBar />}
                <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                         <h2 className="text-xl font-bold">{t('header.invoices')}</h2>
                         <div className="border-l border-slate-300 dark:border-slate-600 h-6 mx-4"></div>
                         <nav className="flex space-x-1 rounded-md bg-slate-200 dark:bg-slate-900 p-1">
                            <button onClick={() => setActiveTab('list')} className={`px-3 py-1 text-sm font-medium rounded-md ${activeTab === 'list' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}>
                                {t('invoices.allInvoices')}
                            </button>
                            <button onClick={() => setActiveTab('design')} className={`px-3 py-1 text-sm font-medium rounded-md ${activeTab === 'design' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}>
                                {t('invoices.designStudio')}
                            </button>
                        </nav>
                    </div>
                    <button 
                        onClick={() => onNavigate('create-invoice')}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5"/>
                        {t('invoices.newInvoice')}
                    </button>
                </div>
                
                <div className={activeTab === 'list' ? "p-0" : "p-4 md:p-6"}>
                    {activeTab === 'list' && <InvoiceList invoices={invoices} onInvoiceSelect={setSelectedInvoice} selectedInvoices={selectedInvoices} onSelectAll={handleSelectAll} onSelectOne={handleSelectOne} />}
                    {activeTab === 'design' && <InvoiceDesignStudio companyProfile={companyProfile} />}
                </div>
            </div>
             {selectedInvoice && (
                <InvoiceDetailsModal 
                    invoice={selectedInvoice}
                    onClose={handleCloseModal}
                    onUpdateInvoice={onUpdateInvoice}
                    companyProfile={companyProfile}
                    onEdit={onEditInvoice}
                />
            )}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={t('invoices.deleteInvoicesTitle', { count: selectedInvoices.length })}
                message={t('invoices.deleteInvoicesMessage')}
            />
        </>
    );
};

export default InvoicesPage;