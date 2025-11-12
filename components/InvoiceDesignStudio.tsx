import React, { useState } from 'react';
import { generateInvoiceStyle } from '../services/geminiService';
import { toast } from './Toaster';
import Spinner from './Spinner';

const SampleInvoice: React.FC = () => (
    <div className="invoice-preview p-8 bg-white text-gray-900 font-sans text-sm border border-gray-200 rounded-lg min-w-[600px]">
        <header className="invoice-header flex justify-between items-start pb-6 border-b-2">
            <div>
                <h1 className="text-3xl font-bold uppercase">Invoice</h1>
                <p className="text-gray-500">#2024-001</p>
            </div>
            <div className="text-right">
                <h2 className="text-xl font-semibold">Your Company Inc.</h2>
                <p className="text-gray-500">123 Business Rd.</p>
                <p className="text-gray-500">Commerce City, USA 12345</p>
            </div>
        </header>

        <section className="client-details grid grid-cols-2 gap-4 py-6">
            <div>
                <h3 className="font-semibold text-gray-600 uppercase tracking-wider mb-2">Bill To</h3>
                <p className="font-bold">Innovate LLC</p>
                <p>123 Innovation Dr.</p>
                <p>Techville, CA 94043</p>
            </div>
            <div className="text-right">
                <p><span className="font-semibold">Issue Date:</span> July 15, 2024</p>
                <p><span className="font-semibold">Due Date:</span> August 14, 2024</p>
            </div>
        </section>

        <table className="invoice-items w-full text-left">
            <thead>
                <tr className="bg-gray-100">
                    <th className="p-3 font-semibold uppercase">Description</th>
                    <th className="p-3 font-semibold uppercase text-center">Qty</th>
                    <th className="p-3 font-semibold uppercase text-right">Unit Price</th>
                    <th className="p-3 font-semibold uppercase text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr className="border-b">
                    <td className="p-3">Web Design</td>
                    <td className="p-3 text-center">1</td>
                    <td className="p-3 text-right">$2500.00</td>
                    <td className="p-3 text-right">$2500.00</td>
                </tr>
                <tr className="border-b">
                    <td className="p-3">Consulting (5 hours)</td>
                    <td className="p-3 text-center">5</td>
                    <td className="p-3 text-right">$150.00</td>
                    <td className="p-3 text-right">$750.00</td>
                </tr>
            </tbody>
        </table>

        <footer className="invoice-footer flex justify-end pt-6">
            <div className="w-1/3">
                 <div className="flex justify-between py-2">
                    <span className="font-semibold">Subtotal:</span>
                    <span>$3250.00</span>
                </div>
                 <div className="flex justify-between py-2 border-b">
                    <span className="font-semibold">Tax (10%):</span>
                    <span>$325.00</span>
                </div>
                 <div className="flex justify-between py-3 font-bold text-lg">
                    <span className="uppercase">Total Due:</span>
                    <span>$3575.00</span>
                </div>
            </div>
        </footer>
        <div className="text-center text-xs text-gray-400 mt-8">
            <p>Thank you for your business!</p>
        </div>
    </div>
);


const InvoiceDesignStudio: React.FC = () => {
    const [prompt, setPrompt] = useState('A modern, minimalist design with a calm blue color scheme.');
    const [generatedCss, setGeneratedCss] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedCss('');
        try {
            const result = await generateInvoiceStyle(prompt);
            if (result && result.css) {
                setGeneratedCss(result.css);
                toast.success("Design generated successfully!");
            } else {
                toast.error("Failed to generate design. The response was empty.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while generating the design.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Describe your invoice style</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Use natural language to describe the look and feel you want. Be creative!</p>
                </div>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700"
                    placeholder="e.g., 'A professional design for a law firm, using serif fonts and a gold accent color.'"
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:bg-sky-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Spinner /> : 'Generate Design'}
                </button>
                 {generatedCss && (
                    <div className="mt-4">
                         <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Generated CSS</h3>
                        <pre className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-md text-xs overflow-x-auto">
                            <code>{generatedCss}</code>
                        </pre>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Live Preview</h3>
                <div className="bg-slate-200 dark:bg-slate-900/50 p-4 rounded-lg overflow-x-auto">
                    <style>{`#invoice-container > .invoice-preview { ${generatedCss} }`}</style>
                    <div id="invoice-container">
                        <SampleInvoice />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDesignStudio;