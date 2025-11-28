
export const modernTemplateCss = `
/* Modern Template CSS */
.invoice-preview {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #0f172a; /* slate-900 for high contrast */
    background-color: #fff;
    padding: 3rem !important;
    position: relative;
    overflow: hidden;
    line-height: 1.5;
}

/* Accent top bar */
.invoice-preview::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #0ea5e9, #2563eb);
}

.invoice-header {
    margin-bottom: 3rem;
    border-bottom: 0 !important;
}

.invoice-header h1 {
    color: #0f172a;
    font-size: 2.25rem;
    font-weight: 800;
    letter-spacing: -0.025em;
    margin-bottom: 0.5rem;
}

.company-details h2 {
    font-size: 1.125rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 0.25rem;
}

.client-details {
    background-color: #f8fafc; /* slate-50 */
    border-radius: 0.75rem;
    padding: 2rem;
    margin-bottom: 2.5rem;
    border: 1px solid #e2e8f0;
}

.invoice-items {
    margin-bottom: 2rem;
    width: 100%;
}

.invoice-items thead th {
    background-color: transparent;
    color: #64748b; /* slate-500 */
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 0.05em;
    padding: 0.75rem 1rem;
    border-bottom: 2px solid #e2e8f0;
}

.invoice-items tbody td {
    padding: 1rem;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: top;
}

/* Description Column - Slick look */
.invoice-items tbody td:first-child {
    color: #1e293b; /* slate-800 */
    font-size: 0.875rem; /* Reduced size */
    font-weight: 500;
    width: 45%;
}

/* Number Columns - Tabular alignment */
.invoice-items tbody td:not(:first-child) {
    color: #334155; /* slate-700 */
    font-size: 0.9rem;
    font-variant-numeric: tabular-nums;
}

.invoice-items tbody tr:last-child td {
    border-bottom: none;
}

.invoice-footer {
    border-top: none !important;
}

.summary-section {
    background-color: #f8fafc;
    padding: 1.5rem;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
}

.summary-row {
    color: #475569;
    font-size: 0.875rem;
    font-weight: 500;
}

.total-row {
    border-top: 2px solid #e2e8f0;
    margin-top: 1rem;
    padding-top: 1rem;
    align-items: center;
}

.total-row span:first-child {
    color: #0f172a;
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.025em;
}

.total-row span:last-child {
    color: #0284c7; /* sky-600 */
    font-size: 1.5rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
}
`;