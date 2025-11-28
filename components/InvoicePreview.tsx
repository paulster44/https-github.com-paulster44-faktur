
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

    return (
        <div className="invoice-preview-wrapper">
             <style>
                {selectedTemplate.css}
            </style>
            <div className="invoice-preview-container">
                <div className="invoice-preview p-6 md:p-8 bg-white text-gray-900 font-sans text-sm border border-gray-200 rounded-lg shadow-sm">
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
                                {lineItems.map(item => (
                                    <tr key={item.id} className="border-b border-slate-100">
                                        <td className="p-3 text-slate-700">{item.description}</td>
                                        <td className="p-3 text-center text-slate-700">{item.quantity}</td>
                                        <td className="p-3 text-right text-slate-700">{formatCurrency(item.unitPrice)}</td>
                                        <td className="p-3 text-right text-slate-700">{formatCurrency(item.quantity * item.unitPrice)}</td>
                                    </tr>
                                ))}
                                {lineItems.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-4 text-center text-gray-400 italic">No items</td>
                                    </tr>
                                )}
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
        </div>
    );
};

export default InvoicePreview;
