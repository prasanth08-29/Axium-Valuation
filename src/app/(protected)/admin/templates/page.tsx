"use client";

import { useData, SectorId } from "@/lib/data-context";
import { Code, FileText, CheckCircle, Save, Trash2, Eye, AlertCircle } from "lucide-react";
import { useState } from "react";

const DEFAULT_CODE = (sectorName: string) => `
<style>
  /* Add your custom styles here */
  .valuation-form-container {
    padding: 1rem;
   }
  .form-group {
    margin-bottom: 2rem;
  }
  .form-label {
    display: block;
    font-size: 1.1rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.5rem;
  }
  .form-input {
    display: block;
    width: 100%;
    border-radius: 0.5rem;
    border: 1px solid #9ca3af;
    background-color: #f9fafb;
    padding: 1rem;
    font-size: 1.1rem;
    color: #111827;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.2s;
  }
  .form-input:focus {
    border-color: #4f46e5;
    background-color: #ffffff;
    outline: 2px solid transparent;
    outline-offset: 2px;
    box-shadow: 0 0 0 4px #e0e7ff;
  }
  .form-input::placeholder {
    color: #6b7280;
  }
</style>

<div class="valuation-form-container space-y-6">
  <h3 class="text-lg font-semibold border-b pb-2">Valuation Details for ${sectorName}</h3>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="form-group">
      <label class="form-label">Client / Borrower Name</label>
      <input type="text" name="clientName" class="form-input" placeholder="e.g. John Smith" required>
    </div>
    
    <div class="form-group">
      <label class="form-label">Valuation Amount ($)</label>
      <input type="number" name="valuationAmount" class="form-input" placeholder="0.00" step="0.01" required>
    </div>

    <div class="form-group">
      <label class="form-label">Valuation Date</label>
      <input type="date" name="valuationDate" class="form-input" required>
    </div>

    <div class="form-group">
      <label class="form-label">Property Type</label>
      <select name="propertyType" class="form-input">
        <option value="">Select Type...</option>
        <option value="residential">Residential</option>
        <option value="commercial">Commercial</option>
        <option value="land">Vacant Land</option>
        <option value="industrial">Industrial</option>
      </select>
    </div>
  </div>
  
  <div class="form-group">
    <label class="form-label">Property Address</label>
    <textarea name="propertyAddress" rows="3" class="form-input" placeholder="Full address..." required></textarea>
  </div>
  
  <div class="form-group">
    <label class="form-label">Property Description</label>
    <textarea name="propertyDescription" rows="3" class="form-input" placeholder="Describe the property..."></textarea>
  </div>

  <div class="form-group">
    <label class="form-label">Additional Notes</label>
    <textarea name="notes" rows="2" class="form-input" placeholder="Internal notes..."></textarea>
  </div>

  <div class="form-group">
    <label class="form-label flex items-center gap-2">
      <input type="checkbox" name="isOccupied" value="yes" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
      Property is currently occupied
    </label>
  </div>
</div>

<script>
  // Add your custom logic here
  console.log('Template loaded for ${sectorName}');
  
  const loanInput = document.querySelector('input[name="loanRef"]');
  const helpText = document.getElementById('loanRefHelp');
  
  if (loanInput && helpText) {
    loanInput.addEventListener('focus', () => {
      helpText.classList.remove('hidden');
    });
    
    loanInput.addEventListener('blur', () => {
      helpText.classList.add('hidden');
    });
  }
</script>
`;

