/**
 * Utility for merging valuation data into HTML templates
 */

export interface ReportData {
    clientName: string;
    propertyAddress: string;
    valuationAmount: number;
    valuationDate: string;
    notes?: string;
    dynamicData?: Record<string, string>;
}

/**
 * Replaces placeholders in the format {{fieldName}} with values from the report data.
 */
export function mergeDataWithTemplate(templateHtml: string, data: ReportData, isReportView: boolean = true): string {
    let merged = templateHtml;

    // Standard {{}} fields
    merged = merged.replace(/{{clientName}}/g, data.clientName || "");
    merged = merged.replace(/{{propertyAddress}}/g, data.propertyAddress || "");
    merged = merged.replace(/{{valuationAmount}}/g, data.valuationAmount.toLocaleString() || "0");
    merged = merged.replace(/{{valuationDate}}/g, data.valuationDate || "");
    merged = merged.replace(/{{notes}}/g, data.notes || "");

    // Dynamic {{}} fields
    if (data.dynamicData) {
        Object.entries(data.dynamicData).forEach(([key, value]) => {
            // Escape key for regex to prevent breakage if key has special chars
            const safeKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`{{${safeKey}}}`, "g");
            merged = merged.replace(regex, value || "");
        });
    }

    // Advanced: Since we use Word-generated HTML forms, we need to inject the values directly
    // into the HTML <input>, <select>, and <textarea> nodes themselves.
    if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(merged, 'text/html');

        // Step 1: Ensure EVERY input, select, and textarea has a name or id
        // This allows us to capture data even from "blind" Word templates
        const allInputsInDoc = doc.querySelectorAll('input, select, textarea');
        allInputsInDoc.forEach((el, index) => {
            const input = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
            if (!input.name && !input.id) {
                input.id = `auto_field_${index}`;
            }
        });

        // Map all potential data fields
        const allData: Record<string, string> = {
            clientName: data.clientName || "",
            propertyAddress: data.propertyAddress || "",
            valuationAmount: data.valuationAmount.toString(),
            valuationDate: data.valuationDate || "",
            notes: data.notes || "",
            ...data.dynamicData
        };

        // For each data point, try to find a matching named or id'd input in the HTML template
        Object.entries(allData).forEach(([key, value]) => {
            // Priority 1: name attribute (standard)
            // Priority 2: id attribute (fallback for Word templates)
            const inputs = doc.querySelectorAll(`[name="${key}"], #${key}`);
            inputs.forEach(el => {
                const input = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
                if (input.tagName === 'INPUT') {
                    const type = (input as HTMLInputElement).type;
                    if (type === 'checkbox' || type === 'radio') {
                        if ((input as HTMLInputElement).value === value) {
                            input.setAttribute('checked', 'checked');
                        }
                    } else {
                        input.setAttribute('value', value);
                    }
                } else if (input.tagName === 'TEXTAREA') {
                    input.innerHTML = value; // innerHTML to preserve line breaks
                } else if (input.tagName === 'SELECT') {
                    const opts = input.querySelectorAll('option');
                    opts.forEach(opt => {
                        if (opt.value === value || opt.textContent === value) {
                            opt.setAttribute('selected', 'selected');
                        }
                    });
                }
            });
        });

        // Optional: lock down the fields for the report view
        if (isReportView) {
            const allInputs = doc.querySelectorAll('input, textarea, select');
            allInputs.forEach(el => {
                el.setAttribute('readonly', 'readonly');
                // Checkboxes/radios and select need disabled to prevent interaction
                if (el.tagName === 'SELECT' || (el as HTMLInputElement).type === 'checkbox' || (el as HTMLInputElement).type === 'radio') {
                    el.setAttribute('disabled', 'disabled');
                }
            });
        }

        // Extract just the inner body HTML since DOMParser wrapped it in <html><body>
        merged = doc.body.innerHTML;
    }

    return merged;
}

