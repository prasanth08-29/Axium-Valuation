"use client";

import { use, useEffect, useState, useRef } from "react";
import { notFound, useRouter } from "next/navigation";
import { useData } from "@/lib/data-context";
import { mergeDataWithTemplate, downloadAsWord, REPORT_STYLES } from "@/lib/report-generator";
import { ChevronLeft, Printer, Download } from "lucide-react";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ReportPage({ params }: PageProps) {
    const { id } = use(params);
    const { valuations, templates } = useData();
    const router = useRouter();
    const reportRef = useRef<HTMLDivElement>(null);

    const valuation = valuations.find((v) => v.id === id);
    if (!valuation) {
        notFound();
    }

    const template = templates[valuation.sectorId];
    const [mergedHtml, setMergedHtml] = useState<string>("");
    const [parsedPhotos, setParsedPhotos] = useState<{ id: string, dataUrl: string }[]>([]);

    useEffect(() => {
        if (template) {
            const merged = mergeDataWithTemplate(template.code, {
                clientName: valuation.clientName,
                propertyAddress: valuation.propertyAddress,
                valuationAmount: valuation.valuationAmount,
                valuationDate: valuation.valuationDate,
                notes: valuation.notes,
                dynamicData: valuation.dynamicData
            });
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setMergedHtml(merged);
        }

        if (valuation.dynamicData && typeof valuation.dynamicData === 'object' && 'app_photos' in valuation.dynamicData) {
            try {
                const photos = JSON.parse(valuation.dynamicData.app_photos as string);
                if (Array.isArray(photos)) {
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setParsedPhotos(photos);
                }
            } catch (e) {
                console.error("Failed to parse photos from draft", e);
            }
        }
    }, [template, valuation]);

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Toolbar - Glassmorphism */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-3 print:hidden shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Go Back"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block" />
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 leading-tight">Valuation Report</h2>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{valuation.clientName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => downloadAsWord(reportRef.current?.innerHTML || "", `Valuation_Report_${valuation.clientName}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-bold text-xs rounded-xl shadow-sm ring-1 ring-slate-200 hover:ring-indigo-500/30 hover:bg-slate-50 transition-all font-sans"
                        >
                            <Download className="h-4 w-4 text-indigo-500" />
                            Export Word
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all font-sans"
                        >
                            <Printer className="h-4 w-4" />
                            Print / PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <main className="max-w-[1000px] mx-auto py-10 px-4 sm:px-6 lg:px-8 print:p-0">
                <div className="bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-200 rounded-2xl overflow-hidden print:shadow-none print:ring-0 print:m-0 print:rounded-none">
                    <div className="min-h-[29.7cm] p-8 sm:p-12 print:p-0 report-view-mode" ref={reportRef}>
                        {template ? (
                            <div
                                className="valuation-report-content max-w-none"
                                dangerouslySetInnerHTML={{ __html: mergedHtml }}
                            />
                        ) : (
                            <div className="valuation-report-content">
                                <div className="text-center mb-4">
                                    <h2 className="text-xl font-bold uppercase tracking-widest border-b-2 border-black inline-block pb-1">Valuation Report</h2>
                                </div>

                                <table className="w-full border-collapse border-2 border-black mb-4">
                                    <thead>
                                        <tr>
                                            <th colSpan={3} className="bg-gray-100 border border-black px-2 py-1 text-left font-bold uppercase text-sm">GENERAL INFORMATION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border border-black px-2 py-1 text-center w-12 text-sm">1</td>
                                            <td className="border border-black px-2 py-1 text-sm font-semibold">Name of the party/owner</td>
                                            <td className="border border-black px-2 py-1 text-sm">
                                                {valuation.clientName}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black px-2 py-1 text-center text-sm">2</td>
                                            <td className="border border-black px-2 py-1 text-sm font-semibold">Address of the property</td>
                                            <td className="border border-black px-2 py-1 text-sm">
                                                {valuation.propertyAddress}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black px-2 py-1 text-center text-sm">3</td>
                                            <td className="border border-black px-2 py-1 text-sm font-semibold">Name/s of reported owner & registration details</td>
                                            <td className="border border-black px-2 py-1 text-sm">
                                                {valuation.dynamicData?.reportedOwner || "N/A"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black px-2 py-1 text-center text-sm">4</td>
                                            <td className="border border-black px-2 py-1 text-sm font-semibold">Purpose of valuation</td>
                                            <td className="border border-black px-2 py-1 text-sm">
                                                {valuation.dynamicData?.valuationPurpose || "N/A"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black px-2 py-1 text-center text-sm">5</td>
                                            <td className="border border-black px-2 py-1 text-sm font-semibold">List of documents produced</td>
                                            <td className="border border-black px-2 py-1 text-sm">
                                                {valuation.dynamicData?.documentsProduced || "N/A"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black px-2 py-1 text-center text-sm">6</td>
                                            <td className="border border-black px-2 py-1 text-sm font-semibold">Date of inspection</td>
                                            <td className="border border-black px-2 py-1 text-sm">
                                                {valuation.dynamicData?.inspectionDate || "N/A"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black px-2 py-1 text-center text-sm">7</td>
                                            <td className="border border-black px-2 py-1 text-sm font-semibold">Date of valuation</td>
                                            <td className="border border-black px-2 py-1 text-sm">
                                                {valuation.valuationDate}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black px-2 py-1 text-center text-sm">8</td>
                                            <td className="border border-black px-2 py-1 text-sm font-semibold">Distance from branch</td>
                                            <td className="border border-black px-2 py-1 text-sm">
                                                {valuation.dynamicData?.branchDistance || "N/A"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black px-2 py-1 text-center text-sm">9</td>
                                            <td className="border border-black px-2 py-1 text-sm font-semibold">Situation/location description</td>
                                            <td className="border border-black px-2 py-1 text-sm">
                                                {valuation.dynamicData?.locationDescription || "N/A"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black px-2 py-1 text-center text-sm">10</td>
                                            <td className="border border-black px-2 py-1 text-sm font-semibold">Latitude & Longitude</td>
                                            <td className="border border-black px-2 py-1 text-sm">
                                                {valuation.dynamicData?.latLong || "N/A"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black px-2 py-1 text-center text-sm">11</td>
                                            <td className="border border-black px-2 py-1 text-sm font-semibold italic">Valuation Amount (₹)</td>
                                            <td className="border border-black px-2 py-1 text-lg font-bold">
                                                ₹{valuation.valuationAmount.toLocaleString()}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {valuation.notes && (
                                    <div className="mt-8">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Additional Remarks</h3>
                                        <div className="text-sm text-gray-700 leading-relaxed border p-4 bg-gray-50/50 rounded-lg">
                                            {valuation.notes}
                                        </div>
                                    </div>
                                )}

                                {valuation.dynamicData && Object.keys(valuation.dynamicData).length > 6 && (
                                    <div className="mt-8 pt-8 border-t border-gray-200">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Other Details</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {Object.entries(valuation.dynamicData)
                                                .filter(([key]) => !['valuationPurpose', 'inspectionDate'].includes(key))
                                                .map(([key, value]) => (
                                                    <div key={key} className="border-b border-gray-100 pb-2">
                                                        <dt className="text-[10px] font-bold text-gray-400 uppercase">{key.replace(/([A-Z])/g, ' $1')}</dt>
                                                        <dd className="text-sm text-gray-800 font-medium">{value}</dd>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}


                    </div>
                </div>
            </main>

            <style>{REPORT_STYLES}</style>
        </div>
    );
}
