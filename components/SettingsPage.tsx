import React, { useState } from 'react';
import { type CompanyProfile, type Address } from '../types';
import { useLanguage } from '../i18n/LanguageProvider';

interface SettingsPageProps {
    companyProfile: CompanyProfile;
    onSave: (profile: CompanyProfile) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ companyProfile, onSave }) => {
    const [profile, setProfile] = useState<CompanyProfile>(companyProfile);
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
        } else {
            setProfile(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({ ...prev, logo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(profile);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg">
            <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold">{t('header.settings')}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.description')}</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="p-4 md:p-6 space-y-8">
                    {/* Logo Section */}
                    <div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">{t('settings.companyLogo')}</h3>
                         <div className="mt-2 flex items-center space-x-6">
                            <div className="shrink-0">
                                {profile.logo ? (
                                    <img className="h-20 w-20 object-contain rounded-md bg-slate-100 dark:bg-slate-700 p-1" src={profile.logo} alt={t('settings.logoAlt')} />
                                ) : (
                                    <div className="h-20 w-20 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                        <span className="text-xs text-slate-500">{t('settings.noLogo')}</span>
                                    </div>
                                )}
                            </div>
                            <label className="block">
                                <span className="sr-only">{t('settings.chooseLogo')}</span>
                                <input type="file" accept="image/png, image/jpeg" onChange={handleLogoUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"/>
                            </label>
                        </div>
                    </div>

                    {/* Company Details Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">{t('setup.companyDetails')}</h3>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.companyName')}</label>
                            <input type="text" name="name" id="name" value={profile.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.email')}</label>
                                <input type="email" name="email" id="email" value={profile.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.phoneOptional')}</label>
                                <input type="tel" name="phone" id="phone" value={profile.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Address Section */}
                    <div className="pt-2 space-y-4">
                         <h3 className="text-lg font-medium text-slate-900 dark:text-white">{t('setup.companyAddress')}</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.street')}</label>
                                <input type="text" name="address.street" value={profile.address.street} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.city')}</label>
                                <input type="text" name="address.city" value={profile.address.city} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.stateProvince')}</label>
                                <input type="text" name="address.state" value={profile.address.state} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.postalCode')}</label>
                                <input type="text" name="address.postalCode" value={profile.address.postalCode} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.country')}</label>
                                <input type="text" name="address.country" value={profile.address.country} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                         </div>
                    </div>
                    
                    {/* Invoice Numbering */}
                    <div className="pt-2 space-y-4">
                         <h3 className="text-lg font-medium text-slate-900 dark:text-white">{t('setup.invoiceNumbering')}</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('setup.prefix')}</label>
                                <input type="text" name="invoiceNumberPrefix" value={profile.invoiceNumberPrefix} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.nextNumber')}</label>
                                <input type="number" name="nextInvoiceNumber" value={profile.nextInvoiceNumber} onChange={handleChange} min="1" required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                         </div>
                    </div>
                    
                    {/* Tax Information */}
                    <div className="pt-2 space-y-4">
                         <h3 className="text-lg font-medium text-slate-900 dark:text-white">{t('setup.taxInfo')}</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('setup.taxType')}</label>
                                <input type="text" name="taxType" value={profile.taxType} onChange={handleChange} placeholder={t('setup.taxTypePlaceholder')} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('setup.taxId')}</label>
                                <input type="text" name="taxNumber" value={profile.taxNumber} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700" />
                            </div>
                         </div>
                    </div>
                </div>
                 <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end rounded-b-lg">
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">{t('settings.saveChanges')}</button>
                </div>
            </form>
        </div>
    );
};

export default SettingsPage;