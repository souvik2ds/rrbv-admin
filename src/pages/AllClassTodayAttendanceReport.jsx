import React, { useState, useEffect, useMemo } from 'react';
import { apiRequest } from '../api';
import {
  Users,
  Calendar,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck
} from 'lucide-react';

const AllClassTodayAttendanceReport = () => {
  const [loadingActiveYear, setLoadingActiveYear] = useState(true);
  const [loadingReport, setLoadingReport] = useState(true);
  const [error, setError] = useState('');

  const [activeYear, setActiveYear] = useState(null);
  const [reportData, setReportData] = useState([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedClasses, setExpandedClasses] = useState({});

  // ============================================================
  // 1. Fetch Active Academic Year
  // ============================================================
  const fetchActiveAcademicYear = async () => {
    setLoadingActiveYear(true);
    try {
      const data = await apiRequest('/academic-years/active', 'GET');
      setActiveYear(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch active academic year:', err);
      setError('Failed to fetch active academic year session');
      return null;
    } finally {
      setLoadingActiveYear(false);
    }
  };

  // ============================================================
  // 2. Fetch Attendance Report For All Classes Today
  // ============================================================
  const fetchTodayReport = async (academicYearId) => {
    if (!academicYearId) return;
    setLoadingReport(true);
    setError('');

    try {
      const endpoint = `/attendance/report/all-classes/today?academicYearId=${academicYearId}`;
      const data = await apiRequest(endpoint, 'GET');
      setReportData(data || []);

      // Auto-expand first 2 classes for better initial view
      if (Array.isArray(data) && data.length > 0) {
        const initialExpanded = {};
        data.slice(0, 2).forEach((cls) => {
          if (cls.classroomId) initialExpanded[cls.classroomId] = true;
        });
        setExpandedClasses(initialExpanded);
      }
    } catch (err) {
      console.error('Failed to fetch class attendance report:', err);
      setError(err.message || 'Failed to load today class attendance report');
      setReportData([]);
    } finally {
      setLoadingReport(false);
    }
  };

  // Initial Fetching Pipeline
  const loadInitialData = async () => {
    setError('');
    const currentActiveYear = await fetchActiveAcademicYear();
    if (currentActiveYear?.id) {
      await fetchTodayReport(currentActiveYear.id);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Toggle Accordion
  const toggleClassAccordion = (classroomId) => {
    setExpandedClasses((prev) => ({
      ...prev,
      [classroomId]: !prev[classroomId]
    }));
  };

  // Expand/Collapse All Toggle
  const toggleExpandAll = (expand) => {
    const newExpandedState = {};
    reportData.forEach((cls) => {
      newExpandedState[cls.classroomId] = expand;
    });
    setExpandedClasses(newExpandedState);
  };

  // ============================================================
  // Computed Metrics & Search Filtering
  // ============================================================
  const filteredReportData = useMemo(() => {
    if (!searchQuery.trim()) return reportData;

    const query = searchQuery.toLowerCase();
    return reportData
      .map((cls) => {
        const matchesClassName = cls.className?.toLowerCase().includes(query);
        const matchingStudents = cls.students?.filter((st) =>
          st.studentName?.toLowerCase().includes(query)
        );

        if (matchesClassName) return cls;
        if (matchingStudents && matchingStudents.length > 0) {
          return { ...cls, students: matchingStudents };
        }
        return null;
      })
      .filter(Boolean);
  }, [reportData, searchQuery]);

  // Overall Statistics
  const overallStats = useMemo(() => {
    let totalClasses = reportData.length;
    let totalStudents = 0;
    let totalPercentageSum = 0;
    let lowAttendanceCount = 0;

    reportData.forEach((cls) => {
      const studentList = cls.students || [];
      totalStudents += studentList.length;

      let classPercentageSum = 0;
      studentList.forEach((st) => {
        classPercentageSum += st.attendancePercentage || 0;
        if ((st.attendancePercentage || 0) < 75) {
          lowAttendanceCount++;
        }
      });

      if (studentList.length > 0) {
        totalPercentageSum += classPercentageSum / studentList.length;
      }
    });

    const avgAttendance = totalClasses > 0 ? (totalPercentageSum / totalClasses).toFixed(1) : 0;

    return { totalClasses, totalStudents, avgAttendance, lowAttendanceCount };
  }, [reportData]);

  // Percentage Badge Stylings
  const getPercentageColorClass = (pct) => {
    if (pct >= 75) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (pct >= 50) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-6 p-2 sm:p-4">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <UserCheck className="text-blue-600" size={26} />
            Today's Class Attendance Report
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-2">
            <Calendar size={14} className="text-emerald-600" />
            Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            <span className="text-slate-300">|</span>
            <GraduationCap size={14} className="text-blue-600" />
            Active Session: <span className="text-slate-700 font-bold">{activeYear?.name || 'N/A'}</span>
          </p>
        </div>

        <button
          onClick={loadInitialData}
          disabled={loadingActiveYear || loadingReport}
          className="self-start sm:self-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loadingActiveYear || loadingReport ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Classes</p>
          <h4 className="text-2xl font-black text-slate-800 mt-1">{overallStats.totalClasses}</h4>
          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Classes reported today</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Students</p>
          <h4 className="text-2xl font-black text-blue-600 mt-1">{overallStats.totalStudents}</h4>
          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Enrolled across classes</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Attendance Rate</p>
          <h4 className="text-2xl font-black text-emerald-600 mt-1">{overallStats.avgAttendance}%</h4>
          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Overall average percentage</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Low Attendance Alert</p>
          <h4 className="text-2xl font-black text-rose-600 mt-1">{overallStats.lowAttendanceCount}</h4>
          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Students with &lt;75% attendance</p>
        </div>
      </div>

      {/* Controls: Search and Accordion Toggles */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by class name or student name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Global Expand / Collapse */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => toggleExpandAll(true)}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
          >
            Expand All
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => toggleExpandAll(false)}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Class List & Students Accordion Section */}
      {loadingReport || loadingActiveYear ? (
        <div className="h-64 bg-white border border-slate-200/80 rounded-3xl flex flex-col items-center justify-center text-slate-400 text-xs font-semibold gap-2">
          <Loader2 size={24} className="animate-spin text-blue-600" />
          Loading today's attendance report...
        </div>
      ) : filteredReportData.length > 0 ? (
        <div className="space-y-4">
          {filteredReportData.map((cls) => {
            const isExpanded = !!expandedClasses[cls.classroomId];
            const studentList = cls.students || [];

            // Calculate class summary stats
            const totalStudentsCount = studentList.length;
            const avgClassPct = totalStudentsCount > 0
              ? (studentList.reduce((acc, st) => acc + (st.attendancePercentage || 0), 0) / totalStudentsCount).toFixed(1)
              : 0;

            return (
              <div
                key={cls.classroomId}
                className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleClassAccordion(cls.classroomId)}
                  className="p-4 bg-slate-50/50 hover:bg-slate-100/60 cursor-pointer flex items-center justify-between transition-all select-none border-b border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-800">{cls.className}</h3>
                      <p className="text-xs font-medium text-slate-500">
                        Total Students: <span className="font-bold text-slate-700">{totalStudentsCount}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Class Avg</span>
                      <span className="text-xs font-black text-slate-800">{avgClassPct}%</span>
                    </div>

                    <div className="p-1.5 text-slate-500 rounded-lg bg-white border border-slate-200">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {/* Accordion Body / Student List */}
                {isExpanded && (
                  <div className="p-4 space-y-4">
                    {studentList.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                              <th className="py-3 px-4">Student Name</th>
                              <th className="py-3 px-4 text-center">Total Days</th>
                              <th className="py-3 px-4 text-center">Present</th>
                              <th className="py-3 px-4 text-center">Absent</th>
                              <th className="py-3 px-4 text-center">Late</th>
                              <th className="py-3 px-4 text-center">Half / Excused</th>
                              <th className="py-3 px-4 text-center">Attendance %</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                            {studentList.map((st) => {
                              const pct = (st.attendancePercentage || 0).toFixed(1);
                              return (
                                <tr key={st.studentEnrollmentId} className="hover:bg-slate-50/50 transition-all">
                                  <td className="py-3 px-4">
                                    <span className="font-bold text-slate-800">{st.studentName}</span>
                                  </td>
                                  <td className="py-3 px-4 text-center text-slate-500">{st.totalDays}</td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                                      <CheckCircle2 size={13} /> {st.presentDays}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                                      <XCircle size={13} /> {st.absentDays}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                                      <Clock size={13} /> {st.lateDays}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-center text-slate-500">
                                    {st.halfDays + st.excusedDays}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span
                                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-black border ${getPercentageColorClass(
                                        pct
                                      )}`}
                                    >
                                      {pct}%
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-400 text-xs font-medium">
                        No student records found for this class.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="h-64 bg-white border border-slate-200/80 rounded-3xl flex flex-col items-center justify-center text-slate-400 text-xs font-medium">
          <Users size={32} className="text-slate-300 mb-2" />
          No class attendance reports found for today.
        </div>
      )}
    </div>
  );
};

export default AllClassTodayAttendanceReport;