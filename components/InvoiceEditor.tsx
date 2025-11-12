import React, { useState } from 'react';
import { type Client, type Item, type InvoiceLineItem, type Invoice, type CompanyProfile } from '../types';
import { TrashIcon, PlusIcon } from './icons';
import { useLanguage } from '../i18n/LanguageProvider';

interface InvoiceEditorProps {
    clients: Client[];
    items: Item[];
    onSaveInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
    onCancel: () => void;
    companyProfile: CompanyProfile;
}

const today = new Date().toISOString().split('T')[0];

const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ clients, items, onSaveInvoice, onCancel, companyProfile }) => {
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([{ id: `li-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }]);
    const [issueDate, setIssueDate] = useState(today);
    const [dueDate, setDueDate] = useState(today);
    const { t } = useLanguage();

    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedClientId(e.target.value);
    };
    
    const handleLineItemChange = (index: number, field: keyof InvoiceLineItem, value: any) => {
        const updatedLineItems = [...lineItems];
        if(field === 'quantity' || field === 'unitPrice') {
            updatedLineItems[index][field] = parseFloat(value) || 0;
        } else {
            updatedLineItems[index][field] = value;
        }
        setLineItems(updatedLineItems);
    };

    const handleItemSelect = (index: number, itemId: string) => {
        const selectedItem = items.find(i => i.id === itemId);
        if (selectedItem) {
            const updatedLineItems = [...lineItems];
            updatedLineItems[index] = {
                ...updatedLineItems[index],
                description: selectedItem.name + (selectedItem.description ? `: ${selectedItem.description}` : ''),
                unitPrice: selectedItem.unitPrice,
            };
            setLineItems(updatedLineItems);
        }
    }
    
    const addLineItem = () => {
        setLineItems([...lineItems, { id: `li-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }]);
    };
    
    const removeLineItem = (index: number) => {
        setLineItems(lineItems.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return lineItems.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
    };
    const grandTotal = calculateTotal();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedClient = clients.find(c => c.id === selectedClientId);
        if (!selectedClient) {
            alert(t('invoiceEditor.selectClientAlert'));
            return;
        }

        const newInvoice: Omit<Invoice, 'id' | 'invoiceNumber'> = {
            client: selectedClient,
            lineItems: lineItems.filter(li => li.description && li.quantity > 0),
            status: 'DRAFT',
            issueDate,
            dueDate,
            total: grandTotal,
            amountPaid: 0,
            paymentRecords: [],
        };

        onSaveInvoice(newInvoice);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 md:p-6">
                <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                    <h2 className="text-xl font-bold">{t('invoiceEditor.newInvoice')}</h2>
                    <div className="flex space-x-2">
                         <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">{t('invoiceEditor.saveInvoice')}</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                         <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('invoiceEditor.from')}</h3>
                         <div className="mt-2 text-slate-800 dark:text-slate-200">
                            <p className="font-bold">{companyProfile.name}</p>
                            <p>{companyProfile.address.street}</p>
                            <p>{companyProfile.address.city}, {companyProfile.address.state} {companyProfile.address.postalCode}</p>
                            <p>{companyProfile.email}</p>
                         </div>
                    </div>
                    <div>
                        <label htmlFor="client" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('invoiceEditor.billTo')}</label>
                        <select id="client" value={selectedClientId} onChange={handleClientChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700">
                            <option value="">{t('invoiceEditor.selectClient')}</option>
                            {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                        </select>
                         <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="issueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.issueDate')}</label>
                                <input type="date" id="issueDate" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                             <div>
                                <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.dueDate')}</label>
                                <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                        </div>
                    </div>
                </div>


                <div className="mt-8 overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b border-slate-300 dark:border-slate-600">
                            <tr>
                                <th className="py-2 text-left text-sm font-semibold text-slate-900 dark:text-slate-200 w-1/3">{t('common.item')}</th>
                                <th className="py-2 text-left text-sm font-semibold text-slate-900 dark:text-slate-200 w-2/5">{t('common.description')}</th>
                                <th className="py-2 text-center text-sm font-semibold text-slate-900 dark:text-slate-200">{t('common.quantityShort')}</th>
                                <th className="py-2 text-right text-sm font-semibold text-slate-900 dark:text-slate-200">{t('common.price')}</th>
                                <th className="py-2 text-right text-sm font-semibold text-slate-900 dark:text-slate-200">{t('common.total')}</th>
                                <th className="py-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {lineItems.map((item, index) => (
                                <tr key={item.id} className="border-b border-slate-200 dark:border-slate-700">
                                    <td className="py-2 pr-2 align-top">
                                        <select onChange={e => handleItemSelect(index, e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700">
                                            <option value="">{t('invoiceEditor.selectItem')}</option>
                                            {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                        </select>
                                    </td>
                                    <td className="py-2 px-2 align-top">
                                        <input type="text" value={item.description} onChange={e => handleLineItemChange(index, 'description', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" placeholder={t('invoiceEditor.itemDescriptionPlaceholder')} />
                                    </td>
                                    <td className="py-2 px-2 align-top"><input type="number" min="0" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', e.target.value)} className="mt-1 block w-20 text-center rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" /></td>
                                    <td className="py-2 px-2 align-top"><input type="number" min="0" step="0.01" value={item.unitPrice} onChange={e => handleLineItemChange(index, 'unitPrice', e.target.value)} className="mt-1 block w-28 text-right rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" /></td>
                                    <td className="py-2 pl-2 text-right align-top"><div className="mt-2.5 sm:text-sm text-slate-900 dark:text-white">${(item.quantity * item.unitPrice).toFixed(2)}</div></td>
                                    <td className="py-2 pl-2 text-right align-top">
                                        <button type="button" onClick={() => removeLineItem(index)} className="mt-1 p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4">
                    <button type="button" onClick={addLineItem} className="inline-flex items-center rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600">
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                        {t('invoiceEditor.addLineItem')}
                    </button>
                </div>
                
                <div className="mt-6 flex justify-end">
                    <div className="w-full max-w-xs space-y-2">
                       <div className="flex justify-between font-bold text-lg">
                           <span>{t('common.total')}</span>
                           <span>${grandTotal.toFixed(2)}</span>
                       </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default InvoiceEditor;