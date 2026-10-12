import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import {
  School,
  Calendar,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  MinusCircle,
  BarChart3,
  Users,
  Award
} from 'lucide-react';

const ClassAttendanceReport = () => {
  // Master Data States
  const [classrooms, setClassrooms] = useState([]);
  const [academicYear, setAcademicYear] = useState(null);

  // Filter States
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [fromDate, setFromDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [toDate, setToDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Response Data States
  const [summaryList, setSummaryList] = useState([]);

  // UI States
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. Fetch Active Classrooms and Active Academic Year on Component Mount
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
          text: err.message || 'Failed to fetch active classrooms or academic year.'
        });
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchInitialData();
  }, []);

  // 2. Fetch Class Attendance Summary Report
  const handleGenerateReport = async (e) => {
    e.preventDefault();

    if (!selectedClassroomId || !academicYear?.id || !fromDate || !toDate) {
      setMessage({ type: 'error', text: 'Please fill in all required filter fields.' });
      return;
    }

    setLoadingReport(true);
    setMessage({ type: '', text: '' });
    setSummaryList([]);

    try {
      const queryParams = new URLSearchParams({
        academicYearId: academicYear.id,
        classroomId: selectedClassroomId,
        fromDate,
        toDate
      });

      const endpoint = `/attendance/report/class/summary?${queryParams.toString()}`;
      const data = await apiRequest(endpoint, 'GET');

      setSummaryList(data || []);
      setSearched(true);
    } catch (err) {
      setSearched(true);
      setMessage({
        type: 'error',
        text: err.message || 'Failed to generate class attendance summary.'
      });
    } finally {
      setLoadingReport(false);
    }
  };

  // Helper to determine percentage badge styling
  const getPercentageColor = (percentage) => {
    if (percentage >= 85) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (percentage >= 70) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300';
  };

  if (loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-500">
        <RefreshCw className="animate-spin text-emerald-600" size={32} />
        <span className="text-sm font-bold">Loading Classrooms & Academic Year...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl shadow-lg shadow-emerald-100">
            <BarChart3 size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Class Attendance Summary
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Generate attendance statistics and percentage breakdown for an entire class.
            </p>
          </div>
        </div>

        {/* Active Academic Year Display */}
        {academicYear && (
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl text-xs font-bold text-emerald-800">
            <Calendar size={16} className="text-emerald-600" />
            <span>Active Academic Year: <strong>{academicYear.name}</strong></span>
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

      {/* Filter Options Panel */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <form onSubmit={handleGenerateReport} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-end">

          {/* Select Classroom */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              Select Classroom <span className="text-rose-500">*</span>
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

          {/* Generate Button */}
          <div>
            <button
              type="submit"
              disabled={loadingReport || !selectedClassroomId}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-emerald-100 active:scale-95 disabled:opacity-70 cursor-pointer"
            >
              {loadingReport ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Search size={16} /> Generate Summary
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* SUMMARY RESULT DATA TABLE */}
      {searched && summaryList.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-emerald-600" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Class Attendance Report
              </h3>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
              <span>Total Students: <strong className="text-slate-800">{summaryList.length}</strong></span>
              <span>Period: <strong className="text-slate-800 font-mono">{fromDate} to {toDate}</strong></span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-400 text-[10px] uppercase font-black tracking-wider border-b border-slate-100">
                  <th className="py-4 px-4">Student Name</th>
                  <th className="py-4 px-3 text-center">Total Days</th>
                  <th className="py-4 px-3 text-center text-emerald-600">Present</th>
                  <th className="py-4 px-3 text-center text-rose-600">Absent</th>
                  <th className="py-4 px-3 text-center text-amber-600">Late</th>
                  <th className="py-4 px-3 text-center text-purple-600">Half Day</th>
                  <th className="py-4 px-3 text-center text-blue-600">Excused</th>
                  <th className="py-4 px-3 text-center text-slate-500">Unmarked</th>
                  <th className="py-4 px-4 text-center">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {summaryList.map((item) => (
                  <tr key={item.studentEnrollmentId} className="hover:bg-slate-50/60 transition-all">
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {item.studentName}
                    </td>
                    <td className="py-4 px-3 text-center font-mono font-bold text-slate-800">
                      {item.totalDays}
                    </td>
                    <td className="py-4 px-3 text-center font-mono font-bold text-emerald-700 bg-emerald-50/30">
                      {item.presentDays}
                    </td>
                    <td className="py-4 px-3 text-center font-mono font-bold text-rose-700 bg-rose-50/30">
                      {item.absentDays}
                    </td>
                    <td className="py-4 px-3 text-center font-mono font-bold text-amber-700 bg-amber-50/30">
                      {item.lateDays}
                    </td>
                    <td className="py-4 px-3 text-center font-mono font-bold text-purple-700 bg-purple-50/30">
                      {item.halfDays}
                    </td>
                    <td className="py-4 px-3 text-center font-mono font-bold text-blue-700 bg-blue-50/30">
                      {item.excusedDays}
                    </td>
                    <td className="py-4 px-3 text-center font-mono font-bold text-slate-600 bg-slate-50/50">
                      {item.unmarkedDays}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block border px-3 py-1 rounded-xl font-mono text-xs font-black ${getPercentageColor(item.attendancePercentage)}`}>
                        {item.attendancePercentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {searched && summaryList.length === 0 && !message.text && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-sm font-black text-slate-700">No Attendance Records Found</h3>
          <p className="text-xs text-slate-500 font-semibold">
            No active student enrollment or attendance summary data found for the selected classroom and date range.
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassAttendanceReport;