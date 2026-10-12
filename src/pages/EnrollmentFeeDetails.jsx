import React, { useState, useEffect } from 'react';
import {
  Search, RefreshCw, Layers, CheckCircle2, XCircle, Filter,
  MoreVertical, Eye, CreditCard, Calendar, BookOpen, DollarSign,
  TrendingUp, AlertCircle, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { apiRequest } from '../api';

const EnrollmentFeeDetails = () => {
  // Dropdown options lists
  const [academicYears, setAcademicYears] = useState([]);
  const [classrooms, setClassrooms] = useState([]);

  // States for Search Request
  const [searchRequest, setSearchRequest] = useState({
    academicYearId: '',
    classroomId: '',
    active: ''
  });

  // Table Data & Loading States
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Ledger Drawer & Menu States
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isLedgerDrawerOpen, setIsLedgerDrawerOpen] = useState(false);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState(null);

  // মাসের নাম সহজে দেখানোর জন্য একটি হেল্পার অ্যারে
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // মাসের ড্রপডাউন/অ্যাকোর্ডিয়ান স্টেট ট্র্যাকিং
  const [expandedMonths, setExpandedMonths] = useState({});

  const toggleMonth = (monthIndex) => {
    setExpandedMonths(prev => ({ ...prev, [monthIndex]: !prev[monthIndex] }));
  };

  // 🔄 1. Load Dropdown Metadata on Mount
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
        console.error("Error loading ledger metadata:", error);
        setMessage({ type: 'error', text: 'Failed to load Academic Years or Classrooms.' });
      } finally {
        setMetaLoading(false);
      }
    };
    loadMetadata();
    fetchStudents({ academicYearId: null, classroomId: null, active: null });
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // 🔍 2. Core Search API Invoker (Same as Directory)
  const fetchStudents = async (payload) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const responseData = await apiRequest('/student-enrollments/search', 'POST', payload);
      setStudents(responseData || []);
    } catch (error) {
      console.error("Error fetching students for fees:", error);
      setMessage({ type: 'error', text: error.message || 'Failed to fetch student enrollment records.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const payload = {
      academicYearId: searchRequest.academicYearId ? Number(searchRequest.academicYearId) : null,
      classroomId: searchRequest.classroomId ? Number(searchRequest.classroomId) : null,
      active: searchRequest.active === 'true' ? true : searchRequest.active === 'false' ? false : null
    };
    fetchStudents(payload);
  };

  const handleReset = () => {
    const freshState = { academicYearId: '', classroomId: '', active: '' };
    setSearchRequest(freshState);
    fetchStudents({ academicYearId: null, classroomId: null, active: null });
  };

  // 💰 3. Feature: View Financial Ledger API Loader
  const handleViewLedger = async (enrollmentId, e) => {
    e.stopPropagation();
    setActiveMenuId(null);
    setIsLedgerDrawerOpen(true);
    setLedgerLoading(true);
    setLedgerData(null);
    setExpandedMonths({}); // রিসেট একোর্ডিয়ান

    try {
      // আপনার দেওয়া GET /fee-collection/ledger?enrollmentId= ব্যবহুত হলো
      const data = await apiRequest(`/fee-collection/ledger?enrollmentId=${enrollmentId}`, 'GET');
      setLedgerData(data);

      // ডিফল্টভাবে যে মাসগুলো পুরোপুরি পেইড না (বকেয়া আছে) সেগুলো ওপেন রাখবো
      const initialExpanded = {};
      data?.months?.forEach(m => {
        if (!m.fullyPaid) initialExpanded[m.month] = true;
      });
      setExpandedMonths(initialExpanded);

    } catch (error) {
      console.error("Error loading student ledger:", error);
      alert("Failed to fetch financial ledger details. Please try again.");
      setIsLedgerDrawerOpen(false);
    } finally {
      setLedgerLoading(false);
    }
  };

  // কারেন্সি ফরম্যাটার হেল্পার (৳ বা Rs ফরম্যাটে দেখানোর জন্য)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="text-emerald-600" size={22} />
          <h2 className="text-xl font-bold text-slate-800">Enrollment Fee Details & Ledgers</h2>
        </div>
      </div>

      {/* 🎛️ FILTER PANEL */}
      <form onSubmit={handleSearchSubmit} className="bg-slate-50 p-4 border border-slate-200 rounded-xl shadow-sm space-y-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Filter size={14} /> Fee Criteria Filtering
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Academic Year</label>
            <select
              value={searchRequest.academicYearId}
              onChange={(e) => setSearchRequest(prev => ({ ...prev, academicYearId: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:border-emerald-500"
            >
              <option value="">All Academic Years</option>
              {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Classroom</label>
            <select
              value={searchRequest.classroomId}
              onChange={(e) => setSearchRequest(prev => ({ ...prev, classroomId: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:border-emerald-500"
            >
              <option value="">All Classrooms</option>
              {classrooms.map(cls => <option key={cls.id} value={cls.id}>{cls.name} - Section {cls.section}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Status (Active Mode)</label>
            <select
              value={searchRequest.active}
              onChange={(e) => setSearchRequest(prev => ({ ...prev, active: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:border-emerald-500"
            >
              <option value="">Active & Inactive</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60">
          <button
            type="button" onClick={handleReset}
            className="px-4 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 transition"
          >
            Clear Filters
          </button>
          <button
            type="submit"
            className="px-5 py-1.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm"
          >
            <Search size={14} /> Search Records
          </button>
        </div>
      </form>

      {/* 📊 ROSTER LIST DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-500 text-sm flex flex-col items-center justify-center space-y-2">
            <RefreshCw size={28} className="animate-spin text-emerald-600" />
            <span className="font-medium animate-pulse">Fetching enrollment finance indexes...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center space-y-1">
            <Layers size={32} className="text-slate-300 mb-1" />
            <span className="font-semibold text-slate-600">No Enrollment Records Loaded</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-mono">
                  <th className="py-3 px-4 w-28">Code</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Admission No.</th>
                  <th className="py-3 px-4">Academic Session</th>
                  <th className="py-3 px-4">Class Allocation</th>
                  <th className="py-3 px-4 text-center w-24">Roll No.</th>
                  <th className="py-3 px-4 text-center w-16">Ledger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {students.map((stu) => (
                  <tr
                    key={stu.id}
                    onClick={(e) => handleViewLedger(stu.id, e)}
                    className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{stu.studentCode}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{stu.studentName}</div>
                      <div className="text-[11px] text-slate-400">Enrollment ID: #{stu.id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {stu.admissionNumber || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{stu.academicYear}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-xs border border-slate-200">
                        {stu.className} ({stu.section})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">#{stu.rollNumber}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => handleViewLedger(stu.id, e)}
                        className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white transition"
                      >
                        <CreditCard size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          🌟 SLIDE-OUT LEDGER DRAWER (PREMIUM ACCOUNTING VIEWER)
          ========================================================================= */}
      {isLedgerDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end transition-opacity duration-300">
          <div className="w-full max-w-4xl bg-slate-50 h-screen shadow-2xl flex flex-col animate-slide-in relative overflow-hidden">

            {/* Header section */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xl text-white shadow-md border-2 border-white/10">
                  {ledgerData ? ledgerData.studentName.charAt(0).toUpperCase() : '$'}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">
                    {ledgerLoading ? 'Loading Fee Accounts...' : ledgerData?.studentName}
                  </h3>
                  <span className="text-xs text-emerald-400 font-mono tracking-wider block mt-0.5">
                    ADMISSION NO: {ledgerData?.admissionNumber || 'N/A'} • CLASS: {ledgerData?.className} ({ledgerData?.section})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLedgerDrawerOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X size={22} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {ledgerLoading ? (
                <div className="h-96 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw size={36} className="animate-spin text-emerald-600" />
                  <p className="text-sm font-semibold text-slate-600">Compiling financial ledger matrices...</p>
                </div>
              ) : (
                <div className="space-y-6">

                  {/* ✨ FINANCIAL METRICS SUMMARY CARDS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase">Grand Total Payable</span>
                        <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">{formatCurrency(ledgerData?.grandTotalPayable)}</h3>
                      </div>
                      <div className="p-2.5 bg-slate-100 rounded-lg text-slate-600">
                        <DollarSign size={20} />
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase">Total Amount Paid</span>
                        <h3 className="text-xl font-extrabold text-emerald-600 mt-0.5">{formatCurrency(ledgerData?.grandTotalPaid)}</h3>
                      </div>
                      <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
                        <CheckCircle2 size={20} />
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase">Net Balance Due</span>
                        <h3 className={`text-xl font-extrabold mt-0.5 ${ledgerData?.grandTotalBalance > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                          {formatCurrency(ledgerData?.grandTotalBalance)}
                        </h3>
                      </div>
                      <div className={`p-2.5 rounded-lg ${ledgerData?.grandTotalBalance > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                        {ledgerData?.grandTotalBalance > 0 ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                      </div>
                    </div>
                  </div>

                  {/* 📅 BREAKDOWN BY MONTHS SECTION */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                        <Calendar size={16} className="text-slate-500" /> Monthly Fee Schedule & Dues
                      </h4>
                      <span className="text-xs font-medium text-slate-400 font-mono">Session: {ledgerData?.academicYearName}</span>
                    </div>

                    {ledgerData?.months?.map((monthDue) => {
                      const isExpanded = !!expandedMonths[monthDue.month];
                      // month number (1-12) থেকে নাম কনভার্ট
                      const currentMonthName = monthNames[(monthDue.month - 1)] || `Month (${monthDue.month})`;

                      return (
                        <div key={monthDue.month} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                          {/* Accordion Trigger Header */}
                          <div
                            onClick={() => toggleMonth(monthDue.month)}
                            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 select-none transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-2.5 h-2.5 rounded-full ${monthDue.fullyPaid ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                              <span className="font-bold text-slate-800 text-sm">{currentMonthName}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                                monthDue.fullyPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                              }`}>
                                {monthDue.fullyPaid ? 'Fully Paid' : 'Dues Pending'}
                              </span>
                            </div>

                            <div className="flex items-center gap-6 text-xs font-semibold">
                              <div className="text-slate-500 hidden sm:block">
                                Total: <span className="text-slate-800 font-bold">{formatCurrency(monthDue.totalPayable)}</span>
                              </div>
                              <div className="text-emerald-600 hidden sm:block">
                                Paid: <span className="font-bold">{formatCurrency(monthDue.totalPaid)}</span>
                              </div>
                              <div className={monthDue.totalBalance > 0 ? 'text-rose-600' : 'text-slate-700'}>
                                Balance: <span className="font-bold">{formatCurrency(monthDue.totalBalance)}</span>
                              </div>
                              {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                            </div>
                          </div>

                          {/* Accordion Nested Child Elements (Fee Items Breakdown) */}
                          {isExpanded && (
                            <div className="border-t border-slate-100 bg-slate-50/50 p-4 font-sans">
                              {monthDue.items && monthDue.items.length > 0 ? (
                                <div className="overflow-hidden border border-slate-200 rounded-lg bg-white">
                                  <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                      <tr className="bg-slate-50 font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider">
                                        <th className="p-2.5 pl-4">Fee Item Name</th>
                                        <th className="p-2.5 text-right w-28">Payable</th>
                                        <th className="p-2.5 text-right w-28">Paid Amount</th>
                                        <th className="p-2.5 text-right w-28">Balance Due</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                      {monthDue.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/60">
                                          <td className="p-2.5 pl-4 font-semibold text-slate-800">{item.feeTypeName || 'Regular Fee Component'}</td>
                                          <td className="p-2.5 text-right font-mono">{formatCurrency(item.payableAmount)}</td>
                                          <td className="p-2.5 text-right font-mono text-emerald-600">{formatCurrency(item.paidAmount)}</td>
                                          <td className={`p-2.5 text-right font-mono font-bold ${item.balanceAmount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                                            {formatCurrency(item.balanceAmount)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="text-center py-4 text-xs text-slate-400 font-medium">
                                  No broken down fee configurations allocated for this timeline item.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}
            </div>

            {/* Footer button */}
            <div className="bg-white border-t border-slate-200 px-6 py-4 flex justify-end shrink-0 shadow-inner">
              <button
                type="button"
                onClick={() => setIsLedgerDrawerOpen(false)}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow transition"
              >
                Close Ledger
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentFeeDetails;