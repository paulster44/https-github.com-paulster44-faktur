import React from 'react';
import { DocumentTextIcon, HomeIcon, UsersIcon, CubeIcon, CogIcon } from './icons';
import { type View } from '../App';

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

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
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
             <NavItem label="Home" icon={<HomeIcon className="h-5 w-5"/>} isActive={currentView === 'home'} onClick={() => onNavigate('home')} />
             <NavItem label="Invoices" icon={<DocumentTextIcon className="h-5 w-5"/>} isActive={currentView === 'invoices'} onClick={() => onNavigate('invoices')} />
             <NavItem label="Clients" icon={<UsersIcon className="h-5 w-5"/>} isActive={currentView === 'clients'} onClick={() => onNavigate('clients')} />
             <NavItem label="Items" icon={<CubeIcon className="h-5 w-5"/>} isActive={currentView === 'items'} onClick={() => onNavigate('items')} />
             <NavItem label="Settings" icon={<CogIcon className="h-5 w-5"/>} isActive={currentView === 'settings'} onClick={() => onNavigate('settings')} />
          </nav>
          <div>
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