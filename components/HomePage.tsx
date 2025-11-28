
import React, { useMemo } from 'react';
import { type Invoice, type InvoiceStatus } from '../types';
import { PlusIcon, ClockIcon, CheckCircleIcon, ChartBarIcon } from './icons';
import { type View } from '../App';
import { useLanguage } from '../i18n/LanguageProvider';

interface HomePageProps {
  invoices: Invoice[];
  onNavigate: (view: View) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const StatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
    const { t } = useLanguage();
    const statusStyles: { [key in InvoiceStatus]: string } = {
      DRAFT: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
      SENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      PAID: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
            {t(`status.${status.toLowerCase()}`)}
        </span>
    );
};

const RevenueChart: React.FC<{ invoices: Invoice[] }> = ({ invoices }) => {
    const data = useMemo(() => {
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return d;
        }).reverse();

        return last6Months.map(date => {
            const monthStr = date.toLocaleString('default', { month: 'short' });
            const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
            
            const total = invoices
                .filter(inv => inv.issueDate.startsWith(monthKey) && inv.status !== 'DRAFT')
                .reduce((sum, inv) => sum + inv.total, 0);
            
            return { month: monthStr, amount: total };
        });
    }, [invoices]);

    const maxVal = Math.max(...data.map(d => d.amount), 100);
    const height = 150;
    const width = 100; // Percentage

    return (
        <div className="w-full h-48 mt-4 flex items-end justify-between space-x-2 px-2">
            {data.map((item, idx) => {
                const barHeight = (item.amount / maxVal) * 100;
                return (
                    <div key={idx} className="flex flex-col items-center flex-1 group">
                        <div className="relative w-full flex items-end justify-center h-[150px] bg-slate-50 dark:bg-slate-700/30 rounded-t-sm">
                            <div 
                                style={{ height: `${Math.max(barHeight, 2)}%` }} 
                                className="w-4/5 bg-sky-500 rounded-t-sm transition-all duration-500 relative group-hover:bg-sky-400"
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {formatCurrency(item.amount)}
                                </div>
                            </div>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">{item.month}</span>
                    </div>
                )
            })}
        </div>
    )
}

const HomePage: React.FC<HomePageProps> = ({ invoices, onNavigate }) => {
    const { t } = useLanguage();
    
    // Metrics
    const outstanding = invoices
        .filter(inv => ['SENT', 'OVERDUE', 'PARTIALLY_PAID'].includes(inv.status))
        .reduce((sum, inv) => sum + (inv.total - inv.amountPaid), 0);
    
    const overdue = invoices
        .filter(inv => inv.status === 'OVERDUE')
        .reduce((sum, inv) => sum + (inv.total - inv.amountPaid), 0);

    const collected = invoices
        .reduce((sum, inv) => sum + inv.amountPaid, 0);

    const recentInvoices = [...invoices].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()).slice(0, 5);
    
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('home.outstanding')}</p>
                            <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(outstanding)}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <ClockIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                     <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('home.overdue')}</p>
                            <h3 className={`mt-2 text-3xl font-bold ${overdue > 0 ? 'text-red-600 dark:text-red-500' : 'text-slate-900 dark:text-white'}`}>{formatCurrency(overdue)}</h3>
                        </div>
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                            <ClockIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                     <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('reports.totalCollected')}</p>
                            <h3 className="mt-2 text-3xl font-bold text-green-600 dark:text-green-500">{formatCurrency(collected)}</h3>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                            <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart Section */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Revenue Trend</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Invoiced amount over the last 6 months</p>
                    <RevenueChart invoices={invoices} />
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('home.recentActivity')}</h3>
                        <button onClick={() => onNavigate('invoices')} className="text-sm font-medium text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300">{t('home.viewAll')}</button>
                    </div>
                    <ul className="divide-y divide-slate-200 dark:divide-slate-700 flex-grow overflow-auto max-h-[300px]">
                        {recentInvoices.map(invoice => (
                            <li key={invoice.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <div className="flex items-center">
                                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                                        invoice.status === 'PAID' ? 'bg-green-100 dark:bg-green-900 text-green-600' : 
                                        invoice.status === 'OVERDUE' ? 'bg-red-100 dark:bg-red-900 text-red-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                                    }`}>
                                        <span className="font-bold text-xs">{invoice.client.name.substring(0, 2).toUpperCase()}</span>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{invoice.client.name}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">#{invoice.invoiceNumber} &bull; {t('home.due')} {invoice.dueDate}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(invoice.total)}</p>
                                    <div className="scale-90 origin-right mt-1">
                                        <StatusBadge status={invoice.status} />
                                    </div>
                                </div>
                            </li>
                        ))}
                         {recentInvoices.length === 0 && (
                            <li className="p-8 text-center text-sm text-slate-500">{t('home.noRecentInvoices')}</li>
                        )}
                    </ul>
                </div>
            </div>

            <div className="bg-sky-600 rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between">
                <div className="text-white mb-4 md:mb-0">
                    <h3 className="text-xl font-bold">{t('home.readyToGetPaid')}</h3>
                    <p className="opacity-90">{t('home.createInvoiceBanner')}</p>
                </div>
                <button
                    onClick={() => onNavigate('create-invoice')}
                    className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-bold text-sky-600 shadow-sm hover:bg-sky-50 transition-colors"
                >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5"/>
                    {t('home.createInvoice')}
                </button>
            </div>
        </div>
    );
};

export default HomePage;
