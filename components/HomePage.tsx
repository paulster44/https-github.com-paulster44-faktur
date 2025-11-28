import React, { useMemo } from 'react';
import { type Invoice, type Client, type InvoiceStatus } from '../types';
import { PlusIcon, EyeIcon, PencilIcon, DocumentTextIcon, CheckIcon, ClockIcon, ChartBarIcon, UsersIcon, ReceiptIcon, ArrowDownTrayIcon } from './icons';
import { type View } from '../App';
import { useLanguage } from '../i18n/LanguageProvider';

interface HomePageProps {
  invoices: Invoice[];
  clients: Client[];
  onNavigate: (view: View) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Custom Icon for Payments (Green Graph)
const TrendingUpIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M15.22 6.268a.75.75 0 0 1 .968-.431l5.942 2.28a.75.75 0 0 1 .431.97l-2.28 5.941a.75.75 0 1 1-1.44-.412l.916-2.39-4.505 4.886a.75.75 0 0 1-1.035.07l-3.232-2.73-5.22 4.659a.75.75 0 0 1-.996-1.12l5.885-5.253a.75.75 0 0 1 1.01-.065l3.242 2.738 3.868-4.195-.915-2.389a.75.75 0 0 1-.432-.97Z" clipRule="evenodd" />
    </svg>
);

// Custom Icon for Outstanding (Red Graph Down)
const TrendingDownIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M1.72 17.732a.75.75 0 1 1 1.06-1.06l5.22-4.66 3.233 2.732 3.868-4.195-.916-2.39a.75.75 0 0 1 1.44-.412l2.28 5.941a.75.75 0 0 1-.43.97l-5.942 2.28a.75.75 0 0 1-.968-.43l-.915-2.39-4.505 4.886a.75.75 0 0 1-1.035.07l-3.232-2.73-5.22 4.659a.75.75 0 0 1-.865-.272Z" clipRule="evenodd" />
    </svg>
);

const AlertIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
         <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
    </svg>
)


const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    bgClass: string; 
}> = ({ title, value, icon, bgClass }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="mt-1 text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${bgClass}`}>
            {icon}
        </div>
    </div>
);

const SmoothAreaChart: React.FC = () => {
    // Static visual representation to match screenshot style
    return (
        <div className="relative w-full h-64 overflow-hidden">
            <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="w-full h-full">
                <defs>
                    <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                    </linearGradient>
                     <linearGradient id="gradientGreen" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {/* Blue Line (Invoices Issued) */}
                <path d="M0,250 C150,150 300,280 500,180 C700,80 850,200 1000,100 V300 H0 Z" fill="url(#gradient)" />
                <path d="M0,250 C150,150 300,280 500,180 C700,80 850,200 1000,100" fill="none" stroke="#3B82F6" strokeWidth="3" />
                
                {/* Green Line (Payments) */}
                 <path d="M0,280 C200,220 400,260 600,150 C800,40 900,120 1000,80 V300 H0 Z" fill="url(#gradientGreen)" />
                <path d="M0,280 C200,220 400,260 600,150 C800,40 900,120 1000,80" fill="none" stroke="#10B981" strokeWidth="3" />
            </svg>
            
            {/* X Axis Labels */}
            <div className="absolute bottom-0 w-full flex justify-between text-xs text-gray-400 px-2 pb-2">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            </div>
            {/* Y Axis Grid (Visual only) */}
             <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between pointer-events-none pb-8">
                 <div className="border-t border-gray-100 w-full h-0"></div>
                 <div className="border-t border-gray-100 w-full h-0"></div>
                 <div className="border-t border-gray-100 w-full h-0"></div>
                 <div className="border-t border-gray-100 w-full h-0"></div>
                 <div className="border-t border-gray-100 w-full h-0"></div>
             </div>
        </div>
    )
}

