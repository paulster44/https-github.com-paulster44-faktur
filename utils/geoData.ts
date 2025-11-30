
interface RegionData {
    states: string[];
    taxType: string;
    taxLabel: string; // e.g. "Tax ID" vs "VAT Number"
}

export const geoData: Record<string, RegionData> = {
    "United States": {
        states: [
            "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", 
            "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", 
            "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", 
            "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", 
            "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
        ],
        taxType: "EIN",
        taxLabel: "EIN / Tax ID"
    },
    "Canada": {
        states: [
            "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Northwest Territories", "Nunavut", "Yukon"
        ],
        taxType: "GST/HST Number",
        taxLabel: "GST/HST Number"
    },
    "United Kingdom": {
        states: ["England", "Scotland", "Wales", "Northern Ireland"],
        taxType: "VAT Number",
        taxLabel: "VAT Number"
    },
    "Australia": {
        states: ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania", "Australian Capital Territory", "Northern Territory"],
        taxType: "ABN",
        taxLabel: "ABN"
    },
    "Germany": {
        states: ["Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hesse", "Lower Saxony", "Mecklenburg-Vorpommern", "North Rhine-Westphalia", "Rhineland-Palatinate", "Saarland", "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia"],
        taxType: "Steuernummer",
        taxLabel: "Steuernummer / VAT"
    },
    "France": {
        states: [],
        taxType: "Numéro TVA",
        taxLabel: "Numéro TVA"
    },
    "Italy": {
        states: [],
        taxType: "Partita IVA",
        taxLabel: "Partita IVA"
    },
    "Spain": {
        states: [],
        taxType: "NIF/IVA",
        taxLabel: "NIF / IVA"
    },
    "India": {
        states: ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"],
        taxType: "GSTIN",
        taxLabel: "GSTIN"
    }
};

export const getCountries = () => Object.keys(geoData).sort();

export const getStatesForCountry = (country: string) => {
    return geoData[country]?.states || [];
};

export const getTaxTypeForRegion = (country: string, state?: string): string => {
    if (country === "Canada" && state === "Quebec") return "GST/QST Number";
    return geoData[country]?.taxType || "Tax ID";
};

export const getSuggestedTaxes = (country: string, state?: string): { name: string, rate: number }[] => {
    if (!country) return [];

    if (country === "Canada") {
        switch (state) {
            case "Alberta":
            case "Northwest Territories":
            case "Nunavut":
            case "Yukon":
                return [{ name: "GST", rate: 5 }];
            case "British Columbia":
                return [{ name: "GST", rate: 5 }, { name: "PST", rate: 7 }];
            case "Manitoba":
                return [{ name: "GST", rate: 5 }, { name: "PST", rate: 7 }];
            case "Saskatchewan":
                return [{ name: "GST", rate: 5 }, { name: "PST", rate: 6 }];
            case "Quebec":
                return [{ name: "GST", rate: 5 }, { name: "QST", rate: 9.975 }];
            case "Ontario":
                return [{ name: "HST", rate: 13 }];
            case "New Brunswick":
            case "Newfoundland and Labrador":
            case "Nova Scotia":
            case "Prince Edward Island":
                return [{ name: "HST", rate: 15 }];
            default:
                return [{ name: "GST", rate: 5 }];
        }
    }

    if (country === "United Kingdom") return [{ name: "VAT", rate: 20 }];
    if (country === "Australia") return [{ name: "GST", rate: 10 }];
    if (country === "Germany" || country === "France") return [{ name: "VAT", rate: 20 }];
    if (country === "Italy") return [{ name: "IVA", rate: 22 }];
    if (country === "Spain") return [{ name: "IVA", rate: 21 }];
    
    // United States (Sales Tax varies wildly by zip code, not just state, so we default to empty or generic)
    if (country === "United States") {
        return [{ name: "Sales Tax", rate: 0 }];
    }

    return []; 
};
