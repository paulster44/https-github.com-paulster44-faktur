
import React, { useState, useEffect } from 'react';
import { type Invoice, type Client, type Item, type CompanyProfile, type InvoiceStatus, type Expense } from './types';
import { mockInvoices, mockClients, mockItems } from './services/geminiService';
import Header from './components/Header';
import HomePage from './components/HomePage';
import InvoicesPage from './components/InvoicesPage';
import ClientsPage from './components/ClientsPage';
import ItemsPage from './components/ItemsPage';
import InvoiceEditor from './components/InvoiceEditor';
import CompanySetup from './components/CompanySetup';
import SettingsPage from './components/SettingsPage';
import ReportsPage from './components/ReportsPage';
import ReceiptList from './components/ReceiptList'; // Expenses Page
import LoginScreen from './components/LoginScreen';
import { Toaster, toast } from './components/Toaster';
import { LanguageProvider, useLanguage } from './i18n/LanguageProvider';

export type View = 'home' | 'invoices' | 'clients' | 'items' | 'create-invoice' | 'settings' | 'reports' | 'expenses';

const MainApp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<View>('home');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const auth = localStorage.getItem('faktur-auth');
    if (auth === 'true') {
        setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    try {
      const storedProfile = localStorage.getItem('faktur-company-profile');
      if (storedProfile) {
        setCompanyProfile(JSON.parse(storedProfile));
      }

      const storedInvoices = localStorage.getItem('faktur-invoices');
      const storedClients = localStorage.getItem('faktur-clients');
      const storedItems = localStorage.getItem('faktur-items');
      const storedExpenses = localStorage.getItem('faktur-expenses');
      
      setInvoices(storedInvoices && storedInvoices.length > 2 ? JSON.parse(storedInvoices) : mockInvoices);
      setClients(storedClients && storedClients.length > 2 ? JSON.parse(storedClients) : mockClients);
      setItems(storedItems && storedItems.length > 2 ? JSON.parse(storedItems) : mockItems);
      setExpenses(storedExpenses ? JSON.parse(storedExpenses) : []);
    } catch (e) {
      console.error("Failed to load data, falling back to mock data.", e);
      setInvoices(mockInvoices);
      setClients(mockClients);
      setItems(mockItems);
    } finally {
      setIsDataLoaded(true);
    }
  }, [isAuthenticated]);

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

  useEffect(() => {
    if(!isDataLoaded) return;
    try {
      localStorage.setItem('faktur-expenses', JSON.stringify(expenses));
    } catch(e) {
      console.error("Failed to save expenses to localStorage", e);
    }
  }, [expenses, isDataLoaded]);

  const handleLogin = () => {
      localStorage.setItem('faktur-auth', 'true');
      setIsAuthenticated(true);
  }

  const handleLogout = () => {
      localStorage.removeItem('faktur-auth');
      setIsAuthenticated(false);
  }

  const handleSaveProfile = (profile: CompanyProfile) => {
    const profileToSave = {
        ...profile,
        template: profile.template || 'modern',
    };
    setCompanyProfile(profileToSave);
    toast.success(t('toasts.profileSaved'));
  }

  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient = { ...client, id: `client-${Date.now()}` };
    setClients(prevClients => [...prevClients, newClient]);
    toast.success(t('toasts.clientAdded'));
  };

  const updateClient = (updatedClient: Client) => {
    setClients(prevClients => 
      prevClients.map(client => client.id === updatedClient.id ? updatedClient : client)
    );
    toast.success(t('toasts.clientUpdated'));
  };

  const deleteClient = (clientId: string) => {
    setClients(prevClients => prevClients.filter(client => client.id !== clientId));
    toast.success(t('toasts.clientDeleted'));
  };

  const addItem = (item: Omit<Item, 'id'>) => {
    const newItem = { ...item, id: `item-${Date.now()}` };
    setItems(prevItems => [...prevItems, newItem]);
    toast.success(t('toasts.itemAdded'));
  };

  const updateItem = (updatedItem: Item) => {
    setItems(prevItems =>
      prevItems.map(item => (item.id === updatedItem.id ? updatedItem : item))
    );
    toast.success(t('toasts.itemUpdated'));
  };

  const deleteItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    toast.success(t('toasts.itemDeleted'));
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: `exp-${Date.now()}` };
    setExpenses(prev => [newExpense, ...prev]);
    toast.success(t('toasts.expenseAdded'));
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
    toast.success(t('toasts.expenseUpdated'));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    toast.success(t('toasts.expenseDeleted'));
  };

  const saveOrUpdateInvoice = (invoiceData: Invoice | Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    if ('id' in invoiceData) {
        // Update existing invoice
        const updatedInvoice = invoiceData as Invoice;
        setInvoices(prevInvoices => 
            prevInvoices.map(inv => (inv.id === updatedInvoice.id ? updatedInvoice : inv))
        );
        toast.success(t('toasts.invoiceUpdated', { number: updatedInvoice.invoiceNumber }));
    } else {
        // Create new invoice
        if (!companyProfile) {
            toast.error(t('toasts.profileNotSet'));
            return;
        }
        const newInvoiceNumber = `${companyProfile.invoiceNumberPrefix}${companyProfile.nextInvoiceNumber}`;
        const newInvoice: Invoice = { 
            ...(invoiceData as Omit<Invoice, 'id' | 'invoiceNumber'>), 
            id: `inv-${Date.now()}`,
            invoiceNumber: newInvoiceNumber,
        };
        setInvoices(prevInvoices => [newInvoice, ...prevInvoices]);
        setCompanyProfile(prevProfile => {
            if (!prevProfile) return null;
            return {
                ...prevProfile,
                nextInvoiceNumber: prevProfile.nextInvoiceNumber + 1,
            };
        });
        toast.success(t('toasts.invoiceCreated', { number: newInvoiceNumber }));
    }
    setCurrentView('invoices');
    setEditingInvoice(null);
  };
  
  const updateInvoicePayment = (invoiceId: string, updatedInvoiceData: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? {...inv, ...updatedInvoiceData} : inv));
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setCurrentView('create-invoice');
  };

  const deleteInvoices = (invoiceIds: string[]) => {
    setInvoices(prevInvoices => prevInvoices.filter(invoice => !invoiceIds.includes(invoice.id)));
    toast.success(t('toasts.invoicesDeleted', { count: invoiceIds.length }));
  };

  const bulkMarkAsPaid = (invoiceIds: string[]) => {
    setInvoices(prevInvoices =>
      prevInvoices.map(invoice =>
        invoiceIds.includes(invoice.id) && invoice.status !== 'PAID'
          ? {
              ...invoice,
              status: 'PAID' as InvoiceStatus,
              amountPaid: invoice.total,
            }
          : invoice
      )
    );
    toast.success(t('toasts.invoicesMarkedAsPaid', { count: invoiceIds.length }));
  };

  if (!isAuthenticated) {
      return (
          <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-200 font-sans">
              <LoginScreen onLogin={handleLogin} />
          </div>
      );
  }

  const renderContent = () => {
    if (!isDataLoaded) {
      return <div className="flex justify-center items-center h-screen"><p>{t('app.loading')}</p></div>;
    }

    if (!companyProfile) {
      return <CompanySetup onSave={handleSaveProfile} />;
    }

    switch (currentView) {
      case 'home':
        return <HomePage invoices={invoices} onNavigate={setCurrentView} />;
      case 'invoices':
        return <InvoicesPage 
            invoices={invoices} 
            onNavigate={setCurrentView} 
            onUpdateInvoice={updateInvoicePayment} 
            companyProfile={companyProfile} 
            onDeleteInvoices={deleteInvoices}
            onBulkMarkAsPaid={bulkMarkAsPaid}
            onEditInvoice={handleEditInvoice}
        />;
      case 'reports':
        return <ReportsPage invoices={invoices} clients={clients} />;
      case 'clients':
        return <ClientsPage clients={clients} onAddClient={addClient} onUpdateClient={updateClient} onDeleteClient={deleteClient} />;
      case 'items':
        return <ItemsPage items={items} onAddItem={addItem} onUpdateItem={updateItem} onDeleteItem={deleteItem} />;
      case 'expenses':
        return <ReceiptList expenses={expenses} onAddExpense={addExpense} onUpdateExpense={updateExpense} onDeleteExpense={deleteExpense} />;
      case 'create-invoice':
        return <InvoiceEditor 
            clients={clients} 
            items={items} 
            onSave={saveOrUpdateInvoice} 
            onCancel={() => { setCurrentView('invoices'); setEditingInvoice(null); }} 
            companyProfile={companyProfile} 
            invoiceToEdit={editingInvoice}
        />;
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
      <div className="fixed bottom-4 left-4">
        <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            {t('login.logout')}
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <MainApp />
  </LanguageProvider>
);

export default App;
