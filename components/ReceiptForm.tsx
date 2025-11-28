
import React, { useState, useEffect } from 'react';
import { type Expense, type TaxDetail } from '../types';
import { useLanguage } from '../i18n/LanguageProvider';
import { PlusIcon, TrashIcon } from './icons';

interface ReceiptFormProps {
    initialData: Partial<Expense>;
    onSave: (expense: Expense | Omit<Expense, 'id'>) => void;
    onCancel: () => void;
}

const ReceiptForm: React.FC<ReceiptFormProps> = ({ initialData, onSave, onCancel }) => {
    const { t } = useLanguage();
    const [expense, setExpense] = useState<Partial<Expense>>({
        merchant: '',
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        tax: 0,
        taxDetails: [],
        category: '',
        description: '',
        ...initialData
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setExpense(prev => ({ 
            ...prev, 
            [name]: (name === 'amount' || name === 'tax') ? parseFloat(value) || 0 : value 
        }));
    };

    // Update total tax when details change, if user hasn't manually overridden it heavily
    const updateTaxTotal = (details: TaxDetail[]) => {
        const totalTax = details.reduce((sum, item) => sum + item.amount, 0);
        setExpense(prev => ({ ...prev, taxDetails: details, tax: parseFloat(totalTax.toFixed(2)) }));
    };

    const handleTaxDetailChange = (index: number, field: keyof TaxDetail, value: string) => {
        const newDetails = [...(expense.taxDetails || [])];
        if (field === 'amount') {
            newDetails[index].amount = parseFloat(value) || 0;
        } else {
            newDetails[index].name = value;
        }
        updateTaxTotal(newDetails);
    };

    const addTaxLine = () => {
        const newDetails = [...(expense.taxDetails || []), { name: '', amount: 0 }];
        updateTaxTotal(newDetails);
    };

    const removeTaxLine = (index: number) => {
        const newDetails = [...(expense.taxDetails || [])];
        newDetails.splice(index, 1);
        updateTaxTotal(newDetails);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!expense.merchant || !expense.amount) {
            alert(t('expenses.validationError'));
            return;
        }
        onSave(expense as Expense | Omit<Expense, 'id'>);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl m-4 flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
                 {expense.receiptImage && (
                    <div className="w-full md:w-1/3 bg-slate-100 dark:bg-slate-900 p-4 flex items-center justify-center border-r border-slate-200 dark:border-slate-700">
                        <img src={expense.receiptImage} alt="Receipt" className="max-w-full max-h-[50vh] object-contain rounded shadow-sm" />
                    </div>
                )}
                
                <div className={`w-full ${expense.receiptImage ? 'md:w-2/3' : ''} p-6 overflow-y-auto`}>
                    <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">{initialData.id ? t('expenses.editExpense') : t('expenses.newExpense')}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="merchant" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('expenses.merchant')}</label>
                            <input type="text" name="merchant" id="merchant" value={expense.merchant} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.date')}</label>
                                <input type="date" name="date" id="date" value={expense.date} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('expenses.category')}</label>
                                <input type="text" name="category" id="category" value={expense.category} onChange={handleChange} list="categories" className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                                <datalist id="categories">
                                    <option value="Meals" />
                                    <option value="Transport" />
                                    <option value="Supplies" />
                                    <option value="Utilities" />
                                    <option value="Software" />
                                    <option value="Rent" />
                                </datalist>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.amount')}</label>
                                <div className="relative mt-1 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input type="number" name="amount" id="amount" value={expense.amount} onChange={handleChange} step="0.01" required className="block w-full rounded-md border-slate-300 dark:border-slate-600 pl-7 pr-12 focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" placeholder="0.00" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="tax" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.totalTax')}</label>
                                <div className="relative mt-1 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input type="number" name="tax" id="tax" value={expense.tax} onChange={handleChange} step="0.01" className="block w-full rounded-md border-slate-300 dark:border-slate-600 pl-7 pr-12 focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" placeholder="0.00" />
                                </div>
                            </div>
                        </div>

                        {/* Tax Details Breakdown */}
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md border border-slate-200 dark:border-slate-600">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">{t('expenses.taxBreakdown')}</span>
                                <button type="button" onClick={addTaxLine} className="text-sky-600 hover:text-sky-700 text-xs flex items-center"><PlusIcon className="h-3 w-3 mr-1"/> {t('common.add')}</button>
                             </div>
                             {expense.taxDetails && expense.taxDetails.length > 0 ? (
                                <div className="space-y-2">
                                    {expense.taxDetails.map((detail, idx) => (
                                        <div key={idx} className="flex space-x-2 items-center">
                                            <input 
                                                type="text" 
                                                placeholder="Tax Name (e.g. GST)" 
                                                value={detail.name} 
                                                onChange={e => handleTaxDetailChange(idx, 'name', e.target.value)}
                                                className="block w-full rounded-md border-slate-300 dark:border-slate-600 py-1 px-2 text-xs bg-white dark:bg-slate-800"
                                            />
                                            <input 
                                                type="number" 
                                                placeholder="0.00" 
                                                value={detail.amount} 
                                                onChange={e => handleTaxDetailChange(idx, 'amount', e.target.value)}
                                                step="0.01"
                                                className="block w-24 rounded-md border-slate-300 dark:border-slate-600 py-1 px-2 text-xs bg-white dark:bg-slate-800"
                                            />
                                            <button type="button" onClick={() => removeTaxLine(idx)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-3 w-3" /></button>
                                        </div>
                                    ))}
                                </div>
                             ) : (
                                 <p className="text-xs text-slate-400 italic">{t('expenses.noTaxDetails')}</p>
                             )}
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.description')}</label>
                            <textarea name="description" id="description" value={expense.description} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                        </div>
                        
                        <div className="pt-4 flex justify-end space-x-3">
                            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600">{t('common.cancel')}</button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">{t('common.save')}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReceiptForm;
