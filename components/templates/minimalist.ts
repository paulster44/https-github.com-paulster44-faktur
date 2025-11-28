
export const minimalistTemplateCss = `
/* Minimalist Template CSS */
.invoice-preview {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #000;
    background-color: #fff;
    padding: 3rem !important;
    line-height: 1.3;
}

.invoice-header {
    border-bottom: 4px solid #000 !important;
    padding-bottom: 2rem !important;
    margin-bottom: 3rem;
    align-items: flex-end;
}

.invoice-header h1 {
    font-weight: 900;
    font-size: 3rem;
    line-height: 0.9;
    letter-spacing: -0.05em;
    color: #000;
    margin: 0;
}

.company-details h2 {
    font-weight: 700;
    text-transform: uppercase;
    font-size: 1rem;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
}

.client-details {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4rem;
}

.client-details h3 {
    background: #000;
    color: #fff;
    display: inline-block;
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 1rem;
}

.invoice-items table {
    width: 100%;
}

.invoice-items thead th {
    text-align: left;
    font-weight: 900;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.05em;
    border-bottom: 4px solid #000;
    padding-bottom: 1rem;
    color: #000;
}

.invoice-items tbody td {
    padding: 1rem 0;
    border-bottom: 1px solid #e5e5e5;
    vertical-align: top;
}

/* Description - Mono font for technical look */
.invoice-items tbody td:first-child {
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.8rem; /* Small and slick */
    letter-spacing: -0.02em;
    font-weight: 600;
    padding-right: 1rem;
}

.invoice-items tbody td:not(:first-child) {
    font-weight: 500;
    font-size: 0.9rem;
}

.invoice-footer {
    border-top: 4px solid #000 !important;
    padding-top: 2rem !important;
    margin-top: 2rem;
}

.summary-section {
    width: 100%;
}

.summary-row {
    font-size: 0.85rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.total-row {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #000;
}

.total-row span:first-child {
    font-weight: 900;
    text-transform: uppercase;
    font-size: 1.25rem;
    letter-spacing: -0.02em;
}

.total-row span:last-child {
    font-weight: 900;
    font-size: 2.5rem;
    color: #000;
    line-height: 1;
}
`;