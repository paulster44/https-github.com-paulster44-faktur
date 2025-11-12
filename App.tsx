import React, { useState, useEffect } from 'react';
import { type Invoice, type Client, type Item, type CompanyProfile, type PaymentRecord } from './types';
import { mockInvoices, mockClients, mockItems } from './services/geminiService';
import Header from './components/Header';
import HomePage from './components/HomePage';
import InvoicesPage from './components/InvoicesPage';
import ClientsPage from './components/ClientsPage';
import ItemsPage from './components/ItemsPage';
import InvoiceEditor from './components/InvoiceEditor';
import CompanySetup from './components/CompanySetup';
import SettingsPage from './components/SettingsPage';
import { Toaster, toast } from './components/Toaster';

export type View = 'home' | 'invoices' | 'clients' | 'items' | 'create-invoice' | 'settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('faktur-company-profile');
      if (storedProfile) {
        setCompanyProfile(JSON.parse(storedProfile));
      }

      const storedInvoices = localStorage.getItem('faktur-invoices');
      const storedClients = localStorage.getItem('faktur-clients');
      const storedItems = localStorage.getItem('faktur-items');
      
      setInvoices(storedInvoices && storedInvoices.length > 2 ? JSON.parse(storedInvoices) : mockInvoices);
      setClients(storedClients && storedClients.length > 2 ? JSON.parse(storedClients) : mockClients);
      setItems(storedItems && storedItems.length > 2 ? JSON.parse(storedItems) : mockItems);
    } catch (e) {
      console.error("Failed to load data, falling back to mock data.", e);
      setInvoices(mockInvoices);
      setClients(mockClients);
      setItems(mockItems);
    } finally {
      setIsDataLoaded(true);
    }
  }, []);

  useEffect(() => {
    if(!isDataLoaded) return;
    try {
      localStorage.setItem('faktur-company-profile', JSON.stringify(companyProfile));
    } catch (e) {
      console.error("Failed to save company profile", e);
    }
  }, [companyProfile, isDataLoaded]);


  useEffect(() => {
    if(!isDataLoaded) return;
    try {
      localStorage.setItem('faktur-invoices', JSON.stringify(invoices));
    } catch (e) {
      console.error("Failed to save invoices to localStorage", e);
    }
  }, [invoices, isDataLoaded]);

  useEffect(() => {
    if(!isDataLoaded) return;
    try {
      localStorage.setItem('faktur-clients', JSON.stringify(clients));
    } catch(e) {
      console.error("Failed to save clients to localStorage", e);
    }
  }, [clients, isDataLoaded]);

  useEffect(() => {
    if(!isDataLoaded) return;
    try {
      localStorage.setItem('faktur-items', JSON.stringify(items));
    } catch(e) {
      console.error("Failed to save items to localStorage", e);
    }
  }, [items, isDataLoaded]);

  const handleSaveProfile = (profile: CompanyProfile) => {
    setCompanyProfile(profile);
    toast.success("Company profile saved!");
  }

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
    if (!companyProfile) {
        toast.error("Company profile is not set up.");
        return;
    }
    
    const newInvoiceNumber = `${companyProfile.invoiceNumberPrefix}${companyProfile.nextInvoiceNumber}`;
    
    const newInvoice: Invoice = { 
        ...invoice, 
        id: `inv-${Date.now()}`,
        invoiceNumber: newInvoiceNumber,
    };
    
    setInvoices(prevInvoices => [newInvoice, ...prevInvoices]);
    
    // Increment the next invoice number in the company profile
    setCompanyProfile(prevProfile => {
        if (!prevProfile) return null;
        return {
            ...prevProfile,
            nextInvoiceNumber: prevProfile.nextInvoiceNumber + 1,
        };
    });

    toast.success(`Invoice #${newInvoiceNumber} created!`);
    setCurrentView('invoices');
  };
  
  const updateInvoice = (invoiceId: string, updatedInvoiceData: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? {...inv, ...updatedInvoiceData} : inv));
  }

  const renderContent = () => {
    if (!isDataLoaded) {
      return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>;
    }

    if (!companyProfile) {
      return <CompanySetup onSave={handleSaveProfile} />;
    }

    switch (currentView) {
      case 'home':
        return <HomePage invoices={invoices} onNavigate={setCurrentView} />;
      case 'invoices':
        return <InvoicesPage invoices={invoices} onNavigate={setCurrentView} onUpdateInvoice={updateInvoice} companyProfile={companyProfile} />;
      case 'clients':
        return <ClientsPage clients={clients} onAddClient={addClient} onUpdateClient={updateClient} onDeleteClient={deleteClient} />;
      case 'items':
        return <ItemsPage items={items} onAddItem={addItem} onUpdateItem={updateItem} onDeleteItem={deleteItem} />;
      case 'create-invoice':
        return <InvoiceEditor clients={clients} items={items} onSaveInvoice={addInvoice} onCancel={() => setCurrentView('invoices')} companyProfile={companyProfile} />;
       case 'settings':
        return <SettingsPage companyProfile={companyProfile} onSave={handleSaveProfile} />;
      default:
        return <HomePage invoices={invoices} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-200 font-sans">
      {companyProfile && <Header currentView={currentView} onNavigate={setCurrentView} />}
      <main className="container mx-auto p-4 md:p-6">
        {renderContent()}
      </main>
      <Toaster />
    </div>
  );
};

export default App;
