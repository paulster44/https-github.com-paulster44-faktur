
import React, { useState, useEffect } from 'react';
import { type Item } from '../types';
import { PlusIcon, PencilIcon, TrashIcon } from './icons';
import { useLanguage } from '../i18n/LanguageProvider';
import Tooltip from './Tooltip';

interface ItemsPageProps {
    items: Item[];
    onAddItem: (item: Omit<Item, 'id'>) => void;
    onUpdateItem: (item: Item) => void;
    onDeleteItem: (itemId: string) => void;
}

const emptyItem: Omit<Item, 'id'> = {
    name: '',
    description: '',
    unitPrice: 0,
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const ItemFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Item | Omit<Item, 'id'>) => void;
    itemToEdit: Item | null;
}> = ({ isOpen, onClose, onSave, itemToEdit }) => {
    const [item, setItem] = useState(itemToEdit || emptyItem);
    const { t } = useLanguage();

    useEffect(() => {
        setItem(itemToEdit || emptyItem);
    }, [itemToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setItem(prev => ({ ...prev, [name]: name === 'unitPrice' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!item.name) {
            alert(t('items.nameRequiredAlert'));
            return;
        }
        onSave(item);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-semibold">{itemToEdit ? t('items.editItem') : t('items.addNewItem')}</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('items.itemName')}</label>
                            <input type="text" name="name" id="name" value={item.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.description')}</label>
                            <textarea name="description" id="description" value={item.description} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                        </div>
                        <div>
                            <label htmlFor="unitPrice" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.unitPrice')}</label>
                            <div className="relative mt-1 rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input type="number" name="unitPrice" id="unitPrice" value={item.unitPrice} onChange={handleChange} className="block w-full rounded-md border-slate-300 dark:border-slate-600 pl-7 pr-12 focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" placeholder="0.00" />
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">{t('items.saveItem')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ItemsPage: React.FC<ItemsPageProps> = ({ items, onAddItem, onUpdateItem, onDeleteItem }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const { t } = useLanguage();

    const handleOpenModalForAdd = () => {
        setSelectedItem(null);
        setIsModalOpen(true);
    };

    const handleOpenModalForEdit = (item: Item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => setIsModalOpen(false);

    const handleSaveItem = (itemData: Item | Omit<Item, 'id'>) => {
        if ('id' in itemData) {
            onUpdateItem(itemData);
        } else {
            onAddItem(itemData);
        }
    };

    const handleDelete = (itemId: string) => {
        if (window.confirm(t('items.deleteConfirm'))) {
            onDeleteItem(itemId);
        }
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg">
            <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-xl font-bold">{t('items.title')}</h2>
                <button
                    onClick={handleOpenModalForAdd}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5"/>
                    {t('items.addItem')}
                </button>
            </div>
            {items.length === 0 ? (
                 <div className="p-12 text-center">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">{t('items.noItemsFound')}</h3>
                    <p className="mt-1 text-sm text-slate-500">{t('items.noItemsMessage')}</p>
                </div>
            ) : (
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                    {items.map(item => (
                        <li key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{formatCurrency(item.unitPrice)}</p>
                                <div className="flex items-center space-x-2">
                                    <Tooltip content={t('common.edit')}>
                                        <button onClick={() => handleOpenModalForEdit(item)} className="p-2 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400">
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                    </Tooltip>
                                    <Tooltip content={t('common.delete')}>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
             <ItemFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveItem}
                itemToEdit={selectedItem}
            />
        </div>
    );
};

export default ItemsPage;
