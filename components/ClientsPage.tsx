
import React, { useState } from 'react';
import { type Client, type Invoice } from '../types';
import { PlusIcon, PencilIcon, TrashIcon } from './icons';
import { useLanguage } from '../i18n/LanguageProvider';

interface ClientsPageProps {
    clients: Client[];
    invoices?: Invoice[];
    onAddClient: (client: Omit<Client, 'id'>) => void;
    onUpdateClient: (client: Client) => void;
    onDeleteClient: (clientId: string) => void;
}

const ClientFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (client: Client | Omit<Client, 'id'>) => void;
    clientToEdit: Client | null;
}> = ({ isOpen, onClose, onSave, clientToEdit }) => {
    const { t } = useLanguage();
    const [client, setClient] = useState<Partial<Client>>({
        name: '',
        email: '',
        phone: '',
        contactName: '',
        address: { street: '', city: '', state: '', postalCode: '', country: '' }
    });

    React.useEffect(() => {
        if (clientToEdit) {
            setClient(clientToEdit);
        } else {
            setClient({
                name: '',
                email: '',
                phone: '',
                contactName: '',
                address: { street: '', city: '', state: '', postalCode: '', country: '' }
            });
        }
    }, [clientToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const field = name.split('.')[1];
            setClient(prev => ({
                ...prev,
                address: { ...prev.address!, [field]: value }
            }));
        } else {
            setClient(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!client.name) return;
        onSave(client as Client | Omit<Client, 'id'>);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div 
                className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]" 
                onClick={e => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-900">{clientToEdit ? t('clients.editClient') : t('clients.addNewClient')}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                
                <div className="overflow-y-auto p-6">
                    <form id="client-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('clients.clientName')}</label>
                            <input type="text" name="name" value={client.name} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('clients.contactName')}</label>
                                <input type="text" name="contactName" value={client.contactName} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.email')}</label>
                                <input type="email" name="email" value={client.email} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.phoneOptional')}</label>
                            <input type="tel" name="phone" value={client.phone || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.address')}</label>
                            <input type="text" name="address.street" placeholder={t('common.street')} value={client.address?.street} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white mb-2" />
                            <div className="grid grid-cols-2 gap-2">
                                <input type="text" name="address.city" placeholder={t('common.city')} value={client.address?.city} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white" />
                                <input type="text" name="address.postalCode" placeholder={t('common.postalCode')} value={client.address?.postalCode} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white" />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50 flex-shrink-0 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">{t('common.cancel')}</button>
                    <button type="submit" form="client-form" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">{t('common.save')}</button>
                </div>
            </div>
        </div>
    );
};

const ClientsPage: React.FC<ClientsPageProps> = ({ clients, invoices = [], onAddClient, onUpdateClient, onDeleteClient }) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClientId, setSelectedClientId] = useState<string | null>(clients.length > 0 ? clients[0].id : null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

    const filteredClients = clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedClient = clients.find(c => c.id === selectedClientId);

    // Mock invoices for selected client
    const clientInvoices = invoices.filter(inv => inv.client.id === selectedClientId);

    const handleAdd = () => {
        setClientToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (client: Client) => {
        setClientToEdit(client);
        setIsModalOpen(true);
    };

    const handleSave = (clientData: Client | Omit<Client, 'id'>) => {
        if ('id' in clientData) {
            onUpdateClient(clientData as Client);
        } else {
            onAddClient(clientData);
        }
    };

    const handleDelete = (clientId: string) => {
        if (window.confirm(t('clients.deleteConfirm') || 'Are you sure you want to delete this client?')) {
            onDeleteClient(clientId);
            if (selectedClientId === clientId) {
                setSelectedClientId(null);
            }
        }
    };

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col">
             {/* Header */}
             <div className="flex justify-between items-center mb-6">
                 <div>
                    <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
                 </div>
                 <button
                    onClick={handleAdd}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5"/>
                    {t('clients.addClient')}
                </button>
             </div>

             <div className="flex-1 flex gap-6 overflow-hidden">
                 {/* Left Panel: Client List */}
                 <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
                     <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <div className="relative w-full max-w-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input 
                                type="text" 
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                                placeholder="Search Clients"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="ml-4">
                            <button className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                                Filter <span className="ml-1">▼</span>
                            </button>
                        </div>
                     </div>

                     <div className="flex-1 overflow-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Client Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Company</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Action</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredClients.map((client, index) => {
                                    const isSelected = client.id === selectedClientId;
                                    const colors = ['bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700', 'bg-yellow-100 text-yellow-700'];
                                    const colorClass = colors[index % colors.length];

                                    return (
                                        <tr 
                                            key={client.id} 
                                            onClick={() => setSelectedClientId(client.id)}
                                            className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/50 ring-1 ring-inset ring-blue-500/20' : 'hover:bg-gray-50'}`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs ${colorClass}`}>
                                                        {client.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-semibold text-gray-900">{client.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {client.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {client.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {client.phone || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={(e) => { e.stopPropagation(); setSelectedClientId(client.id); }} className="text-blue-600 hover:text-blue-800 mr-3 lg:hidden">View</button>
                                                <button onClick={(e) => { e.stopPropagation(); handleEdit(client); }} className="text-gray-400 hover:text-gray-600">Edit</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                     </div>
                 </div>

                 {/* Right Panel: Client Details */}
                 <div className={`w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-auto
                    fixed inset-0 z-20 lg:static lg:z-auto transition-transform duration-300 bg-white
                    ${selectedClientId ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                    lg:block
                    ${!selectedClientId ? 'hidden lg:flex' : 'flex'}
                 `}>
                    {selectedClient ? (
                        <div className="p-6 h-full overflow-y-auto">
                            <div className="lg:hidden mb-4">
                                <button onClick={() => setSelectedClientId(null)} className="text-blue-600 font-medium">← Back to List</button>
                            </div>
                            <div className="mb-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Client Details</h2>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between border-b border-gray-50 pb-2">
                                        <span className="text-gray-500">Company</span>
                                        <span className="font-medium text-gray-900">{selectedClient.name}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-50 pb-2">
                                        <span className="text-gray-500">Address</span>
                                        <span className="font-medium text-gray-900 text-right">{selectedClient.address?.street}, {selectedClient.address?.city}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-50 pb-2">
                                        <span className="text-gray-500">Industry</span>
                                        <span className="font-medium text-gray-900">Technology</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-base font-bold text-gray-900 mb-3">Contact Information</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Primary Contact</span>
                                        <span className="font-medium text-gray-900">{selectedClient.contactName || 'Jane Doe'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Email</span>
                                        <span className="font-medium text-gray-900">{selectedClient.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Phone</span>
                                        <span className="font-medium text-gray-900">{selectedClient.phone || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-base font-bold text-gray-900 mb-3">Recent Invoices</h3>
                                <div className="bg-gray-50 rounded-lg overflow-hidden">
                                     <table className="w-full text-left text-xs">
                                         <thead className="bg-gray-100">
                                             <tr>
                                                 <th className="px-3 py-2 font-medium text-gray-500">ID</th>
                                                 <th className="px-3 py-2 font-medium text-gray-500">Date</th>
                                                 <th className="px-3 py-2 font-medium text-gray-500">Amount</th>
                                                 <th className="px-3 py-2 font-medium text-gray-500">Status</th>
                                             </tr>
                                         </thead>
                                         <tbody className="divide-y divide-gray-200">
                                             {clientInvoices.length > 0 ? clientInvoices.slice(0, 5).map(inv => (
                                                 <tr key={inv.id}>
                                                     <td className="px-3 py-2 text-blue-600 font-medium">#{inv.invoiceNumber}</td>
                                                     <td className="px-3 py-2 text-gray-500">{inv.issueDate}</td>
                                                     <td className="px-3 py-2 text-gray-900">${inv.total}</td>
                                                     <td className="px-3 py-2">
                                                         <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                                             inv.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                         }`}>{inv.status}</span>
                                                     </td>
                                                 </tr>
                                             )) : (
                                                 <tr><td colSpan={4} className="px-3 py-4 text-center text-gray-400">No invoices yet</td></tr>
                                             )}
                                         </tbody>
                                     </table>
                                     {clientInvoices.length > 0 && (
                                         <div className="p-2 text-center border-t border-gray-200">
                                             <button className="text-xs text-blue-600 font-medium hover:underline">View All Invoices</button>
                                         </div>
                                     )}
                                </div>
                            </div>
                            
                            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
                                <button onClick={() => handleDelete(selectedClient.id)} className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center">
                                    <TrashIcon className="h-4 w-4 mr-1"/> Delete Client
                                </button>
                            </div>

                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Select a client to view details
                        </div>
                    )}
                 </div>
             </div>
             
             <ClientFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                clientToEdit={clientToEdit}
             />
        </div>
    );
};

export default ClientsPage;
