
import React from 'react';
import { type Invoice, type CompanyProfile } from '../types';
import { useLanguage } from '../i18n/LanguageProvider';
import { templates } from './templates';

interface InvoicePreviewProps {
    invoice: Invoice;
    companyProfile: CompanyProfile;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
const formatDate = (dateString: string) => {
    if(!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
};

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, companyProfile }) => {
    const { t } = useLanguage();
    const balanceDue = invoice.total - invoice.amountPaid;
    const selectedTemplate = templates.find(t => t.id === companyProfile.template) || templates[0];

    // Ensure lineItems is an array
    const lineItems = invoice.lineItems || [];
    
    // Fallback for older invoices that might not have taxDetails saved
    // We assume subtotal exists or calculate it
    const subtotal = invoice.subtotal || invoice.lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

    return (
        <div className="invoice-preview-wrapper">
             <style>
                {selectedTemplate.css}
            </style>
            <div className="invoice-preview-container">
                <div className="invoice-preview p-8 bg-white text-slate-900 font-sans text-sm border border-slate-200 rounded-lg shadow-sm min-h-[800px] flex flex-col">
                    <header className="invoice-header flex flex-col md:flex-row justify-between items-start pb-8 border-b border-slate-100">
                        <div className="mb-6 md:mb-0">
                            {companyProfile.logo && <img src={companyProfile.logo} alt="Company Logo" className="company-logo h-16 w-auto object-contain mb-4" />}
                            <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase">{t('common.invoice')}</h1>
                            <p className="text-slate-500 mt-1 font-medium">#{invoice.invoiceNumber}</p>
                        </div>
                        <div className="w-full md:w-auto text-left md:text-right company-details">
                            <h2 className="text-lg font-bold text-slate-900">{companyProfile.name}</h2>
                            <div className="text-slate-500 mt-1 space-y-0.5">
                                <p>{companyProfile.address.street}</p>
                                <p>{companyProfile.address.city}, {companyProfile.address.state} {companyProfile.address.postalCode}</p>
                                {companyProfile.taxNumber && (
                                    <p className="mt-2 text-xs uppercase tracking-wider font-semibold text-slate-400">{companyProfile.taxType}: {companyProfile.taxNumber}</p>
                                )}
                            </div>
                        </div>
                    </header>
                    
                    <section className="client-details grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('invoiceEditor.billTo')}</h3>
                            <p className="text-lg font-semibold text-slate-900">{invoice.client.name}</p>
                            {invoice.client.address && (
                                <div className="text-slate-500 mt-1">
                                    <p>{invoice.client.address.street}</p>
                                    <p>{invoice.client.address.city}, {invoice.client.address.state} {invoice.client.address.postalCode}</p>
                                </div>
                            )}
                        </div>
                        <div className="text-left md:text-right">
                            <div className="space-y-2">
                                <div>
                                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{t('common.issueDate')}</span>
                                    <span className="text-slate-900 font-medium">{formatDate(invoice.issueDate)}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{t('common.dueDate')}</span>
                                    <span className="text-slate-900 font-medium">{formatDate(invoice.dueDate)}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="flex-grow">
                        <table className="invoice-items w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">{t('common.description')}</th>
                                    <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-center border-b border-slate-200 w-24">{t('common.quantityShort')}</th>
                                    <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right border-b border-slate-200 w-32">{t('common.unitPrice')}</th>
                                    <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right border-b border-slate-200 w-32">{t('common.total')}</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-700">
                                {lineItems.map(item => (
                                    <tr key={item.id} className="border-b border-slate-50 last:border-b-0">
                                        <td className="py-4 px-4 font-medium">{item.description}</td>
                                        <td className="py-4 px-4 text-center">{item.quantity}</td>
                                        <td className="py-4 px-4 text-right">{formatCurrency(item.unitPrice)}</td>
                                        <td className="py-4 px-4 text-right font-semibold text-slate-900">{formatCurrency(item.quantity * item.unitPrice)}</td>
                                    </tr>
                                ))}
                                {lineItems.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-slate-400 italic">No items added</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <footer className="invoice-footer flex justify-end pt-8 border-t border-slate-100 mt-8">
                        <div className="w-full max-w-xs summary-section">
                            <div className="summary-row flex justify-between py-2 text-slate-600">
                                <span className="font-medium">{t('common.subtotal')}</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            
                            {/* Render Detailed Taxes if available, otherwise just show gap if no taxes */}
                            {invoice.taxDetails && invoice.taxDetails.length > 0 ? (
                                invoice.taxDetails.map((tax, i) => (
                                    <div key={i} className="summary-row flex justify-between py-2 text-slate-600">
                                        <span className="font-medium">{tax.name} ({tax.rate}%):</span>
                                        <span>{formatCurrency(tax.amount)}</span>
                                    </div>
                                ))
                            ) : null}

                            <div className="summary-row flex justify-between py-2 text-slate-600">
                                <span className="font-medium">{t('payments.paid')}</span>
                                <span>-{formatCurrency(invoice.amountPaid)}</span>
                            </div>
                            <div className="total-row flex justify-between py-4 mt-2 border-t border-slate-200">
                                <span className="text-lg font-bold text-slate-900">{t('payments.balanceDue')}</span>
                                <span className="text-2xl font-bold text-sky-600">{formatCurrency(balanceDue)}</span>
                            </div>
                        </div>
                    </footer>
                    
                    {/* Optional Thank You Note */}
                    <div className="mt-12 text-center text-xs text-slate-400">
                        <p>{t('designStudio.thankYou')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoicePreview;
