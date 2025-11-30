
import React, { useState, useEffect, useRef } from 'react';

interface AutocompleteProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    required?: boolean;
    name?: string;
    className?: string;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ 
    label, 
    value, 
    onChange, 
    options, 
    placeholder, 
    required, 
    className 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!value) {
            setFilteredOptions(options);
            return;
        }
        const filtered = options.filter(opt => 
            opt.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredOptions(filtered);
    }, [value, options]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelect = (option: string) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                required={required}
                className="block w-full rounded-md border-slate-400 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700"
                autoComplete="off"
            />
            {isOpen && filteredOptions.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-slate-200 dark:border-slate-700">
                    {filteredOptions.map((option, index) => (
                        <li
                            key={index}
                            className="relative cursor-default select-none py-2 pl-3 pr-9 text-slate-900 dark:text-slate-200 hover:bg-sky-100 dark:hover:bg-slate-700 cursor-pointer"
                            onClick={() => handleSelect(option)}
                        >
                            <span className="block truncate">{option}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Autocomplete;
