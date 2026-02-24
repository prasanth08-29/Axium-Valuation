"use client";

import { useState } from "react";
import { useData, SectorId } from "@/lib/data-context";
import Link from "next/link";
import {
    Search,
    Filter,
    FileText,
    ChevronRight,
    Calendar,
    User,
    MapPin,
    MoreHorizontal,
    Download,
    Eye,
    Trash2
} from "lucide-react";

export default function ValuationsListPage() {
    const { valuations, sectors, deleteValuation } = useData();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSector, setSelectedSector] = useState<SectorId | "all">("all");

    // Filter logic
    const filteredValuations = valuations.filter((v) => {
        const matchesSearch =
            v.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSector = selectedSector === "all" || v.sectorId === selectedSector;

        return matchesSearch && matchesSector;
    });

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Valuation Reports</h1>
                <p className="mt-2 text-sm text-gray-500 font-medium font-medium">Browse, search, and manage all your property valuation records.</p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl shadow-sm ring-1 ring-gray-200">
                <div className="relative flex-1 max-w-md">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-xl border-0 py-2.5 pl-11 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm font-medium transition-all"
                        placeholder="Search by client or address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Filter className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <select
                            className="block w-full rounded-xl border-0 py-2.5 pl-9 pr-10 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm font-bold transition-all appearance-none bg-white"
                            value={selectedSector}
                            onChange={(e) => setSelectedSector(e.target.value as SectorId | "all")}
                        >
                            <option value="all">All Sectors</option>
                            {sectors.map((sector) => (
                                <option key={sector.id} value={sector.id}>
                                    {sector.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <ChevronRight className="h-4 w-4 text-gray-400 rotate-90" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Valuations Table */}
            <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-2xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Client Info</th>
                            <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Sector</th>
                            <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Valuation</th>
                            <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                            <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                            <th scope="col" className="relative py-4 pl-3 pr-6 text-right">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {filteredValuations.length > 0 ? (
                            filteredValuations.map((val) => (
                                <tr key={val.id} className="group hover:bg-slate-50/50 transition-colors duration-200">
                                    <td className="whitespace-nowrap py-5 pl-6 pr-3">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center ring-1 ring-slate-100 group-hover:bg-white transition-colors">
                                                <User className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="text-sm font-bold text-gray-900 leading-tight">{val.clientName}</div>
                                                <div className="text-[11px] text-gray-400 font-bold mt-1 truncate max-w-[220px] flex items-center gap-1.5 font-medium">
                                                    <MapPin className="h-3 w-3 text-slate-300" />
                                                    {val.propertyAddress}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-5 text-sm">
                                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 capitalize">
                                            {val.sectorId}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-5">
                                        <div className="text-sm font-bold text-gray-900 tracking-tight">${val.valuationAmount.toLocaleString()}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-1">Property Value</div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500 font-bold tracking-tight">
                                        {val.valuationDate}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-5 text-sm">
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${val.status === 'Completed'
                                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                                            : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
                                            }`}>
                                            <div className={`h-1.5 w-1.5 rounded-full ${val.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                            {val.status}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap py-5 pl-3 pr-6 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            {val.status === 'Completed' ? (
                                                <>
                                                    <Link
                                                        href={`/valuation/report/${val.id}`}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200"
                                                        title="Quick View"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </Link>
                                                    <Link
                                                        href={`/valuation/report/${val.id}`}
                                                        className="text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-indigo-500/20"
                                                    >
                                                        Open Report
                                                    </Link>
                                                </>
                                            ) : (
                                                <Link
                                                    href={`/valuation/${val.sectorId}?draft=${val.id}`}
                                                    className="text-white bg-amber-600 hover:bg-amber-700 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-amber-500/20"
                                                >
                                                    Resume Draft
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => deleteValuation(val.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 ml-2"
                                                title="Delete Valuation"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-24 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-5 ring-1 ring-gray-100">
                                            <FileText className="h-10 w-10 text-gray-300" />
                                        </div>
                                        <p className="text-base font-bold text-gray-500">No matching reports found</p>
                                        <p className="text-sm text-gray-400 mt-1 font-medium">Try adjusting your search query or filters</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