const StatusPill: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
    const styles = {
        PAID: 'bg-green-100 text-green-700',
        SENT: 'bg-blue-100 text-blue-700',
        OVERDUE: 'bg-red-100 text-red-700',
        DRAFT: 'bg-gray-100 text-gray-700',
        PARTIALLY_PAID: 'bg-yellow-100 text-yellow-700'
    };
    
    // Capitalize only first letter
    const label = status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ');

    return (
        <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${styles[status] || styles.DRAFT}`}>
            {label}
        </span>
    );
};

const HomePage: React.FC<HomePageProps> = ({ invoices, clients, onNavigate }) => {
    const { t } = useLanguage();
    
    // Calculate stats matching the screenshot logic
    const outstanding = invoices
        .filter(inv => ['SENT', 'OVERDUE', 'PARTIALLY_PAID'].includes(inv.status))
        .reduce((sum, inv) => sum + (inv.total - inv.amountPaid), 0);
    
    const overdueCount = invoices.filter(inv => inv.status === 'OVERDUE').length;
    
    const collected = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);

    const activeClients = clients.length;

    // Recent invoices list (last 5)
    const recentInvoices = [...invoices].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()).slice(0, 5);

    // Mock Recent Activity
    const recentActivity = [
        { id: 1, text: "Invoice #1023 sent to Acme Corp", time: "1 day ago", color: "blue" },
        { id: 2, text: "Payment received from TechSolutions", time: "3 days ago", color: "green" },
        { id: 3, text: "Client XYZ added", time: "2 weeks ago", color: "gray" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                    <span>Dashboard</span>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">Overview</span>
                </div>
                 <div className="flex justify-between items-center">
                     <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                     <button className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm hover:bg-gray-50">
                         Last 30 Days ▼
                     </button>
                 </div>
            </div>

            {/* Stats Cards - InvoicePro Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Outstanding"
                    value={formatCurrency(outstanding)}
                    icon={<TrendingDownIcon className="h-6 w-6 text-red-500" />}
                    bgClass="bg-red-50"
                />
                 <StatCard 
                    title="Overdue Invoices"
                    value={overdueCount}
                    icon={<AlertIcon className="h-6 w-6 text-red-500" />}
                    bgClass="bg-red-50"
                />
                 <StatCard 
                    title="Payments Received"
                    value={formatCurrency(collected)}
                    icon={<TrendingUpIcon className="h-6 w-6 text-green-500" />}
                    bgClass="bg-green-50"
                />
                 <StatCard 
                    title="Active Clients"
                    value={activeClients}
                    icon={<UsersIcon className="h-6 w-6 text-blue-500" />}
                    bgClass="bg-blue-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Invoicing Overview</h3>
                        <div className="flex items-center space-x-4">
                            <span className="flex items-center text-xs text-gray-500 font-medium">
                                <span className="w-3 h-3 rounded bg-blue-500 mr-2"></span> Invoices Issued
                            </span>
                             <span className="flex items-center text-xs text-gray-500 font-medium">
                                <span className="w-3 h-3 rounded bg-green-500 mr-2"></span> Payments Collected
                            </span>
                        </div>
                    </div>
                    <SmoothAreaChart />
                </div>

                {/* Recent Activity Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">{t('home.recentActivity')}</h3>
                    <div className="relative border-l border-gray-200 ml-2 space-y-8">
                        {recentActivity.map((activity, idx) => (
                             <div key={idx} className="mb-8 ml-6 relative">
                                <span className={`absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full bg-white ring-4 ring-white ${
                                    activity.color === 'blue' ? 'text-blue-500' : 
                                    activity.color === 'green' ? 'text-green-500' : 'text-gray-400'
                                }`}>
                                     <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 8 8">
                                         <circle cx="4" cy="4" r="3" />
                                     </svg>
                                </span>
                                <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                                <time className="block mb-1 text-xs font-normal leading-none text-gray-400 mt-1">{activity.time}</time>
                             </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Recent Invoices Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                     <h3 className="text-lg font-bold text-gray-900">Recent Invoices</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-semibold text-gray-500">
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Invoice ID</th>
                                <th className="px-6 py-3">Client Name</th>
                                <th className="px-6 py-3">Date Issued</th>
                                <th className="px-6 py-3">Due Date</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {recentInvoices.map(invoice => (
                                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusPill status={invoice.status} />
                                    </td>
                                    <td className="px-6 py-4 font-medium text-blue-600">
                                        #{invoice.invoiceNumber}
                                    </td>
                                    <td className="px-6 py-4 text-gray-900">
                                        {invoice.client.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {formatDate(invoice.issueDate)}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {formatDate(invoice.dueDate)}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {formatCurrency(invoice.total)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3 text-gray-400">
                                            <button className="hover:text-gray-600"><EyeIcon className="h-4 w-4" /></button>
                                            <button className="hover:text-gray-600"><PencilIcon className="h-4 w-4" /></button>
                                            <button className="hover:text-gray-600"><DocumentTextIcon className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {recentInvoices.length === 0 && (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No invoices found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HomePage;