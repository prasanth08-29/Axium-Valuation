"use client";

import { useData, SectorId } from "@/lib/data-context";
import { Code, FileText, CheckCircle, Save, Trash2, Eye, AlertCircle } from "lucide-react";
import { useState } from "react";

const DEFAULT_CODE = (_sectorName: string) => `
<div class="valuation-report-content">
  <div class="text-center mb-8">
    <h2 class="text-xl font-bold uppercase tracking-widest border-b-2 border-black inline-block pb-1">Valuation Report</h2>
  </div>

  <table class="w-full border-collapse border-2 border-black mb-8">
    <thead>
      <tr>
        <th colspan="3" class="bg-gray-100 border border-black px-4 py-2 text-left font-bold uppercase text-sm">GENERAL INFORMATION</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-black px-4 py-2 text-center w-12">1</td>
        <td class="border border-black px-4 py-2 text-sm font-semibold">Name of the party/owner</td>
        <td class="border border-black px-4 py-2">
          <input type="text" name="clientName" class="w-full border border-gray-300 rounded px-2 py-1" placeholder="Enter owner name">
        </td>
      </tr>
      <tr>
        <td class="border border-black px-4 py-2 text-center">2</td>
        <td class="border border-black px-4 py-2 text-sm font-semibold">Address of the property</td>
        <td class="border border-black px-4 py-2">
          <textarea name="propertyAddress" rows="2" class="w-full border border-gray-300 rounded px-2 py-1" placeholder="Enter full address"></textarea>
        </td>
      </tr>
      <tr>
        <td class="border border-black px-4 py-2 text-center">3</td>
        <td class="border border-black px-4 py-2 text-sm font-semibold">Name/s of reported owner & registration details</td>
        <td class="border border-black px-4 py-2">
          <textarea name="reportedOwner" rows="2" class="w-full border border-gray-300 rounded px-2 py-1" placeholder="Registration details..."></textarea>
        </td>
      </tr>
      <tr>
        <td class="border border-black px-4 py-2 text-center">4</td>
        <td class="border border-black px-4 py-2 text-sm font-semibold">Purpose of valuation</td>
        <td class="border border-black px-4 py-2">
          <input type="text" name="valuationPurpose" class="w-full border border-gray-300 rounded px-2 py-1" placeholder="e.g. Bank Loan">
        </td>
      </tr>
      <tr>
        <td class="border border-black px-4 py-2 text-center">5</td>
        <td class="border border-black px-4 py-2 text-sm font-semibold">List of documents produced</td>
        <td class="border border-black px-4 py-2">
          <textarea name="documentsProduced" rows="2" class="w-full border border-gray-300 rounded px-2 py-1" placeholder="Documents..."></textarea>
        </td>
      </tr>
      <tr>
        <td class="border border-black px-4 py-2 text-center">6</td>
        <td class="border border-black px-4 py-2 text-sm font-semibold">Date of inspection</td>
        <td class="border border-black px-4 py-2">
          <input type="date" name="inspectionDate" class="w-full border border-gray-300 rounded px-2 py-1">
        </td>
      </tr>
      <tr>
        <td class="border border-black px-4 py-2 text-center">7</td>
        <td class="border border-black px-4 py-2 text-sm font-semibold">Date of valuation</td>
        <td class="border border-black px-4 py-2">
          <input type="date" name="valuationDate" class="w-full border border-gray-300 rounded px-2 py-1" required>
        </td>
      </tr>
      <tr>
        <td class="border border-black px-4 py-2 text-center">8</td>
        <td class="border border-black px-4 py-2 text-sm font-semibold">Distance from branch</td>
        <td class="border border-black px-4 py-2">
          <input type="text" name="branchDistance" class="w-full border border-gray-300 rounded px-2 py-1" placeholder="e.g. 5 km">
        </td>
      </tr>
      <tr>
        <td class="border border-black px-4 py-2 text-center">9</td>
        <td class="border border-black px-4 py-2 text-sm font-semibold">Situation/location description</td>
        <td class="border border-black px-4 py-2">
          <textarea name="locationDescription" rows="2" class="w-full border border-gray-300 rounded px-2 py-1" placeholder="Describe locality..."></textarea>
        </td>
      </tr>
      <tr>
        <td class="border border-black px-4 py-2 text-center">10</td>
        <td class="border border-black px-4 py-2 text-sm font-semibold">Latitude & Longitude</td>
        <td class="border border-black px-4 py-2">
          <input type="text" name="latLong" class="w-full border border-gray-300 rounded px-2 py-1" placeholder="GPS coordinates">
        </td>
      </tr>
      <tr>
        <td class="border border-black px-4 py-2 text-center">11</td>
        <td class="border border-black px-4 py-2 text-sm font-semibold italic">Valuation Amount ($)</td>
        <td class="border border-black px-4 py-2">
          <input type="number" name="valuationAmount" class="w-full border border-gray-300 rounded px-2 py-1 font-bold" placeholder="0" required>
        </td>
      </tr>
    </tbody>
  </table>
</div>
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
    // Extract field names from name="..." or id="..." attributes
    const regex = /(?:name|id)=["']([^"']+)["']/g;
    const matches = [...code.matchAll(regex)];
    const fields = [...new Set(matches.map(m => m[1]))];

    // Check for inputs without name or id attributes
    const hasUnnamedInputs = (code.match(/<input(?!.*(?:name|id)=)[^>]*>/g) || []).length > 0 ||
      (code.match(/<textarea(?!.*(?:name|id)=)[^>]*>/g) || []).length > 0 ||
      (code.match(/<select(?!.*(?:name|id)=)[^>]*>/g) || []).length > 0;

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
                  {/* Warning if no inputs or ids detected */}
                  {!code.includes('name=') && !code.includes('id=') && code.length > 50 && (
                    <div className="bg-yellow-900/20 text-yellow-500 text-xs px-4 py-2 border-t border-yellow-900/30 flex items-center gap-2">
                      <AlertCircle className="h-3 w-3" />
                      Warning: No named fields or IDs detected. Users won&apos;t be able to enter data that saves.
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
                    ? `Last updated on ${template.uploadDate} `
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
