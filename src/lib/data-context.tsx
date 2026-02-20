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
    addValuation: (valuation: Omit<Valuation, "id" | "submissionDate" | "status">) => void;
    addSector: (name: string) => void;
    updateSector: (id: SectorId, name: string) => void;
    deleteSector: (id: SectorId) => void;
    saveTemplate: (sectorId: SectorId, code: string, fields: string[]) => void;
    // Legacy support might be removed or updated
    saveTemplateHTML: (sectorId: SectorId, htmlContent: string, fields: string[]) => void;
    deleteTemplate: (sectorId: SectorId) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const INITIAL_SECTORS: Sector[] = [
    { id: "bank", name: "Bank Valuation" },
    { id: "individual", name: "Individual Valuation" },
    { id: "company", name: "Company Valuation" },
];

export function DataProvider({ children }: { children: ReactNode }) {
    const [sectors, setSectors] = useState<Sector[]>(INITIAL_SECTORS);
    const [templates, setTemplates] = useState<Record<SectorId, Template | null>>({
        bank: null,
        individual: null,
        company: null,
    });
    const [valuations, setValuations] = useState<Valuation[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load data from localStorage on mount
    useEffect(() => {
        const storedSectors = localStorage.getItem("sectors");
        const storedTemplates = localStorage.getItem("templates");
        const storedValuations = localStorage.getItem("valuations");

        if (storedSectors) {
            setSectors(JSON.parse(storedSectors));
        }
        if (storedTemplates) {
            setTemplates(JSON.parse(storedTemplates));
        }
        if (storedValuations) {
            setValuations(JSON.parse(storedValuations));
        }
        setIsInitialized(true);
    }, []);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("sectors", JSON.stringify(sectors));
        }
    }, [sectors, isInitialized]);

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("templates", JSON.stringify(templates));
        }
    }, [templates, isInitialized]);

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("valuations", JSON.stringify(valuations));
        }
    }, [valuations, isInitialized]);

    const saveTemplate = (sectorId: SectorId, code: string, fields: string[]) => {
        setTemplates((prev) => {
            const currentTemplate = prev[sectorId];

            const existingFields = currentTemplate?.fields || [];
            const allFields = [...new Set([...existingFields, ...fields])];

            const newTemplate: Template = {
                sectorId,
                fileName: currentTemplate?.fileName,
                code,
                uploadDate: new Date().toLocaleDateString(),
                fields: allFields,
            };

            return {
                ...prev,
                [sectorId]: newTemplate,
            };
        });
    };

    // Legacy adapter
    const saveTemplateHTML = (sectorId: SectorId, htmlContent: string, fields: string[]) => {
        saveTemplate(sectorId, htmlContent, fields);
    };

    const deleteTemplate = (sectorId: SectorId) => {
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

    const addValuation = (data: Omit<Valuation, "id" | "submissionDate" | "status">) => {
        const newValuation: Valuation = {
            ...data,
            id: Math.random().toString(36).substring(7),
            submissionDate: new Date().toLocaleDateString(),
            status: "Completed",
        };
        setValuations((prev) => [newValuation, ...prev]);
    };

    const addSector = (name: string) => {
        const id = name.toLowerCase().replace(/\s+/g, "-");
        // Check if ID already exists
        if (sectors.some(s => s.id === id)) {
            alert("A sector with this name already exists.");
            return;
        }
        const newSector: Sector = { id, name };
        setSectors(prev => [...prev, newSector]);
    };

    const updateSector = (id: SectorId, name: string) => {
        setSectors(prev => prev.map(s => s.id === id ? { ...s, name } : s));
    };

    const deleteSector = (id: SectorId) => {
        if (confirm("Are you sure? This will hide all valuations associated with this sector.")) {
            setSectors(prev => prev.filter(s => s.id !== id));
        }
    };

    // Prevent rendering children until hydration is complete to avoid mismatch
    if (!isInitialized) {
        return null;
    }

    return (
        <DataContext.Provider value={{ sectors, templates, valuations, uploadTemplate, saveTemplate, saveTemplateHTML, deleteTemplate, addValuation, addSector, updateSector, deleteSector }}>
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
