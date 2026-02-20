"use client";

import { notFound, useRouter } from "next/navigation";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, User, Home, Calendar, FileText, Layers } from "lucide-react";
import { useData, SectorId } from "@/lib/data-context";

interface PageProps {
    params: Promise<{ sector: string }>;
}

export default function ValuationPage({ params }: PageProps) {
    const { sector } = use(params);
    const { sectors, templates, addValuation } = useData();
    const router = useRouter();

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        clientName: "",
        propertyAddress: "",
        valuationAmount: "",
        valuationDate: new Date().toISOString().split('T')[0],
        notes: "",
        dynamicData: {} as Record<string, string>
    });

    const currentSector = sectors.find((s) => s.id === sector);
    if (!currentSector) {
        notFound();
    }

    const template = templates[sector as SectorId];

    // Only use fields if they exist in the current template
    const dynamicFields = template?.fields || [];

    // Remove any <form> tags from the template code to prevent nesting issues
    const rawCode = template?.code || "";
    const htmlContent = rawCode.replace(/<\/?form[^>]*>/gi, "");

    // Inject JS from the HTML content
    useEffect(() => {
        if (!htmlContent) return;

        // Create a temporary container to parse the HTML and find scripts
        const container = document.createElement('div');
        container.innerHTML = htmlContent;
        const scripts = container.querySelectorAll('script');

        // Execute each script
        const cleanupFns: (() => void)[] = [];

        scripts.forEach(script => {
            try {
                if (script.src) {
                    // External script
                    const newScript = document.createElement('script');
                    newScript.src = script.src;
                    newScript.async = true;
                    document.body.appendChild(newScript);
                    cleanupFns.push(() => {
                        if (document.body.contains(newScript)) {
                            document.body.removeChild(newScript);
                        }
                    });
                } else {
                    // Inline script
                    // We wrap in a setImmediate/timeout to allow DOM to render first
                    const timer = setTimeout(() => {
                        try {
                            // eslint-disable-next-line no-new-func
                            const fn = new Function(script.textContent || "");
                            fn();
                        } catch (err) {
                            console.error("Error executing inline template script:", err);
                        }
                    }, 50);
                    cleanupFns.push(() => clearTimeout(timer));
                }
            } catch (err) {
                console.error("Error processing template script:", err);
            }
        });

        // Debugging inputs missing names
        setTimeout(() => {
            const inputs = container.querySelectorAll('input, select, textarea');
            inputs.forEach(el => {
                const input = el as HTMLElement;
                if (!input.getAttribute('name')) {
                    console.warn("Input element missing 'name' attribute:", input);
                    input.style.border = "2px solid red";
                    input.title = "Warning: Missing 'name' attribute. Data won't save.";
                }
            });
        }, 500);

        return () => {
            cleanupFns.forEach(fn => fn());
        };
    }, [htmlContent, sector]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (dynamicFields.includes(name)) {
            setFormData(prev => ({
                ...prev,
                dynamicData: {
                    ...prev.dynamicData,
                    [name]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Capture dynamic data from the form directly for HTML templates
        const form = new FormData(e.currentTarget);
        const entries = Array.from(form.entries());
        console.log("Form Submission Entries:", entries); // Debug logging

        // Dynamic data
        let capturedDynamicData = { ...formData.dynamicData };
        if (htmlContent) {
            for (const [key, value] of entries) {
                // Skip standard fields that are handled separately
                if (!['clientName', 'propertyAddress', 'valuationAmount', 'valuationDate', 'notes'].includes(key)) {
                    capturedDynamicData[key] = value.toString();
                }
            }
        }

        // Standard fields processing
        const clientName = htmlContent ? (form.get('clientName')?.toString() || "") : formData.clientName;
        const propertyAddress = htmlContent ? (form.get('propertyAddress')?.toString() || "") : formData.propertyAddress;
        const valuationAmountStr = htmlContent ? (form.get('valuationAmount')?.toString() || "") : formData.valuationAmount;
        const valuationDate = htmlContent ? (form.get('valuationDate')?.toString() || "") : formData.valuationDate;
        const notes = htmlContent ? (form.get('notes')?.toString() || "") : formData.notes;

        if (!clientName || !propertyAddress || !valuationAmountStr) {
            alert("Please include standard fields (clientName, propertyAddress, valuationAmount) in your template.");
            return;
        }

        setSubmitting(true);

        setTimeout(() => {
            addValuation({
                sectorId: sector as SectorId,
                clientName: clientName,
                propertyAddress: propertyAddress,
                valuationAmount: parseFloat(valuationAmountStr),
                valuationDate: valuationDate || new Date().toISOString().split('T')[0],
                notes: notes,
                dynamicData: capturedDynamicData
            });
            setSubmitting(false);
            setSubmitted(true);
        }, 1000);
    };

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <div className="mb-8">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 mb-4 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <Layers className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                            {currentSector.name}
                        </h1>
                        <p className="text-sm text-gray-500">
                            New Valuation Report
                        </p>
                    </div>
                </div>
            </div>

            {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Section 1: Client & Property */}
                    {!htmlContent && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                                <h3 className="text-base font-semibold leading-6 text-gray-900 flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    Client & Property Details
                                </h3>
                            </div>
                            <div className="p-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="col-span-2">
                                    <label htmlFor="clientName" className="block text-sm font-medium leading-6 text-gray-900">
                                        Client / Reference Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            name="clientName"
                                            id="clientName"
                                            required
                                            className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow"
                                            placeholder="e.g. John Doe Property"
                                            value={formData.clientName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <label htmlFor="propertyAddress" className="block text-sm font-medium leading-6 text-gray-900">
                                        Property Address <span className="text-red-500">*</span>
                                    </label>
                                    <div className="mt-2">
                                        <textarea
                                            name="propertyAddress"
                                            id="propertyAddress"
                                            rows={3}
                                            required
                                            className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow"
                                            placeholder="Full address of the property"
                                            value={formData.propertyAddress}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section 2: Valuation Details */}
                    {!htmlContent && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                                <h3 className="text-base font-semibold leading-6 text-gray-900 flex items-center gap-2">
                                    <Home className="h-4 w-4 text-gray-500" />
                                    Valuation Details
                                </h3>
                            </div>
                            <div className="p-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label htmlFor="valuationAmount" className="block text-sm font-medium leading-6 text-gray-900">
                                        Valuation Amount ($) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="mt-2 relative rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-gray-500 sm:text-sm">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="valuationAmount"
                                            id="valuationAmount"
                                            min="0"
                                            step="0.01"
                                            required
                                            className="block w-full rounded-md border-0 py-2 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow"
                                            placeholder="0.00"
                                            value={formData.valuationAmount}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="valuationDate" className="block text-sm font-medium leading-6 text-gray-900">
                                        Valuation Date <span className="text-red-500">*</span>
                                    </label>
                                    <div className="mt-2 relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="date"
                                            name="valuationDate"
                                            id="valuationDate"
                                            required
                                            className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow"
                                            value={formData.valuationDate}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <label htmlFor="notes" className="block text-sm font-medium leading-6 text-gray-900">
                                        Additional Notes
                                    </label>
                                    <div className="mt-2">
                                        <textarea
                                            name="notes"
                                            id="notes"
                                            rows={3}
                                            className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow"
                                            placeholder="Any additional details..."
                                            value={formData.notes}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section 3: Dynamic Template Data */}
                    {htmlContent ? (
                        <div className="bg-white rounded-xl shadow-sm ring-1 ring-indigo-900/5 overflow-hidden">
                            <div className="border-b border-indigo-100 bg-indigo-50/50 px-6 py-4">
                                <h3 className="text-base font-semibold leading-6 text-indigo-900 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-indigo-500" />
                                    {currentSector.name} Report Form
                                </h3>
                            </div>
                            <div className="p-6">
                                {/* Fallback CSS to valid inputs even without template styles */}
                                <style>{`
                                    .dynamic-template-container input:not([type="checkbox"]):not([type="radio"]),
                                    .dynamic-template-container select,
                                    .dynamic-template-container textarea {
                                        display: block;
                                        width: 100%;
                                        border-radius: 0.5rem;
                                        border: 1px solid #9ca3af;
                                        background-color: #f9fafb;
                                        padding: 1rem;
                                        font-size: 1.1rem;
                                        color: #111827;
                                        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                                    }
                                    .dynamic-template-container input:focus,
                                    .dynamic-template-container select:focus,
                                    .dynamic-template-container textarea:focus {
                                        border-color: #4f46e5;
                                        background-color: #ffffff;
                                        outline: 2px solid transparent;
                                        outline-offset: 2px;
                                        box-shadow: 0 0 0 4px #e0e7ff;
                                    }
                                    .dynamic-template-container label {
                                        display: block;
                                        font-size: 1.1rem;
                                        font-weight: 600;
                                        color: #111827;
                                        margin-bottom: 0.5rem;
                                    }
                                    .dynamic-template-container .form-group {
                                        margin-bottom: 2rem;
                                    }
                                `}</style>
                                <div
                                    className="dynamic-template-container space-y-4 pointer-events-auto"
                                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                                />
                            </div>
                        </div>
                    ) : (
                        template && (
                            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <FileText className="h-5 w-5 text-blue-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800">No Custom Template Active</h3>
                                        <div className="mt-2 text-sm text-blue-700">
                                            <p>
                                                Using standard valuation form. Upload a template in Admin settings to enable sector-specific fields.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                    <div className="flex items-center justify-end gap-x-4 border-t border-gray-900/10 pt-6">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="text-sm font-semibold leading-6 text-gray-900 px-4 py-2 hover:bg-gray-50 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-95"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                    Saving...
                                </>
                            ) : (
                                "Submit Valuation"
                            )}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl shadow-sm border border-gray-200">
                    <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Valuation Submitted!</h3>
                    <p className="text-gray-500 mt-2 max-w-md mx-auto">
                        The valuation for <strong>{formData.clientName}</strong> has been successfully recorded and is now available in your dashboard.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                        <button
                            onClick={() => {
                                setSubmitted(false);
                                setFormData({
                                    clientName: "",
                                    propertyAddress: "",
                                    valuationAmount: "",
                                    valuationDate: new Date().toISOString().split('T')[0],
                                    notes: "",
                                    dynamicData: {}
                                });
                            }}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                            Add Another
                        </button>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
