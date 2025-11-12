import React, { useState, useEffect } from 'react';
import { type Client } from '../types';
import { PlusIcon, PencilIcon, TrashIcon } from './icons';

interface ClientsPageProps {
    clients: Client[];
    onAddClient: (client: Omit<Client, 'id'>) => void;
    onUpdateClient: (client: Client) => void;
    onDeleteClient: (clientId: string) => void;
}

const emptyClient: Omit<Client, 'id'> = {
    name: '',
    email: '',
    address: { street: '', city: '', state: '', postalCode: '', country: '' }
};

const ClientFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (client: Client | Omit<Client, 'id'>) => void;
    clientToEdit: Client | null;
}> = ({ isOpen, onClose, onSave, clientToEdit }) => {
    const [client, setClient] = useState(clientToEdit || emptyClient);

    useEffect(() => {
        setClient(clientToEdit || emptyClient);
    }, [clientToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            alert("Client name is required."); // Replace with better validation/toast
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
                        <h3 className="text-xl font-semibold">{clientToEdit ? 'Edit Client' : 'Add New Client'}</h3>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Client Name</label>
                            <input type="text" name="name" id="name" value={client.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                            <input type="email" name="email" id="email" value={client.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                        </div>
                        <div className="pt-2">
                             <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-2">Address</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Street</label>
                                    <input type="text" name="address.street" value={client.address?.street} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
                                    <input type="text" name="address.city" value={client.address?.city} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">State / Province</label>
                                    <input type="text" name="address.state" value={client.address?.state} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Postal Code</label>
                                    <input type="text" name="address.postalCode" value={client.address?.postalCode} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                                </div>
                                 <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Country</label>
                                    <input type="text" name="address.country" value={client.address?.country} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                                </div>
                             </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">Save Client</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ClientsPage: React.FC<ClientsPageProps> = ({ clients, onAddClient, onUpdateClient, onDeleteClient }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

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
        if (window.confirm("Are you sure you want to delete this client?")) {
            onDeleteClient(clientId);
        }
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg">
            <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-xl font-bold">Clients</h2>
                <button
                    onClick={handleOpenModalForAdd}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5"/>
                    Add Client
                </button>
            </div>
            {clients.length === 0 ? (
                 <div className="p-12 text-center">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">No clients found</h3>
                    <p className="mt-1 text-sm text-slate-500">Click "Add Client" to create your first one.</p>
                </div>
            ) : (
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                    {clients.map(client => (
                        <li key={client.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{client.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{client.email}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => handleOpenModalForEdit(client)} className="p-2 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400">
                                    <PencilIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => handleDelete(client.id)} className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500">
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
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
