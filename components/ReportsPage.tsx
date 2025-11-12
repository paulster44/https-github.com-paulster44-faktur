import React, { useState, useMemo } from 'react';
import { type Invoice, type Client } from '../types';
import { useLanguage } from '../i18n/LanguageProvider';

interface ReportsPageProps {
    invoices: Invoice[];
    clients: Client[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const ReportsPage: React.FC<ReportsPageProps> = ({ invoices, clients }) => {
    const { t } = useLanguage();
    const [dateRange, setDateRange] = useState('all');

    const filteredInvoices = useMemo(() => {
        if (dateRange === 'all') return invoices;
        
        const now = new Date();
        const startDate = new Date();
        
        if (dateRange === '30d') {
            startDate.setDate(now.getDate() - 30);
        } else if (dateRange === '90d') {
            startDate.setDate(now.getDate() - 90);
        } else if (dateRange === '365d') {
            startDate.setFullYear(now.getFullYear() - 1);
        }

        return invoices.filter(inv => new Date(inv.issueDate) >= startDate);
    }, [invoices, dateRange]);

    const totalRevenue = useMemo(() => {
        return filteredInvoices
            .filter(inv => inv.status === 'PAID' || inv.status === 'PARTIALLY_PAID')
            .reduce((sum, inv) => sum + inv.total, 0);
    }, [filteredInvoices]);

    const totalCollected = useMemo(() => {
        return filteredInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    }, [filteredInvoices]);

    const outstanding = useMemo(() => {
        return filteredInvoices
            .filter(inv => ['SENT', 'OVERDUE', 'PARTIALLY_PAID'].includes(inv.status))
            .reduce((sum, inv) => sum + (inv.total - inv.amountPaid), 0);
    }, [filteredInvoices]);
    
    const revenueByClient = useMemo(() => {
        const clientData = clients.map(client => ({
            id: client.id,
            name: client.name,
            invoiceCount: 0,
            totalBilled: 0,
        }));
        
        filteredInvoices.forEach(invoice => {
            const client = clientData.find(c => c.id === invoice.client.id);
            if (client) {
                client.invoiceCount++;
                client.totalBilled += invoice.total;
            }
        });

        return clientData
            .filter(c => c.invoiceCount > 0)
            .sort((a,b) => b.totalBilled - a.totalBilled);

    }, [filteredInvoices, clients]);

    return (
        <div className="space-y-6">
             <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">{t('reports.title')}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('reports.description')}</p>
                    </div>
                     <div className="flex items-center space-x-2">
                        <label htmlFor="date-range" className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('reports.dateRange')}:</label>
                        <select 
                            id="date-range"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700"
                        >
                            <option value="all">{t('reports.allTime')}</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="365d">Last 365 days</option>
                        </select>
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('reports.totalRevenue')}</h3>
                    <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('reports.totalCollected')}</h3>
                    <p className="mt-1 text-3xl font-semibold text-green-600 dark:text-green-500">{formatCurrency(totalCollected)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('reports.outstanding')}</h3>
                    <p className={`mt-1 text-3xl font-semibold ${outstanding > 0 ? 'text-red-600 dark:text-red-500' : 'text-slate-900 dark:text-white'}`}>{formatCurrency(outstanding)}</p>
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700">
                     <h3 className="text-lg font-bold">{t('reports.revenueByClient')}</h3>
                </div>
                 {revenueByClient.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('reports.client')}</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('reports.invoices')}</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('reports.amount')}</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                {revenueByClient.map(client => (
                                    <tr key={client.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{client.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-500 dark:text-slate-400">{client.invoiceCount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-slate-900 dark:text-white">{formatCurrency(client.totalBilled)}</td>
                                    </tr>
                                ))}
                             </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <p className="text-sm text-slate-500">{t('reports.noData')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;