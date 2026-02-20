"use client";

import { useData, SectorId } from "@/lib/data-context";
import { Plus, Trash2, Edit2, Save, X, AlertTriangle, Layers } from "lucide-react";
import { useState } from "react";

export default function SectorsPage() {
    const { sectors, addSector, updateSector, deleteSector } = useData();
    const [newSectorName, setNewSectorName] = useState("");
    const [editingId, setEditingId] = useState<SectorId | null>(null);
    const [editName, setEditName] = useState("");

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSectorName.trim()) {
            addSector(newSectorName.trim());
            setNewSectorName("");
        }
    };

    const startEdit = (sector: { id: SectorId; name: string }) => {
        setEditingId(sector.id);
        setEditName(sector.name);
    };

    const handleUpdate = () => {
        if (editingId && editName.trim()) {
            updateSector(editingId, editName.trim());
            setEditingId(null);
            setEditName("");
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName("");
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manage Sectors</h1>
                    <p className="mt-2 text-base text-gray-500">
                        Define the valuation sectors available in the system.
                    </p>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-amber-700 ring-1 ring-inset ring-amber-600/20 text-sm">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Deleting a sector hides associated data.</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Add Sector Card */}
                <div className="lg:col-span-1">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sticky top-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <Plus className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-semibold leading-6 text-gray-900">Add New Sector</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">Create a new category for valuations. This will appear on the dashboard.</p>

                        <form onSubmit={handleAdd}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="sectorName" className="block text-sm font-medium leading-6 text-gray-900">
                                        Sector Name
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            id="sectorName"
                                            value={newSectorName}
                                            onChange={(e) => setNewSectorName(e.target.value)}
                                            placeholder="e.g. Retail Valuation"
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newSectorName.trim()}
                                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create Sector
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sectors List */}
                <div className="lg:col-span-2">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-900/5 bg-gray-50 px-6 py-4">
                            <h3 className="text-base font-semibold leading-6 text-gray-900">Existing Sectors</h3>
                        </div>
                        {sectors.length > 0 ? (
                            <ul role="list" className="divide-y divide-gray-100">
                                {sectors.map((sector) => (
                                    <li key={sector.id} className="flex items-center justify-between gap-x-6 px-6 py-5 hover:bg-gray-50/50 transition-colors">
                                        <div className="flex min-w-0 gap-x-4 items-center">
                                            <div className="h-10 w-10 flex-none rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                                                <Layers className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-auto">
                                                {editingId === sector.id ? (
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <p className="text-sm font-semibold leading-6 text-gray-900">{sector.name}</p>
                                                )}
                                                <p className="mt-1 truncate text-xs leading-5 text-gray-500">ID: {sector.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-none items-center gap-x-4">
                                            {editingId === sector.id ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleUpdate}
                                                        className="rounded-full bg-green-50 p-2 text-green-600 hover:bg-green-100 shadow-sm ring-1 ring-inset ring-green-600/20"
                                                        title="Save"
                                                    >
                                                        <Save className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="rounded-full bg-gray-50 p-2 text-gray-600 hover:bg-gray-100 shadow-sm ring-1 ring-inset ring-gray-900/10"
                                                        title="Cancel"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => startEdit(sector)}
                                                        className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteSector(sector.id)}
                                                        className="rounded bg-white px-2 py-1 text-xs font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-red-50 hover:text-red-700"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="px-6 py-12 text-center">
                                <Layers className="mx-auto h-12 w-12 text-gray-300" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">No sectors found</h3>
                                <p className="mt-1 text-sm text-gray-500">Get started by creating a new sector.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
