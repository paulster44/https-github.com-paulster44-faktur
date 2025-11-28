
import React, { useState } from 'react';
import { type Expense } from '../types';
import { PlusIcon, CameraIcon, TrashIcon, PencilIcon, ReceiptIcon } from './icons';
import ReceiptUploader from './ReceiptUploader';
import ReceiptForm from './ReceiptForm';
import ReceiptProcessor from './ReceiptProcessor';
import { analyzeReceipt } from '../services/geminiService';
import { toast } from './Toaster';
import { useLanguage } from '../i18n/LanguageProvider';

interface ReceiptListProps {
    expenses: Expense[];
    onAddExpense: (expense: Omit<Expense, 'id'>) => void;
    onUpdateExpense: (expense: Expense) => void;
    onDeleteExpense: (id: string) => void;
}

const ReceiptList: React.FC<ReceiptListProps> = ({ expenses, onAddExpense, onUpdateExpense, onDeleteExpense }) => {
    const { t } = useLanguage();
    const [viewState, setViewState] = useState<'list' | 'upload' | 'processing' | 'form'>('list');
    const [currentExpense, setCurrentExpense] = useState<Partial<Expense> | null>(null);

    const handleFileUpload = async (file: File) => {
        setViewState('processing');
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                // Remove data URL prefix for API
                const base64Data = base64.split(',')[1];
                
                try {
                    const analysis = await analyzeReceipt(base64Data);
                    setCurrentExpense({
                        ...analysis,
                        receiptImage: base64
                    });
                    setViewState('form');
                    toast.success(t('expenses.scanSuccess'));
                } catch (e) {
                    console.error(e);
                    toast.error(t('expenses.scanError'));
                    setViewState('upload');
                }
            };
        } catch (e) {
            setViewState('list');
            toast.error(t('expenses.uploadError'));
        }
    };

    const handleSave = (expenseData: Expense | Omit<Expense, 'id'>) => {
        if ('id' in expenseData) {
            onUpdateExpense(expenseData as Expense);
        } else {
            onAddExpense(expenseData);
        }
        setViewState('list');
        setCurrentExpense(null);
    };

    const handleEdit = (expense: Expense) => {
        setCurrentExpense(expense);
        setViewState('form');
    };

    const handleDelete = (id: string) => {
        if (window.confirm(t('expenses.deleteConfirm'))) {
            onDeleteExpense(id);
        }
    };
    
    const handleManualAdd = () => {
        setCurrentExpense({});
        setViewState('form');
    }

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="space-y-6">
            {viewState === 'list' && (
                <>
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-xl font-bold">{t('expenses.title')}</h2>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleManualAdd}
                                    className="inline-flex items-center justify-center rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600"
                                >
                                    <PlusIcon className="-ml-1 mr-2 h-5 w-5"/>
                                    {t('expenses.manualAdd')}
                                </button>
                                <button
                                    onClick={() => setViewState('upload')}
                                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700"
                                >
                                    <CameraIcon className="-ml-1 mr-2 h-5 w-5"/>
                                    {t('expenses.scanReceipt')}
                                </button>
                            </div>
                        </div>

                        {expenses.length === 0 ? (
                            <div className="p-12 text-center">
                                <ReceiptIcon className="mx-auto h-12 w-12 text-slate-400" />
                                <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-white">{t('expenses.noExpenses')}</h3>
                                <p className="mt-1 text-sm text-slate-500">{t('expenses.noExpensesMsg')}</p>
                            </div>
                        ) : (
                             <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('common.date')}</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('expenses.merchant')}</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('expenses.category')}</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('common.amount')}</th>
                                            <th scope="col" className="relative px-6 py-3">
                                                <span className="sr-only">{t('common.edit')}</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                        {expenses.map((expense) => (
                                            <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{expense.date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white flex items-center">
                                                    {expense.receiptImage && <ReceiptIcon className="h-4 w-4 mr-2 text-sky-500" />}
                                                    {expense.merchant}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{expense.category}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-slate-900 dark:text-white">${expense.amount.toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => handleEdit(expense)} className="text-sky-600 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300 mr-3">
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(expense.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                            <span className="text-sm font-medium text-slate-900 dark:text-white mr-2">{t('expenses.totalExpenses')}:</span>
                            <span className="text-lg font-bold text-slate-900 dark:text-white">${totalExpenses.toFixed(2)}</span>
                        </div>
                    </div>
                </>
            )}

            {viewState === 'upload' && (
                <ReceiptUploader 
                    onUpload={handleFileUpload} 
                    onCancel={() => setViewState('list')} 
                />
            )}

            {viewState === 'processing' && <ReceiptProcessor />}

            {viewState === 'form' && currentExpense && (
                <ReceiptForm 
                    initialData={currentExpense} 
                    onSave={handleSave} 
                    onCancel={() => { setViewState('list'); setCurrentExpense(null); }} 
                />
            )}
        </div>
    );
};

export default ReceiptList;
