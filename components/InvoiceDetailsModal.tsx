import React, { useState } from 'react';
import { type Invoice, type PaymentRecord, type CompanyProfile, type InvoiceStatus } from '../types';
import { XIcon, PlusIcon, PencilIcon, PrinterIcon, ArrowDownTrayIcon } from './icons';
import { toast } from './Toaster';
import { useLanguage } from '../i18n/LanguageProvider';
import { templates } from './templates';

interface InvoiceDetailsModalProps {
    invoice: Invoice;
    companyProfile: CompanyProfile;
    onClose: () => void;
    onUpdateInvoice: (invoiceId: string, updatedData: Partial<Invoice>) => void;
    onEdit: (invoice: Invoice) => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

const today = new Date().toISOString().split('T')[0];

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ invoice, companyProfile, onClose, onUpdateInvoice, onEdit }) => {
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
                #invoice-to-print .invoice-preview {
                    ${selectedTemplate.css}
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
                <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
                    {/* Invoice Content */}
                    <div id="invoice-to-print">
                        <div className="invoice-preview p-6 md:p-8 bg-white text-gray-900 font-sans text-sm border border-gray-200 rounded-lg">
                             <header className="invoice-header flex flex-col md:flex-row justify-between items-start pb-6 border-b">
                                <div className="mb-4 md:mb-0">
                                    {companyProfile.logo && <img src={companyProfile.logo} alt="Company Logo" className="company-logo max-h-20 mb-4" />}
                                    <h1 className="text-3xl font-bold uppercase text-slate-800">{t('common.invoice')}</h1>
                                    <p className="text-gray-500">#{invoice.invoiceNumber}</p>
                                </div>
                                <div className="w-full md:w-auto text-left md:text-right company-details">
                                    <h2 className="text-xl font-semibold text-slate-700">{companyProfile.name}</h2>
                                    <p className="text-gray-500">{companyProfile.address.street}</p>
                                    <p className="text-gray-500">{companyProfile.address.city}, {companyProfile.address.state} {companyProfile.address.postalCode}</p>
                                    {companyProfile.taxNumber && (
                                        <div className="tax-details mt-1">
                                            <p className="text-gray-500">{companyProfile.taxType}: {companyProfile.taxNumber}</p>
                                        </div>
                                    )}
                                </div>
                            </header>
                             <section className="client-details grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
                                <div>
                                    <h3 className="font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('invoiceEditor.billTo')}</h3>
                                    <p className="font-bold text-slate-700">{invoice.client.name}</p>
                                    {invoice.client.address && <p>{invoice.client.address.street}</p>}
                                    {invoice.client.address && <p>{invoice.client.address.city}, {invoice.client.address.state} {invoice.client.address.postalCode}</p>}
                                </div>
                                <div className="text-left md:text-right mt-4 md:mt-0">
                                    <p><span className="font-semibold text-slate-600">{t('common.issueDate')}:</span> {formatDate(invoice.issueDate)}</p>
                                    <p><span className="font-semibold text-slate-600">{t('common.dueDate')}:</span> {formatDate(invoice.dueDate)}</p>
                                </div>
                            </section>
                            <div className="overflow-x-auto">
                                <table className="invoice-items w-full text-left min-w-[500px]">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="p-3 font-semibold text-slate-600 uppercase">{t('common.description')}</th>
                                            <th className="p-3 font-semibold text-slate-600 uppercase text-center">{t('common.quantityShort')}</th>
                                            <th className="p-3 font-semibold text-slate-600 uppercase text-right">{t('common.unitPrice')}</th>
                                            <th className="p-3 font-semibold text-slate-600 uppercase text-right">{t('common.total')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.lineItems.map(item => (
                                            <tr key={item.id} className="border-b border-slate-100">
                                                <td className="p-3">{item.description}</td>
                                                <td className="p-3 text-center">{item.quantity}</td>
                                                <td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                                                <td className="p-3 text-right">{formatCurrency(item.quantity * item.unitPrice)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <footer className="invoice-footer flex justify-end pt-6">
                                <div className="w-full max-w-sm">
                                    <div className="flex justify-between py-2 text-slate-600"><span>{t('common.subtotal')}:</span><span>{formatCurrency(invoice.total)}</span></div>
                                    <div className="flex justify-between py-2 text-slate-600"><span>{t('payments.paid')}:</span><span>-{formatCurrency(invoice.amountPaid)}</span></div>
                                    <div className="flex justify-between py-3 font-bold text-lg text-slate-800 border-t mt-2"><span>{t('payments.balanceDue')}:</span><span>{formatCurrency(balanceDue)}</span></div>
                                </div>
                            </footer>
                        </div>
                    </div>
                    {/* Payment Section */}
                    <div className="mt-8">
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