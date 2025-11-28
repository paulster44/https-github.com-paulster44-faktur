
export const classicTemplateCss = `
/* Classic Template CSS */
.invoice-preview {
    font-family: 'Times New Roman', Times, serif;
    color: #111;
    background-color: #fff;
    padding: 4rem !important;
}

.invoice-header {
    border-bottom: 3px double #000 !important;
    padding-bottom: 2rem !important;
    margin-bottom: 2rem;
}

.invoice-header h1 {
    font-family: 'Georgia', serif;
    font-size: 2.5rem;
    color: #000;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.company-details h2 {
    font-family: 'Georgia', serif;
    font-size: 1.5rem;
    font-weight: bold;
    color: #000;
    margin-bottom: 0.25rem;
}

.client-details {
    margin-bottom: 3rem;
}

.client-details h3 {
    font-family: 'Arial', sans-serif; /* Contrast font for labels */
    font-size: 0.7rem;
    text-decoration: underline;
    margin-bottom: 0.5rem;
    color: #333;
}

.invoice-items thead th {
    border-bottom: 1px solid #000;
    border-top: 1px solid #000;
    font-family: 'Arial', sans-serif;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 0.8rem;
    padding: 0.75rem 0.5rem;
    color: #000;
}

.invoice-items tbody td {
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid #ccc;
}

.summary-section {
    width: 100%;
    margin-top: 1rem;
}

.summary-row {
    font-family: 'Arial', sans-serif;
    font-size: 0.9rem;
    color: #333;
}

.total-row {
    border-top: 3px double #000;
    border-bottom: 3px double #000;
    margin-top: 0.5rem;
    padding: 0.75rem 0;
}

.total-row span:last-child {
    font-family: 'Georgia', serif;
    font-weight: bold;
    font-size: 1.5rem;
    color: #000;
}
`;
