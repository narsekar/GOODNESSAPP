import React, { useState, useEffect, useMemo } from 'react';
import { Employee, ChangeRecord, UserSession, ShiftType, WeekOffRecord, WeekOffRequest } from './types';
import { 
  SEED_EMPLOYEES, 
  DAYS_OF_WEEK, 
  SHIFTS, 
  WARDS, 
  UNITS, 
  DESIGNATIONS,
  generateWhatsAppMessage, 
  getWhatsAppShareUrl, 
  exportToCSV, 
  exportEmployeesToCSV,
  formatDateTime,
  getCollarType
} from './data';
import LoginManager from './components/LoginManager';
import DataImporterModal from './components/DataImporterModal';
import { 
  subscribeEmployees,
  subscribeRequests,
  subscribeChangeRecords,
  saveEmployeesToCloud,
  updateEmployeeInCloud,
  saveRequestToCloud,
  updateRequestStatusInCloud,
  saveChangeRecordToCloud
} from './services/firestoreService';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { 
  Calendar, Layers, History, Users, 
  Clock, Plus, ShieldCheck, HeartPulse, UserPlus, 
  Trash2, Check, Download, Search, MessageSquare, 
  Copy, X, FileSpreadsheet, Monitor, Smartphone, Filter, 
  ChevronRight, AlertCircle, Menu
} from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<'week_off' | 'history' | 'directory'>('week_off');
  
  // Roster States
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<ChangeRecord[]>([]);
  const [requests, setRequests] = useState<WeekOffRequest[]>([]);

  // Filter States (as requested: shift, ward, unit, designation & search)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterShift, setFilterShift] = useState<string>('all');
  const [filterWard, setFilterWard] = useState<string>('all');
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const [filterDesignation, setFilterDesignation] = useState<string>('all');
  const [filterCollar, setFilterCollar] = useState<'all' | 'white' | 'blue'>('all');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interactive Adjustment Dialog States
  const [weekOffTarget, setWeekOffTarget] = useState<Employee | null>(null);
  const [newWeekOffDay, setNewWeekOffDay] = useState('');
  

  
  // Success Confirmation State for Instant WhatsApp Sharing
  const [successRecord, setSuccessRecord] = useState<ChangeRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Employee Registration Roster modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesg, setNewDesg] = useState('Staff Nurse');
  const [newWard, setNewWard] = useState('ICU');
  const [newShift, setNewShift] = useState<ShiftType>('A Shift');
  const [newUnit, setNewUnit] = useState('Unit 1');
  const [newWeekOff, setNewWeekOff] = useState('Sunday');

  // Viewport mode simulation (shows user they can toggle PC/Mobile preview for demo)
  const [previewDevice, setPreviewDevice] = useState<'auto' | 'mobile'>('auto');

  // Load state and subscribe to Firestore on mount
  useEffect(() => {
    // Ensure every new visit or page load starts at the login screen
    localStorage.removeItem('goodness_session');
    setSession(null);

    // Real-time Firestore Employees Subscription
    let isInitialLoad = true;
    const unsubEmployees = subscribeEmployees((cloudEmps) => {
      if (cloudEmps && cloudEmps.length > 0) {
        setEmployees(cloudEmps);
        localStorage.setItem('goodness_employees', JSON.stringify(cloudEmps));
      } else if (isInitialLoad) {
        // If Firestore is empty on initial setup, populate cloud with seed employees
        const stored = localStorage.getItem('goodness_employees');
        let initial: Employee[] = SEED_EMPLOYEES;
        if (stored) {
          try { initial = JSON.parse(stored); } catch {}
        }
        setEmployees(initial);
        saveEmployeesToCloud(initial, 'replace');
      }
      isInitialLoad = false;
    });

    // Real-time Firestore Week Off Requests Subscription
    const unsubRequests = subscribeRequests((cloudRequests) => {
      setRequests(cloudRequests);
      localStorage.setItem('goodness_requests', JSON.stringify(cloudRequests));
    });

    // Real-time Firestore Change Records Subscription
    const unsubRecords = subscribeChangeRecords((cloudRecords) => {
      setRecords(cloudRecords);
      localStorage.setItem('goodness_records', JSON.stringify(cloudRecords));
    });

    return () => {
      unsubEmployees();
      unsubRequests();
      unsubRecords();
    };
  }, []);

  // Sync session and employees rosters
  const handleLogin = (userSession: UserSession) => {
    setSession(userSession);
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('goodness_session');
  };

  // Filter logic based on user filters
  const filteredEmployees = employees.filter((emp) => {
    // 1. Text search (ID or Name)
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      emp.id.toLowerCase().includes(query) ||
      emp.name.toLowerCase().includes(query);

    // 2. Shift Filter
    const matchesShift = filterShift === 'all' || emp.shift === filterShift;

    // 3. Ward Filter
    const matchesWard = filterWard === 'all' || emp.ward === filterWard;

    // 4. Unit Filter
    const empUnitClean = (emp.unit || '').trim();
    const matchesUnit = 
      filterUnit === 'all' || 
      (filterUnit === 'empty' 
        ? (!empUnitClean || empUnitClean === '' || empUnitClean === '-')
        : empUnitClean === filterUnit);

    // 5. Designation Filter
    const matchesDesignation = filterDesignation === 'all' || emp.designation === filterDesignation;

    // 6. Collar Type Filter (White Collar or Blue Collar)
    const collarType = getCollarType(emp.designation, emp.id);
    const matchesCollar = filterCollar === 'all' || collarType === filterCollar;

    return matchesSearch && matchesShift && matchesWard && matchesUnit && matchesDesignation && matchesCollar;
  });

  // Dynamically available designations and wards including imported excel data
  const availableDesignations = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => {
      if (e.designation && e.designation.trim()) {
        set.add(e.designation.trim());
      }
    });
    if (set.size === 0) {
      DESIGNATIONS.forEach(d => set.add(d));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [employees]);

  const availableWards = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => {
      if (e.ward && e.ward.trim()) {
        set.add(e.ward.trim());
      }
    });
    if (set.size === 0) {
      WARDS.forEach(w => set.add(w));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [employees]);

  const availableUnits = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => {
      if (e.unit && e.unit.trim()) {
        const u = e.unit.trim();
        if (!/^unit\s*[1-5]$/i.test(u)) {
          set.add(u);
        }
      }
    });
    if (set.size === 0) {
      UNITS.forEach(u => {
        if (!/^unit\s*[1-5]$/i.test(u)) {
          set.add(u);
        }
      });
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [employees]);

  const availableShifts = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => {
      if (e.shift && e.shift.trim()) {
        set.add(e.shift.trim());
      }
    });
    if (set.size === 0) {
      SHIFTS.forEach(s => set.add(s));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [employees]);

  // Open Week Off Change Panel
  const initiateWeekOffChange = (emp: Employee) => {
    setWeekOffTarget(emp);
    const initialDay = DAYS_OF_WEEK.find(day => day !== emp.weekOff) || 'Monday';
    setNewWeekOffDay(initialDay);
  };

  // Submit Week Off Change
  const submitWeekOffChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weekOffTarget || !session) return;

    if (newWeekOffDay === weekOffTarget.weekOff) {
      alert('New Week Off must be different from current Week Off!');
      return;
    }

    const newRecord: WeekOffRecord = {
      id: `WO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'week_off',
      empId: weekOffTarget.id,
      empName: weekOffTarget.name,
      submittedBy: session.username,
      submittedByRole: session.role,
      timestamp: new Date().toISOString(),
      previousWeekOff: weekOffTarget.weekOff,
      newWeekOff: newWeekOffDay
    };

    // Update active roster database locally and in Firestore cloud
    const updatedTarget = { ...weekOffTarget, weekOff: newWeekOffDay };
    const updatedEmployees = employees.map(emp => {
      if (emp.id === weekOffTarget.id) {
        return updatedTarget;
      }
      return emp;
    });

    setEmployees(updatedEmployees);
    localStorage.setItem('goodness_employees', JSON.stringify(updatedEmployees));
    updateEmployeeInCloud(updatedTarget);

    const updatedRecords = [newRecord, ...records];
    setRecords(updatedRecords);
    localStorage.setItem('goodness_records', JSON.stringify(updatedRecords));
    saveChangeRecordToCloud(newRecord);

    // Open successful share panel
    setSuccessRecord(newRecord);
    setWeekOffTarget(null);
  };

  // Direct Interactive Spreadsheet Week Off Change
  const handleDirectWeekOffChange = (emp: Employee, newDay: string) => {
    if (!session) return;
    if (newDay === emp.weekOff) return;

    const newRecord: WeekOffRecord = {
      id: `WO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'week_off',
      empId: emp.id,
      empName: emp.name,
      submittedBy: session.username,
      submittedByRole: session.role,
      timestamp: new Date().toISOString(),
      previousWeekOff: emp.weekOff,
      newWeekOff: newDay
    };

    // Update active roster database locally and in Firestore cloud
    const updatedEmp = { ...emp, weekOff: newDay };
    const updatedEmployees = employees.map(e => {
      if (e.id === emp.id) {
        return updatedEmp;
      }
      return e;
    });

    setEmployees(updatedEmployees);
    localStorage.setItem('goodness_employees', JSON.stringify(updatedEmployees));
    updateEmployeeInCloud(updatedEmp);

    const updatedRecords = [newRecord, ...records];
    setRecords(updatedRecords);
    localStorage.setItem('goodness_records', JSON.stringify(updatedRecords));
    saveChangeRecordToCloud(newRecord);

    // Trigger success confirmation pop-up instantly
    setSuccessRecord(newRecord);
  };

  // Submit a week off request from a normal employee (White or Blue Collar)
  const handleRequestWeekOffChange = (empId: string, proposedDay: string) => {
    if (!session) return;
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    // Check if there is already a pending request
    const existingPending = requests.some(r => r.empId === empId && r.status === 'pending');
    if (existingPending) {
      alert("You already have a pending week off request! Please wait for your supervisor to update/approve it.");
      return;
    }

    if (proposedDay === emp.weekOff) {
      alert("Your proposed week off day is already your current week off!");
      return;
    }

    const collarType = getCollarType(emp.designation, emp.id);

    const newRequest: WeekOffRequest = {
      id: `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      empId: emp.id,
      empName: emp.name,
      designation: emp.designation,
      collarType,
      currentWeekOff: emp.weekOff,
      proposedWeekOff: proposedDay,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    const updated = [newRequest, ...requests];
    setRequests(updated);
    localStorage.setItem('goodness_requests', JSON.stringify(updated));
    saveRequestToCloud(newRequest);
    alert("Your week off request has been submitted successfully to your supervisor! They will update it soon.");
  };

  // Supervisor (Admin) approves a request and updates roster
  const handleApproveRequest = (req: WeekOffRequest) => {
    if (!session || session.role !== 'admin') return;

    // 1. Update the employee's active roster weekOff day locally and in cloud
    let updatedEmpTarget: Employee | null = null;
    const updatedEmployees = employees.map(emp => {
      if (emp.id === req.empId) {
        updatedEmpTarget = { ...emp, weekOff: req.proposedWeekOff };
        return updatedEmpTarget;
      }
      return emp;
    });
    setEmployees(updatedEmployees);
    localStorage.setItem('goodness_employees', JSON.stringify(updatedEmployees));
    if (updatedEmpTarget) {
      updateEmployeeInCloud(updatedEmpTarget);
    }

    // 2. Create the historical change log record so they can share on WhatsApp / see history
    const newRecord: WeekOffRecord = {
      id: `WO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'week_off',
      empId: req.empId,
      empName: req.empName,
      submittedBy: session.username,
      submittedByRole: session.role,
      timestamp: new Date().toISOString(),
      previousWeekOff: req.currentWeekOff,
      newWeekOff: req.proposedWeekOff
    };
    const updatedRecords = [newRecord, ...records];
    setRecords(updatedRecords);
    localStorage.setItem('goodness_records', JSON.stringify(updatedRecords));
    saveChangeRecordToCloud(newRecord);

    // 3. Mark the request as approved in cloud
    const updatedRequests = requests.map(r => {
      if (r.id === req.id) {
        return { ...r, status: 'approved' as const };
      }
      return r;
    });
    setRequests(updatedRequests);
    localStorage.setItem('goodness_requests', JSON.stringify(updatedRequests));
    updateRequestStatusInCloud(req.id, 'approved');

    // 4. Open success panel / copy success record
    setSuccessRecord(newRecord);
    alert(`Success: Approved & Updated ${req.empName}'s weekly off to ${req.proposedWeekOff}!`);
  };

  // Supervisor (Admin) declines/rejects a request
  const handleRejectRequest = (reqId: string) => {
    if (!session || session.role !== 'admin') return;

    if (confirm("Are you sure you want to decline this week off request?")) {
      const updatedRequests = requests.map(r => {
        if (r.id === reqId) {
          return { ...r, status: 'rejected' as const };
        }
        return r;
      });
      setRequests(updatedRequests);
      localStorage.setItem('goodness_requests', JSON.stringify(updatedRequests));
      updateRequestStatusInCloud(reqId, 'rejected');
    }
  };

  // Supervisor (Admin) deletes a request log entry
  const handleDeleteRequestLog = (reqId: string) => {
    if (!session || session.role !== 'admin') return;
    if (confirm("Are you sure you want to permanently delete this request log entry?")) {
      const updated = requests.filter(r => r.id !== reqId);
      setRequests(updated);
      localStorage.setItem('goodness_requests', JSON.stringify(updated));
      deleteDoc(doc(db, 'week_off_requests', reqId)).catch(console.error);
    }
  };

  // Delete Record validation
  const handleDeleteRecord = (id: string) => {
    const record = records.find(r => r.id === id);
    if (!record || !session) return;

    const isAdmin = session.role === 'admin';
    const isOwner = record.submittedBy === session.username;

    if (isAdmin || isOwner) {
      if (confirm(`Are you sure you want to permanently delete this adjustment record?`)) {
        const updated = records.filter(r => r.id !== id);
        setRecords(updated);
        localStorage.setItem('goodness_records', JSON.stringify(updated));
        deleteDoc(doc(db, 'change_records', id)).catch(console.error);
      }
    } else {
      alert("Error: You only have permission to delete entries that you personally created!");
    }
  };

  // Add new staff directly
  const submitAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId.trim() || !newName.trim()) return;

    const formattedId = newId.replace(/\D/g, '').trim();
    if (!formattedId) {
      alert('Please enter a valid numeric Employee ID (e.g. 1011)!');
      return;
    }

    if (employees.some(emp => emp.id === formattedId)) {
      alert('This Employee ID is already registered in the system!');
      return;
    }

    const newEmp: Employee = {
      id: formattedId,
      name: newName.trim(),
      designation: newDesg,
      ward: newWard,
      shift: newShift,
      unit: newShift === 'A Shift' ? newUnit : '',
      weekOff: newWeekOff
    };

    const updated = [...employees, newEmp];
    setEmployees(updated);
    localStorage.setItem('goodness_employees', JSON.stringify(updated));
    updateEmployeeInCloud(newEmp);

    // Reset fields
    setNewId('');
    setNewName('');
    setShowAddModal(false);
  };

  // Delete staff from active directory (Admin only)
  const handleDeleteStaffDirectly = (id: string) => {
    if (!session || session.role !== 'admin') {
      alert("Only an Administrator can remove staff members from the primary roster.");
      return;
    }
    if (confirm(`Are you sure you want to permanently delete Employee ${id} from the roster? This does not alter previous logs.`)) {
      const updated = employees.filter(e => e.id !== id);
      setEmployees(updated);
      localStorage.setItem('goodness_employees', JSON.stringify(updated));
      deleteDoc(doc(db, 'employees', id)).catch(console.error);
    }
  };

  // Clear / Reset roster data (Admin only)
  const handleClearRoster = () => {
    if (!session || session.role !== 'admin') {
      alert("Only an Administrator can reset or clear the roster dataset.");
      return;
    }
    if (confirm("Are you sure you want to clear all existing roster data? You can then import your new Excel/CSV dataset.")) {
      setEmployees([]);
      localStorage.setItem('goodness_employees', JSON.stringify([]));
      saveEmployeesToCloud([], 'replace');
      alert("Roster dataset cleared! You can now import your new Excel data.");
    }
  };

  // Bulk Import Excel / CSV Data Handler (Admin only)
  const handleBulkImportEmployees = (imported: Employee[], mode: 'append' | 'replace') => {
    if (!session || session.role !== 'admin') {
      alert('Only Administrators can perform bulk data imports.');
      return;
    }

    let updated: Employee[] = [];
    if (mode === 'replace') {
      updated = imported;
    } else {
      // Merge: replace existing matching IDs, add new ones
      const map = new Map<string, Employee>();
      employees.forEach(e => map.set(e.id, e));
      imported.forEach(e => map.set(e.id, e));
      updated = Array.from(map.values());
    }

    setEmployees(updated);
    localStorage.setItem('goodness_employees', JSON.stringify(updated));
    saveEmployeesToCloud(updated, mode);
  };

  const handleCopySuccessMessage = (rec: ChangeRecord) => {
    const msg = generateWhatsAppMessage(rec);
    navigator.clipboard.writeText(msg);
    setCopiedId(rec.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareWhatsAppDirect = (rec: ChangeRecord) => {
    const msg = generateWhatsAppMessage(rec);
    const url = getWhatsAppShareUrl(msg);
    window.open(url, '_blank', 'noreferrer,noopener');
  };

  // Group active employees by Ward for summary reporting
  const wardsRepresented = Array.from(new Set(employees.map(e => e.ward)));

  const currentEmployee = useMemo(() => {
    if (!session || !session.empId) return null;
    return employees.find(e => e.id === session.empId) || null;
  }, [session, employees]);

  const currentEmployeeCollar = useMemo(() => {
    if (!currentEmployee) return null;
    return getCollarType(currentEmployee.designation, currentEmployee.id);
  }, [currentEmployee]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased font-sans flex flex-col lg:flex-row">
      
      {/* If user is not logged in, show centered login screen */}
      {!session ? (
        <div className="flex-1 flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full">
            {/* Logo area */}
            <div className="flex flex-col items-center justify-center gap-2 mb-8 text-center">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                <HeartPulse size={26} className="animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">Goodness App</h1>
                <p className="text-xs font-semibold text-emerald-700 tracking-wider uppercase mt-1">Roster & Transfer System</p>
              </div>
            </div>
            
            <LoginManager session={session} employees={employees} onLogin={handleLogin} onLogout={handleLogout} />
          </div>
        </div>
      ) : (
        <>
          {/* Mobile top bar navigation header */}
          <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                <HeartPulse size={16} />
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight text-slate-900 leading-none">Goodness App</h1>
                <span className="text-[10px] text-emerald-700 font-extrabold uppercase mt-0.5 block">Roster Hub</span>
              </div>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:text-emerald-700 cursor-pointer"
            >
              <Menu size={18} />
            </button>
          </header>

          {/* Sidebar Drawer Backdrop for mobile */}
          {mobileMenuOpen && (
            <div 
              className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* Left Sidebar Content Panel */}
          <aside 
            className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 py-6 px-4 flex flex-col justify-between transition-transform duration-300 transform lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Upper Sidebar Area */}
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-emerald-100">
                  <HeartPulse size={18} className="animate-pulse" />
                </div>
                <div>
                  <h1 className="text-md font-extrabold tracking-tight text-slate-900 leading-tight">Goodness App</h1>
                  <p className="text-[10px] font-bold text-emerald-700 tracking-wide uppercase">Roster & Duty Hub</p>
                </div>
              </div>

              {/* Login Status */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Active Session</span>
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">
                    {session.role === 'white_collar' ? `Hallo ${session.username}` : session.username}
                  </h4>
                  <p className="text-[10px] text-slate-400 capitalize font-semibold">
                    {session.role === 'admin' 
                      ? 'Administrator' 
                      : currentEmployeeCollar === 'blue' 
                        ? 'Blue Collar Staff' 
                        : 'White Collar Staff'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full mt-1.5 py-1.5 px-3 bg-white hover:bg-rose-50 text-rose-600 border border-rose-100 hover:border-rose-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer text-center"
                >
                  Log Out
                </button>
              </div>

              {/* Vertical Menu Navigation Options */}
              <nav className="space-y-1">
                <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-2 mb-2">Navigation Menu</span>
                
                {/* Option 1: Week Off Changes */}
                <button
                  onClick={() => {
                    setActiveTab('week_off');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left border ${
                    activeTab === 'week_off'
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-100 font-extrabold'
                      : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Calendar size={15} className={activeTab === 'week_off' ? 'text-emerald-700' : 'text-slate-400'} />
                  <span>Week Off Changes</span>
                </button>
              </nav>
            </div>

            {/* Lower Sidebar Area: Version Info */}
            <div className="space-y-4 border-t border-slate-100 pt-4">
              <div className="pl-2 leading-snug">
                <span className="text-[10px] text-slate-400 font-bold block">Goodness App v1.2.0</span>
                <span className="text-[9px] text-slate-300 block">Duty Adjuster Suite</span>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className={`flex-1 flex flex-col min-w-0 w-full ${
            previewDevice === 'mobile' ? 'max-w-md mx-auto bg-white border-x border-slate-200 shadow-xl rounded-2xl my-4' : 'w-full'
          }`}>
            
            {/* Main Interactive Workspace Container */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
              
              {/* HIGH DENSITY SEARCH & DROP-DOWN CONTROLS */}
              {activeTab !== 'directory' && (
                <section className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Filter size={13} className="text-emerald-600" />
                      Roster Database Filters
                    </h2>
                    
                    <div className="flex items-center gap-3">
                      {session?.role === 'admin' && (
                        <button 
                          type="button"
                          onClick={() => setShowImportModal(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                          title="Import Excel / CSV staff data (Admin Only)"
                        >
                          <FileSpreadsheet size={13} className="text-emerald-700" />
                          <span>Import Excel Data</span>
                        </button>
                      )}

                      {/* Clear Filters helper */}
                      {(searchQuery || searchInput || filterShift !== 'all' || filterWard !== 'all' || filterUnit !== 'all' || filterDesignation !== 'all' || filterCollar !== 'all') && (
                        <button 
                          onClick={() => {
                            setSearchQuery('');
                            setSearchInput('');
                            setFilterShift('all');
                            setFilterWard('all');
                            setFilterUnit('all');
                            setFilterDesignation('all');
                            setFilterCollar('all');
                          }}
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-950 underline cursor-pointer"
                        >
                          Reset All Filters
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Grid of Inputs */}
                  <div className="space-y-4">
                    
                    {/* 1. Search Bar */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Search Employee</label>
                      <div className="flex gap-1.5 items-center">
                        <div className="relative flex-1">
                          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                          <input 
                            type="text"
                            placeholder="Type name or ID (e.g. 1001)..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                // Apply search query
                                setSearchQuery(searchInput);
                              }
                            }}
                            className="w-full pl-9 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setSearchQuery(searchInput)}
                          className="px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs h-8 transition-colors cursor-pointer flex items-center justify-center shrink-0 shadow-xs"
                        >
                          Search
                        </button>
                        <div className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-xs font-black shrink-0 text-center flex items-center gap-1 shadow-2xs" title="Matching Staff Count">
                          <span className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">Count:</span>
                          <span>{filteredEmployees.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Responsive Selection Options Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                      {/* Shift selection */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Select Shift</label>
                        <select
                          value={filterShift}
                          onChange={(e) => setFilterShift(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                        >
                          <option value="all">All Shifts</option>
                          {availableShifts.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* Ward Selection */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Select Ward / Dept</label>
                        <select
                          value={filterWard}
                          onChange={(e) => setFilterWard(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                        >
                          <option value="all">All Wards / Departments</option>
                          {availableWards.map(w => (
                            <option key={w} value={w}>{w}</option>
                          ))}
                        </select>
                      </div>

                      {/* Unit Selection */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">
                          Select Unit
                        </label>
                        <select
                          value={filterUnit}
                          onChange={(e) => setFilterUnit(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                        >
                          <option value="all">All Units</option>
                          <option value="empty">Empty</option>
                          {availableUnits.map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>

                      {/* Designation selection */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Select Designation</label>
                        <select
                          value={filterDesignation}
                          onChange={(e) => setFilterDesignation(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                        >
                          <option value="all">All Designations</option>
                          {availableDesignations.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      {/* Collar Category selection */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-emerald-800 uppercase tracking-tight">Collar Category</label>
                        <select
                          value={filterCollar}
                          onChange={(e) => setFilterCollar(e.target.value as any)}
                          className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-200 text-emerald-950 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 cursor-pointer"
                        >
                          <option value="all">All (White & Blue)</option>
                          <option value="white">White Collar</option>
                          <option value="blue">Blue Collar</option>
                        </select>
                      </div>
                    </div>

                  </div>
                </section>
              )}

              {/* TAB CONTENTS */}
              <div className="space-y-4">
              
              {/* --- WEEK OFF ROSTER VIEW (Excel styled spreadsheet) --- */}
              {activeTab === 'week_off' && (
                <div className="space-y-6">
                  
                  {/* ROLE-BASED DASHBOARDS (Top Section of Roster View) */}
                  {session?.role === 'admin' ? (
                    /* ---------------- SUPERVISOR PENDING UPDATES QUEUE ---------------- */
                    <section className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                            <ShieldCheck size={18} />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                              <span>Supervisor Update Queue</span>
                              <span className="text-[10px] bg-amber-500/25 text-amber-400 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/20">
                                {requests.filter(r => r.status === 'pending').length} Pending
                              </span>
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Review week-off submissions filled by both White and Blue collar employees, then click Update to apply.
                            </p>
                          </div>
                        </div>
                      </div>

                      {requests.filter(r => r.status === 'pending').length === 0 ? (
                        <div className="py-6 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                          <ShieldCheck size={24} className="mx-auto text-emerald-500 mb-1.5" />
                          <h4 className="text-xs font-semibold text-slate-300">All Filled Submissions Updated</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">There are no pending week off requests requiring approval at this time.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {requests.filter(r => r.status === 'pending').map((req) => (
                            <div key={req.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-2xs hover:border-slate-700 transition-colors">
                              <div>
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="text-xs font-bold text-slate-100 truncate">{req.empName}</h4>
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                                    req.collarType === 'blue' 
                                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' 
                                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25'
                                  }`}>
                                    {req.collarType === 'blue' ? 'Blue Collar' : 'White Collar'}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono font-semibold mt-0.5">
                                  ID: {req.empId} • {req.designation}
                                </div>
                                
                                <div className="mt-3 py-1.5 px-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-bold">
                                  <div className="text-slate-400">Current Off: <span className="line-through text-slate-500 font-medium block">{req.currentWeekOff}</span></div>
                                  <div className="text-emerald-400">Proposed Off: <span className="text-emerald-400 block font-black uppercase tracking-wider">{req.proposedWeekOff}</span></div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-2 border-t border-slate-800/60 pt-2.5">
                                <span className="text-[9px] text-slate-500 font-semibold font-mono">
                                  {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleRejectRequest(req.id)}
                                    className="px-2.5 py-1 text-[11px] font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 rounded-lg transition-colors cursor-pointer"
                                  >
                                    Decline
                                  </button>
                                  <button
                                    onClick={() => handleApproveRequest(req)}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                                  >
                                    <Check size={11} />
                                    <span>Approve & Update</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  ) : null}

                  {/* Main spreadsheet card */}
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                    
                    {/* Spreadsheet Header Strip with Ward-Wise Export */}
                    <div className="bg-slate-50 px-4 sm:px-6 py-4 border-b border-b-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <FileSpreadsheet size={16} className="text-emerald-700" />
                          <span>Excel-Type Week Off Master</span>
                          <span className="text-xs bg-emerald-50 text-emerald-800 font-mono font-bold px-2.5 py-0.5 rounded-full">
                            {filteredEmployees.length} Shown
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          View active roster personnel and change their weekly rest days below.
                        </p>
                      </div>

                      {/* Ward-wise Export Feature (Admin Only) */}
                      {session?.role === 'admin' && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-500 hidden sm:inline">Ward Excel Export:</span>
                          <select 
                            id="ward-wise-export-select"
                            value={filterWard}
                            onChange={(e) => setFilterWard(e.target.value)}
                            className="bg-white text-xs border border-slate-200 px-2 py-1.5 rounded-lg font-bold focus:outline-none"
                          >
                            <option value="all">All Wards</option>
                            {availableWards.map(w => <option key={w} value={w}>{w}</option>)}
                          </select>
                          <button
                            onClick={() => exportEmployeesToCSV(employees, filterWard)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                            title="Download Ward-wise filtered employees roster to CSV"
                          >
                            <Download size={13} />
                            Export Active (.CSV)
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Empty State */}
                    {filteredEmployees.length === 0 ? (
                      <div className="p-12 text-center">
                        <AlertCircle size={32} className="mx-auto text-slate-400 mb-2" />
                        <h4 className="text-sm font-bold text-slate-700">No employees match filters</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          Please clear or edit your search keywords or drop-down filters to find active roster staff.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* PC VIEW: HIGH DENSITY SPREADSHEET */}
                        <div className={`overflow-x-auto ${previewDevice === 'mobile' ? 'hidden' : 'hidden lg:block'}`}>
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="px-5 py-2.5 border-r border-slate-100 font-mono w-24">Emp ID</th>
                                <th className="px-5 py-2.5 border-r border-slate-100">Full Name</th>
                                <th className="px-5 py-2.5 border-r border-slate-100">Designation, Ward & Unit</th>
                                <th className="px-5 py-2.5 border-r border-slate-100 text-center">Category</th>
                                <th className="px-5 py-2.5 border-r border-slate-100 text-center bg-emerald-50/40 text-emerald-800 font-black">Current Week Off</th>
                                {session?.role === 'admin' && <th className="px-5 py-2.5 text-right">Action</th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                              {filteredEmployees.map((emp) => {
                                const collar = getCollarType(emp.designation, emp.id);
                                const isSelf = session?.empId === emp.id;
                                // Admin and White Collar users can edit week off directly in the dropdown
                                const isEditable = session?.role === 'admin' || session?.role === 'white_collar';

                                return (
                                  <tr 
                                    key={emp.id} 
                                    className={`hover:bg-slate-50/80 transition-colors ${isSelf ? 'bg-emerald-50/30' : ''}`}
                                  >
                                    <td className="px-5 py-2.5 border-r border-slate-100 font-mono text-[11px] font-bold text-slate-500">
                                      {emp.id}
                                    </td>
                                    <td className="px-5 py-2.5 border-r border-slate-100 text-slate-900 font-bold">
                                      <div className="flex items-center gap-1.5">
                                        <span>{emp.name}</span>
                                        {isSelf && (
                                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded-full border border-emerald-200 uppercase tracking-tight shrink-0">
                                            You
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-5 py-2.5 border-r border-slate-100">
                                      <div className="font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                                        <span>{emp.designation}</span>
                                        {emp.unit && emp.unit.trim() !== '' && emp.unit.trim() !== '-' && (
                                          <span className="text-[10px] bg-emerald-100 text-emerald-900 font-extrabold px-2 py-0.5 rounded-md border border-emerald-300 shadow-2xs">
                                            {emp.unit}
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-semibold">{emp.ward} • {emp.shift}</div>
                                    </td>
                                    <td className="px-5 py-2.5 border-r border-slate-100 text-center">
                                      <span className={`inline-flex items-center text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                                        collar === 'blue' 
                                          ? 'bg-amber-50 text-amber-850 border-amber-200' 
                                          : 'bg-indigo-50 text-indigo-850 border-indigo-200'
                                      }`}>
                                        {collar === 'blue' ? 'Blue Collar' : 'White Collar'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 border-r border-slate-100 text-center bg-emerald-50/10">
                                      <div className="relative inline-block w-full max-w-[150px]">
                                        <select
                                          value={emp.weekOff}
                                          disabled={!isEditable}
                                          onChange={(e) => handleDirectWeekOffChange(emp, e.target.value)}
                                          className="w-full bg-white hover:bg-emerald-50 text-emerald-800 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-150 disabled:cursor-not-allowed border border-emerald-200 rounded-lg py-1 px-2.5 text-xs font-black text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs transition-colors appearance-none"
                                          style={{ textAlignLast: 'center' }}
                                        >
                                          {!DAYS_OF_WEEK.includes(emp.weekOff) && (
                                            <option value={emp.weekOff} className="text-slate-500 font-semibold">
                                              {emp.weekOff || '- Blank -'}
                                            </option>
                                          )}
                                          {DAYS_OF_WEEK.map((day) => (
                                            <option key={day} value={day} className="text-slate-900 font-semibold">
                                              {day}
                                            </option>
                                          ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-emerald-600">
                                          <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                          </svg>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-5 py-2 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => initiateWeekOffChange(emp)}
                                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-all cursor-pointer animate-fade-in"
                                          title="Change Week Off"
                                        >
                                          <Calendar size={13} />
                                          <span>Change</span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* MOBILE VIEW: ADAPTIVE DETAILED CARDS */}
                        <div className={`divide-y divide-slate-100 px-3 py-1 ${previewDevice === 'mobile' ? 'block' : 'block lg:hidden'}`}>
                          {filteredEmployees.map((emp) => {
                            const collar = getCollarType(emp.designation, emp.id);
                            const isSelf = session?.empId === emp.id;
                            // Admin and White Collar users can edit week off directly
                            const isEditable = session?.role === 'admin' || session?.role === 'white_collar';

                            return (
                              <div 
                                key={emp.id}
                                className={`flex items-center justify-between py-2.5 gap-2 text-xs ${isSelf ? 'bg-emerald-50/20 px-2 rounded-lg my-1 border border-emerald-100/40' : ''}`}
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded shrink-0">
                                    {emp.id}
                                  </span>
                                  <div className="truncate">
                                    <h4 className="font-bold text-slate-850 truncate flex items-center gap-1.5" title={emp.name}>
                                      <span>{emp.name}</span>
                                      {isSelf && (
                                        <span className="text-[8px] bg-emerald-100 text-emerald-800 font-extrabold px-1 rounded-full uppercase tracking-tight">
                                          You
                                        </span>
                                      )}
                                    </h4>
                                    <p className="text-[9px] text-slate-400 font-semibold truncate flex items-center gap-1 mt-0.5">
                                      <span>{emp.designation}</span>
                                      {emp.unit && emp.unit.trim() !== '' && emp.unit.trim() !== '-' && (
                                        <span className="text-[9px] bg-emerald-100 text-emerald-900 font-extrabold px-1.5 py-0.2 rounded border border-emerald-300">
                                          {emp.unit}
                                        </span>
                                      )}
                                      <span className="mx-0.5">•</span>
                                      <span className={collar === 'blue' ? 'text-amber-600 font-extrabold' : 'text-indigo-600 font-extrabold'}>
                                        {collar === 'blue' ? 'BC' : 'WC'}
                                      </span>
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <div className="relative inline-block w-24">
                                    <select
                                      value={emp.weekOff}
                                      disabled={!isEditable}
                                      onChange={(e) => handleDirectWeekOffChange(emp, e.target.value)}
                                      className="w-full bg-white disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100 disabled:cursor-not-allowed hover:bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg py-1 px-2 pr-5 text-[11px] font-black text-center focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer appearance-none shadow-2xs"
                                      style={{ textAlignLast: 'center' }}
                                    >
                                      {!DAYS_OF_WEEK.includes(emp.weekOff) && (
                                        <option value={emp.weekOff} className="text-slate-500 font-semibold text-xs">
                                          {emp.weekOff || '- Blank -'}
                                        </option>
                                      )}
                                      {DAYS_OF_WEEK.map((day) => (
                                        <option key={day} value={day} className="text-slate-900 font-semibold text-xs">
                                          {day.slice(0, 3)}
                                        </option>
                                      ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-emerald-600">
                                      <svg className="fill-current h-2.5 w-2.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                      </svg>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMobileMenuOpen(false);
                                      initiateWeekOffChange(emp);
                                    }}
                                    className="inline-flex items-center justify-center p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-all cursor-pointer h-7 w-7"
                                    title="Change Week Off"
                                  >
                                    <Calendar size={13} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                  </div>
                </div>
              )}

              {/* --- TAB 3: ADJUSTMENT HISTORY LOG (Excel spreadsheet layout) --- */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <FileSpreadsheet size={16} className="text-emerald-700" />
                        <span>Historical Adjustments Spreadsheet Log</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Excel roster adjustments spreadsheet tracking active rest day schedules.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => exportToCSV(records, 'all', filterWard)}
                        disabled={records.length === 0}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        <FileSpreadsheet size={14} />
                        Download History CSV
                      </button>
                    </div>
                  </div>

                  {records.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                      <History size={36} className="mx-auto text-slate-300 mb-2" />
                      <h4 className="text-sm font-bold text-slate-700">No Adjustment Records Exist</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Submit a new Week Off change first to view roster history logs.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              <th className="px-5 py-3 border-r border-slate-100 font-mono w-24">ID</th>
                              <th className="px-5 py-3 border-r border-slate-100">Date & Time</th>
                              <th className="px-5 py-3 border-r border-slate-100">Employee</th>
                              <th className="px-5 py-3 border-r border-slate-100">Week Off Change</th>
                              <th className="px-5 py-3 border-r border-slate-100">Submitted By</th>
                              <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                            {records.map((rec) => {
                              const isCreator = rec.submittedBy === session.username;
                              const isAdmin = session.role === 'admin';
                              const canRemove = isAdmin || isCreator;

                              return (
                                <tr key={rec.id} className="hover:bg-slate-50/40 transition-colors">
                                  <td className="px-5 py-3 border-r border-slate-100 font-mono text-[11px] font-bold text-slate-400">
                                    #{rec.id.split('-')[0]}
                                  </td>
                                  <td className="px-5 py-3 border-r border-slate-100 text-slate-500 font-medium">
                                    {formatDateTime(rec.timestamp)}
                                  </td>
                                  <td className="px-5 py-3 border-r border-slate-100">
                                    <div className="font-bold text-slate-900">{rec.empName}</div>
                                    <div className="text-[10px] text-slate-400 font-mono font-bold">ID: {rec.empId}</div>
                                  </td>
                                  <td className="px-5 py-3 border-r border-slate-100 font-medium text-slate-600">
                                    <div className="flex items-center gap-1.5">
                                      <span className="line-through text-slate-400">{rec.previousWeekOff}</span>
                                      <span className="text-slate-400">➔</span>
                                      <span className="text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">{rec.newWeekOff}</span>
                                    </div>
                                  </td>
                                  <td className="px-5 py-3 border-r border-slate-100 text-slate-500">
                                    <span className="font-bold text-slate-700 block">{rec.submittedBy}</span>
                                    <span className="text-[10px] capitalize">({rec.submittedByRole === 'admin' ? 'Admin' : 'WC Team'})</span>
                                  </td>
                                  <td className="px-5 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {canRemove ? (
                                        <button
                                          onClick={() => handleDeleteRecord(rec.id)}
                                          className="inline-flex items-center justify-center p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 border border-rose-150 rounded-lg hover:bg-rose-100 cursor-pointer transition-colors"
                                          title="Delete log entry"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      ) : (
                                        <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-bold cursor-not-allowed" title="Locked">
                                          Locked
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- TAB 4: ACTIVE STAFF DIRECTORY --- */}
              {activeTab === 'directory' && (
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Roster Master Register</h3>
                      <p className="text-xs text-slate-500">View and update active hospital personnel profiles</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {session?.role === 'admin' && (
                        <>
                          <button
                            onClick={() => setShowImportModal(true)}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                            title="Import Excel / CSV data (Admin Only)"
                          >
                            <FileSpreadsheet size={15} className="text-emerald-400" />
                            Import Excel Data
                          </button>

                          <button
                            onClick={handleClearRoster}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                            title="Clear all active roster data (Admin Only)"
                          >
                            <Trash2 size={14} className="text-rose-600" />
                            Clear Roster
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                      >
                        <UserPlus size={14} />
                        Register New Staff
                      </button>
                    </div>
                  </div>

                  {/* Add Employee Form Drawer Modal */}
                  {showAddModal && (
                    <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-lg relative space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <UserPlus size={16} className="text-emerald-600" />
                          Register New Staff Profile
                        </h4>
                        <button 
                          onClick={() => setShowAddModal(false)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <form onSubmit={submitAddEmployee} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Employee ID (Numeric)</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            required
                            placeholder="e.g. 1011"
                            value={newId}
                            onChange={(e) => setNewId(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Employee Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sameer Patil"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Designation</label>
                          <select
                            value={newDesg}
                            onChange={(e) => setNewDesg(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                          >
                            {availableDesignations.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Ward / Dept</label>
                          <select
                            value={newWard}
                            onChange={(e) => setNewWard(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                          >
                            {availableWards.map(w => (
                              <option key={w} value={w}>{w}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Shift</label>
                          <select
                            value={newShift}
                            onChange={(e) => setNewShift(e.target.value as any)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                          >
                            {SHIFTS.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Unit</label>
                          <select
                            value={newUnit}
                            onChange={(e) => setNewUnit(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            <option value="">No Unit / General</option>
                            {availableUnits.map(u => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Week Off Day</label>
                          <select
                            value={newWeekOff}
                            onChange={(e) => setNewWeekOff(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                          >
                            {DAYS_OF_WEEK.map(day => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all cursor-pointer"
                          >
                            Register Staff Member
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Directory Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {employees.map((emp) => (
                      <div 
                        key={emp.id}
                        className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs hover:shadow-sm transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded">
                              {emp.id}
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900 mt-1">{emp.name}</h4>
                            <p className="text-[11px] text-slate-400 font-semibold">{emp.designation}</p>
                          </div>

                          {session.role === 'admin' ? (
                            <button
                              onClick={() => handleDeleteStaffDirectly(emp.id)}
                              className="text-slate-300 hover:text-rose-600 p-1 rounded transition-colors"
                              title="Delete from roster"
                            >
                              <Trash2 size={13} />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-200/50 px-2 py-1 rounded">Locked</span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-2.5 border-t border-slate-100">
                          <div>
                            <span className="text-slate-400 block font-semibold text-[9px] uppercase">Ward / Dept:</span>
                            <span className="font-extrabold text-slate-700">{emp.ward}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-semibold text-[9px] uppercase">Shift & Unit:</span>
                            <span className="font-extrabold text-slate-700">
                              {emp.shift} {emp.unit ? `(${emp.unit})` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="bg-emerald-50 border border-emerald-100/50 p-2 rounded-lg flex items-center justify-between text-[11px]">
                          <span className="text-emerald-800 font-bold uppercase tracking-wide text-[9px]">Weekly Off Day:</span>
                          <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full text-xs">
                            {emp.weekOff || 'Blank'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              </div>

              {/* Standard non-hype footer */}
              <footer className="bg-white border-t border-slate-200 mt-12 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center sm:flex sm:items-center sm:justify-between text-xs text-slate-400">
                  <p>© 2026 Goodness App. Built for hospital ward & staff communication.</p>
                  <p className="font-bold text-emerald-600 mt-2 sm:mt-0 uppercase tracking-wider">Precision Duty Adjuster v1.2.0</p>
                </div>
              </footer>

            </div>
          </main>
        </>
      )}

      {/* --- QUICK WEEK OFF ADUSTMENT DIALOG OVERLAY --- */}
      {weekOffTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative space-y-4">
            <button 
              onClick={() => setWeekOffTarget(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-900 rounded-xl">
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Change Weekly Off Day</h3>
                <p className="text-xs text-slate-500">Configure new rest day for {weekOffTarget.name}</p>
              </div>
            </div>

            <form onSubmit={submitWeekOffChange} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Current Week Off</span>
                  <span className="text-sm font-extrabold text-slate-800">{weekOffTarget.weekOff}</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Select New Day</label>
                  <select
                    value={newWeekOffDay}
                    onChange={(e) => setNewWeekOffDay(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                  >
                    {DAYS_OF_WEEK.map(d => (
                      <option key={d} value={d} disabled={d === weekOffTarget.weekOff}>
                        {d} {d === weekOffTarget.weekOff ? '(Current)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setWeekOffTarget(null)}
                  className="flex-1 py-3 text-xs font-bold text-slate-500 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Submit Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SUCCESS CONFIRMATION OVERLAY --- */}
      {successRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-emerald-100 shadow-2xl p-6 text-center space-y-4">
            
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Check size={26} className="animate-bounce" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Record Updated Successfully!</h3>
              <p className="text-xs text-slate-500 mt-1">
                The week off change for <strong>{successRecord.empName}</strong> ({successRecord.previousWeekOff} ➔ {successRecord.newWeekOff}) has been saved to the database.
              </p>
            </div>

            <button
              onClick={() => setSuccessRecord(null)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
            >
              Done
            </button>

          </div>
        </div>
      )}

      {/* Admin Data Importer Modal */}
      <DataImporterModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleBulkImportEmployees}
        currentStaffCount={employees.length}
      />

    </div>
  );
}
