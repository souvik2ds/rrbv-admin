import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import {
  ShieldAlert,
  School,
  Calendar,
  Users,
  Search,
  RefreshCw,
  AlertCircle,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  MinusCircle,
  BarChart3,
  ListOrdered,
  FileText
} from 'lucide-react';

const AdminStudentAttendanceReport = () => {
  // Master Data States
  const [classrooms, setClassrooms] = useState([]);
  const [academicYear, setAcademicYear] = useState(null);
  const [enrollments, setEnrollments] = useState([]);

  // Selection States
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState('');
  const [fromDate, setFromDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [toDate, setToDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [reportType, setReportType] = useState('HISTORY'); // 'HISTORY' or 'SUMMARY'

  // Report Data States
  const [historyData, setHistoryData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);

  // UI & Loading States
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. Load Initial Active Classrooms and Academic Year
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingInitial(true);
      try {
        const [classroomsData, academicYearData] = await Promise.all([
          apiRequest('/classrooms/active', 'GET'),
          apiRequest('/academic-years/active', 'GET')
        ]);

        setClassrooms(classroomsData || []);
        setAcademicYear(academicYearData || null);

        if (classroomsData && classroomsData.length > 0) {
          setSelectedClassroomId(classroomsData[0].id);
        }
      } catch (err) {
        setMessage({
          type: 'error',
          text: err.message || 'Failed to load initial metadata.'
        });
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchInitialData();
  }, []);

  // 2. Fetch Enrollments when Classroom or Academic Year changes
  useEffect(() => {
    if (!selectedClassroomId || !academicYear?.id) return;

    const fetchEnrollments = async () => {
      setLoadingEnrollments(true);
      setEnrollments([]);
      setSelectedEnrollmentId('');
      setHistoryData([]);
      setSummaryData(null);
      setSearched(false);

      try {
        const endpoint = `/student-enrollments/academic-year/${academicYear.id}/classroom/${selectedClassroomId}`;
        const data = await apiRequest(endpoint, 'GET');

        // Filter only active enrollments if necessary
        const activeEnrollments = (data || []).filter(e => e.active);
        setEnrollments(activeEnrollments);

        if (activeEnrollments.length > 0) {
          setSelectedEnrollmentId(activeEnrollments[0].id);
        }
      } catch (err) {
        setMessage({
          type: 'error',
          text: err.message || 'Failed to load student enrollments.'
        });
      } finally {
        setLoadingEnrollments(false);
      }
    };

    fetchEnrollments();
  }, [selectedClassroomId, academicYear]);

  // 3. Fetch Report (History or Summary)
  const handleFetchReport = async (e) => {
    if (e) e.preventDefault();

    if (!selectedEnrollmentId || !fromDate || !toDate) {
      setMessage({ type: 'error', text: 'Please select student enrollment and date range.' });
      return;
    }

    setLoadingReport(true);
    setMessage({ type: '', text: '' });
    setHistoryData([]);
    setSummaryData(null);

    try {
      if (reportType === 'HISTORY') {
        const endpoint = `/attendance/report/student/history?studentEnrollmentId=${selectedEnrollmentId}&fromDate=${fromDate}&toDate=${toDate}`;
        const data = await apiRequest(endpoint, 'GET');
        setHistoryData(data || []);
      } else {
        const endpoint = `/attendance/report/student/summary?studentEnrollmentId=${selectedEnrollmentId}&fromDate=${fromDate}&toDate=${toDate}`;
        const data = await apiRequest(endpoint, 'GET');
        setSummaryData(data || null);
      }
      setSearched(true);
    } catch (err) {
      setSearched(true);
      setMessage({ type: 'error', text: err.message || 'Failed to fetch attendance report.' });
    } finally {
      setLoadingReport(false);
    }
  };

  // Helper Badge Style for AttendanceStatus Enum Values
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PRESENT': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'ABSENT': return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'LATE': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'HALF_DAY': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'EXCUSED': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'UNMARKED':
      default: return 'bg-slate-100 text-slate-600 border-slate-300';
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-500">
        <RefreshCw className="animate-spin text-emerald-600" size={32} />
        <span className="text-sm font-bold">Loading System Data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl shadow-lg shadow-emerald-100">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Student Attendance Reports</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Admin control panel for student attendance history and summary analysis.
            </p>
          </div>
        </div>

        {/* Active Academic Year Display */}
        {academicYear && (
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl text-xs font-bold text-emerald-800">
            <Calendar size={16} className="text-emerald-600" />
            <span>Academic Year: <strong>{academicYear.name}</strong></span>
          </div>
        )}
      </div>

      {/* Alert Error Message */}
      {message.text && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-xs font-bold">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Filter Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <form onSubmit={handleFetchReport} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Classroom Selection */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                1. Select Classroom <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedClassroomId}
                onChange={(e) => setSelectedClassroomId(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all cursor-pointer"
              >
                {classrooms.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.section}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Enrollment Selection */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                2. Select Active Student <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedEnrollmentId}
                onChange={(e) => setSelectedEnrollmentId(e.target.value)}
                disabled={loadingEnrollments || enrollments.length === 0}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all cursor-pointer disabled:opacity-50"
              >
                {enrollments.length === 0 ? (
                  <option value="">No Active Student Enrollments Found</option>
                ) : (
                  enrollments.map((enr) => (
                    <option key={enr.id} value={enr.id}>
                      #{enr.rollNumber || 'N/A'} - {enr.studentName} ({enr.studentCode})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
            {/* From Date */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                From Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all cursor-pointer"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                To Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all cursor-pointer"
              />
            </div>

            {/* Report Mode Radio Options */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Report View Option <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setReportType('HISTORY')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    reportType === 'HISTORY'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ListOrdered size={14} /> History
                </button>

                <button
                  type="button"
                  onClick={() => setReportType('SUMMARY')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    reportType === 'SUMMARY'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BarChart3 size={14} /> Summary
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={loadingReport || enrollments.length === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black py-3.5 px-8 rounded-2xl transition-all shadow-lg shadow-emerald-100 active:scale-95 disabled:opacity-70 cursor-pointer"
            >
              {loadingReport ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Fetching Report...
                </>
              ) : (
                <>
                  <Search size={16} /> Generate Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* DISPLAY OPTION 1: ATTENDANCE HISTORY TABLE */}
      {searched && reportType === 'HISTORY' && historyData.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <ListOrdered size={16} className="text-emerald-600" /> Attendance History
            </h3>
            <span className="text-xs font-bold text-slate-500">
              Total Records: {historyData.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-400 text-[10px] uppercase font-black tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Roll No</th>
                  <th className="py-4 px-6">Student Name</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {historyData.map((item, idx) => (
                  <tr key={item.attendanceId || idx} className="hover:bg-slate-50/60 transition-all">
                    <td className="py-4 px-6 font-mono font-bold text-slate-800">
                      {item.attendanceDate}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-600">
                      #{item.rollNo || 'N/A'}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {item.studentName}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block border px-3 py-1.5 rounded-xl text-xs font-black uppercase ${getStatusBadgeClass(item.status)}`}>
                        {item.status || 'UNMARKED'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 italic">
                      {item.remarks ? item.remarks : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DISPLAY OPTION 2: ATTENDANCE SUMMARY CARDS */}
      {searched && reportType === 'SUMMARY' && summaryData && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Student Report For</span>
              <h3 className="text-base font-black text-slate-800 mt-0.5">{summaryData.studentName}</h3>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Date Range</span>
              <span className="text-xs font-black text-slate-700 font-mono mt-0.5 block">
                {summaryData.fromDate} to {summaryData.toDate}
              </span>
            </div>
          </div>

          {/* Attendance Percentage Display */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-800 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-900/10">
            <div>
              <span className="text-xs uppercase font-black tracking-wider text-emerald-200">Overall Attendance Score</span>
              <p className="text-xs text-emerald-100/80 mt-1">Calculated ratio of present days vs total academic days in selected range.</p>
            </div>
            <div className="text-center sm:text-right">
              <span className="text-4xl font-black font-mono tracking-tight text-emerald-300">
                {summaryData.attendancePercentage.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Breakdown Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-black block">Total Days</span>
              <span className="text-base font-black text-slate-800 mt-1 block">{summaryData.totalDays}</span>
            </div>

            <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
              <span className="text-[10px] text-emerald-700 uppercase font-black flex items-center gap-1">
                <CheckCircle2 size={12} /> Present
              </span>
              <span className="text-base font-black text-emerald-800 mt-1 block">{summaryData.presentDays}</span>
            </div>

            <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100">
              <span className="text-[10px] text-rose-700 uppercase font-black flex items-center gap-1">
                <XCircle size={12} /> Absent
              </span>
              <span className="text-base font-black text-rose-800 mt-1 block">{summaryData.absentDays}</span>
            </div>

            <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
              <span className="text-[10px] text-amber-700 uppercase font-black flex items-center gap-1">
                <Clock size={12} /> Late
              </span>
              <span className="text-base font-black text-amber-800 mt-1 block">{summaryData.lateDays}</span>
            </div>

            <div className="bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100">
              <span className="text-[10px] text-purple-700 uppercase font-black flex items-center gap-1">
                <Clock size={12} /> Half Days
              </span>
              <span className="text-base font-black text-purple-800 mt-1 block">{summaryData.halfDays}</span>
            </div>

            <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100">
              <span className="text-[10px] text-blue-700 uppercase font-black flex items-center gap-1">
                <HelpCircle size={12} /> Excused
              </span>
              <span className="text-base font-black text-blue-800 mt-1 block">{summaryData.excusedDays}</span>
            </div>

            <div className="bg-slate-100/50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-600 uppercase font-black flex items-center gap-1">
                <MinusCircle size={12} /> Unmarked
              </span>
              <span className="text-base font-black text-slate-700 mt-1 block">{summaryData.unmarkedDays}</span>
            </div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {searched && ((reportType === 'HISTORY' && historyData.length === 0) || (reportType === 'SUMMARY' && !summaryData)) && !message.text && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-sm font-black text-slate-700">No Data Found</h3>
          <p className="text-xs text-slate-500 font-semibold">
            No attendance records exist for the selected student within the specified date range.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminStudentAttendanceReport;