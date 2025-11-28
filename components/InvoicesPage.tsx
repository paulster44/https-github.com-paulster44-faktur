
import React, { useState, useMemo } from 'react';
import { type Invoice, type InvoiceStatus, type CompanyProfile } from '../types';
import { PlusIcon, TrashIcon, CheckCircleIcon, ArrowDownTrayIcon, EyeIcon, PencilIcon, DocumentTextIcon } from './icons';
import { type View, type SendMode } from '../App';
import InvoiceDetailsModal from './InvoiceDetailsModal';
import ConfirmationModal from './ConfirmationModal';
import { useLanguage } from '../i18n/LanguageProvider';
import Tooltip from './Tooltip';
import { exportToCSV } from '../utils/exportHelpers';

interface InvoicesPageProps {
    invoices: Invoice[];
    onNavigate: (view: View) => void;
    onUpdateInvoice: (invoiceId: string, updatedData: Partial<Invoice>) => void;
    onDeleteInvoices: (invoiceIds: string[]) => void;
    onBulkMarkAsPaid: (invoiceIds: string[]) => void;
    onEditInvoice: (invoice: Invoice) => void;
    onSendInvoice: (invoice: Invoice, mode: SendMode) => void;
    companyProfile: CompanyProfile;
}

const formatCurrency = (amount: number | null) => {
    if (amount === null || isNaN(amount)) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return dateString;
    }
}

const StatusPill: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
    const styles = {
        PAID: 'bg-green-100 text-green-700',
        SENT: 'bg-blue-100 text-blue-700',
        OVERDUE: 'bg-red-100 text-red-700',
        DRAFT: 'bg-gray-100 text-gray-700',
        PARTIALLY_PAID: 'bg-yellow-100 text-yellow-700'
    };
    const label = status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ');

    return (
        <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${styles[status] || styles.DRAFT}`}>
            {label}
        </span>
    );
};

const InvoicesPage: React.FC<InvoicesPageProps> = ({ invoices, onNavigate, onUpdateInvoice, onDeleteInvoices, onBulkMarkAsPaid, onEditInvoice, onSendInvoice, companyProfile }) => {
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
    const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'ALL'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const { t } = useLanguage();

    // Derived state for the modal - ensures reactivity
    const selectedInvoice = useMemo(() => {
        return invoices.find(inv => inv.id === selectedInvoiceId) || null;
    }, [invoices, selectedInvoiceId]);

    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => {
            const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
            const matchesSearch = 
                inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                inv.client.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [invoices, statusFilter, searchTerm]);

    const handleSelectOne = (invoiceId: string) => {
        setSelectedInvoices(prev =>
            prev.includes(invoiceId)
                ? prev.filter(id => id !== invoiceId)
                : [...prev, invoiceId]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedInvoices(filteredInvoices.map(inv => inv.id));
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
    
    const handleExportCSV = () => {
        const headers = ['Invoice Number', 'Client', 'Issue Date', 'Due Date', 'Total', 'Amount Paid', 'Status'];
        const rows = filteredInvoices.map(inv => [
            inv.invoiceNumber,
            inv.client.name,
            inv.issueDate,
            inv.dueDate,
            inv.total,
            inv.amountPaid,
            inv.status
        ]);
        exportToCSV('invoices.csv', headers, rows);
    };

    const handleCloseModal = () => setSelectedInvoiceId(null);

    const BulkActionsBar = () => (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-4 z-20 w-full max-w-fit animate-fade-in-down">
            <div className="flex items-center space-x-2 bg-white shadow-lg rounded-full px-4 py-2 border border-gray-100">
                <span className="text-sm font-medium text-gray-700 px-2">{t('invoices.selected', { count: selectedInvoices.length })}</span>
                <Tooltip content={t('invoices.markAsPaid')}>
                    <button onClick={handleBulkPaid} className="inline-flex items-center justify-center rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-200">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    </button>
                </Tooltip>
                <Tooltip content={t('common.delete')}>
                    <button onClick={() => setIsConfirmModalOpen(true)} className="inline-flex items-center justify-center rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-200">
                        <TrashIcon className="h-4 w-4 text-red-500" />
                    </button>
                </Tooltip>
            </div>
        </div>
    );

    const FilterTab = ({ label, value }: { label: string, value: InvoiceStatus | 'ALL' }) => (
        <button
            onClick={() => setStatusFilter(value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                statusFilter === value 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">{t('header.invoices')}</h2>
                <button 
                    onClick={() => onNavigate('create-invoice')}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5"/>
                    {t('invoices.newInvoice')}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden min-h-[500px]">
                {selectedInvoices.length > 0 && <BulkActionsBar />}
                
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                     <div className="flex space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                        <FilterTab label="All" value="ALL" />
                        <FilterTab label="Paid" value="PAID" />
                        <FilterTab label="Sent" value="SENT" />
                        <FilterTab label="Overdue" value="OVERDUE" />
                        <FilterTab label="Draft" value="DRAFT" />
                    </div>
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search invoices..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                            />
                        </div>
                        <Tooltip content={t('common.exportCSV')}>
                            <button onClick={handleExportCSV} className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-600 transition-colors">
                                <ArrowDownTrayIcon className="h-5 w-5" />
                            </button>
                        </Tooltip>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 w-[50px]">
                                    <input 
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={invoices.length > 0 && selectedInvoices.length === filteredInvoices.length}
                                        ref={input => {
                                            if (input) input.indeterminate = selectedInvoices.length > 0 && selectedInvoices.length < filteredInvoices.length;
                                        }}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('invoices.status')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('invoices.number')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('invoices.client')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('common.dueDate')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('common.total')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredInvoices.map(invoice => (
                                <tr 
                                    key={invoice.id} 
                                    className={`${selectedInvoices.includes(invoice.id) ? 'bg-blue-50/30' : ''} hover:bg-gray-50 transition-colors`}
                                    onClick={() => setSelectedInvoiceId(invoice.id)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={selectedInvoices.includes(invoice.id)}
                                            onChange={() => handleSelectOne(invoice.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap"><StatusPill status={invoice.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 cursor-pointer">#{invoice.invoiceNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium cursor-pointer">{invoice.client.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer">{formatDate(invoice.dueDate)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 cursor-pointer">{formatCurrency(invoice.total)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center space-x-3 text-gray-400">
                                            <Tooltip content={t('common.preview')}>
                                                <button onClick={() => setSelectedInvoiceId(invoice.id)} className="hover:text-gray-600"><EyeIcon className="h-4 w-4" /></button>
                                            </Tooltip>
                                            <Tooltip content={t('common.edit')}>
                                                <button onClick={() => onEditInvoice(invoice)} className="hover:text-blue-600"><PencilIcon className="h-4 w-4" /></button>
                                            </Tooltip>
                                            <Tooltip content={t('sendInvoice.title')}>
                                                <button onClick={() => onSendInvoice(invoice, 'send')} className="hover:text-green-600"><DocumentTextIcon className="h-4 w-4" /></button>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <DocumentTextIcon className="h-10 w-10 text-gray-300 mb-2" />
                                            <p>{t('invoices.noInvoicesYet')}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

             {selectedInvoice && (
                <InvoiceDetailsModal 
                    invoice={selectedInvoice}
                    onClose={handleCloseModal}
                    onUpdateInvoice={onUpdateInvoice}
                    companyProfile={companyProfile}
                    onEdit={onEditInvoice}
                    onSend={onSendInvoice}
                />
            )}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={t('invoices.deleteInvoicesTitle', { count: selectedInvoices.length })}
                message={t('invoices.deleteInvoicesMessage')}
            />
        </div>
    );
};

export default InvoicesPage;
