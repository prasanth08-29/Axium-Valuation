"use client";

import { useData } from "@/lib/data-context";
import { Building, Building2, User, FileText, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    const { sectors, valuations } = useData();

    // Calculate Stats
    const totalValuations = valuations.length;
    const completedValuations = valuations.filter(v => v.status === "Completed").length;
    const pendingValuations = valuations.filter(v => v.status === "Pending").length;

    return (
        <div className="space-y-10">
            {/* Header & Stats */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                <p className="mt-2 text-gray-500">Overview of your valuation activities.</p>

                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm ring-1 ring-gray-900/5 sm:p-6 transition-all hover:shadow-md">
                        <dt className="truncate text-sm font-medium text-gray-500">Total Valuations</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 flex items-center gap-2">
                            {totalValuations}
                            <TrendingUp className="h-5 w-5 text-indigo-500" />
                        </dd>
                    </div>
                    <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm ring-1 ring-gray-900/5 sm:p-6 transition-all hover:shadow-md">
                        <dt className="truncate text-sm font-medium text-gray-500">Completed</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 flex items-center gap-2">
                            {completedValuations}
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </dd>
                    </div>
                    <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm ring-1 ring-gray-900/5 sm:p-6 transition-all hover:shadow-md">
                        <dt className="truncate text-sm font-medium text-gray-500">Pending</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 flex items-center gap-2">
                            {pendingValuations}
                            <Clock className="h-5 w-5 text-amber-500" />
                        </dd>
                    </div>
                </div>
            </div>

            {/* Sector Selection */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Start New Valuation</h2>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {sectors.map((sector) => {
                        // Dynamic styling
                        const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-cyan-500", "bg-rose-500"];
                        const colorIndex = sector.name.length % colors.length;
                        const color = colors[colorIndex];
                        const Icon = sector.id === "bank" ? Building : (sector.id === "individual" ? User : (sector.id === "company" ? Building2 : FileText));

                        return (
                            <Link
                                key={sector.id}
                                href={`/valuation/${sector.id}`}
                                className="group relative flex flex-col items-start justify-between space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-gray-200"
                            >
                                <div className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
                                    <Icon className={`h-6 w-6 ${color.replace("bg-", "text-")}`} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                        {sector.name}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Create a new report for {sector.name.toLowerCase()}.
                                    </p>
                                </div>
                                <div className="w-full pt-4 border-t border-gray-50 flex items-center text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Start Report &rarr;
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* Recent Valuations Table */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
                    {valuations.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Client</th>
                                        <th scope="col" className="px-3 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Address</th>
                                        <th scope="col" className="px-3 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Sector</th>
                                        <th scope="col" className="px-3 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Amount</th>
                                        <th scope="col" className="px-3 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Date</th>
                                        <th scope="col" className="px-3 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {valuations.map((val) => (
                                        <tr key={val.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">{val.clientName}</td>
                                            <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">{val.propertyAddress}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                                                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                    {val.sectorId}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gray-900">
                                                ${val.valuationAmount.toLocaleString()}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{val.valuationDate}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${val.status === 'Completed'
                                                        ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                                                        : 'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20'
                                                    }`}>
                                                    {val.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <FileText className="mx-auto h-12 w-12 text-gray-300" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No valuations</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new valuation report above.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
