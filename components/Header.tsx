
import React from 'react';
import { MenuIcon, DocumentTextIcon } from './icons';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
      <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
             <button 
                onClick={onMenuClick}
                className="p-2 -ml-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none"
            >
                <MenuIcon className="h-6 w-6" />
            </button>
            <div className="ml-3 flex items-center">
                 <div className="bg-blue-600 p-1 rounded-md mr-2">
                    <DocumentTextIcon className="h-4 w-4 text-white" />
                 </div>
                 <span className="font-bold text-lg text-slate-900 dark:text-white">Faktur</span>
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600">
              JD
          </div>
      </div>
    </header>
  );
};

export default Header;
