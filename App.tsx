import React, { useState, useEffect } from 'react';
import { type Invoice, type Client } from './types';
import { mockInvoices, mockClients } from './services/geminiService';
import Header from './components/Header';
import HomePage from './components/ReceiptUploader';
import InvoiceListPage from './components/ReceiptList';
import ClientsPage from './components/ClientsPage';
import ItemsPage from './components/ReceiptForm';
import { Toaster, toast } from './components/Toaster';

export type View = 'home' | 'invoices' | 'clients' | 'items';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    try {
      const storedInvoices = localStorage.getItem('faktur-invoices');
      const storedClients = localStorage.getItem('faktur-clients');
      
      if (storedInvoices && storedInvoices.length > 2) { // check for more than empty array
        setInvoices(JSON.parse(storedInvoices));
      } else {
        setInvoices(mockInvoices);
      }

      if (storedClients && storedClients.length > 2) {
        setClients(JSON.parse(storedClients));
      } else {
        setClients(mockClients);
      }
    } catch (e) {
      console.error("Failed to load data, falling back to mock data.", e);
      setInvoices(mockInvoices);
      setClients(mockClients);
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
  }


  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HomePage invoices={invoices} onNavigate={setCurrentView} />;
      case 'invoices':
        return <InvoiceListPage invoices={invoices} />;
      case 'clients':
        return <ClientsPage clients={clients} onAddClient={addClient} onUpdateClient={updateClient} onDeleteClient={deleteClient} />;
      case 'items':
        return <ItemsPage />;
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