"use client";

import { notFound, useRouter, useSearchParams } from "next/navigation";
import { use, useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, User, Home, Calendar, FileText, Layers } from "lucide-react";
import { useData, SectorId } from "@/lib/data-context";
import { REPORT_STYLES, mergeDataWithTemplate } from "@/lib/report-generator";

interface PageProps {
    params: Promise<{ sector: string }>;
}

export default function ValuationPage({ params }: PageProps) {
    const { sector } = use(params);
    const { sectors, templates, valuations, addValuation, updateValuation, refreshData } = useData();
    const router = useRouter();
    const searchParams = useSearchParams();
    const draftId = searchParams.get('draft');

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

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

    // Pre-populate data if resuming a draft
    useEffect(() => {
        if (draftId && valuations.length > 0) {
            const draft = valuations.find(v => v.id === draftId);
            if (draft && draft.status === "Pending" && draft.sectorId === sector) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setFormData({
                    clientName: draft.clientName,
                    propertyAddress: draft.propertyAddress,
                    valuationAmount: draft.valuationAmount ? draft.valuationAmount.toString() : "",
                    valuationDate: draft.valuationDate || new Date().toISOString().split('T')[0],
                    notes: draft.notes || "",
                    dynamicData: (draft.dynamicData as Record<string, string>) || {}
                });
            }
        }
    }, [draftId, valuations, sector]);

    const template = templates[sector as SectorId];

    // Only use fields if they exist in the current template
    const dynamicFields = template?.fields || [];

    // Remove any <form> tags from the template code to prevent nesting issues
    const rawCode = template?.code || "";
    const cleanRawCode = rawCode.replace(/<\/?form[^>]*>/gi, "");

    // Inject formData directly into the HTML inputs using Virtual DOM so edits can resume seamlessly
    const htmlContent = useMemo(() => {
        if (!cleanRawCode) return "";
        return mergeDataWithTemplate(cleanRawCode, {
            clientName: formData.clientName,
            propertyAddress: formData.propertyAddress,
            valuationAmount: Number(formData.valuationAmount) || 0,
            valuationDate: formData.valuationDate,
            notes: formData.notes,
            dynamicData: formData.dynamicData
        }, false); // false = do not lock inputs to readonly
    }, [cleanRawCode, formData]);

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
                            const newScript = document.createElement('script');
                            newScript.textContent = script.textContent || "";
                            document.body.appendChild(newScript);

                            cleanupFns.push(() => {
                                if (document.body.contains(newScript)) {
                                    document.body.removeChild(newScript);
                                }
                            });
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

        // Debugging inputs missing names/ids
        setTimeout(() => {
            const inputs = container.querySelectorAll('input, select, textarea');
            inputs.forEach(el => {
                const input = el as HTMLElement;
                if (!input.getAttribute('name') && !input.getAttribute('id')) {
                    console.warn("Input element missing both 'name' and 'id' attributes:", input);
                    input.style.border = "2px solid red";
                    input.title = "Warning: Missing field identifier. Data won't save.";
                } else if (input.getAttribute('id')?.startsWith('auto_field_')) {
                    // It was auto-assigned. Let's make it visible in title
                    input.title = `Auto-ID assigned: ${input.getAttribute('id')}. Data will save.`;
                }
            });
        }, 500);

        return () => {
            cleanupFns.forEach(fn => fn());
        };
    }, [htmlContent, sector]);

    // Warn before leaving if there are unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty && !submitted) {
                e.preventDefault();
                e.returnValue = ''; // Required for Chrome/Edge
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty, submitted]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setIsDirty(true);
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

    const [lastValuationId, setLastValuationId] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Capture dynamic data from the form directly for HTML templates
        const form = new FormData(e.currentTarget);
        const capturedDynamicData = { ...formData.dynamicData };
        let clientName = formData.clientName || "Untitled Valuation";
        let propertyAddress = formData.propertyAddress || "";
        let valuationAmountStr = formData.valuationAmount?.toString() || "0";
        let valuationDate = formData.valuationDate || new Date().toISOString().split('T')[0];
        let notes = formData.notes || "";

        // Find out which button was clicked
        const submitAction = (e.nativeEvent as SubmitEvent).submitter?.getAttribute('value') || "completed";
        const formStatus = submitAction === "pending" ? "Pending" : "Completed";

        if (htmlContent) {
            // Because Word templates can have broken HTML structures (like inputs outside of tables), 
            // a standard FormData might miss them if the DOM gets confused.
            // We manually query all input, select, and textarea elements within our form ref to be safe.
            if (formRef.current) {
                const allInputs = formRef.current.querySelectorAll('input, select, textarea');
                allInputs.forEach(el => {
                    const input = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
                    const name = input.name || input.id;
                    if (!name) return; // Skip unnamed elements without ID

                    // Get value based on input type
                    const val = input.value;
                    if (input.tagName === 'INPUT') {
                        const type = (input as HTMLInputElement).type;
                        if (type === 'checkbox' || type === 'radio') {
                            if (!(input as HTMLInputElement).checked) return; // Skip unchecked
                        }
                    }
                    console.log(`[Form HTMLScraper] Found input: ${name} = ${val}`);

                    // Map to appropriate field
                    if (name === 'clientName') clientName = val;
                    else if (name === 'propertyAddress') propertyAddress = val;
                    else if (name === 'valuationAmount') valuationAmountStr = val;
                    else if (name === 'valuationDate') valuationDate = val;
                    else if (name === 'notes') notes = val;
                    else if (name !== 'submitAction') capturedDynamicData[name] = val;
                });
            }
        } else {
            // Standard static fields form
            clientName = form.get('clientName')?.toString() || clientName;
            propertyAddress = form.get('propertyAddress')?.toString() || propertyAddress;
            valuationAmountStr = form.get('valuationAmount')?.toString() || valuationAmountStr;
            valuationDate = form.get('valuationDate')?.toString() || valuationDate;
            notes = form.get('notes')?.toString() || notes;
        }

        setSubmitting(true);
        console.log("[Form HTMLScraper] Final Payload to DB:", {
            clientName, propertyAddress, valuationAmountStr, valuationDate, notes, capturedDynamicData
        });

        // ... (removed debug notes override)

        setTimeout(async () => {
            try {
                let newValId = "";

                if (draftId) {
                    const updatedVal = await updateValuation(draftId, {
                        clientName: clientName,
                        propertyAddress: propertyAddress,
                        valuationAmount: parseFloat(valuationAmountStr) || 0,
                        valuationDate: valuationDate,
                        notes: notes,
                        dynamicData: capturedDynamicData,
                        status: formStatus
                    });
                    newValId = updatedVal.id;
                } else {
                    const newVal = await addValuation({
                        sectorId: sector as SectorId,
                        clientName: clientName,
                        propertyAddress: propertyAddress,
                        valuationAmount: parseFloat(valuationAmountStr) || 0,
                        valuationDate: valuationDate,
                        notes: notes,
                        dynamicData: capturedDynamicData,
                        status: formStatus
                    });
                    newValId = newVal.id;
                }

                await refreshData();
                setLastValuationId(newValId);
                setSubmitting(false);
                setSubmitted(true);
                setIsDirty(false);
            } catch (error) {
                console.error("Failed to submit valuation:", error);
                setSubmitting(false);
                // In a real app we'd show an error state here
            }
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
                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    onChange={() => setIsDirty(true)}
                    className="space-y-8"
                >
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
                                            className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow"
                                            placeholder="e.g. John Doe Property"
                                            value={formData.clientName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <label htmlFor="propertyAddress" className="block text-sm font-medium leading-6 text-gray-900">
                                        Property Address
                                    </label>
                                    <div className="mt-2">
                                        <textarea
                                            name="propertyAddress"
                                            id="propertyAddress"
                                            rows={3}
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
                                        Valuation Amount ($)
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
                                            className="block w-full rounded-md border-0 py-2 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow"
                                            placeholder="0.00"
                                            value={formData.valuationAmount}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="valuationDate" className="block text-sm font-medium leading-6 text-gray-900">
                                        Valuation Date
                                    </label>
                                    <div className="mt-2 relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="date"
                                            name="valuationDate"
                                            id="valuationDate"
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
                        <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 ring-1 ring-slate-200 overflow-hidden">
                            <div className="border-b border-indigo-100 bg-indigo-50/50 px-6 py-4">
                                <h3 className="text-base font-semibold leading-6 text-indigo-900 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-indigo-500" />
                                    {currentSector.name} Report Form
                                </h3>
                            </div>
                            <div className="p-8 sm:p-12">
                                {/* Fallback CSS to valid inputs even without template styles */}
                                <style>{REPORT_STYLES}</style>
                                <div
                                    className="valuation-report-content pointer-events-auto"
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
                            name="submitAction"
                            value="pending"
                            disabled={submitting}
                            className="rounded-md bg-white border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-95"
                        >
                            Save as Draft
                        </button>
                        <button
                            type="submit"
                            name="submitAction"
                            value="completed"
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
                        The valuation for <strong>{formData.clientName}</strong> has been successfully recorded.
                    </p>

                    <div className="mt-8 flex flex-col items-center gap-4 w-full max-w-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            <button
                                onClick={() => router.push(`/valuation/report/${lastValuationId}`)}
                                className="flex items-center justify-center gap-2 px-6 py-3 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md active:scale-95"
                            >
                                <FileText className="h-5 w-5" />
                                View Full Report
                            </button>
                            <Link
                                href={`/valuation/report/${lastValuationId}`}
                                className="flex items-center justify-center gap-2 px-6 py-3 text-base font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all border border-blue-200 active:scale-95"
                            >
                                <CheckCircle2 className="h-5 w-5" />
                                Export PDF / Word
                            </Link>
                        </div>

                        <div className="flex items-center gap-4 mt-4 text-sm font-medium">
                            <button
                                onClick={() => {
                                    setSubmitted(false);
                                    setIsDirty(false);
                                    setFormData({
                                        clientName: "",
                                        propertyAddress: "",
                                        valuationAmount: "",
                                        valuationDate: new Date().toISOString().split('T')[0],
                                        notes: "",
                                        dynamicData: {}
                                    });
                                }}
                                className="text-gray-500 hover:text-indigo-600 transition-colors"
                            >
                                Add Another Valuation
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                                onClick={() => {
                                    router.push("/dashboard");
                                    router.refresh();
                                }}
                                className="text-gray-500 hover:text-indigo-600 transition-colors"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
