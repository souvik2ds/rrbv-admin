import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart3, Search, RefreshCw, Calendar, BookOpen,
  ChevronDown, CheckCircle2, AlertCircle, DollarSign, Users, ClipboardList
} from 'lucide-react';
import { apiRequest } from '../api';

const ClasswiseDueSummary = () => {
  // 🗂️ Metadata States
  const [academicYears, setAcademicYears] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [metaLoading, setMetaLoading] = useState(false);

  // 🎛️ Form States
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedClassrooms, setSelectedClassrooms] = useState([]); // Array of IDs
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 📊 Report Data & Loading States
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // 🔄 1. Load Dropdowns Metadata on Mount
  useEffect(() => {
    const loadMetadata = async () => {
      setMetaLoading(true);
      try {
        const [yearsData, classroomsData] = await Promise.all([
          apiRequest('/academic-years', 'GET'),
          apiRequest('/classrooms', 'GET')
        ]);
        setAcademicYears(yearsData || []);
        setClassrooms(classroomsData || []);
      } catch (error) {
        console.error("Error loading metadata:", error);
        setErrorMessage("Failed to load metadata options.");
      } finally {
        setMetaLoading(false);
      }
    };
    loadMetadata();
  }, []);

  // Close custom checkbox dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsClassDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ⏹️ Handle Classroom Checkbox Selection
  const handleCheckboxChange = (classroomId) => {
    setSelectedClassrooms(prev =>
      prev.includes(classroomId)
        ? prev.filter(id => id !== classroomId)
        : [...prev, classroomId]
    );
  };

  // 🔍 2. Fetch Bulk Due Report (POST /fee/reports/class-monthly-due/bulk)
  const handleFetchReport = async (e) => {
    e.preventDefault();
    if (!selectedYear || !selectedMonth || selectedClassrooms.length === 0) {
      setErrorMessage("Please select Academic Year, at least one Classroom, and a Month.");
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setReportData([]);

    const payload = {
      classroomIds: selectedClassrooms.map(Number),
      academicYearId: Number(selectedYear),
      month: Number(selectedMonth)
    };

    try {
      const data = await apiRequest('/fee/reports/class-monthly-due/bulk', 'POST', payload);
      setReportData(data || []);
    } catch (error) {
      console.error("Error fetching classwise due report:", error);
      setErrorMessage(error.message || "Failed to fetch classwise due metrics.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
  };

  // ক্লাসরুমের নাম সহজে বের করার হেল্পার
  const getClassroomLabel = (id) => {
    const cls = classrooms.find(c => c.id === id);
    return cls ? `${cls.name} (${cls.section})` : `Class #${id}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-emerald-600" size={22} />
          <h2 className="text-xl font-bold text-slate-800">Classwise Due Summary</h2>
        </div>
      </div>

      {/* 🎛️ FILTER PANEL WITH CHECKBOX DROPDOWN */}
      <form onSubmit={handleFetchReport} className="bg-slate-50 p-4 border border-slate-200 rounded-xl shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Academic Year Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:border-emerald-500"
            >
              <option value="">Select Academic Year</option>
              {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
            </select>
          </div>

          {/* 🌟 Custom Multi-Select Checkbox Dropdown for Classrooms */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Select Classrooms</label>
            <button
              type="button"
              onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white flex items-center justify-between outline-none text-left focus:border-emerald-500"
            >
              <span className="truncate text-slate-700">
                {selectedClassrooms.length === 0
                  ? 'Select Classrooms (Multiple)'
                  : `${selectedClassrooms.length} Classroom(s) Selected`}
              </span>
              <ChevronDown size={16} className="text-slate-400" />
            </button>

            {isClassDropdownOpen && (
              <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto p-2 space-y-1">
                {classrooms.length === 0 ? (
                  <div className="text-xs text-slate-400 p-2 text-center">No classrooms available</div>
                ) : (
                  classrooms.map(cls => (
                    <label
                      key={cls.id}
                      className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-slate-50 rounded-md cursor-pointer text-sm select-none"
                    >
                      <input
                        type="checkbox"
                        checked={selectedClassrooms.includes(cls.id)}
                        onChange={() => handleCheckboxChange(cls.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                      />
                      <span className="text-slate-700 font-medium">{cls.name} - Section {cls.section}</span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Month Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:border-emerald-500"
            >
              <option value="">Select Month</option>
              {monthNames.map((name, index) => (
                <option key={index + 1} value={index + 1}>{name}</option>
              ))}
            </select>
          </div>

        </div>

        {errorMessage && (
          <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-lg flex items-center gap-1.5">
            <AlertCircle size={14} /> {errorMessage}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-200/60">
          <button
            type="submit"
            disabled={loading || metaLoading}
            className="px-6 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 transition flex items-center gap-2 shadow-sm"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
            Generate Due Report
          </button>
        </div>
      </form>

      {/* 📊 RESPONSE GRID AND DATA TABLES */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 text-sm flex flex-col items-center justify-center space-y-2">
          <RefreshCw size={28} className="animate-spin text-emerald-600" />
          <span className="font-medium animate-pulse">Analyzing class outstanding metrics...</span>
        </div>
      ) : reportData.length === 0 ? (
        <div className="p-16 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl bg-white flex flex-col items-center justify-center">
          <ClipboardList size={32} className="text-slate-300 mb-1" />
          <span className="font-semibold text-slate-500">No Summary Discovered</span>
          <p className="text-xs text-slate-400 mt-1">Select filters above to load bulk monthly collections due.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reportData.map((classReport, index) => (
            <div key={index} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

              {/* Class Header & Total Outstanding Card */}
              <div className="bg-slate-900 text-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-slate-800 rounded-lg text-emerald-400">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{getClassroomLabel(classReport.classroomId)}</h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Month: {monthNames[classReport.month - 1]} • Students with Dues: {classReport.dueStudents?.length || 0}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-4 py-1.5 flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Outstanding</span>
                  <span className="text-md font-extrabold text-rose-400 font-mono">
                    {formatCurrency(classReport.totalOutstanding)}
                  </span>
                </div>
              </div>

              {/* Nested Due Students Sub-Table */}
              <div className="overflow-x-auto">
                {classReport.dueStudents && classReport.dueStudents.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase border-b border-slate-200 font-semibold tracking-wider">
                        <th className="py-2.5 px-4 w-32">Roll Number</th>
                        <th className="py-2.5 px-4">Student Name</th>
                        <th className="py-2.5 px-4">Admission No.</th>
                        <th className="py-2.5 px-4 text-right pr-6">Outstanding Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {classReport.dueStudents.map((student, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-500 font-mono">
                            #{student.rollNumber || 'N/A'}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {student.studentName}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-600">
                            {student.admissionNumber || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-right pr-6 font-mono font-bold text-rose-600">
                            {formatCurrency(student.balanceAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-xs text-emerald-600 font-semibold bg-emerald-50/30 flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={16} /> All clean! No outstanding balance reported for this classroom context.
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClasswiseDueSummary;