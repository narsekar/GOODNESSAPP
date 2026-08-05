import React, { useState } from 'react';
import { UserSession, Employee } from '../types';
import { Shield, User, LogIn, LogOut } from 'lucide-react';
import { getCollarType } from '../data';

interface LoginManagerProps {
  session: UserSession | null;
  employees: Employee[];
  onLogin: (session: UserSession) => void;
  onLogout: () => void;
}

export default function LoginManager({ session, employees, onLogin, onLogout }: LoginManagerProps) {
  const [role, setRole] = useState<'admin' | 'white_collar'>('white_collar');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'white_collar') {
      const enteredId = username.trim();
      if (!enteredId) {
        setError('Please enter your Employee ID to log in.');
        return;
      }
      const foundEmployee = employees.find(emp => emp.id.toLowerCase() === enteredId.toLowerCase());
      if (!foundEmployee) {
        setError('Employee ID not found. Try a valid numeric ID (e.g., 1001, 1002, etc.).');
        return;
      }

      // ONLY white collar can log in to fill/submit week off data
      const collarType = getCollarType(foundEmployee.designation, foundEmployee.id);
      if (collarType === 'blue') {
        setError('Access Restricted: Only White Collar staff can log in to fill or propose week-off changes. Blue Collar staff rosters are managed and updated directly by the Admin.');
        return;
      }

      // Check password: allow assigned password, or temp password 'admin' / '123456'
      const enteredPass = password ? password.trim() : '';
      const assignedPass = foundEmployee.password ? foundEmployee.password.trim() : '';
      
      if (enteredPass) {
        const isPassValid = enteredPass === 'admin' || enteredPass === '123456' || (assignedPass && enteredPass === assignedPass);
        if (!isPassValid) {
          setError('Incorrect password. Please try again.');
          return;
        }
      } else if (assignedPass) {
        // Password required if assigned
        setError(`Please enter the password for EMP ID ${foundEmployee.id}.`);
        return;
      }
      
      setError('');
      onLogin({
        username: foundEmployee.name,
        role: 'white_collar',
        empId: foundEmployee.id
      });
    } else {
      if (!adminPassword) {
        setError('Please enter the Admin password to continue.');
        return;
      }
      if (adminPassword.trim() !== 'admin' && adminPassword.trim() !== '654321') {
        setError('Incorrect Admin password. Please try again.');
        return;
      }

      setError('');
      onLogin({
        username: 'Admin Controller',
        role: 'admin'
      });
    }
  };

  if (session) {
    return (
      <div 
        id="session-banner" 
        className="flex flex-col sm:flex-row sm:items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 gap-3 shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${session.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {session.role === 'admin' ? <Shield size={18} /> : <User size={18} />}
          </div>
          <div>
            <div className="text-xs text-emerald-800 font-medium tracking-wide uppercase">
              {session.role === 'white_collar' ? 'Greeting' : 'Logged in as'}
            </div>
            <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              {session.role === 'white_collar' ? `Hallo ${session.username}` : session.username}
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                session.role === 'admin' 
                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {session.role === 'admin' ? 'Admin' : 'WC Team'}
              </span>
            </div>
          </div>
        </div>
        <button
          id="btn-logout"
          onClick={onLogout}
          className="flex items-center justify-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 hover:border-rose-300 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut size={14} />
          Switch / Log Out
        </button>
      </div>
    );
  }

  return (
    <div id="login-container" className="max-w-md w-full mx-auto bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden p-6 sm:p-8">
      <div className="text-center mb-6">
        <div className="inline-flex p-3.5 bg-emerald-100 text-emerald-700 rounded-2xl mb-3">
          <Shield size={32} />
        </div>
        <h2 id="login-heading" className="text-2xl font-bold text-slate-900 tracking-tight">Goodness App Portal</h2>
        <p className="text-sm text-slate-500 mt-1">Please select your login profile to gain access</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3 p-1 bg-slate-50 rounded-xl border border-slate-100">
          <button
            id="login-tab-white-collar"
            type="button"
            onClick={() => {
              setRole('white_collar');
              setError('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              role === 'white_collar'
                ? 'bg-white text-emerald-800 shadow-xs border border-emerald-100/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User size={16} />
            White Collar Staff
          </button>
          <button
            id="login-tab-admin"
            type="button"
            onClick={() => {
              setRole('admin');
              setError('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              role === 'admin'
                ? 'bg-white text-indigo-800 shadow-xs border border-indigo-100/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield size={16} />
            Admin
          </button>
        </div>

        {role === 'white_collar' ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label id="lbl-username" htmlFor="username" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                White Collar Employee ID
              </label>
              <input
                id="input-username"
                type="text"
                inputMode="numeric"
                name="username"
                placeholder="e.g. 1001, 1002, etc."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-mono font-bold"
                maxLength={40}
              />
            </div>

            <div className="space-y-1.5">
              <label id="lbl-password" htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Password
              </label>
              <input
                id="input-password"
                type="password"
                name="password"
                placeholder="Enter Employee Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold"
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Import registered accounts via Excel using headers: <strong className="font-mono text-slate-600">EMP ID | EMPLOYEE NAME | DESIGNATION | PASSWARD</strong>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3.5 text-center">
              <div className="inline-flex p-1.5 bg-indigo-100 text-indigo-700 rounded-lg mb-1">
                <Shield size={18} />
              </div>
              <p className="text-xs text-indigo-900 font-bold leading-relaxed">
                Admin Controller System
              </p>
              <p className="text-[11px] text-indigo-700 mt-0.5">
                Full administrative access to manage staff roster and system records
              </p>
            </div>

            <div className="space-y-1.5">
              <label id="lbl-admin-password" htmlFor="adminPassword" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Admin Password
              </label>
              <input
                id="input-admin-password"
                type="password"
                name="adminPassword"
                placeholder="Enter Admin Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-mono font-bold"
              />
            </div>
          </div>
        )}

        {error && (
          <p id="login-error" className="text-xs font-semibold text-rose-500 text-center bg-rose-50 border border-rose-100 p-2.5 rounded-lg">
            {error}
          </p>
        )}

        <button
          id="btn-login-submit"
          type="submit"
          className={`w-full py-3.5 px-4 font-bold rounded-xl text-sm text-white transition-all shadow-md cursor-pointer ${
            role === 'admin'
              ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 hover:shadow-indigo-200'
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 hover:shadow-emerald-200'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <LogIn size={16} />
            Access Goodness App
          </span>
        </button>
      </form>
    </div>
  );
}
