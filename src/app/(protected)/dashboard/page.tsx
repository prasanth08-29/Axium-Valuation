"use client";

import { useData } from "@/lib/data-context";
import {
    FileText,
    CheckCircle2,
    Plus,
    ArrowUpRight,
    Layers,
    Calendar
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    const { sectors, valuations } = useData();

    // Calculate Stats
    const totalValuations = valuations.length;
    const completedValuations = valuations.filter(v => v.status === "Completed").length;
    const totalAmount = valuations.reduce((sum, v) => sum + v.valuationAmount, 0);

    const stats = {
        totalValuations,
        completedValuations,
        totalAmount
    };

    return (
        <div className="space-y-8 pb-12 text-gray-900">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-sm text-gray-500 font-medium">Welcome back! Here&apos;s what&apos;s happening with your valuations today.</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {sectors.map((sector) => (
                    <Link
                        key={sector.id}
                        href={`/valuation/${sector.id}`}
                        className="group relative flex items-center gap-x-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-lg hover:ring-indigo-500/30 hover:-translate-y-1"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 group-hover:bg-indigo-600 transition-colors duration-300">
                            <Plus className="h-6 w-6 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-gray-900 leading-tight">New {sector.name}</span>
                            <span className="block text-xs text-gray-400 font-medium mt-0.5">Create valuation</span>
                        </div>
                        <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-gray-300 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    </Link>
                ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 group transition-all hover:shadow-md">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-indigo-500/5 transition-transform group-hover:scale-150 duration-700" />
                    <div className="flex items-center gap-x-5">
                        <div className="rounded-xl bg-indigo-50 p-4 ring-1 ring-indigo-500/10">
                            <Layers className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Total Valuations</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalValuations}</p>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 group transition-all hover:shadow-md">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-500/5 transition-transform group-hover:scale-150 duration-700" />
                    <div className="flex items-center gap-x-5">
                        <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-500/10">
                            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Completed</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completedValuations}</p>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 group transition-all hover:shadow-md">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-amber-500/5 transition-transform group-hover:scale-150 duration-700" />
                    <div className="flex items-center gap-x-5">
                        <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-500/10">
                            <Calendar className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Total Amount</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">${stats.totalAmount.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
                <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                        <p className="mt-1 text-sm text-gray-500 font-medium font-medium">Your most recent valuation report submissions.</p>
                    </div>
                    <Link href="/valuations" className="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors bg-indigo-50 px-4 py-2 rounded-lg">
                        View all reports &rarr;
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Client / Property</th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Sector</th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Amount</th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                                <th scope="col" className="relative py-4 pl-3 pr-6 text-right">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {valuations.length > 0 ? (
                                valuations.slice(0, 5).map((val) => (
                                    <tr key={val.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="whitespace-nowrap py-5 pl-6 pr-3">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 leading-tight">{val.clientName}</span>
                                                <span className="text-xs text-gray-500 mt-1 truncate max-w-xs font-medium">{val.propertyAddress}</span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-5 text-sm">
                                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 capitalize">
                                                {val.sectorId}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500 font-semibold tracking-tight">
                                            {val.valuationDate}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-5 text-sm font-bold text-gray-900 tracking-tight">
                                            ${val.valuationAmount.toLocaleString()}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-5 text-sm">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${val.status === 'Completed'
                                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                                                : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
                                                }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${val.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                {val.status}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-5 text-right text-sm font-medium pr-6">
                                            {val.status === 'Completed' ? (
                                                <Link
                                                    href={`/valuation/report/${val.id}`}
                                                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-4 py-2 rounded-xl text-xs font-bold transition-all group-hover:bg-indigo-600 group-hover:text-white"
                                                >
                                                    View Report
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={`/valuation/${val.sectorId}?draft=${val.id}`}
                                                    className="text-amber-600 hover:text-amber-900 bg-amber-50 px-4 py-2 rounded-xl text-xs font-bold transition-all group-hover:bg-amber-600 group-hover:text-white"
                                                >
                                                    Resume Draft
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <FileText className="h-8 w-8 text-gray-300" />
                                            </div>
                                            <p className="text-sm font-bold text-gray-400">No valuations found</p>
                                            <p className="text-xs text-gray-400 mt-1">Start by creating a new report from the dashboard</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
