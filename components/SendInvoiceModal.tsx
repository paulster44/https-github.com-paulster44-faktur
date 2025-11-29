
import React, { useState, useEffect } from 'react';
import { type Invoice, type CompanyProfile } from '../types';
import { type SendMode } from '../App';
import { useLanguage } from '../i18n/LanguageProvider';
import InvoicePreview from './InvoicePreview';
import { DocumentTextIcon, CheckIcon } from './icons';
import { toast } from './Toaster';

interface SendInvoiceModalProps {
    invoice: Invoice;
    companyProfile: CompanyProfile;
    onSend: (invoice: Invoice) => void;
    onSkip: () => void;
    mode: SendMode;
}

const SendInvoiceModal: React.FC<SendInvoiceModalProps> = ({ invoice, companyProfile, onSend, onSkip, mode }) => {
    const { t } = useLanguage();
    const [email, setEmail] = useState(invoice.client.email || '');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const clientName = invoice.client.contactName || invoice.client.name;
        const balanceDue = (invoice.total - invoice.amountPaid).toFixed(2);
        
        let defaultSubject = '';
        let defaultMessage = '';

        if (mode === 'reminder') {
            defaultSubject = `${t('sendInvoice.reminderPrefix')}: ${t('common.invoice')} #${invoice.invoiceNumber}`;
            defaultMessage = `${t('sendInvoice.greeting', { name: clientName })},\n\n${t('sendInvoice.reminderBody', { number: invoice.invoiceNumber, date: invoice.dueDate, amount: balanceDue })}\n\n${t('sendInvoice.closing')},\n${companyProfile.name}`;
        } else if (mode === 'resend') {
            defaultSubject = `${t('sendInvoice.resendPrefix')}: ${t('common.invoice')} #${invoice.invoiceNumber} ${t('common.from')} ${companyProfile.name}`;
            defaultMessage = `${t('sendInvoice.greeting', { name: clientName })},\n\n${t('sendInvoice.resendBody', { number: invoice.invoiceNumber })}\n\n${t('sendInvoice.closing')},\n${companyProfile.name}`;
        } else {
            // Default 'send'
            defaultSubject = `${t('common.invoice')} #${invoice.invoiceNumber} ${t('common.from')} ${companyProfile.name}`;
            defaultMessage = `${t('sendInvoice.greeting', { name: clientName })},\n\n${t('sendInvoice.body', { number: invoice.invoiceNumber, amount: balanceDue, date: invoice.dueDate })}\n\n${t('sendInvoice.closing')},\n${companyProfile.name}`;
        }

        setSubject(defaultSubject);
        setMessage(defaultMessage);
    }, [invoice, companyProfile, mode, t]);

    const handleSend = async () => {
        setIsSending(true);
        
        // 1. Generate PDF
        const element = document.getElementById('invoice-preview-capture');
        if (element && window.html2canvas && window.jspdf) {
            try {
                toast.success(t('toasts.exporting'));
                const canvas = await window.html2canvas(element, { scale: 2, logging: false, useCORS: true });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new window.jspdf.jsPDF({
                    orientation: 'p',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
                
                // Notify user to attach
                setTimeout(() => {
                    toast.success(t('toasts.attachFileInstruction'));
                }, 800);
            } catch (e) {
                console.error("PDF generation failed", e);
                toast.error(t('toasts.exportFailed'));
            }
        }

        // 2. Open Mail Client
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        
        setTimeout(() => {
            window.location.href = mailtoLink;
            
            // 3. Update State
            let nextStatus = invoice.status;
            if (mode === 'send') nextStatus = 'SENT';
            
            onSend({ ...invoice, status: nextStatus });
            setIsSending(false);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 z-50 flex justify-center items-start md:items-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-6xl flex flex-col md:flex-row my-8 md:my-0
                h-auto md:h-[90vh] md:overflow-hidden relative
            ">
                {/* Left Side: Email Form */}
                <div className="w-full md:w-1/3 p-6 flex flex-col border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 z-10 md:h-full">
                    <div className="mb-6">
                        <div className="h-12 w-12 bg-sky-100 dark:bg-sky-900/50 rounded-full flex items-center justify-center mb-4">
                            <DocumentTextIcon className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {mode === 'reminder' ? t('sendInvoice.titleReminder') : t('sendInvoice.title')}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('sendInvoice.description')}</p>
                    </div>

                    <div className="space-y-4 md:flex-grow md:overflow-y-auto pr-2">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('sendInvoice.to')}</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('sendInvoice.subject')}</label>
                            <input 
                                type="text" 
                                value={subject} 
                                onChange={(e) => setSubject(e.target.value)}
                                className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('sendInvoice.message')}</label>
                            <textarea 
                                value={message} 
                                onChange={(e) => setMessage(e.target.value)}
                                rows={8}
                                className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700 font-mono"
                            />
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col space-y-3">
                        <button 
                            onClick={handleSend}
                            disabled={isSending}
                            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${isSending ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {isSending ? t('app.loading') : (mode === 'reminder' ? t('sendInvoice.sendReminderButton') : t('sendInvoice.sendButton'))}
                        </button>
                        <button 
                            onClick={onSkip}
                            disabled={isSending}
                            className="w-full flex justify-center items-center py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
                        >
                             {t('common.cancel')}
                        </button>
                    </div>
                </div>

                {/* Right Side: Invoice Preview */}
                <div className="w-full md:w-2/3 bg-slate-100 dark:bg-slate-900 p-8 flex justify-center md:h-full md:overflow-y-auto">
                    <div className="w-full max-w-3xl transform scale-90 origin-top">
                        <div id="invoice-preview-capture" className="bg-white rounded-lg shadow-lg pointer-events-none select-none">
                             <InvoicePreview invoice={invoice} companyProfile={companyProfile} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SendInvoiceModal;
