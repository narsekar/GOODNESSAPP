import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Employee, ShiftType } from '../types';
import { DAYS_OF_WEEK, SHIFTS, WARDS, UNITS, DESIGNATIONS } from '../data';
import { FileSpreadsheet, Upload, X, AlertCircle, CheckCircle2, Download, FileText, ArrowRight } from 'lucide-react';

interface DataImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importedEmployees: Employee[], mode: 'append' | 'replace') => void;
  currentStaffCount: number;
}

export default function DataImporterModal({
  isOpen,
  onClose,
  onImport,
  currentStaffCount
}: DataImporterModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [activeInputMethod, setActiveInputMethod] = useState<'file' | 'paste'>('file');
  const [parsedEmployees, setParsedEmployees] = useState<Employee[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('replace');
  const [parseError, setParseError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Header normalization helper
  const normalizeHeaderKey = (key: string): string => {
    return key.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  };

  // Process raw array of object rows from Excel or CSV
  const processRawRows = (rows: Record<string, any>[]) => {
    setParseError(null);
    if (!rows || rows.length === 0) {
      setParseError('The file or text provided contains no valid data rows.');
      setParsedEmployees([]);
      return;
    }

    const result: Employee[] = [];
    const seenIds = new Set<string>();

    rows.forEach((row, idx) => {
      // Find key mappings for each row
      let rawId = '';
      let rawName = '';
      let rawDesg = '';
      let rawPassword = '';
      let rawWard = '';
      let rawUnit = '';
      let rawShift = '';
      let rawWeekOff = '';

      Object.entries(row).forEach(([key, val]) => {
        if (val === undefined || val === null) return;
        const normKey = normalizeHeaderKey(key);
        const strVal = String(val).trim();

        if (normKey === 'empid' || normKey === 'id' || normKey === 'employeeid' || normKey === 'staffid') {
          rawId = strVal;
        } else if (normKey === 'employeename' || normKey === 'name' || normKey === 'fullname' || normKey === 'staffname') {
          rawName = strVal;
        } else if (
          normKey === 'designation1' || 
          normKey === 'designation' || 
          normKey === 'desg' || 
          normKey === 'desig' || 
          normKey === 'role' || 
          normKey === 'post' || 
          normKey === 'category' || 
          normKey === 'cadre'
        ) {
          rawDesg = strVal;
        } else if (
          normKey === 'passward' ||
          normKey === 'password' ||
          normKey === 'pass' ||
          normKey === 'pwd'
        ) {
          rawPassword = strVal;
        } else if (
          normKey === 'adward' || 
          normKey === 'ward' || 
          normKey === 'department' || 
          normKey === 'dept'
        ) {
          rawWard = strVal;
        } else if (
          normKey === 'unit' || 
          normKey === 'unitno' || 
          normKey === 'unitnumber' || 
          normKey === 'units' || 
          normKey === 'section' || 
          normKey === 'adunit'
        ) {
          rawUnit = strVal;
        } else if (normKey === 'shift' || normKey === 'shifttype') {
          rawShift = strVal;
        } else if (normKey === 'weekoff' || normKey === 'restday' || normKey === 'offday' || normKey === 'currentweekoff' || normKey === 'wo' || normKey === 'weekoffday') {
          rawWeekOff = strVal;
        }
      });

      // Clean ID to numeric
      let cleanId = rawId.replace(/\D/g, '');
      if (!cleanId) {
        cleanId = String(1001 + idx);
      }

      // Avoid duplicate IDs in same file import
      let finalId = cleanId;
      let counter = 1;
      while (seenIds.has(finalId)) {
        finalId = `${cleanId}_${counter}`;
        counter++;
      }
      seenIds.add(finalId);

      // Clean Name
      const finalName = rawName || `Staff Member ${finalId}`;

      // Clean Designation: Preserve exact uploaded designation (e.g. from DESIGNATION1)
      let finalDesg = rawDesg.trim();
      if (!finalDesg) {
        finalDesg = 'Staff Member';
      } else {
        const found = DESIGNATIONS.find(d => d.toLowerCase() === finalDesg.toLowerCase());
        if (found) finalDesg = found;
      }

      // Clean Ward: Preserve exact uploaded ward (e.g. from AD. WARD)
      let finalWard = rawWard.trim();
      if (!finalWard) {
        finalWard = 'General Ward';
      } else {
        const found = WARDS.find(w => w.toLowerCase() === finalWard.toLowerCase());
        if (found) finalWard = found;
      }

      // Clean Shift
      let finalShift: ShiftType = 'A Shift';
      if (rawShift) {
        const sLower = rawShift.toLowerCase();
        if (sLower.includes('a') && !sLower.includes('b') && !sLower.includes('c')) finalShift = 'A Shift';
        else if (sLower.includes('b')) finalShift = 'B Shift';
        else if (sLower.includes('c')) finalShift = 'C Shift';
        else if (sLower.includes('night')) finalShift = 'Night Shift';
        else if (sLower.includes('gen')) finalShift = 'General Shift';
      }

      // Clean Unit: Preserve exact uploaded Unit from Excel (e.g. "Unit 1", "Unit 2", "1", "2")
      let finalUnit = rawUnit.trim();
      if (finalUnit) {
        if (/^\d+$/.test(finalUnit)) {
          finalUnit = `Unit ${finalUnit}`;
        } else {
          const uFound = UNITS.find(u => u.toLowerCase() === finalUnit.toLowerCase());
          if (uFound) finalUnit = uFound;
        }
      }

      // Clean Week Off
      let finalWeekOff = '';
      if (rawWeekOff && rawWeekOff.trim()) {
        const trimmedWo = rawWeekOff.trim();
        const dayFound = DAYS_OF_WEEK.find(d => d.toLowerCase().startsWith(trimmedWo.toLowerCase().slice(0, 3)));
        if (dayFound) {
          finalWeekOff = dayFound;
        } else {
          finalWeekOff = trimmedWo;
        }
      }

      result.push({
        id: finalId,
        name: finalName,
        designation: finalDesg,
        ward: finalWard,
        shift: finalShift,
        unit: finalUnit,
        weekOff: finalWeekOff,
        password: rawPassword
      });
    });

    if (result.length === 0) {
      setParseError('Failed to parse valid staff records from the input.');
    } else {
      setParsedEmployees(result);
    }
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setIsProcessing(true);
    setParseError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
        processRawRows(data);
      } catch (err) {
        console.error(err);
        setParseError('Unable to parse the Excel / CSV file. Please ensure it is a valid format.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(uploadedFile);
  };

  // Text Paste Handler
  const handleParsePastedText = () => {
    if (!pasteText.trim()) {
      setParseError('Please paste your CSV or tab-separated spreadsheet data.');
      return;
    }

    try {
      setIsProcessing(true);
      const wb = XLSX.read(pasteText, { type: 'string' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
      processRawRows(data);
    } catch (err) {
      console.error(err);
      setParseError('Failed to parse pasted text. Please check the delimiter or copy again from Excel.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'EMP ID': '1001',
        'EMPLOYEE NAME': 'Aarav Sharma',
        'DESIGNATION': 'Staff Nurse',
        'PASSWARD': '123456',
        'AD. WARD': 'ICU',
        'UNIT': 'Unit 1',
        'SHIFT': 'A Shift',
        'WEEK OFF': 'Sunday'
      },
      {
        'EMP ID': '1002',
        'EMPLOYEE NAME': 'Bhavna Sen',
        'DESIGNATION': 'Ward Assistant',
        'PASSWARD': '123456',
        'AD. WARD': 'Emergency',
        'UNIT': 'Unit 2',
        'SHIFT': 'B Shift',
        'WEEK OFF': 'Monday'
      },
      {
        'EMP ID': '1003',
        'EMPLOYEE NAME': 'Chirag Patel',
        'DESIGNATION': 'Senior Resident',
        'PASSWARD': '654321',
        'AD. WARD': 'Ward 1',
        'UNIT': '',
        'SHIFT': 'Night Shift',
        'WEEK OFF': 'Wednesday'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Roster_Template');
    XLSX.writeFile(wb, 'Roster_Staff_Import_Template.xlsx');
  };

  const handleConfirmImport = () => {
    if (parsedEmployees.length === 0) return;
    onImport(parsedEmployees, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl flex items-center justify-center font-bold">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Import Staff Data (Excel / CSV)</h3>
                <span className="bg-emerald-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin Exclusive
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Bulk upload White Collar staff records with custom Login Password into the Roster System
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          
          {/* Header Field Legend & Download Template Callout */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-1">
              <h4 className="font-bold text-emerald-900 text-xs">Supported Heading Headers:</h4>
              <p className="text-[11px] text-emerald-800 leading-relaxed font-mono">
                <span className="font-bold text-emerald-950 bg-emerald-200/70 px-1 rounded">EMP ID</span> | <span className="font-bold text-emerald-950 bg-emerald-200/70 px-1 rounded">EMPLOYEE NAME</span> | <span className="font-bold text-emerald-950 bg-emerald-200/70 px-1 rounded">DESIGNATION</span> | <span className="font-bold text-emerald-950 bg-emerald-200/70 px-1 rounded">PASSWARD</span> | <span className="font-bold">AD. WARD</span> | <span className="font-bold">UNIT</span> | <span className="font-bold">SHIFT</span> | <span className="font-bold">WEEK OFF</span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
            >
              <Download size={14} />
              Sample Template
            </button>
          </div>

          {/* Input Method Switcher */}
          <div className="flex border-b border-slate-200 gap-6 font-bold text-xs">
            <button
              onClick={() => { setActiveInputMethod('file'); setParseError(null); }}
              className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeInputMethod === 'file'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Upload size={15} />
              Upload Excel / CSV File
            </button>

            <button
              onClick={() => { setActiveInputMethod('paste'); setParseError(null); }}
              className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeInputMethod === 'paste'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <FileText size={15} />
              Paste Raw Data
            </button>
          </div>

          {/* METHOD 1: File Upload */}
          {activeInputMethod === 'file' && (
            <div className="space-y-3">
              <label className="block border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-emerald-50/30 transition-colors">
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <Upload size={28} className="mx-auto text-emerald-600 mb-2" />
                <span className="font-bold text-slate-800 block">Click to browse or drop your Excel file here</span>
                <span className="text-[11px] text-slate-400 block mt-1">Accepts .xlsx, .xls, or .csv files</span>
                {file && (
                  <span className="inline-block mt-3 bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-full text-xs">
                    📁 {file.name}
                  </span>
                )}
              </label>
            </div>
          )}

          {/* METHOD 2: Paste Raw Data */}
          {activeInputMethod === 'paste' && (
            <div className="space-y-3">
              <label className="block text-slate-600 font-bold">Copy cells directly from Excel and paste below:</label>
              <textarea
                rows={5}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={`EMP ID\tEMPLOYEE NAME\tDESIGNATION\tPASSWARD\tAD. WARD\tUNIT\tSHIFT\tWEEK OFF\n1001\tAnil Kumar\tStaff Nurse\t123456\tICU\tUnit 1\tA Shift\tSunday`}
                className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="button"
                onClick={handleParsePastedText}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
              >
                Parse Pasted Data
              </button>
            </div>
          )}

          {/* Error Banner */}
          {parseError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 font-semibold">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Preview Parsed Staff Table */}
          {parsedEmployees.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <h4 className="font-bold text-slate-900">
                    Preview Parsed Records ({parsedEmployees.length} Staff)
                  </h4>
                </div>

                {/* Import Mode Selector */}
                <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-lg">
                  <label className="flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded text-[11px] font-bold">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="accent-emerald-600"
                    />
                    Append & Merge ({currentStaffCount} existing)
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded text-[11px] font-bold text-rose-700">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="accent-rose-600"
                    />
                    Replace All Active Roster
                  </label>
                </div>
              </div>

              {/* Preview Table */}
              <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                    <tr>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Designation</th>
                      <th className="px-3 py-2">Passward</th>
                      <th className="px-3 py-2">AD. Ward</th>
                      <th className="px-3 py-2">Shift</th>
                      <th className="px-3 py-2">Unit</th>
                      <th className="px-3 py-2">Week Off</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-[11px]">
                    {parsedEmployees.map((emp, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-mono font-bold text-slate-600">{emp.id}</td>
                        <td className="px-3 py-2 font-bold text-slate-900">{emp.name}</td>
                        <td className="px-3 py-2 text-slate-600">{emp.designation}</td>
                        <td className="px-3 py-2 font-mono text-xs text-indigo-700">{emp.password || '—'}</td>
                        <td className="px-3 py-2">
                          <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {emp.ward}
                          </span>
                        </td>
                        <td className="px-3 py-2">{emp.shift}</td>
                        <td className="px-3 py-2 text-slate-500">{emp.unit || '—'}</td>
                        <td className="px-3 py-2 font-bold text-emerald-700">{emp.weekOff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={parsedEmployees.length === 0 || isProcessing}
            onClick={handleConfirmImport}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md"
          >
            <span>Confirm & Import {parsedEmployees.length > 0 ? `${parsedEmployees.length} Staff` : ''}</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
