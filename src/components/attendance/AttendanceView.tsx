import React, { useState, useEffect } from 'react';
import {
  Clock, Users, CheckCircle2, AlertCircle, XCircle, Calendar,
  Plus, Search, Download, UserCheck, ShieldAlert, ArrowRight,
  Filter, Check, UserPlus, FileText, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { Language, BusinessSettings, Employee, AttendanceRecord } from '../../types';
import { StorageService } from '../../services/storage';
import { PDFGenerator } from '../../utils/pdfGenerator';

interface AttendanceViewProps {
  lang: Language;
  settings: BusinessSettings;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ lang, settings }) => {
  const isBn = lang === 'bn';
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'staff'>('daily');

  // Modals
  const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [selectedEmpForPunch, setSelectedEmpForPunch] = useState<string>('');
  const [punchType, setPunchType] = useState<'in' | 'out'>('in');
  const [punchTime, setPunchTime] = useState<string>('');
  const [punchNotes, setPunchNotes] = useState<string>('');
  const [punchStatus, setPunchStatus] = useState<AttendanceRecord['status']>('present');

  // New staff form state
  const [newStaff, setNewStaff] = useState<Partial<Employee>>({
    name: '',
    designation: '',
    department: 'আউটলেট ও সেলস',
    phone: '',
    email: '',
    salary: 15000,
    salaryType: 'monthly',
    joiningDate: todayStr,
    status: 'active'
  });

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString(isBn ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedDate]);

  const loadData = () => {
    const emps = StorageService.getEmployees();
    setEmployees(emps);
    const records = StorageService.getAttendance();
    setAttendanceList(records);
  };

  const recordsForDate = attendanceList.filter(a => a.date === selectedDate);

  // Statistics for selected date
  const totalEmployees = employees.filter(e => e.status === 'active').length;
  const presentCount = recordsForDate.filter(a => a.status === 'present').length;
  const lateCount = recordsForDate.filter(a => a.status === 'late').length;
  const leaveCount = recordsForDate.filter(a => a.status === 'leave').length;
  const absentCount = totalEmployees - (presentCount + lateCount + leaveCount);

  const handleOpenPunchModal = (empId?: string) => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    const timeFormatted = `${hours}:${mins}`;

    setSelectedEmpForPunch(empId || employees[0]?.id || '');
    setPunchTime(timeFormatted);
    setPunchNotes('');
    setPunchType('in');
    setPunchStatus('present');
    setIsPunchModalOpen(true);
  };

  const handleSavePunch = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === selectedEmpForPunch);
    if (!emp) return;

    const existingRecord = recordsForDate.find(r => r.employeeId === emp.id);
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    let updatedRecord: AttendanceRecord;

    if (punchType === 'in') {
      updatedRecord = {
        id: existingRecord?.id || `att-${Date.now()}`,
        employeeId: emp.id,
        employeeName: emp.name,
        date: selectedDate,
        checkInTime: timeStr,
        checkOutTime: existingRecord?.checkOutTime || '',
        status: punchStatus,
        workingHours: existingRecord?.workingHours || 0,
        notes: punchNotes || existingRecord?.notes || ''
      };
    } else {
      // Punch Out
      updatedRecord = {
        id: existingRecord?.id || `att-${Date.now()}`,
        employeeId: emp.id,
        employeeName: emp.name,
        date: selectedDate,
        checkInTime: existingRecord?.checkInTime || '09:00 AM',
        checkOutTime: timeStr,
        status: existingRecord?.status || 'present',
        workingHours: 8.5,
        notes: punchNotes || existingRecord?.notes || ''
      };
    }

    StorageService.recordAttendance(updatedRecord);
    loadData();
    setIsPunchModalOpen(false);
  };

  const handleMarkAllPresent = () => {
    const timeStr = '09:00 AM';
    employees.forEach(emp => {
      if (emp.status === 'active') {
        const existing = recordsForDate.find(r => r.employeeId === emp.id);
        if (!existing) {
          StorageService.recordAttendance({
            id: `att-${Date.now()}-${emp.id}`,
            employeeId: emp.id,
            employeeName: emp.name,
            date: selectedDate,
            checkInTime: timeStr,
            status: 'present',
            workingHours: 0,
            notes: 'এক ক্লিকে সকল কর্মী উপস্থিত'
          });
        }
      }
    });
    loadData();
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.phone) return;

    const emp: Employee = {
      id: `emp-${Date.now()}`,
      name: newStaff.name,
      designation: newStaff.designation || (isBn ? 'সেলস এক্সিকিউটিভ' : 'Sales Executive'),
      department: newStaff.department || 'General',
      phone: newStaff.phone,
      email: newStaff.email || '',
      salary: Number(newStaff.salary) || 15000,
      salaryType: newStaff.salaryType || 'monthly',
      joiningDate: newStaff.joiningDate || todayStr,
      status: 'active'
    };

    StorageService.saveEmployee(emp);
    loadData();
    setIsAddStaffModalOpen(false);
    setNewStaff({
      name: '',
      designation: '',
      department: 'আউটলেট ও সেলস',
      phone: '',
      email: '',
      salary: 15000,
      salaryType: 'monthly',
      joiningDate: todayStr,
      status: 'active'
    });
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.phone.includes(searchQuery)
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0e1424] via-[#131b2e] to-[#0e1424] p-5 rounded-2xl border border-[#1e2a47] shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 flex-shrink-0">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                {isBn ? 'স্টাফ উপস্থিতি ও হাজিরা খাতা' : 'Staff Attendance & Timesheet'}
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isBn
                ? 'কর্মীদের দৈনিক ইন/আউট সময়, লেট কাউন্ট ও মাসিক উপস্থিতি ট্র্যাকিং'
                : 'Realtime check-in/out tracking, late records, and monthly attendance'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#090d18] border border-[#1e2a47] px-3 py-2 rounded-xl text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
              {isBn ? 'বর্তমান সময়' : 'Current Time'}
            </span>
            <span className="text-sm font-mono font-bold text-sky-400">{currentTime || '--:--:--'}</span>
          </div>

          <button
            onClick={() => PDFGenerator.generateAttendanceReportPDF(attendanceList, settings)}
            className="flex items-center gap-2 bg-[#192238] hover:bg-[#202d4a] text-sky-300 hover:text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-[#2b3a5d] transition-all"
            title="Download Daily Attendance Report PDF"
          >
            <Download className="w-4 h-4" />
            <span>{isBn ? 'উপস্থিতি PDF' : 'Attendance PDF'}</span>
          </button>

          <button
            onClick={() => handleOpenPunchModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all active:scale-95"
          >
            <UserCheck className="w-4 h-4" />
            {isBn ? 'পাঞ্চ ইন / আউট' : 'Punch In / Out'}
          </button>

          <button
            onClick={() => setIsAddStaffModalOpen(true)}
            className="flex items-center gap-2 bg-[#192238] hover:bg-[#202d4a] text-slate-200 hover:text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-[#2b3a5d] transition-all"
          >
            <UserPlus className="w-4 h-4 text-sky-400" />
            {isBn ? 'নতুন কর্মী' : 'Add Staff'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0e1424] border border-[#1e2a47] p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">{isBn ? 'মোট কর্মী' : 'Total Staff'}</p>
            <h3 className="text-xl font-bold text-white mt-0.5">{totalEmployees} {isBn ? 'জন' : ''}</h3>
          </div>
        </div>

        <div className="bg-[#0e1424] border border-[#1e2a47] p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">{isBn ? 'উপস্থিত' : 'Present'}</p>
            <h3 className="text-xl font-bold text-emerald-400 mt-0.5">{presentCount} {isBn ? 'জন' : ''}</h3>
          </div>
        </div>

        <div className="bg-[#0e1424] border border-[#1e2a47] p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">{isBn ? 'দেরিতে (Late)' : 'Late'}</p>
            <h3 className="text-xl font-bold text-amber-400 mt-0.5">{lateCount} {isBn ? 'জন' : ''}</h3>
          </div>
        </div>

        <div className="bg-[#0e1424] border border-[#1e2a47] p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 flex-shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">{isBn ? 'অনুপস্থিত / ছুটি' : 'Absent / Leave'}</p>
            <h3 className="text-xl font-bold text-rose-400 mt-0.5">{Math.max(0, absentCount + leaveCount)} {isBn ? 'জন' : ''}</h3>
          </div>
        </div>
      </div>

      {/* Main Content Area with Sub-Tabs */}
      <div className="bg-[#0e1424] border border-[#1e2a47] rounded-2xl overflow-hidden shadow-xl">
        {/* Controls Toolbar */}
        <div className="p-4 border-b border-[#1e2a47] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0f1d]/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'daily'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {isBn ? 'দৈনিক উপস্থিতি' : 'Daily Timesheet'}
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'staff'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {isBn ? 'কর্মী তালিকা' : 'Staff List'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeTab === 'daily' && (
              <div className="flex items-center gap-2 bg-[#090d18] border border-[#1e2a47] px-3 py-1.5 rounded-xl">
                <Calendar className="w-4 h-4 text-sky-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                />
              </div>
            )}

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBn ? 'কর্মী খুঁজুন...' : 'Search staff...'}
                className="bg-[#090d18] border border-[#1e2a47] text-xs text-white pl-8 pr-3 py-2 rounded-xl focus:border-sky-500 focus:outline-none w-48"
              />
            </div>

            {activeTab === 'daily' && (
              <button
                onClick={handleMarkAllPresent}
                className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-2 rounded-xl font-semibold transition-colors flex items-center gap-1.5"
                title={isBn ? 'সবাইকে উপস্থিত করুন' : 'Mark all present'}
              >
                <Check className="w-3.5 h-3.5" />
                {isBn ? 'সকলকে উপস্থিত করুন' : 'Mark All'}
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Daily Timesheet */}
        {activeTab === 'daily' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1e2a47] bg-[#090d18]/70 text-slate-400">
                  <th className="py-3 px-4 font-semibold">{isBn ? 'কর্মী' : 'Employee'}</th>
                  <th className="py-3 px-4 font-semibold">{isBn ? 'পদবি ও বিভাগ' : 'Designation'}</th>
                  <th className="py-3 px-4 font-semibold">{isBn ? 'ইন সময়' : 'Punch In'}</th>
                  <th className="py-3 px-4 font-semibold">{isBn ? 'আউট সময়' : 'Punch Out'}</th>
                  <th className="py-3 px-4 font-semibold">{isBn ? 'কাজের ঘণ্টা' : 'Working Hours'}</th>
                  <th className="py-3 px-4 font-semibold">{isBn ? 'হাজিরা স্ট্যাটাস' : 'Status'}</th>
                  <th className="py-3 px-4 font-semibold">{isBn ? 'মন্তব্য' : 'Notes'}</th>
                  <th className="py-3 px-4 font-semibold text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2a47]">
                {filteredEmployees.map((emp) => {
                  const record = recordsForDate.find(r => r.employeeId === emp.id);
                  const isPresent = record?.status === 'present';
                  const isLate = record?.status === 'late';
                  const isLeave = record?.status === 'leave';
                  const isAbsent = !record;

                  return (
                    <tr key={emp.id} className="hover:bg-[#131b2e]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-white">{emp.name}</p>
                            <p className="text-[10px] text-slate-400">{emp.phone}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="text-slate-200 font-medium">{emp.designation}</p>
                        <p className="text-[10px] text-slate-400">{emp.department}</p>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-200">
                          {record?.checkInTime || '—'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-200">
                          {record?.checkOutTime || '—'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-300">
                          {record?.workingHours ? `${record.workingHours} ${isBn ? 'ঘণ্টা' : 'hrs'}` : '—'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {isPresent && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Check className="w-3 h-3" /> {isBn ? 'উপস্থিত' : 'Present'}
                          </span>
                        )}
                        {isLate && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <AlertCircle className="w-3 h-3" /> {isBn ? 'দেরিতে (Late)' : 'Late'}
                          </span>
                        )}
                        {isLeave && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <FileText className="w-3 h-3" /> {isBn ? 'ছুটি (Leave)' : 'Leave'}
                          </span>
                        )}
                        {isAbsent && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3 h-3" /> {isBn ? 'অনুপস্থিত' : 'Absent'}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs truncate text-slate-400">
                        {record?.notes || '—'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenPunchModal(emp.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-semibold border border-sky-500/20 transition-colors"
                        >
                          {isBn ? 'আপডেট' : 'Update'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Staff List */}
        {activeTab === 'staff' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="bg-[#090d18] border border-[#1e2a47] rounded-xl p-4 flex flex-col justify-between hover:border-sky-500/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{emp.name}</h4>
                      <p className="text-xs text-sky-400">{emp.designation}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1e2a47]/60 space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isBn ? 'ফোন নম্বর:' : 'Phone:'}</span>
                    <span className="font-mono text-white">{emp.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isBn ? 'বিভাগ:' : 'Department:'}</span>
                    <span>{emp.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isBn ? 'মাসিক বেতন:' : 'Salary:'}</span>
                    <span className="font-bold text-emerald-400">
                      {settings.currencySymbol}{emp.salary.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isBn ? 'যোগদান:' : 'Joined:'}</span>
                    <span>{emp.joiningDate}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex gap-2">
                  <button
                    onClick={() => handleOpenPunchModal(emp.id)}
                    className="flex-1 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-semibold text-center transition-colors"
                  >
                    {isBn ? 'হাজিরা দিন' : 'Mark Attendance'}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(isBn ? 'আপনি কি নিশ্চিত এই কর্মীকে সরাতে চান?' : 'Are you sure?')) {
                        StorageService.deleteEmployee(emp.id);
                        loadData();
                      }
                    }}
                    className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-semibold transition-colors"
                  >
                    {isBn ? 'মুছুন' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Quick Punch In / Out */}
      {isPunchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#1e2a47] flex items-center justify-between bg-[#0a0f1d]">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-white text-base">
                  {isBn ? 'হাজিরা রেকর্ড করুন' : 'Record Staff Attendance'}
                </h3>
              </div>
              <button
                onClick={() => setIsPunchModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePunch} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isBn ? 'কর্মী নির্বাচন করুন' : 'Select Employee'} *
                </label>
                <select
                  value={selectedEmpForPunch}
                  onChange={(e) => setSelectedEmpForPunch(e.target.value)}
                  className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isBn ? 'কার্যক্রম টাইপ' : 'Punch Type'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPunchType('in')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      punchType === 'in'
                        ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                        : 'bg-[#090d18] border-[#1e2a47] text-slate-400'
                    }`}
                  >
                    {isBn ? 'ইন (Check In)' : 'Check In'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPunchType('out')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      punchType === 'out'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                        : 'bg-[#090d18] border-[#1e2a47] text-slate-400'
                    }`}
                  >
                    {isBn ? 'আউট (Check Out)' : 'Check Out'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isBn ? 'হাজিরা স্ট্যাটাস' : 'Attendance Status'}
                </label>
                <select
                  value={punchStatus}
                  onChange={(e) => setPunchStatus(e.target.value as any)}
                  className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
                >
                  <option value="present">{isBn ? 'উপস্থিত (Present)' : 'Present'}</option>
                  <option value="late">{isBn ? 'দেরিতে আগমন (Late)' : 'Late'}</option>
                  <option value="leave">{isBn ? 'ছুটি (On Leave)' : 'On Leave'}</option>
                  <option value="half_day">{isBn ? 'অর্ধ-দিবস (Half Day)' : 'Half Day'}</option>
                  <option value="absent">{isBn ? 'অনুপস্থিত (Absent)' : 'Absent'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isBn ? 'মন্তব্য বা কারণ (ঐচ্ছিক)' : 'Notes (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={punchNotes}
                  onChange={(e) => setPunchNotes(e.target.value)}
                  placeholder={isBn ? 'যেমন: ট্রাফিক জ্যামে দেরি বা বিশেষ ছুটি...' : 'e.g. late due to traffic...'}
                  className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPunchModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#1e2a47] text-xs font-bold text-slate-300 hover:bg-[#131b2e]"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/20"
                >
                  {isBn ? 'সংরক্ষণ করুন' : 'Save Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Staff Member */}
      {isAddStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#1e2a47] flex items-center justify-between bg-[#0a0f1d]">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-white text-base">
                  {isBn ? 'নতুন কর্মী যোগ করুন' : 'Add New Staff Member'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddStaffModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isBn ? 'কর্মীর পূর্ণ নাম' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder={isBn ? 'যেমন: মো: তানভীর আহমেদ' : 'e.g. Tanveer Ahmed'}
                  className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isBn ? 'পদবি (Designation)' : 'Designation'}
                  </label>
                  <input
                    type="text"
                    value={newStaff.designation}
                    onChange={(e) => setNewStaff({ ...newStaff, designation: e.target.value })}
                    placeholder={isBn ? 'ক্যাশিয়ার / সেলস' : 'Cashier'}
                    className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isBn ? 'বিভাগ (Department)' : 'Department'}
                  </label>
                  <input
                    type="text"
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                    placeholder={isBn ? 'আউটলেট / গোডাউন' : 'Sales'}
                    className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isBn ? 'মোবাইল নম্বর' : 'Phone Number'} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    placeholder="01700-000000"
                    className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isBn ? 'মাসিক বেতন (টাকা)' : 'Salary (BDT)'}
                  </label>
                  <input
                    type="number"
                    value={newStaff.salary}
                    onChange={(e) => setNewStaff({ ...newStaff, salary: Number(e.target.value) })}
                    className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isBn ? 'যোগদানের তারিখ' : 'Joining Date'}
                </label>
                <input
                  type="date"
                  value={newStaff.joiningDate}
                  onChange={(e) => setNewStaff({ ...newStaff, joiningDate: e.target.value })}
                  className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddStaffModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#1e2a47] text-xs font-bold text-slate-300 hover:bg-[#131b2e]"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/20"
                >
                  {isBn ? 'কর্মী সংরক্ষণ' : 'Save Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
