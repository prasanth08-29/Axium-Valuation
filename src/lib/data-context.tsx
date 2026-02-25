"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type SectorId = string;

export interface Sector {
    id: SectorId;
    name: string;
}

export interface Template {
    sectorId: SectorId;
    fileName?: string;
    code: string; // Single string for all HTML/CSS/JS
    uploadDate: string;
    fields: string[];
}

export interface Valuation {
    id: string;
    sectorId: SectorId;
    clientName: string;
    propertyAddress: string;
    valuationAmount: number;
    valuationDate: string;
    notes?: string;
    dynamicData?: Record<string, string>; // Data for dynamic fields
    submissionDate: string;
    status: "Pending" | "Completed";
}

interface DataContextType {
    sectors: Sector[];
    templates: Record<SectorId, Template | null>;
    valuations: Valuation[];
    uploadTemplate: (sectorId: SectorId, fileName: string, fields?: string[]) => void;
    addValuation: (valuation: Omit<Valuation, "id" | "submissionDate">) => Valuation;
    updateValuation: (id: string, valuation: Partial<Omit<Valuation, "id" | "submissionDate">>) => Valuation;
    deleteValuation: (id: string) => void;
    addSector: (name: string) => void;
    updateSector: (id: SectorId, name: string) => void;
    deleteSector: (id: SectorId) => void;
    saveTemplate: (sectorId: SectorId, code: string, fields: string[]) => void;
    // Legacy support might be removed or updated
    saveTemplateHTML: (sectorId: SectorId, htmlContent: string, fields: string[]) => void;
    deleteTemplate: (sectorId: SectorId) => void;
    refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);



export function DataProvider({ children }: { children: ReactNode }) {
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [templates, setTemplates] = useState<Record<SectorId, Template | null>>({
        bank: null,
        individual: null,
        company: null,
    });
    const [valuations, setValuations] = useState<Valuation[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    const loadInitialData = async () => {
        try {
            // We must import actions dynamically here or load them at the top
            // But since Server Actions are just async functions, we can import them.
            const { getSectors, getTemplates, getValuations, seedInitialData } = await import("@/app/actions/db-actions");

            await seedInitialData();

            const [dbSectors, dbTemplates, dbValuations] = await Promise.all([
                getSectors(),
                getTemplates(),
                getValuations()
            ]);

            setSectors(dbSectors);
            setTemplates(dbTemplates as Record<SectorId, Template | null>);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setValuations(dbValuations as any); // Cast for simplicity since Prisma dates are precise
        } catch (error) {
            console.error("Failed to load initial data from DB", error);
        } finally {
            setIsInitialized(true);
        }
    };

    // Load data from Database on mount
    useEffect(() => {
        loadInitialData();
    }, []);

    const refreshData = async () => {
        await loadInitialData();
    };

    const saveTemplate = async (sectorId: SectorId, code: string, fields: string[]) => {
        const { saveTemplate: dbSaveTemplate } = await import("@/app/actions/db-actions");

        const existingFields = templates[sectorId]?.fields || [];
        const allFields = [...new Set([...existingFields, ...fields])];

        const saved = await dbSaveTemplate(sectorId, code, allFields);

        setTemplates((prev) => ({
            ...prev,
            [sectorId]: {
                ...saved,
                fields: JSON.parse(saved.fields),
                uploadDate: new Date().toLocaleDateString()
            }
        }));
    };

    // Legacy adapter
    const saveTemplateHTML = async (sectorId: SectorId, htmlContent: string, fields: string[]) => {
        await saveTemplate(sectorId, htmlContent, fields);
    };

    const deleteTemplate = async (sectorId: SectorId) => {
        const { deleteTemplate: dbDeleteTemplate } = await import("@/app/actions/db-actions");
        await dbDeleteTemplate(sectorId);

        setTemplates((prev) => ({
            ...prev,
            [sectorId]: null
        }));
    };

    // Kept for backward compatibility if needed, but we might deprecate
    const uploadTemplate = (sectorId: SectorId, fileName: string, fields: string[] = []) => {
        const newTemplate: Template = {
            sectorId,
            fileName,
            uploadDate: new Date().toLocaleDateString(),
            code: '', // Empty placeholder
            fields,
        };
        setTemplates((prev) => ({
            ...prev,
            [sectorId]: newTemplate,
        }));
    };

    const addValuation = async (data: Omit<Valuation, "id" | "submissionDate">) => {
        const { createValuation } = await import("@/app/actions/db-actions");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newValuation = await createValuation(data as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setValuations((prev) => [newValuation as any, ...prev]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return newValuation as any;
    };

    const updateValuationContext = async (id: string, data: Partial<Omit<Valuation, "id" | "submissionDate">>) => {
        const { updateValuation: dbUpdateValuation } = await import("@/app/actions/db-actions");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updatedValuation = await dbUpdateValuation(id, data as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setValuations(prev => prev.map(v => v.id === id ? updatedValuation as any : v));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return updatedValuation as any;
    };

    const deleteValuationContext = async (id: string) => {
        const { deleteValuation: dbDeleteValuation } = await import("@/app/actions/db-actions");

        if (confirm("Are you sure you want to delete this valuation? This action cannot be undone.")) {
            await dbDeleteValuation(id);
            setValuations(prev => prev.filter(v => v.id !== id));
        }
    };

    const addSector = async (name: string) => {
        const { createSector } = await import("@/app/actions/db-actions");
        const id = name.toLowerCase().replace(/\s+/g, "-");

        if (sectors.some(s => s.id === id)) {
            alert("A sector with this name already exists.");
            return;
        }

        const newSector = await createSector(id, name);
        setSectors(prev => [...prev, newSector]);
    };

    const updateSector = (id: SectorId, name: string) => {
        // Mock update for now
        setSectors(prev => prev.map(s => s.id === id ? { ...s, name } : s));
    };

    const deleteSector = async (id: SectorId) => {
        const { deleteSector: dbDeleteSector } = await import("@/app/actions/db-actions");

        if (confirm("Are you sure? This will hide all valuations associated with this sector.")) {
            await dbDeleteSector(id);
            setSectors(prev => prev.filter(s => s.id !== id));
        }
    };

    // Prevent rendering children until hydration is complete to avoid mismatch
    if (!isInitialized) {
        return null;
    }

    return (
        <DataContext.Provider value={{
            sectors, templates, valuations,
            uploadTemplate,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            saveTemplate: saveTemplate as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            saveTemplateHTML: saveTemplateHTML as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            deleteTemplate: deleteTemplate as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            addValuation: addValuation as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            updateValuation: updateValuationContext as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            deleteValuation: deleteValuationContext as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            addSector: addSector as any,
            updateSector,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            deleteSector: deleteSector as any,
            refreshData
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
}
