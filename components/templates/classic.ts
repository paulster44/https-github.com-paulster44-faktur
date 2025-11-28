
export const classicTemplateCss = `
/* Classic Template CSS */
.invoice-preview {
    font-family: 'Times New Roman', Times, serif;
    color: #000;
    background-color: #fff;
    padding: 4rem !important;
    line-height: 1.4;
}

.invoice-header {
    border-bottom: 1px solid #000 !important;
    padding-bottom: 2rem !important;
    margin-bottom: 2.5rem;
}

.invoice-header h1 {
    font-family: 'Georgia', serif;
    font-size: 2.25rem;
    color: #000;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.5rem;
}

.company-details h2 {
    font-family: 'Georgia', serif;
    font-size: 1.25rem;
    font-weight: bold;
    color: #000;
    margin-bottom: 0.5rem;
}

.client-details {
    margin-bottom: 3rem;
}

.client-details h3 {
    font-family: 'Arial', sans-serif;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    text-decoration: none;
    margin-bottom: 0.5rem;
    color: #444;
    border-bottom: 1px solid #ccc;
    display: inline-block;
    padding-bottom: 2px;
}

.invoice-items thead th {
    border-bottom: 2px solid #000;
    border-top: 2px solid #000;
    font-family: 'Arial', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.75rem;
    padding: 0.75rem 0.5rem;
    color: #000;
}

.invoice-items tbody td {
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid #e5e5e5;
    vertical-align: top;
}

/* Description Column */
.invoice-items tbody td:first-child {
    font-family: 'Georgia', serif;
    font-size: 0.9rem; /* Reduced from default */
    font-style: italic;
    color: #111;
}

/* Numbers */
.invoice-items tbody td:not(:first-child) {
    font-family: 'Arial', sans-serif;
    font-size: 0.85rem;
}

.summary-section {
    width: 100%;
    margin-top: 1rem;
}

.summary-row {
    font-family: 'Arial', sans-serif;
    font-size: 0.85rem;
    color: #333;
}

.total-row {
    border-top: 1px solid #000;
    border-bottom: 3px double #000;
    margin-top: 0.75rem;
    padding: 0.75rem 0;
}

.total-row span:first-child {
    font-family: 'Arial', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.9rem;
}

.total-row span:last-child {
    font-family: 'Georgia', serif;
    font-weight: bold;
    font-size: 1.5rem;
    color: #000;
}
`;