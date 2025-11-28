
import React, { useRef } from 'react';
import { CameraIcon, UploadIcon } from './icons';
import { useLanguage } from '../i18n/LanguageProvider';

interface ReceiptUploaderProps {
  onUpload: (file: File) => void;
  onCancel: () => void;
}

const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ onUpload, onCancel }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4 p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">{t('expenses.scanReceipt')}</h3>
        <p className="text-sm text-slate-500 mb-6">{t('expenses.uploadDescription')}</p>
        
        <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
        />

        <div className="grid grid-cols-1 gap-4">
             <button
                onClick={triggerFileInput}
                className="flex items-center justify-center w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
                <div className="text-center">
                    <UploadIcon className="mx-auto h-12 w-12 text-slate-400" />
                    <span className="mt-2 block text-sm font-medium text-slate-900 dark:text-white">{t('expenses.chooseFile')}</span>
                </div>
            </button>
            <button
                onClick={() => {
                   // This mimics opening camera on mobile devices if supported by the file input with capture attribute, 
                   // but here we just trigger the file input which usually offers camera on mobile.
                   triggerFileInput();
                }}
                className="flex items-center justify-center w-full p-4 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
                <CameraIcon className="mr-2 h-6 w-6" />
                <span className="font-bold">{t('expenses.takePhoto')}</span>
            </button>
        </div>

        <button onClick={onCancel} className="mt-6 w-full py-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
            {t('common.cancel')}
        </button>
      </div>
    </div>
  );
};

export default ReceiptUploader;
