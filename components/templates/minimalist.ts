
export const minimalistTemplateCss = `
/* Minimalist Template CSS */
.invoice-preview {
    font-family: 'Courier New', Courier, monospace;
    color: #000;
    background-color: #fff;
    padding: 3rem !important;
}

.invoice-header {
    border-bottom: 4px solid #000 !important;
    padding-bottom: 2rem !important;
    margin-bottom: 3rem;
    align-items: flex-end;
}

.invoice-header h1 {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-weight: 900;
    font-size: 3rem;
    line-height: 1;
    letter-spacing: -0.05em;
    color: #000;
    margin: 0;
}

.company-details h2 {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 1rem;
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
    padding: 0.2rem 0.5rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    margin-bottom: 1rem;
}

.invoice-items table {
    width: 100%;
}

.invoice-items thead th {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    text-align: left;
    font-weight: 900;
    text-transform: uppercase;
    font-size: 0.85rem;
    border-bottom: 2px solid #000;
    padding-bottom: 1rem;
    color: #000;
}

.invoice-items tbody td {
    padding: 1.5rem 0;
    border-bottom: 1px solid #eee;
    font-size: 0.9rem;
}

.invoice-footer {
    border-top: 4px solid #000 !important;
    padding-top: 2rem !important;
}

.summary-section {
    width: 100%;
}

.total-row {
    margin-top: 1rem;
}

.total-row span:first-child {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-weight: 900;
    text-transform: uppercase;
    font-size: 1.25rem;
}

.total-row span:last-child {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-weight: 900;
    font-size: 2rem;
    color: #000;
}
`;
