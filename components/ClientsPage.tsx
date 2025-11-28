
import React, { useState, useEffect } from 'react';
import { type Client } from '../types';
import { PlusIcon, PencilIcon, TrashIcon } from './icons';
import { useLanguage } from '../i18n/LanguageProvider';
import Tooltip from './Tooltip';

interface ClientsPageProps {
    clients: Client[];
    onAddClient: (client: Omit<Client, 'id'>) => void;
    onUpdateClient: (client: Client) => void;
    onDeleteClient: (clientId: string) => void;
}

const emptyClient: Omit<Client, 'id'> = {
    name: '',
    email: '',
    address: { street: '', city: '', state: '', postalCode: '', country: '' },
    contactName: '',
    notes: '',
};

const ClientFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (client: Client | Omit<Client, 'id'>) => void;
    clientToEdit: Client | null;
}> = ({ isOpen, onClose, onSave, clientToEdit }) => {
    const [client, setClient] = useState(clientToEdit || emptyClient);
    const { t } = useLanguage();

    useEffect(() => {
        setClient(clientToEdit || emptyClient);
    }, [clientToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setClient(prev => ({
                ...prev,
                address: { ...(prev.address || {}), [addressField]: value } as any,
            }));
        } else {
            setClient(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!client.name) {
            alert(t('clients.nameRequiredAlert'));
            return;
        }
        onSave(client);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-semibold">{clientToEdit ? t('clients.editClient') : t('clients.addNewClient')}</h3>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('clients.clientName')}</label>
                                <input type="text" name="name" id="name" value={client.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                            <div>
                                <label htmlFor="contactName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('clients.contactName')}</label>
                                <input type="text" name="contactName" id="contactName" value={client.contactName} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.email')}</label>
                            <input type="email" name="email" id="email" value={client.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                        </div>
                         <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.notes')}</label>
                            <textarea name="notes" id="notes" value={client.notes} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                        </div>
                        <div className="pt-2">
                             <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-2">{t('common.address')}</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.street')}</label>
                                    <input type="text" name="address.street" value={client.address?.street} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.city')}</label>
                                    <input type="text" name="address.city" value={client.address?.city} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.stateProvince')}</label>
                                    <input type="text" name="address.state" value={client.address?.state} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.postalCode')}</label>
                                    <input type="text" name="address.postalCode" value={client.address?.postalCode} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                                </div>
                                 <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.country')}</label>
                                    <input type="text" name="address.country" value={client.address?.country} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                                </div>
                             </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">{t('clients.saveClient')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ClientsPage: React.FC<ClientsPageProps> = ({ clients, onAddClient, onUpdateClient, onDeleteClient }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { t } = useLanguage();

    const handleOpenModalForAdd = () => {
        setSelectedClient(null);
        setIsModalOpen(true);
    };

    const handleOpenModalForEdit = (client: Client) => {
        setSelectedClient(client);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => setIsModalOpen(false);

    const handleSaveClient = (clientData: Client | Omit<Client, 'id'>) => {
        if ('id' in clientData) {
            onUpdateClient(clientData);
        } else {
            onAddClient(clientData);
        }
    };

    const handleDelete = (clientId: string) => {
        if (window.confirm(t('clients.deleteConfirm'))) {
            onDeleteClient(clientId);
        }
    }

    const filteredClients = clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contactName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="w-full md:w-1/3">
                    <input 
                        type="text" 
                        placeholder="Search clients..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm focus:ring-sky-500 focus:border-sky-500"
                    />
                </div>
                <button
                    onClick={handleOpenModalForAdd}
                    className="w-full md:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5"/>
                    {t('clients.addClient')}
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {clients.length === 0 ? (
                     <div className="p-12 text-center">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">{t('clients.noClientsFound')}</h3>
                        <p className="mt-1 text-sm text-slate-500">{t('clients.noClientsMessage')}</p>
                    </div>
                ) : filteredClients.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-sm text-slate-500">No clients match your search.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Client</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Contact</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Email</th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredClients.map(client => (
                                    <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center text-sky-600 dark:text-sky-300 font-bold">
                                                        {client.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{client.name}</div>
                                                    <div className="text-sm text-slate-500 dark:text-slate-400">{client.address?.city}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                            {client.contactName || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                            {client.email || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end items-center space-x-2">
                                                <Tooltip content={t('common.edit')}>
                                                    <button onClick={() => handleOpenModalForEdit(client)} className="p-2 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400">
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip content={t('common.delete')}>
                                                    <button onClick={() => handleDelete(client.id)} className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500">
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
             <ClientFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveClient}
                clientToEdit={selectedClient}
            />
        </div>
    );
};

export default ClientsPage;
