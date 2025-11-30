
import React, { useState, useEffect } from 'react';
import { type Invoice, type Client, type Item, type CompanyProfile, type InvoiceStatus, type Expense } from './types';
import { mockInvoices, mockClients, mockItems } from './services/geminiService';
import Sidebar from './components/Sidebar';
import Header from './components/Header'; // Mobile only
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
import SendInvoiceModal from './components/SendInvoiceModal';
import InvoiceDetailsModal from './components/InvoiceDetailsModal';
import { Toaster, toast } from './components/Toaster';
import { LanguageProvider, useLanguage } from './i18n/LanguageProvider';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, setDoc } from 'firebase/firestore';

export type View = 'home' | 'invoices' | 'clients' | 'items' | 'create-invoice' | 'settings' | 'reports' | 'expenses';

export type SendMode = 'send' | 'resend' | 'reminder';

const MainApp: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('home');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  
  // Modal States
  const [sendContext, setSendContext] = useState<{ invoice: Invoice, mode: SendMode } | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { t } = useLanguage();

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
            setUser(currentUser);
        } else {
            setUser(null);
            setInvoices([]);
            setClients([]);
            setItems([]);
            setExpenses([]);
            setCompanyProfile(null);
            setIsDataLoaded(false);
        }
    });
    return () => unsubscribe();
  }, []);

  // 2. Data Fetching from Firestore
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
        try {
            setDbError(null);
            // Fetch Profile
            const profileRef = doc(db, 'settings', `profile_${user.uid}`);
            const profileSnap = await import('firebase/firestore').then(mod => mod.getDoc(profileRef));
            if (profileSnap.exists()) {
                setCompanyProfile(profileSnap.data() as CompanyProfile);
            }

            // Fetch Invoices
            const invoicesQ = query(collection(db, 'invoices'), where('userId', '==', user.uid));
            const invoicesSnap = await getDocs(invoicesQ);
            const loadedInvoices = invoicesSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Invoice));
            setInvoices(loadedInvoices);

            // Fetch Clients
            const clientsQ = query(collection(db, 'clients'), where('userId', '==', user.uid));
            const clientsSnap = await getDocs(clientsQ);
            const loadedClients = clientsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Client));
            setClients(loadedClients);

            // Fetch Items
            const itemsQ = query(collection(db, 'items'), where('userId', '==', user.uid));
            const itemsSnap = await getDocs(itemsQ);
            const loadedItems = itemsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Item));
            setItems(loadedItems);

            // Fetch Expenses
            const expensesQ = query(collection(db, 'expenses'), where('userId', '==', user.uid));
            const expensesSnap = await getDocs(expensesQ);
            const loadedExpenses = expensesSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Expense));
            setExpenses(loadedExpenses);

        } catch (e: any) {
            console.error("Error fetching data from Firestore", e);
            if (e.code === 'not-found' || e.message?.includes('database (default) does not exist') || e.code === 'unavailable') {
                setDbError("Cannot connect to Firestore. Please ensure your project has a Cloud Firestore database created in the Firebase Console.");
            } else {
                toast.error("Failed to sync data.");
            }
        } finally {
            setIsDataLoaded(true);
        }
    };

    fetchData();
  }, [user]);

  const handleLogin = () => {
      // Login is handled by the Auth Listener
  }

  const handleLogout = async () => {
      try {
        await signOut(auth);
        setUser(null);
      } catch (e) {
          console.error("Logout failed", e);
      }
  }

  const handleSaveProfile = async (profile: CompanyProfile) => {
    if (!user) return;
    try {
        const profileToSave = {
            ...profile,
            template: profile.template || 'modern',
            userId: user.uid
        };
        await setDoc(doc(db, 'settings', `profile_${user.uid}`), profileToSave);
        setCompanyProfile(profileToSave);
        toast.success(t('toasts.profileSaved'));
    } catch (e) {
        console.error("Save profile failed", e);
        toast.error("Failed to save profile.");
    }
  }

  const addClient = async (client: Omit<Client, 'id'>) => {
    if (!user) return;
    try {
        const newClientData = { ...client, userId: user.uid };
        const docRef = await addDoc(collection(db, 'clients'), newClientData);
        setClients(prev => [...prev, { ...newClientData, id: docRef.id }]);
        toast.success(t('toasts.clientAdded'));
    } catch (e) {
        console.error(e);
        toast.error("Failed to add client.");
    }
  };

  const updateClient = async (updatedClient: Client) => {
    try {
        const { id, ...data } = updatedClient;
        await updateDoc(doc(db, 'clients', id), data as any);
        setClients(prev => prev.map(c => c.id === id ? updatedClient : c));
        toast.success(t('toasts.clientUpdated'));
    } catch (e) {
        console.error(e);
        toast.error("Failed to update client.");
    }
  };

  const deleteClient = async (clientId: string) => {
    try {
        await import('firebase/firestore').then(mod => mod.deleteDoc(doc(db, 'clients', clientId)));
        setClients(prev => prev.filter(c => c.id !== clientId));
        toast.success(t('toasts.clientDeleted'));
    } catch (e) {
        console.error(e);
        toast.error("Failed to delete client.");
    }
  };

  const addItem = async (item: Omit<Item, 'id'>) => {
    if (!user) return;
    try {
        const newItemData = { ...item, userId: user.uid };
        const docRef = await addDoc(collection(db, 'items'), newItemData);
        setItems(prev => [...prev, { ...newItemData, id: docRef.id }]);
        toast.success(t('toasts.itemAdded'));
    } catch (e) {
        console.error(e);
        toast.error("Failed to add item.");
    }
  };

  const updateItem = async (updatedItem: Item) => {
    try {
        const { id, ...data } = updatedItem;
        await updateDoc(doc(db, 'items', id), data as any);
        setItems(prev => prev.map(i => i.id === id ? updatedItem : i));
        toast.success(t('toasts.itemUpdated'));
    } catch (e) {
        console.error(e);
        toast.error("Failed to update item.");
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
        await import('firebase/firestore').then(mod => mod.deleteDoc(doc(db, 'items', itemId)));
        setItems(prev => prev.filter(i => i.id !== itemId));
        toast.success(t('toasts.itemDeleted'));
    } catch (e) {
        console.error(e);
        toast.error("Failed to delete item.");
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    if (!user) return;
    try {
        const newExpenseData = { ...expense, userId: user.uid };
        const docRef = await addDoc(collection(db, 'expenses'), newExpenseData);
        setExpenses(prev => [{ ...newExpenseData, id: docRef.id }, ...prev]);
        toast.success(t('toasts.expenseAdded'));
    } catch (e) {
        console.error(e);
        toast.error("Failed to add expense.");
    }
  };

  const updateExpense = async (updatedExpense: Expense) => {
    try {
        const { id, ...data } = updatedExpense;
        await updateDoc(doc(db, 'expenses', id), data as any);
        setExpenses(prev => prev.map(e => e.id === id ? updatedExpense : e));
        toast.success(t('toasts.expenseUpdated'));
    } catch (e) {
        console.error(e);
        toast.error("Failed to update expense.");
    }
  };

  const deleteExpense = async (id: string) => {
    try {
        await import('firebase/firestore').then(mod => mod.deleteDoc(doc(db, 'expenses', id)));
        setExpenses(prev => prev.filter(e => e.id !== id));
        toast.success(t('toasts.expenseDeleted'));
    } catch (e) {
        console.error(e);
        toast.error("Failed to delete expense.");
    }
  };

  const saveOrUpdateInvoice = async (invoiceData: Invoice | Omit<Invoice, 'id' | 'invoiceNumber'>, action: 'save' | 'send' = 'save') => {
    if (!user) return;
    
    let savedInvoice: Invoice;

    try {
        if ('id' in invoiceData) {
            // Update existing invoice
            const updatedInvoice = invoiceData as Invoice;
            const { id, ...data } = updatedInvoice;
            await updateDoc(doc(db, 'invoices', id), data as any);
            
            setInvoices(prev => prev.map(inv => (inv.id === id ? updatedInvoice : inv)));
            savedInvoice = updatedInvoice;
            toast.success(t('toasts.invoiceUpdated', { number: updatedInvoice.invoiceNumber }));
        } else {
            // Create new invoice
            if (!companyProfile) {
                toast.error(t('toasts.profileNotSet'));
                return;
            }
            const newInvoiceNumber = `${companyProfile.invoiceNumberPrefix}${companyProfile.nextInvoiceNumber}`;
            const newInvoiceData = { 
                ...(invoiceData as Omit<Invoice, 'id' | 'invoiceNumber'>), 
                invoiceNumber: newInvoiceNumber,
                userId: user.uid
            };
            
            const docRef = await addDoc(collection(db, 'invoices'), newInvoiceData);
            const newInvoice = { ...newInvoiceData, id: docRef.id } as Invoice;

            setInvoices(prev => [newInvoice, ...prev]);
            
            // Update Next Invoice Number in Profile
            const nextNum = companyProfile.nextInvoiceNumber + 1;
            await updateDoc(doc(db, 'settings', `profile_${user.uid}`), { nextInvoiceNumber: nextNum });
            setCompanyProfile(prev => prev ? ({ ...prev, nextInvoiceNumber: nextNum }) : null);

            savedInvoice = newInvoice;
            toast.success(t('toasts.invoiceCreated', { number: newInvoiceNumber }));
        }
        
        if (action === 'send') {
             setSendContext({ invoice: savedInvoice, mode: 'send' });
        } else {
            setCurrentView('invoices');
        }
        setEditingInvoice(null);

    } catch (e) {
        console.error("Failed to save invoice", e);
        toast.error("Failed to save invoice to database.");
    }
  };
  
  const handleInitiateSend = (invoice: Invoice, mode: SendMode) => {
      setSendContext({ invoice, mode });
  };

  const handleInvoiceSent = async (sentInvoice: Invoice) => {
    // Update the invoice status in DB
    try {
        const { id, ...data } = sentInvoice;
        await updateDoc(doc(db, 'invoices', id), data as any);
        setInvoices(prev => prev.map(inv => inv.id === id ? sentInvoice : inv));
        
        if (sendContext?.mode === 'reminder') {
            toast.success(t('toasts.reminderSent'));
        } else {
            toast.success(t('toasts.invoiceSent'));
        }
        
        setSendContext(null);
        if (currentView === 'create-invoice') {
            setCurrentView('invoices');
        }
    } catch (e) {
        console.error(e);
        toast.error("Failed to update invoice status.");
    }
  };

  const handleInvoiceSkipped = () => {
    setSendContext(null);
    if (currentView === 'create-invoice') {
        setCurrentView('invoices');
    }
  }

  const updateInvoice = async (invoiceId: string, updatedInvoiceData: Partial<Invoice>) => {
    try {
        await updateDoc(doc(db, 'invoices', invoiceId), updatedInvoiceData as any);
        setInvoices(prev => {
            const nextInvoices = prev.map(inv => inv.id === invoiceId ? {...inv, ...updatedInvoiceData} : inv);
            if (viewingInvoice && viewingInvoice.id === invoiceId) {
                setViewingInvoice(nextInvoices.find(inv => inv.id === invoiceId) || null);
            }
            return nextInvoices;
        });
    } catch (e) {
        console.error(e);
        toast.error("Failed to update invoice.");
    }
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setCurrentView('create-invoice');
    setViewingInvoice(null);
  };

  const handleViewInvoice = (invoice: Invoice) => {
      setViewingInvoice(invoice);
  }

  const deleteInvoices = async (invoiceIds: string[]) => {
    try {
        await Promise.all(invoiceIds.map(id => import('firebase/firestore').then(mod => mod.deleteDoc(doc(db, 'invoices', id)))));
        setInvoices(prevInvoices => prevInvoices.filter(invoice => !invoiceIds.includes(invoice.id)));
        toast.success(t('toasts.invoicesDeleted', { count: invoiceIds.length }));
    } catch (e) {
        console.error(e);
        toast.error("Failed to delete invoices.");
    }
  };

  const bulkMarkAsPaid = async (invoiceIds: string[]) => {
    try {
        const updates = invoiceIds.map(id => {
            const inv = invoices.find(i => i.id === id);
            if (inv && inv.status !== 'PAID') {
                return updateDoc(doc(db, 'invoices', id), {
                    status: 'PAID',
                    amountPaid: inv.total
                });
            }
            return Promise.resolve();
        });
        await Promise.all(updates);

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
    } catch (e) {
        console.error(e);
        toast.error("Failed to update invoices.");
    }
  };

  if (!user) {
      return (
          <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
              <LoginScreen onLogin={handleLogin} />
          </div>
      );
  }

  const renderContent = () => {
    if (dbError) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="bg-red-50 text-red-800 p-6 rounded-lg max-w-lg border border-red-200 shadow-sm">
                    <h2 className="text-xl font-bold mb-2">Configuration Required</h2>
                    <p className="mb-4">{dbError}</p>
                    <a 
                        href="https://console.firebase.google.com/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                        Go to Firebase Console
                    </a>
                </div>
            </div>
        );
    }

    if (!isDataLoaded) {
      return <div className="flex justify-center items-center h-full"><p>{t('app.loading')}</p></div>;
    }

    if (!companyProfile) {
      return <CompanySetup onSave={handleSaveProfile} />;
    }

    // Modals take precedence
    if (sendContext) {
        return <SendInvoiceModal 
            invoice={sendContext.invoice} 
            companyProfile={companyProfile}
            onSend={handleInvoiceSent}
            onSkip={handleInvoiceSkipped}
            mode={sendContext.mode}
        />;
    }

    switch (currentView) {
      case 'home':
        return <HomePage 
            invoices={invoices} 
            clients={clients} 
            onNavigate={setCurrentView}
            onEditInvoice={handleEditInvoice}
            onViewInvoice={handleViewInvoice}
            onSendInvoice={(inv) => handleInitiateSend(inv, 'send')}
        />;
      case 'invoices':
        return <InvoicesPage 
            invoices={invoices} 
            onNavigate={setCurrentView} 
            onUpdateInvoice={updateInvoice} 
            companyProfile={companyProfile} 
            onDeleteInvoices={deleteInvoices}
            onBulkMarkAsPaid={bulkMarkAsPaid}
            onEditInvoice={handleEditInvoice}
            onSendInvoice={handleInitiateSend}
            onViewInvoice={handleViewInvoice}
        />;
      case 'reports':
        return <ReportsPage invoices={invoices} clients={clients} />;
      case 'clients':
        return <ClientsPage clients={clients} onAddClient={addClient} onUpdateClient={updateClient} onDeleteClient={deleteClient} invoices={invoices} />;
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
        return <HomePage invoices={invoices} clients={clients} onNavigate={setCurrentView} onViewInvoice={handleViewInvoice} onEditInvoice={handleEditInvoice} onSendInvoice={(inv) => handleInitiateSend(inv, 'send')} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar Navigation */}
      {companyProfile && !sendContext && !dbError && (
        <Sidebar 
            currentView={currentView} 
            onNavigate={setCurrentView} 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
        />
      )}
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col md:ml-64 transition-all duration-300 ${sendContext || dbError ? 'ml-0 md:ml-0' : ''}`}>
        
        {/* Mobile Top Bar */}
        {!sendContext && companyProfile && !dbError && (
            <Header onMenuClick={() => setIsSidebarOpen(true)} />
        )}

        <main className={`flex-1 overflow-x-hidden overflow-y-auto ${sendContext ? 'h-screen p-0 m-0' : 'p-4 md:p-8'}`}>
            <div className={`mx-auto ${sendContext ? 'w-full' : 'max-w-7xl'}`}>
                {renderContent()}
            </div>
        </main>
      </div>
      
      {/* Global Invoice Viewer Modal */}
      {viewingInvoice && companyProfile && !sendContext && !dbError && (
          <InvoiceDetailsModal 
            invoice={viewingInvoice}
            companyProfile={companyProfile}
            onClose={() => setViewingInvoice(null)}
            onUpdateInvoice={updateInvoice}
            onEdit={handleEditInvoice}
            onSend={handleInitiateSend}
          />
      )}

      <Toaster />
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <MainApp />
  </LanguageProvider>
);

export default App;
