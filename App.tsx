import React, { useState, useEffect } from 'react';
import { type Invoice, type Client, type Item } from './types';
import { mockInvoices, mockClients, mockItems } from './services/geminiService';
import Header from './components/Header';
import HomePage from './components/ReceiptUploader';
import InvoicesPage from './components/InvoicesPage';
import ClientsPage from './components/ClientsPage';
import ItemsPage from './components/ItemsPage';
import InvoiceEditor from './components/InvoiceEditor';
import { Toaster, toast } from './components/Toaster';

export type View = 'home' | 'invoices' | 'clients' | 'items' | 'create-invoice';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    try {
      const storedInvoices = localStorage.getItem('faktur-invoices');
      const storedClients = localStorage.getItem('faktur-clients');
      const storedItems = localStorage.getItem('faktur-items');
      
      if (storedInvoices && storedInvoices.length > 2) {
        setInvoices(JSON.parse(storedInvoices));
      } else {
        setInvoices(mockInvoices);
      }

      if (storedClients && storedClients.length > 2) {
        setClients(JSON.parse(storedClients));
      } else {
        setClients(mockClients);
      }
      
      if (storedItems && storedItems.length > 2) {
        setItems(JSON.parse(storedItems));
      } else {
        setItems(mockItems);
      }
    } catch (e) {
      console.error("Failed to load data, falling back to mock data.", e);
      setInvoices(mockInvoices);
      setClients(mockClients);
      setItems(mockItems);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('faktur-invoices', JSON.stringify(invoices));
    } catch (e) {
      console.error("Failed to save invoices to localStorage", e);
    }
  }, [invoices]);

  useEffect(() => {
    try {
      localStorage.setItem('faktur-clients', JSON.stringify(clients));
    } catch(e) {
      console.error("Failed to save clients to localStorage", e);
    }
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem('faktur-items', JSON.stringify(items));
    } catch(e) {
      console.error("Failed to save items to localStorage", e);
    }
  }, [items]);

  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient = { ...client, id: `client-${Date.now()}` };
    setClients(prevClients => [...prevClients, newClient]);
    toast.success("Client added successfully!");
  };

  const updateClient = (updatedClient: Client) => {
    setClients(prevClients => 
      prevClients.map(client => client.id === updatedClient.id ? updatedClient : client)
    );
    toast.success("Client updated successfully!");
  };

  const deleteClient = (clientId: string) => {
    setClients(prevClients => prevClients.filter(client => client.id !== clientId));
    toast.success("Client deleted successfully.");
  };

  const addItem = (item: Omit<Item, 'id'>) => {
    const newItem = { ...item, id: `item-${Date.now()}` };
    setItems(prevItems => [...prevItems, newItem]);
    toast.success("Item added successfully!");
  };

  const updateItem = (updatedItem: Item) => {
    setItems(prevItems =>
      prevItems.map(item => (item.id === updatedItem.id ? updatedItem : item))
    );
    toast.success("Item updated successfully!");
  };

  const deleteItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    toast.success("Item deleted successfully.");
  };

  const addInvoice = (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const newInvoiceNumber = `2024-${(invoices.length + 1).toString().padStart(3, '0')}`;
    const newInvoice = { 
        ...invoice, 
        id: `inv-${Date.now()}`,
        invoiceNumber: newInvoiceNumber,
    };
    setInvoices(prevInvoices => [newInvoice, ...prevInvoices]);
    toast.success(`Invoice #${newInvoiceNumber} created!`);
    setCurrentView('invoices');
  };


  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HomePage invoices={invoices} onNavigate={setCurrentView} />;
      case 'invoices':
        return <InvoicesPage invoices={invoices} onNavigate={setCurrentView} />;
      case 'clients':
        return <ClientsPage clients={clients} onAddClient={addClient} onUpdateClient={updateClient} onDeleteClient={deleteClient} />;
      case 'items':
        return <ItemsPage items={items} onAddItem={addItem} onUpdateItem={updateItem} onDeleteItem={deleteItem} />;
      case 'create-invoice':
        return <InvoiceEditor clients={clients} items={items} onSaveInvoice={addInvoice} onCancel={() => setCurrentView('invoices')} />;
      default:
        return <HomePage invoices={invoices} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-200 font-sans">
      <Header currentView={currentView} onNavigate={setCurrentView} />
      <main className="container mx-auto p-4 md:p-6">
        {renderContent()}
      </main>
      <Toaster />
    </div>
  );
};

export default App;