
import React, { useState } from 'react';
import { type Invoice, type PaymentRecord, type CompanyProfile, type InvoiceStatus } from '../types';
import { type SendMode } from '../App';
import { XIcon, PlusIcon, PencilIcon, PrinterIcon, ArrowDownTrayIcon, CheckCircleIcon } from './icons';
import { toast } from './Toaster';
import { useLanguage } from '../i18n/LanguageProvider';
import { templates } from './templates';
import InvoicePreview from './InvoicePreview';

interface InvoiceDetailsModalProps {
    invoice: Invoice;
    companyProfile: CompanyProfile;
    onClose: () => void;
    onUpdateInvoice: (invoiceId: string, updatedData: Partial<Invoice>) => void;
    onEdit: (invoice: Invoice) => void;
    onSend: (invoice: Invoice, mode: SendMode) => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

const today = new Date().toISOString().split('T')[0];

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ invoice, companyProfile, onClose, onUpdateInvoice, onEdit, onSend }) => {
    const [isPaymentFormVisible, setIsPaymentFormVisible] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [payment, setPayment] = useState<Omit<PaymentRecord, 'id'>>({
        amount: invoice.total - invoice.amountPaid,
        date: today,
        method: 'Bank Transfer',
        note: '',
    });
    const { t } = useLanguage();

    const balanceDue = invoice.total - invoice.amountPaid;
    const isOverdue = invoice.status !== 'PAID' && new Date(invoice.dueDate) < new Date(today);

    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPayment(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
    };

    const handleRecordPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (payment.amount <= 0 || payment.amount > balanceDue + 0.001) { // Add tolerance for float issues
            toast.error(t('payments.invalidAmount', { amount: formatCurrency(balanceDue) }));
            return;
        }

        const newAmountPaid = invoice.amountPaid + payment.amount;
        const newStatus: InvoiceStatus = newAmountPaid >= invoice.total ? 'PAID' : 'PARTIALLY_PAID';
        
        const updatedData = {
            amountPaid: newAmountPaid,
            status: newStatus,
            paymentRecords: [...invoice.paymentRecords, payment as PaymentRecord],
        };

        onUpdateInvoice(invoice.id, updatedData);
        toast.success(t('toasts.paymentRecorded'));
        setIsPaymentFormVisible(false);
    };

    const selectedTemplate = templates.find(t => t.id === companyProfile.template) || templates[0];

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 100);
    };

    const handleExportPdf = async () => {
        const invoiceElement = document.getElementById('invoice-to-print');
        if (!invoiceElement || !window.html2canvas || !window.jspdf) {
            toast.error(t('toasts.exportFailed'));
            return;
        }

        toast.success(t('toasts.exporting'));

        try {
            const canvas = await window.html2canvas(invoiceElement, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new window.jspdf.jsPDF({
                orientation: 'p',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
        } catch (error) {
            console.error("Failed to export PDF:", error);
            toast.error(t('toasts.exportFailed'));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-start p-4 overflow-y-auto print:p-0 print:bg-white" onClick={onClose}>
             <style>
            {`
                @media print {
                    body > *:not(.printable-area) {
                        display: none !important;
                    }
                    .printable-area {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: auto;
                    }
                    .non-printable {
                        display: none !important;
                    }
                }
            `}
            </style>
            <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl my-8 non-printable ${isPrinting ? 'printable-area' : ''}`} onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-semibold">{t('common.invoice')} #{invoice.invoiceNumber}</h3>
                         <button onClick={() => onEdit(invoice)} className="p-2 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400" aria-label={t('common.edit')}>
                            <PencilIcon className="h-5 w-5" />
                        </button>
                        <button onClick={handlePrint} className="p-2 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400" aria-label={t('common.print')}>
                            <PrinterIcon className="h-5 w-5" />
                        </button>
                        <button onClick={handleExportPdf} className="p-2 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400" aria-label={t('common.export')}>
                            <ArrowDownTrayIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" aria-label={t('common.close')}>
                        <XIcon className="h-6 w-6 text-slate-500" />
                    </button>
                </div>

                {/* Status / Action Bar */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-700">
                     <div className="flex items-center space-x-2">
                         <span className="text-sm text-slate-500 dark:text-slate-400">{t('invoices.status')}:</span>
                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${invoice.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                              invoice.status === 'OVERDUE' || isOverdue ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                              invoice.status === 'SENT' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                              'bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-300'}`}>
                             {t(`status.${invoice.status.toLowerCase()}`)}
                             {isOverdue && invoice.status !== 'OVERDUE' && ` (${t('status.overdue')})`}
                         </span>
                     </div>
                     <div className="flex space-x-3">
                         {invoice.status === 'DRAFT' && (
                             <button 
                                onClick={() => onSend(invoice, 'send')}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700"
                             >
                                 {t('sendInvoice.sendNow')}
                             </button>
                         )}
                         {(invoice.status === 'SENT' || invoice.status === 'PARTIALLY_PAID') && !isOverdue && (
                             <button 
                                onClick={() => onSend(invoice, 'resend')}
                                className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
                             >
                                 {t('sendInvoice.resend')}
                             </button>
                         )}
                         {isOverdue && (
                             <button 
                                onClick={() => onSend(invoice, 'reminder')}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700"
                             >
                                 {t('sendInvoice.sendReminder')}
                             </button>
                         )}
                     </div>
                </div>

                <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto">
                    {/* Invoice Content */}
                    <div id="invoice-to-print">
                        <InvoicePreview invoice={invoice} companyProfile={companyProfile} />
                    </div>
                    {/* Payment Section */}
                    <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
                        <h4 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">{t('payments.paymentHistory')}</h4>
                        {invoice.paymentRecords.length > 0 ? (
                            <ul className="divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-md">
                                {invoice.paymentRecords.map((p, i) => (
                                    <li key={i} className="p-3 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{formatDate(p.date)}</p>
                                            <p className="text-sm text-slate-500">{p.method}{p.note ? ` - ${p.note}` : ''}</p>
                                        </div>
                                        <p className="font-semibold">{formatCurrency(p.amount)}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-500">{t('payments.noPayments')}</p>
                        )}

                        {balanceDue > 0 && !isPaymentFormVisible && (
                            <div className="mt-4">
                                <button onClick={() => setIsPaymentFormVisible(true)} className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700">
                                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                    {t('payments.recordPayment')}
                                </button>
                            </div>
                        )}

                        {isPaymentFormVisible && (
                            <form onSubmit={handleRecordPayment} className="mt-6 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                <h5 className="text-md font-semibold mb-4">{t('payments.addPayment')}</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('payments.amount')}</label>
                                        <input type="number" name="amount" id="amount" value={payment.amount} onChange={handlePaymentChange} max={balanceDue} step="0.01" required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm sm:text-sm bg-white dark:bg-slate-700" />
                                    </div>
                                    <div>
                                        <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('payments.date')}</label>
                                        <input type="date" name="date" id="date" value={payment.date} onChange={handlePaymentChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm sm:text-sm bg-white dark:bg-slate-700" />
                                    </div>
                                    <div>
                                        <label htmlFor="method" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('payments.method')}</label>
                                        <select name="method" id="method" value={payment.method} onChange={handlePaymentChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm sm:text-sm bg-white dark:bg-slate-700">
                                            <option>{t('payments.methods.bankTransfer')}</option>
                                            <option>{t('payments.methods.creditCard')}</option>
                                            <option>{t('payments.methods.cash')}</option>
                                            <option>{t('payments.methods.other')}</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label htmlFor="note" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('payments.noteOptional')}</label>
                                    <textarea name="note" id="note" value={payment.note || ''} onChange={handlePaymentChange} rows={2} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm sm:text-sm bg-white dark:bg-slate-700" />
                                </div>
                                <div className="mt-4 flex justify-end space-x-2">
                                    <button type="button" onClick={() => setIsPaymentFormVisible(false)} className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm">{t('common.cancel')}</button>
                                    <button type="submit" className="px-3 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">{t('payments.savePayment')}</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailsModal;
