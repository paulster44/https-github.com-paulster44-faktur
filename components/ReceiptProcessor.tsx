
import React from 'react';
import Spinner from './Spinner';
import { useLanguage } from '../i18n/LanguageProvider';

const ReceiptProcessor: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col justify-center items-center text-white">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-full shadow-lg mb-6">
        <Spinner />
      </div>
      <h3 className="text-2xl font-bold mb-2">{t('expenses.analyzing')}</h3>
      <p className="text-slate-300">{t('expenses.aiProcessing')}</p>
    </div>
  );
};

export default ReceiptProcessor;
