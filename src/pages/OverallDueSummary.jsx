import React, { useState, useEffect } from 'react';
import {
  PieChart, Search, RefreshCw, Calendar,
  AlertCircle, CheckCircle2, ClipboardList, BookOpen
} from 'lucide-react';
import { apiRequest } from '../api';

const OverallDueSummary = () => {
  // 🗂️ Metadata & Dropdown States
  const [academicYears, setAcademicYears] = useState([]);
  const [metaLoading, setMetaLoading] = useState(false);

  // 🎛️ Form States
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  // 📊 Report Data & Loading States
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // 🔄 1. Load Academic Years Dropdown on Mount
  useEffect(() => {
    const loadAcademicYears = async () => {
      setMetaLoading(true);
      try {
        const data = await apiRequest('/academic-years', 'GET');
        setAcademicYears(data || []);
      } catch (error) {
        console.error("Error loading academic years:", error);
        setErrorMessage("Failed to load academic years option.");
      } finally {
        setMetaLoading(false);
      }
    };
    loadAcademicYears();
  }, []);

  // 🔍 2. Fetch Overall Due Report (GET /fee/reports/overAll-monthly-due?academicYearId=...&month=...)
  const handleFetchReport = async (e) => {
    e.preventDefault();
    if (!selectedYear || !selectedMonth) {
      setErrorMessage("Please select both Academic Year and Month.");
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setReportData(null);

    try {
      // 💡 আপনার ব্যাকএন্ডের রিকোয়ারমেন্ট অনুযায়ী Query Parameters পাঠানো হচ্ছে
      const endpoint = `/fee/reports/overAll-monthly-due?academicYearId=${selectedYear}&month=${selectedMonth}`;
      const data = await apiRequest(endpoint, 'GET');
      setReportData(data);
    } catch (error) {
      console.error("Error fetching overall due report:", error);
      setErrorMessage(error.message || "Failed to fetch overall due metrics.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <PieChart className="text-emerald-600" size={22} />
          <h2 className="text-xl font-bold text-slate-800">Overall Due Summary</h2>
        </div>
      </div>

      {/* 🎛️ FILTER PANEL */}
      <form onSubmit={handleFetchReport} className="bg-slate-50 p-4 border border-slate-200 rounded-xl shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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
            Generate Report
          </button>
        </div>
      </form>

      {/* 📊 RESPONSE GRID AND DATA TABLES */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 text-sm flex flex-col items-center justify-center space-y-2">
          <RefreshCw size={28} className="animate-spin text-emerald-600" />
          <span className="font-medium animate-pulse">Analyzing entire institutional due metrics...</span>
        </div>
      ) : !reportData ? (
        <div className="p-16 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl bg-white flex flex-col items-center justify-center">
          <ClipboardList size={32} className="text-slate-300 mb-1" />
          <span className="font-semibold text-slate-500">No Summary Discovered</span>
          <p className="text-xs text-slate-400 mt-1">Select filters above to load full institutional monthly collections due.</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Total Summary Card */}
          <div className="bg-slate-900 text-white p-5 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-xl text-emerald-400">
                <PieChart size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">All Classrooms Combined Dues</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Target Month: {monthNames[reportData.month - 1]} • Total Outstanding Accounts: {reportData.dueStudents?.length || 0}
                </p>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-5 py-2.5 flex items-center justify-between sm:justify-start gap-4 min-w-[220px]">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Outstanding</span>
              <span className="text-xl font-extrabold text-rose-400 font-mono">
                {formatCurrency(reportData.totalOutstanding)}
              </span>
            </div>
          </div>

          {/* Master Table of All Due Students */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {reportData.dueStudents && reportData.dueStudents.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase border-b border-slate-200 font-semibold tracking-wider">
                      <th className="py-3 px-4 w-40">Admission No.</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Classroom</th>
                      <th className="py-3 px-4 text-right pr-6">Outstanding Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {reportData.dueStudents.map((student, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-500 font-mono">
                          {student.admissionNumber || 'N/A'}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {student.studentName}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200/50">
                            <BookOpen size={10} className="text-slate-400" />
                            {student.classroomName}
                          </span>
                        </td>
                        {/* 💡 Field Mismatch এড়িয়ে সরাসরি balanceAmount ফিল্ডটি ব্যবহার করা হয়েছে */}
                        <td className="py-3 px-4 text-right pr-6 font-mono font-bold text-rose-600">
                          {formatCurrency(student.balanceAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-sm text-emerald-600 font-semibold bg-emerald-50/20 flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={18} /> Excellent! No outstanding balance recorded across the entire institution for this period.
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default OverallDueSummary;