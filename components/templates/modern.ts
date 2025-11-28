
export const modernTemplateCss = `
/* Modern Template CSS */
.invoice-preview {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #1e293b; /* slate-800 */
    background-color: #fff;
    padding: 3rem !important; /* Force padding */
    position: relative;
    overflow: hidden;
}

/* Accent top bar */
.invoice-preview::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #0ea5e9, #2563eb); /* Sky to Blue */
}

.invoice-header {
    margin-bottom: 3rem;
    border-bottom: 0 !important;
}

.invoice-header h1 {
    color: #0f172a; /* slate-900 */
    font-size: 2.25rem;
    letter-spacing: -0.025em;
    margin-bottom: 0.5rem;
}

.invoice-header .company-logo {
    margin-bottom: 1.5rem;
    max-height: 80px;
}

.company-details h2 {
    font-size: 1.25rem;
    color: #0f172a;
    margin-bottom: 0.5rem;
}

.client-details {
    background-color: #f8fafc; /* slate-50 */
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border: 1px solid #e2e8f0;
}

.invoice-items {
    margin-bottom: 2rem;
}

.invoice-items thead th {
    background-color: #f1f5f9; /* slate-100 */
    color: #475569; /* slate-600 */
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    padding: 1rem;
    border: none;
}

.invoice-items thead th:first-child {
    border-top-left-radius: 0.375rem;
    border-bottom-left-radius: 0.375rem;
}

.invoice-items thead th:last-child {
    border-top-right-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;
}

.invoice-items tbody td {
    padding: 1rem;
    border-bottom: 1px solid #f1f5f9;
    color: #334155; /* slate-700 */
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
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
}

.summary-row {
    color: #64748b;
    font-size: 0.9rem;
}

.total-row {
    border-top: 2px solid #e2e8f0;
    margin-top: 1rem;
    padding-top: 1rem;
    align-items: center;
}

.total-row span:first-child {
    color: #0f172a;
    font-size: 1.1rem;
}

.total-row span:last-child {
    color: #0284c7; /* sky-600 */
    font-size: 1.75rem;
}
`;