/**
 * Triggers a download of the provided HTML content as a Word document (.doc)
 * This uses the simple MIME-type trick which is compatible with MS Word.
 */
export function downloadAsWord(htmlContent: string, fileName: string) {
    let processHtml = htmlContent;

    // Convert form elements to plain text spans for better Word compatibility
    if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        const formElements = doc.querySelectorAll('input, textarea, select');
        formElements.forEach(el => {
            let value = '';

            if (el.tagName === 'INPUT') {
                const input = el as HTMLInputElement;
                if (input.type === 'checkbox' || input.type === 'radio') {
                    value = input.hasAttribute('checked') || input.checked ? '[X]' : '[ ]';
                } else {
                    value = input.getAttribute('value') || input.value || '';
                }
            } else if (el.tagName === 'TEXTAREA') {
                const textarea = el as HTMLTextAreaElement;
                value = textarea.innerHTML || textarea.value || '';
            } else if (el.tagName === 'SELECT') {
                const select = el as HTMLSelectElement;
                const selectedOpt = select.querySelector('option[selected]') as HTMLOptionElement;
                if (selectedOpt) {
                    value = selectedOpt.textContent || selectedOpt.value || '';
                } else if (select.options && select.options.length > 0 && select.selectedIndex >= 0) {
                    value = select.options[select.selectedIndex].textContent || '';
                }
            }

            const span = doc.createElement('span');
            span.style.fontWeight = 'bold';
            // Replace newlines with <br> tags for textareas
            span.innerHTML = value.replace(/\n/g, '<br/>');

            el.parentNode?.replaceChild(span, el);
        });

        processHtml = doc.body.innerHTML;
    }

    const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
        <meta charset='utf-8'>
        <title>Export</title>
        <style>
            ${REPORT_STYLES}
        </style>
    </head>
    <body>`;
    const footer = "</body></html>";
    const sourceHTML = header + processHtml + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${fileName}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
}

export const REPORT_STYLES = `
    .valuation-report-content {
        font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
        color: #1a1c21;
        background: white;
    }
    
    .valuation-report-content {
        line-height: 1.6;
    }

    .valuation-report-content input:not([type="checkbox"]):not([type="radio"]),
    .valuation-report-content select,
    .valuation-report-content textarea {
        display: block;
        width: 100%;
        border-radius: 0.5rem;
        border: 1px solid #d1d5db;
        background-color: #fdfdfd;
        padding: 0.75rem 1rem;
        font-size: 0.95rem;
        color: #111827;
        margin-bottom: 1rem;
        transition: all 0.2s;
    }

    /* Report View Specific: Make inputs look like text */
    .report-view-mode .valuation-report-content input, 
    .report-view-mode .valuation-report-content textarea, 
    .report-view-mode .valuation-report-content select {
        border-color: transparent !important;
        background-color: transparent !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        font-weight: 500;
        resize: none;
    }

    .valuation-report-content label {
        display: block;
        font-size: 0.75rem;
        font-weight: 700;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.5rem;
    }

    .valuation-report-content table {
        width: 100%;
        border-collapse: collapse;
        margin: 2rem 0;
        border: 2px solid #111827;
    }

    .valuation-report-content table th,
    .valuation-report-content table td {
        border: 1px solid #111827;
        padding: 12px;
        text-align: left;
    }

    .valuation-report-content table th {
        background-color: #f3f4f6;
        font-weight: 700;
        text-transform: uppercase;
        font-size: 0.75rem;
    }

    .valuation-report-content .form-group {
        margin-bottom: 1.5rem;
    }

    /* Print Optimizations */
    @media print {
        .valuation-report-content {
            width: 100% !important;
        }
        input, textarea, select {
            border: none !important;
            box-shadow: none !important;
        }
    }

    /* Hide template-provided submit buttons in form view to avoid duplication */
    .valuation-report-content button,
    .valuation-report-content input[type="submit"],
    .valuation-report-content input[type="button"],
    .valuation-report-content .btn {
        display: none !important;
    }
`;
