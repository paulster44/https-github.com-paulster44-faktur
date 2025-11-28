
import React, { useState, useRef, useEffect } from 'react';
import { DocumentTextIcon, HomeIcon, UsersIcon, CubeIcon, CogIcon, GlobeIcon, ChartBarIcon, ReceiptIcon } from './icons';
import { type View } from '../App';
import { useLanguage } from '../i18n/LanguageProvider';

interface HeaderProps {
    currentView: View;
    onNavigate: (view: View) => void;
}

const NavItem: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
    const activeClasses = "bg-slate-100 text-sky-600 dark:bg-slate-700 dark:text-white";
    const inactiveClasses = "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white";
    return (
        <button
            onClick={onClick}
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive ? activeClasses : inactiveClasses}`}
        >
            {icon}
            <span className="ml-3">{label}</span>
        </button>
    )
}

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage, t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = {
        en: 'English',
        fr: 'Français',
        es: 'Español',
        it: 'Italiano',
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700">
                <GlobeIcon className="h-6 w-6" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1">
                        {Object.entries(languages).map(([code, name]) => (
                             <button
                                key={code}
                                onClick={() => { setLanguage(code); setIsOpen(false); }}
                                className={`block w-full text-left px-4 py-2 text-sm ${language === code ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'} hover:bg-slate-100 dark:hover:bg-slate-700`}
                            >
                               {name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}


const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { t } = useLanguage();

  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-sky-500 mr-3" />
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">
              Faktur
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-2">
             <NavItem label={t('header.home')} icon={<HomeIcon className="h-5 w-5"/>} isActive={currentView === 'home'} onClick={() => onNavigate('home')} />
             <NavItem label={t('header.invoices')} icon={<DocumentTextIcon className="h-5 w-5"/>} isActive={currentView === 'invoices'} onClick={() => onNavigate('invoices')} />
             <NavItem label={t('header.expenses')} icon={<ReceiptIcon className="h-5 w-5"/>} isActive={currentView === 'expenses'} onClick={() => onNavigate('expenses')} />
             <NavItem label={t('header.reports')} icon={<ChartBarIcon className="h-5 w-5"/>} isActive={currentView === 'reports'} onClick={() => onNavigate('reports')} />
             <NavItem label={t('header.clients')} icon={<UsersIcon className="h-5 w-5"/>} isActive={currentView === 'clients'} onClick={() => onNavigate('clients')} />
             <NavItem label={t('header.items')} icon={<CubeIcon className="h-5 w-5"/>} isActive={currentView === 'items'} onClick={() => onNavigate('items')} />
             <NavItem label={t('header.settings')} icon={<CogIcon className="h-5 w-5"/>} isActive={currentView === 'settings'} onClick={() => onNavigate('settings')} />
          </nav>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
              U
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
