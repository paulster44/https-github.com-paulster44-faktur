import React from 'react';
import { DocumentTextIcon, HomeIcon, UsersIcon, CubeIcon, CogIcon, ChartBarIcon, ReceiptIcon, XIcon, GlobeIcon } from './icons';
import { type View } from '../App';
import { useLanguage } from '../i18n/LanguageProvider';

interface SidebarProps {
    currentView: View;
    onNavigate: (view: View) => void;
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

const NavItem: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 mb-1 ${
                isActive 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
        >
            <span className={`${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`}>
                {icon}
            </span>
            <span className="ml-3">{label}</span>
        </button>
    )
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isOpen, onClose, onLogout }) => {
    const { t } = useLanguage();

    const navItems = [
        { label: t('header.home'), icon: <HomeIcon className="h-5 w-5"/>, view: 'home' as View },
        { label: t('header.invoices'), icon: <DocumentTextIcon className="h-5 w-5"/>, view: 'invoices' as View },
        { label: t('header.clients'), icon: <UsersIcon className="h-5 w-5"/>, view: 'clients' as View },
        { label: t('header.expenses'), icon: <ReceiptIcon className="h-5 w-5"/>, view: 'expenses' as View },
        { label: t('header.reports'), icon: <ChartBarIcon className="h-5 w-5"/>, view: 'reports' as View },
        { label: t('header.items'), icon: <CubeIcon className="h-5 w-5"/>, view: 'items' as View },
        { label: t('header.settings'), icon: <CogIcon className="h-5 w-5"/>, view: 'settings' as View },
    ];

    const sidebarClasses = `
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out shadow-sm
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/50 z-30 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={sidebarClasses}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
                    <div className="flex items-center">
                        <div className="bg-blue-600 p-1.5 rounded-lg mr-3 shadow-sm">
                            <DocumentTextIcon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">InvoicePro</span>
                    </div>
                    <button onClick={onClose} className="md:hidden text-gray-500">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex flex-col h-[calc(100%-4rem)] justify-between p-4">
                    <nav className="space-y-1">
                        {navItems.map(item => (
                            <NavItem
                                key={item.view}
                                label={item.label}
                                icon={item.icon}
                                isActive={currentView === item.view}
                                onClick={() => {
                                    onNavigate(item.view);
                                    onClose(); // Close on mobile selection
                                }}
                            />
                        ))}
                    </nav>

                    <div className="border-t border-gray-100 pt-4 mt-4">
                        <div className="flex items-center px-4 py-3 mb-2 rounded-lg bg-gray-50">
                            <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                                <img src={`https://ui-avatars.com/api/?name=Alex+Johnson&background=0D8ABC&color=fff`} alt="Profile" className="h-8 w-8 rounded-full" />
                            </div>
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-semibold text-gray-900 truncate">Alex Johnson</p>
                                <button onClick={onLogout} className="text-xs text-gray-500 hover:text-red-600 transition-colors">
                                    {t('login.logout')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;