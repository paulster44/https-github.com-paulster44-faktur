
import React, { useState } from 'react';
import { type CompanyProfile, type Address } from '../types';
import { DocumentTextIcon } from './icons';
import { useLanguage } from '../i18n/LanguageProvider';

interface CompanySetupProps {
    onSave: (profile: CompanyProfile) => void;
}

const emptyProfile: CompanyProfile = {
    name: '',
    email: '',
    phone: '',
    address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
    },
    logo: '',
    invoiceNumberPrefix: 'INV-',
    nextInvoiceNumber: 1,
    taxType: 'GST/HST Number',
    taxNumber: '',
    template: 'modern',
};

const CompanySetup: React.FC<CompanySetupProps> = ({ onSave }) => {
    const [profile, setProfile] = useState<CompanyProfile>(emptyProfile);
    const { t } = useLanguage();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1] as keyof Address;
            setProfile(prev => ({
                ...prev,
                address: { ...prev.address, [addressField]: value },
            }));
        } else if (name === 'nextInvoiceNumber') {
            setProfile(prev => ({...prev, [name]: parseInt(value, 10) || 1 }));
        }
        else {
            setProfile(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile.name || !profile.email || !profile.address.street) {
            alert(t('setup.fillRequiredFieldsAlert'));
            return;
        }
        onSave(profile);
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen">
            <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8">
                <div className="text-center mb-8">
                    <DocumentTextIcon className="h-12 w-12 text-sky-500 mx-auto" />
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white mt-4">{t('setup.welcome')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">{t('setup.description')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Company Details */}
                    <div>
                        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">{t('setup.companyDetails')}</h4>
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.companyName')}</label>
                                <input type="text" name="name" id="name" value={profile.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-400 dark:border-slate-500 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.email')}</label>
                                    <input type="email" name="email" id="email" value={profile.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-400 dark:border-slate-500 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.phoneOptional')}</label>
                                    <input type="tel" name="phone" id="phone" value={profile.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-400 dark:border-slate-500 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Company Address */}
                    <div className="pt-2">
                         <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">{t('setup.companyAddress')}</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.street')}</label>
                                <input type="text" name="address.street" value={profile.address.street} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-400 dark:border-slate-500 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.city')}</label>
                                <input type="text" name="address.city" value={profile.address.city} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-400 dark:border-slate-500 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.stateProvince')}</label>
                                <input type="text" name="address.state" value={profile.address.state} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-400 dark:border-slate-500 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.postalCode')}</label>
                                <input type="text" name="address.postalCode" value={profile.address.postalCode} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-400 dark:border-slate-500 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.country')}</label>
                                <input type="text" name="address.country" value={profile.address.country} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-400 dark:border-slate-500 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                         </div>
                    </div>
                    
                    {/* Invoice Numbering */}
                    <div className="pt-2">
                         <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">{t('setup.invoiceNumbering')}</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('setup.prefix')}</label>
                                <input type="text" name="invoiceNumberPrefix" value={profile.invoiceNumberPrefix} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-400 dark:border-slate-500 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('setup.startNumber')}</label>
                                <input type="number" name="nextInvoiceNumber" value={profile.nextInvoiceNumber} onChange={handleChange} min="1" required className="mt-1 block w-full rounded-md border-slate-400 dark:border-slate-500 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                         </div>
                    </div>
                    
                    {/* Tax Information */}
                    <div className="pt-2">
                         <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">{t('setup.taxInfo')}</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('setup.taxType')}</label>
                                <input type="text" name="taxType" value={profile.taxType} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-400 dark:border-slate-500 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('setup.taxId')}</label>
                                <input type="text" name="taxNumber" value={profile.taxNumber} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-400 dark:border-slate-500 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                         </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-sky-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
                            {t('setup.saveAndContinue')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompanySetup;
