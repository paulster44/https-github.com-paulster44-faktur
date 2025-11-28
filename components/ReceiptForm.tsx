
import React, { useState, useEffect } from 'react';
import { type Expense } from '../types';
import { useLanguage } from '../i18n/LanguageProvider';

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
                                <label htmlFor="tax" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.tax')}</label>
                                <div className="relative mt-1 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input type="number" name="tax" id="tax" value={expense.tax} onChange={handleChange} step="0.01" className="block w-full rounded-md border-slate-300 dark:border-slate-600 pl-7 pr-12 focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" placeholder="0.00" />
                                </div>
                            </div>
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