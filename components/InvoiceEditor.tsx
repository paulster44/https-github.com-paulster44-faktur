
import React, { useState, useEffect } from 'react';
import { type Client, type Item, type InvoiceLineItem, type Invoice, type CompanyProfile, type InvoiceTaxDetail } from '../types';
import { TrashIcon, PlusIcon, EyeIcon } from './icons';
import { useLanguage } from '../i18n/LanguageProvider';
import InvoicePreview from './InvoicePreview';
import Tooltip from './Tooltip';

interface InvoiceEditorProps {
    clients: Client[];
    items: Item[];
    onSave: (invoice: Invoice | Omit<Invoice, 'id' | 'invoiceNumber'>, action?: 'save' | 'send') => void;
    onCancel: () => void;
    companyProfile: CompanyProfile;
    invoiceToEdit: Invoice | null;
}

const today = new Date().toISOString().split('T')[0];
const generateId = () => `li-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ clients, items, onSave, onCancel, companyProfile, invoiceToEdit }) => {
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([{ id: generateId(), description: '', quantity: 1, unitPrice: 0 }]);
    const [issueDate, setIssueDate] = useState(today);
    const [dueDate, setDueDate] = useState(today);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const { t } = useLanguage();

    // Default invoice number display
    const displayInvoiceNumber = invoiceToEdit?.invoiceNumber || `${companyProfile.invoiceNumberPrefix}${companyProfile.nextInvoiceNumber}`;

    useEffect(() => {
        if (invoiceToEdit) {
            setSelectedClientId(invoiceToEdit.client.id);
            setLineItems(invoiceToEdit.lineItems.map(li => ({...li})));
            setIssueDate(invoiceToEdit.issueDate);
            setDueDate(invoiceToEdit.dueDate);
        } else {
            setSelectedClientId('');
            setLineItems([{ id: generateId(), description: '', quantity: 1, unitPrice: 0 }]);
            setIssueDate(today);
            setDueDate(today);
        }
    }, [invoiceToEdit]);

    const handleLineItemChange = (index: number, field: keyof InvoiceLineItem, value: any) => {
        setLineItems(prevItems => {
            const updatedItems = [...prevItems];
            const updatedItem = { ...updatedItems[index] };
            if(field === 'quantity' || field === 'unitPrice') {
                updatedItem[field] = parseFloat(value) || 0;
            } else {
                updatedItem[field] = value;
            }
            updatedItems[index] = updatedItem;
            return updatedItems;
        });
    };

    const handleItemSelect = (index: number, itemId: string) => {
        const selectedItem = items.find(i => i.id === itemId);
        if (selectedItem) {
            setLineItems(prevItems => {
                const updatedItems = [...prevItems];
                updatedItems[index] = {
                    ...updatedItems[index],
                    description: selectedItem.name + (selectedItem.description ? `: ${selectedItem.description}` : ''),
                    unitPrice: selectedItem.unitPrice,
                };
                return updatedItems;
            });
        }
    }
    
    const addLineItem = () => setLineItems(prev => [...prev, { id: generateId(), description: '', quantity: 1, unitPrice: 0 }]);
    const removeLineItem = (index: number) => setLineItems(prev => prev.filter((_, i) => i !== index));
    
    // Calculations
    const subtotal = lineItems.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
    
    // Calculate Taxes based on company profile defaults
    // Note: In a real app, you might want per-invoice override of tax rates. 
    // Here we use the company defaults at the time of editing.
    const taxDetails: InvoiceTaxDetail[] = (companyProfile.defaultTaxes || []).map(tax => ({
        name: tax.name,
        rate: tax.rate,
        amount: subtotal * (tax.rate / 100)
    }));

    const totalTaxAmount = taxDetails.reduce((sum, tax) => sum + tax.amount, 0);
    const finalTotal = subtotal + totalTaxAmount;

    const saveInvoice = (action: 'save' | 'send') => {
        const selectedClient = clients.find(c => c.id === selectedClientId);
        if (!selectedClient) {
            alert(t('invoiceEditor.selectClientAlert'));
            return false;
        }
        const validLineItems = lineItems.filter(li => li.description && li.quantity > 0);
        if (validLineItems.length === 0) {
            alert("Please add at least one line item.");
            return false;
        }

        const commonData = {
            client: selectedClient,
            lineItems: validLineItems,
            issueDate,
            dueDate,
            subtotal,
            total: finalTotal,
            taxDetails, // Save the calculated tax breakdown
        };

        if (invoiceToEdit) {
            onSave({ ...invoiceToEdit, ...commonData }, action);
        } else {
            onSave({ ...commonData, status: 'DRAFT', amountPaid: 0, paymentRecords: [] }, action);
        }
        return true;
    };

    const getPreviewInvoice = (): Invoice | null => {
        const selectedClient = clients.find(c => c.id === selectedClientId);
        if (!selectedClient) return null;
        return {
            id: invoiceToEdit?.id || 'preview',
            invoiceNumber: displayInvoiceNumber,
            client: selectedClient,
            lineItems,
            status: invoiceToEdit?.status || 'DRAFT',
            issueDate,
            dueDate,
            subtotal,
            total: finalTotal,
            taxDetails,
            amountPaid: 0,
            paymentRecords: []
        };
    };

    return (
        <div className="max-w-6xl mx-auto pb-24">
             {/* Header */}
             <div className="flex justify-between items-center mb-6">
                 <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
                 <div className="flex space-x-3">
                     <button className="text-gray-500 hover:text-gray-700">
                         <span className="sr-only">Settings</span>
                         <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                     </button>
                 </div>
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
                 
                 {/* Top Form Section */}
                 <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-gray-300">
                     {/* Left: Invoice Details */}
                     <div>
                         <h2 className="text-lg font-bold text-gray-900 mb-6">Invoice Details</h2>
                         <div className="space-y-5">
                             <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-1.5">Invoice Number</label>
                                 <input type="text" disabled value={displayInvoiceNumber} className="block w-full rounded-md border-gray-400 bg-gray-100 text-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3" />
                             </div>
                             <div className="grid grid-cols-2 gap-5">
                                 <div>
                                     <label className="block text-sm font-bold text-gray-700 mb-1.5">Issue Date</label>
                                     <div className="relative">
                                         <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 bg-white text-gray-900" />
                                     </div>
                                 </div>
                                 <div>
                                     <label className="block text-sm font-bold text-gray-700 mb-1.5">Due Date</label>
                                     <div className="relative">
                                         <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 bg-white text-gray-900" />
                                     </div>
                                 </div>
                             </div>
                         </div>
                     </div>

                     {/* Right: Client Details */}
                     <div>
                         <h2 className="text-lg font-bold text-gray-900 mb-6">Client Details</h2>
                         <div className="space-y-5">
                             <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-1.5">Select Client</label>
                                 <select 
                                    value={selectedClientId} 
                                    onChange={e => setSelectedClientId(e.target.value)}
                                    className="block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 bg-white text-gray-900"
                                >
                                    <option value="">Choose a client...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                             </div>
                             <div className="grid grid-cols-2 gap-5">
                                 <div>
                                     <label className="block text-sm font-bold text-gray-700 mb-1.5">Client Name</label>
                                     <input type="text" readOnly value={clients.find(c => c.id === selectedClientId)?.name || ''} className="block w-full rounded-md border-gray-400 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 text-gray-700" />
                                 </div>
                                 <div>
                                     <label className="block text-sm font-bold text-gray-700 mb-1.5">Billing Address</label>
                                     <input type="text" readOnly value={clients.find(c => c.id === selectedClientId)?.address?.city || ''} className="block w-full rounded-md border-gray-400 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 text-gray-700" />
                                 </div>
                             </div>
                             <div className="grid grid-cols-2 gap-5">
                                 <div>
                                     <label className="block text-sm font-bold text-gray-700 mb-1.5">Contact Person</label>
                                     <input type="text" readOnly value={clients.find(c => c.id === selectedClientId)?.contactName || ''} className="block w-full rounded-md border-gray-400 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 text-gray-700" />
                                 </div>
                                 <div>
                                     <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
                                     <input type="text" readOnly value={clients.find(c => c.id === selectedClientId)?.email || ''} className="block w-full rounded-md border-gray-400 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 text-gray-700" />
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* Line Items Section */}
                 <div className="p-8">
                     <h2 className="text-lg font-bold text-gray-900 mb-6">Line Items</h2>
                     <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-300">
                         <table className="min-w-full divide-y divide-gray-300">
                             <thead className="bg-gray-100">
                                 <tr>
                                     <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-[20%]">Item</th>
                                     <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-[35%]">Description</th>
                                     <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-[10%]">Quantity</th>
                                     <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider w-[15%]">Unit Price</th>
                                     <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider w-[15%]">Amount</th>
                                     <th scope="col" className="relative px-6 py-3 w-[5%]"><span className="sr-only">Delete</span></th>
                                 </tr>
                             </thead>
                             <tbody className="bg-white divide-y divide-gray-300">
                                 {lineItems.map((item, index) => (
                                     <tr key={item.id}>
                                         <td className="px-6 py-4 align-top">
                                            <select 
                                                onChange={e => handleItemSelect(index, e.target.value)} 
                                                className="block w-full rounded-md border border-gray-400 bg-white text-sm focus:ring-blue-500 focus:border-blue-500 py-2 px-3 shadow-sm text-gray-900"
                                            >
                                                <option value="">Select...</option>
                                                {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                            </select>
                                         </td>
                                         <td className="px-6 py-4 align-top">
                                             <input 
                                                type="text" 
                                                value={item.description} 
                                                onChange={e => handleLineItemChange(index, 'description', e.target.value)}
                                                className="block w-full rounded-md border border-gray-400 bg-white py-2 px-3 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm" 
                                                placeholder="Item description" 
                                             />
                                         </td>
                                         <td className="px-6 py-4 align-top">
                                             <input 
                                                type="number" 
                                                value={item.quantity} 
                                                onChange={e => handleLineItemChange(index, 'quantity', e.target.value)}
                                                className="block w-full rounded-md border border-gray-400 bg-white py-2 px-3 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center shadow-sm" 
                                             />
                                         </td>
                                         <td className="px-6 py-4 align-top text-right">
                                             <input 
                                                type="number" 
                                                value={item.unitPrice} 
                                                onChange={e => handleLineItemChange(index, 'unitPrice', e.target.value)}
                                                className="block w-full rounded-md border border-gray-400 bg-white py-2 px-3 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right shadow-sm" 
                                             />
                                         </td>
                                         <td className="px-6 py-4 align-top text-right font-medium text-gray-900 pt-3">
                                             ${(item.quantity * item.unitPrice).toFixed(2)}
                                         </td>
                                         <td className="px-6 py-4 align-top text-right pt-3">
                                             <button onClick={() => removeLineItem(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                 <TrashIcon className="h-4 w-4" />
                                             </button>
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                         <div className="p-4 border-t border-gray-300 bg-gray-50">
                             <button 
                                onClick={addLineItem}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                             >
                                 <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                                 Add Line Item
                             </button>
                         </div>
                     </div>
                 </div>

                 {/* Totals Section */}
                 <div className="p-8 flex justify-end">
                     <div className="w-full max-w-sm space-y-3">
                         <div className="flex justify-between text-sm text-gray-600">
                             <span>Subtotal:</span>
                             <span className="font-semibold">${subtotal.toFixed(2)}</span>
                         </div>
                         {/* Dynamic Taxes */}
                         {taxDetails.length > 0 ? (
                             taxDetails.map((tax, i) => (
                                 <div key={i} className="flex justify-between text-sm text-gray-600">
                                     <span>{tax.name} ({tax.rate}%):</span>
                                     <span className="font-semibold">${tax.amount.toFixed(2)}</span>
                                 </div>
                             ))
                         ) : (
                             <div className="flex justify-between text-sm text-gray-600">
                                 <span>Tax:</span>
                                 <span className="font-semibold">$0.00</span>
                             </div>
                         )}
                         <div className="flex justify-between text-sm text-gray-600">
                             <span>Discount:</span>
                             <span className="font-semibold">$0.00</span>
                         </div>
                         <div className="flex justify-between items-center pt-4 border-t border-gray-300">
                             <span className="text-xl font-bold text-gray-900">Total:</span>
                             <span className="text-2xl font-bold text-gray-900">${finalTotal.toFixed(2)}</span>
                         </div>
                     </div>
                 </div>

                 {/* Terms & Notes */}
                 <div className="p-8 border-t border-gray-300 grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">Payment Terms & Notes</label>
                         <textarea 
                            rows={4} 
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-400 rounded-md bg-white text-gray-900" 
                            placeholder="Net 30. Please make checks payable to InvoiceFlow Inc."
                        />
                     </div>
                 </div>
             </div>

             {/* Bottom Sticky Action Bar */}
             <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-gray-300 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
                 <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <button 
                        onClick={() => { if (selectedClientId) setIsPreviewOpen(true); else alert("Select client first"); }}
                        className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                    >
                        Preview Invoice
                    </button>
                    <div className="flex space-x-4">
                        <button 
                            type="button" 
                            onClick={() => saveInvoice('save')} 
                            className="bg-white py-2.5 px-6 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Save Draft
                        </button>
                        <button 
                            type="button" 
                            onClick={() => saveInvoice('send')} 
                            className="bg-blue-600 py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Send Invoice
                        </button>
                    </div>
                 </div>
             </div>

             {/* Hidden Preview Modal */}
            {isPreviewOpen && getPreviewInvoice() && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
                        <div className="p-4 border-b border-gray-200 flex justify-end">
                            <button onClick={() => setIsPreviewOpen(false)} className="text-gray-500 hover:text-gray-700">Close</button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 bg-gray-100">
                            <InvoicePreview invoice={getPreviewInvoice()!} companyProfile={companyProfile} />
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-white">
                             <button onClick={() => { saveInvoice('save'); setIsPreviewOpen(false); }} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50">{t('invoiceEditor.saveInvoice')}</button>
                             <button onClick={() => { saveInvoice('send'); setIsPreviewOpen(false); }} className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700">{t('invoiceEditor.saveAndSend')}</button>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default InvoiceEditor;