export default function TemplatesPage() {
    const { sectors, templates, saveTemplate, deleteTemplate } = useData();
    const [editing, setEditing] = useState<SectorId | null>(null);
    const [code, setCode] = useState<string>("");
    const [previewMode, setPreviewMode] = useState(false);

    const startEditing = (sectorId: SectorId, currentCode?: string, sectorName?: string) => {
        setEditing(sectorId);
        setCode(currentCode || DEFAULT_CODE(sectorName || "Sector"));
        setPreviewMode(false);
    };

    const handleSave = (sectorId: SectorId) => {
        // Extract field names from name="..." attributes
        const regex = /name=["']([^"']+)["']/g;
        const matches = [...code.matchAll(regex)];
        const fields = [...new Set(matches.map(m => m[1]))];

        // Check for inputs without name attributes
        const hasUnnamedInputs = (code.match(/<input(?!.*name=)[^>]*>/g) || []).length > 0 ||
            (code.match(/<textarea(?!.*name=)[^>]*>/g) || []).length > 0 ||
            (code.match(/<select(?!.*name=)[^>]*>/g) || []).length > 0;

        if (hasUnnamedInputs) {
            if (!confirm("Warning: Some input fields appear to be missing 'name' attributes. Data entered in these fields will NOT be saved. Do you want to proceed anyway?")) {
                return;
            }
        }

        if (fields.length === 0 && !confirm("Warning: No named fields found. This template might not collect any data. Save anyway?")) {
            return;
        }

        saveTemplate(sectorId, code, fields);
        alert("Saved!");
    };

    const handleDelete = (sectorId: SectorId) => {
        if (confirm("Are you sure you want to delete this template?")) {
            deleteTemplate(sectorId);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Templates</h1>
                    <p className="mt-2 text-gray-600">
                        Create custom valuation forms using HTML, CSS, and JavaScript.
                    </p>
                </div>

                {editing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <div className="flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-gray-200">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Code className="h-5 w-5 text-indigo-600" />
                                        Editing {sectors.find(s => s.id === editing)?.name}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPreviewMode(!previewMode)}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${previewMode
                                            ? "bg-indigo-100 text-indigo-700"
                                            : "text-gray-600 hover:bg-gray-100"
                                            }`}
                                    >
                                        <Eye className="h-4 w-4" />
                                        {previewMode ? "Edit Code" : "Preview"}
                                    </button>
                                    <div className="h-6 w-px bg-gray-300 mx-1" />
                                    <button
                                        onClick={() => setEditing(null)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => handleSave(editing)}
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm flex items-center gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        Save
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                                {/* Code Editor */}
                                <div className={`flex-1 flex flex-col border-r border-gray-200 ${previewMode ? "hidden md:flex md:w-1/2" : "w-full"}`}>
                                    <div className="bg-gray-900 text-gray-400 text-xs px-4 py-2 border-b border-gray-800 font-mono flex items-center justify-between">
                                        <span>HTML / CSS / JS Editor</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCode(prev => prev + '\n<div class="form-group">\n  <label class="form-label">New Field</label>\n  <input type="text" name="field_name" class="form-input">\n</div>')}
                                                className="hover:text-white transition-colors"
                                                title="Insert Text Input"
                                            >
                                                + Input
                                            </button>
                                            <button
                                                onClick={() => setCode(prev => prev + '\n<div class="form-group">\n  <label class="form-label">New Area</label>\n  <textarea name="area_name" class="form-input" rows="3"></textarea>\n</div>')}
                                                className="hover:text-white transition-colors"
                                                title="Insert Text Area"
                                            >
                                                + TextArea
                                            </button>
                                            <button
                                                onClick={() => setCode(prev => prev + '\n<div class="form-group">\n  <label class="form-label">New Date</label>\n  <input type="date" name="date_name" class="form-input">\n</div>')}
                                                className="hover:text-white transition-colors"
                                                title="Insert Date Input"
                                            >
                                                + Date
                                            </button>
                                        </div>
                                    </div>
                                    <textarea
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="flex-1 w-full bg-gray-900 text-green-400 font-mono text-sm p-4 resize-none focus:outline-none"
                                        spellCheck={false}
                                        placeholder="Enter your HTML, CSS, and JS code here..."
                                    />
                                    {/* Warning if no inputs detected */}
                                    {!code.includes('<input') && !code.includes('<textarea') && !code.includes('<select') && code.length > 50 && (
                                        <div className="bg-yellow-900/20 text-yellow-500 text-xs px-4 py-2 border-t border-yellow-900/30 flex items-center gap-2">
                                            <AlertCircle className="h-3 w-3" />
                                            Warning: No input fields detected. Users won't be able to enter data.
                                        </div>
                                    )}
                                </div>

                                {/* Preview */}
                                <div className={`flex-1 flex flex-col bg-gray-50 ${!previewMode ? "hidden md:flex md:w-1/2" : "w-full overflow-y-auto"}`}>
                                    <div className="bg-white border-b border-gray-200 text-gray-500 text-xs px-4 py-2 relative">
                                        Live Preview
                                    </div>
                                    <div className="p-8 flex-1 overflow-y-auto">
                                        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6 relative">
                                            {/* Note regarding script execution */}
                                            <div
                                                className="prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: code }}
                                            />
                                            <div className="mt-4 p-2 bg-yellow-50 text-yellow-700 text-xs rounded border border-yellow-200">
                                                Note: Scripts may not execute in preview mode depending on browser security policies.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sectors.map((sector) => {
                        const template = templates[sector.id];
                        return (
                            <div key={sector.id} className="relative group bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    {template && (
                                        <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
                                            <CheckCircle className="h-3 w-3" />
                                            <span>Active</span>
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{sector.name}</h3>
                                <p className="text-sm text-gray-500 mb-4 h-10 line-clamp-2">
                                    {template
                                        ? `Last updated on ${template.uploadDate}`
                                        : "No template configured yet."}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="text-xs text-gray-400 font-mono">
                                        {template?.fields.length || 0} fields
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {template && (
                                            <button
                                                onClick={() => handleDelete(sector.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                title="Delete Template"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => startEditing(sector.id, template?.code, sector.name)}
                                            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all"
                                        >
                                            <Code className="h-4 w-4 text-gray-500" />
                                            {template ? "Edit Code" : "Create Form"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
