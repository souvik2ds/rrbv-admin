import React, { useState, useEffect, useMemo } from 'react';
import { apiRequest } from '../api';
import {
  IndianRupee,
  Receipt,
  TrendingUp,
  CreditCard,
  Calendar,
  Loader2,
  AlertCircle,
  RefreshCw,
  Users,
  GraduationCap,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

const Dashboard = () => {
  const [loadingToday, setLoadingToday] = useState(true);
  const [loadingStudentStats, setLoadingStudentStats] = useState(true);
  const [loadingActiveYear, setLoadingActiveYear] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [error, setError] = useState('');

  const [todayData, setTodayData] = useState(null);
  const [studentStatsData, setStudentStatsData] = useState([]);
  const [activeYear, setActiveYear] = useState(null);
  const [classwiseAttendance, setClasswiseAttendance] = useState([]);

  // ============================================================
  // 1. Fetch Today's Day-Book Collection Data
  // ============================================================
  const fetchTodayCollection = async () => {
    setLoadingToday(true);
    const todayStr = new Date().toISOString().split('T')[0];

    try {
      const endpoint = `/fee/reports/day-book?date=${todayStr}`;
      const data = await apiRequest(endpoint, 'GET');
      setTodayData(data);
    } catch (err) {
      setError(err.message || "Failed to fetch today's collection data");
      setTodayData(null);
    } finally {
      setLoadingToday(false);
    }
  };

  // ============================================================
  // 2. Fetch Yearly Active Student Stats by Gender
  // ============================================================
  const fetchStudentStats = async () => {
    setLoadingStudentStats(true);
    try {
      const endpoint = `/student-enrollments/yearly-active-students-by-gender`;
      const data = await apiRequest(endpoint, 'GET');
      setStudentStatsData(data || []);
    } catch (err) {
      console.error("Failed to fetch student stats:", err);
      setStudentStatsData([]);
    } finally {
      setLoadingStudentStats(false);
    }
  };

  // ============================================================
  // 3. Fetch Class-wise Attendance Counts Today
  // ============================================================
  const fetchTodayClasswiseAttendance = async (academicYearId) => {
    if (!academicYearId) return;
    setLoadingAttendance(true);
    try {
      const endpoint = `/attendance/report/classwise-count-today?academicYearId=${academicYearId}`;
      const data = await apiRequest(endpoint, 'GET');
      setClasswiseAttendance(data || []);
    } catch (err) {
      console.error("Failed to fetch classwise attendance count:", err);
      setClasswiseAttendance([]);
    } finally {
      setLoadingAttendance(false);
    }
  };

  // ============================================================
  // 4. Fetch Active Academic Year and Pipeline
  // ============================================================
  const fetchActiveAcademicYear = async () => {
    setLoadingActiveYear(true);
    try {
      const endpoint = `/academic-years/active`;
      const data = await apiRequest(endpoint, 'GET');
      setActiveYear(data);
      return data;
    } catch (err) {
      console.error("Failed to fetch active academic year:", err);
      setActiveYear(null);
      return null;
    } finally {
      setLoadingActiveYear(false);
    }
  };

  // Initial Fetching
  const fetchAllDashboardData = async () => {
    setError('');
    fetchTodayCollection();
    fetchStudentStats();

    const active = await fetchActiveAcademicYear();
    if (active?.id) {
      fetchTodayClasswiseAttendance(active.id);
    }
  };

  useEffect(() => {
    fetchAllDashboardData();
  }, []);

  // Format currency in INR
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Convert totalByPaymentMode object into Recharts-friendly array
  const paymentModeChartData = useMemo(() => {
    if (!todayData || !todayData.totalByPaymentMode) return [];
    return Object.entries(todayData.totalByPaymentMode).map(([mode, value]) => ({
      name: mode.toUpperCase(),
      value: Number(value)
    }));
  }, [todayData]);

  // Find student statistics strictly for the current active academic year
  const activeYearStats = useMemo(() => {
    if (!activeYear || !studentStatsData.length) return null;
    return studentStatsData.find(
      (stat) => stat.academicYear?.toLowerCase() === activeYear.name?.toLowerCase()
    ) || null;
  }, [activeYear, studentStatsData]);

  // Attendance summary aggregate across all classes
  const overallAttendanceSummary = useMemo(() => {
    let totalEnrolled = 0;
    let totalPresent = 0;
    let totalAbsent = 0;

    classwiseAttendance.forEach((cls) => {
      totalEnrolled += cls.totalStudents || 0;
      totalPresent += cls.presentCount || 0;
      totalAbsent += cls.absentCount || 0;
    });

    const presentPercentage = totalEnrolled > 0 ? ((totalPresent / totalEnrolled) * 100).toFixed(1) : 0;

    return { totalEnrolled, totalPresent, totalAbsent, presentPercentage };
  }, [classwiseAttendance]);

  return (
    <div className="space-y-6 p-2 sm:p-4">
      {/* Dashboard Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            School Dashboard
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Calendar size={14} className="text-emerald-600" />
            Today: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        <button
          onClick={fetchAllDashboardData}
          disabled={loadingToday || loadingStudentStats || loadingActiveYear || loadingAttendance}
          className="self-start sm:self-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loadingToday || loadingStudentStats || loadingActiveYear || loadingAttendance ? 'animate-spin' : ''} />
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

      {/* TOP SECTION: Financial Summary & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* UPPER LEFT CORNER: Today's Collection Stats */}
        <div className="lg:col-span-1 space-y-4">
          {/* Main Today's Collection Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/10">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-100 border border-white/10">
                Today's Collection
              </span>
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <IndianRupee size={20} className="text-white" />
              </div>
            </div>

            {loadingToday ? (
              <div className="py-6 flex items-center gap-2 text-emerald-100 text-sm font-semibold">
                <Loader2 size={18} className="animate-spin" />
                Loading Today's Data...
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-black tracking-tight">
                  {formatCurrency(todayData?.totalCollected)}
                </h2>
                <div className="mt-4 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-emerald-100 font-semibold">
                  <span className="flex items-center gap-1">
                    <Receipt size={14} /> Total Receipts
                  </span>
                  <span className="font-bold text-white text-sm">
                    {todayData?.entries?.length || 0}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Receipts</p>
              <h4 className="text-lg font-extrabold text-slate-800 mt-1">
                {loadingToday ? '...' : todayData?.entries?.length || 0}
              </h4>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5">Transactions today</p>
            </div>

            {/* Active Academic Year Section */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Session</p>
              <h4 className="text-lg font-extrabold text-emerald-600 mt-1 flex items-center gap-1">
                <GraduationCap size={16} />
                {loadingActiveYear ? '...' : activeYear?.name || 'N/A'}
              </h4>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                {activeYearStats ? `${activeYearStats.totalCount} Active Students` : 'Active Session'}
              </p>
            </div>
          </div>
        </div>

        {/* PAYMENT MODE GRAPH SECTION */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <CreditCard size={18} className="text-emerald-600" />
                Today's Payment Mode Breakdown
              </h3>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Distribution between Cash, UPI, Online & other modes
              </p>
            </div>
          </div>

          {loadingToday ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-semibold gap-2">
              <Loader2 size={18} className="animate-spin text-emerald-600" />
              Generating Chart...
            </div>
          ) : paymentModeChartData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 py-4">
              {/* Pie Chart */}
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentModeChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {paymentModeChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [formatCurrency(value), 'Amount']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                        border: 'none'
                      }}
                      itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Mode Breakdown Details */}
              <div className="space-y-2.5">
                {paymentModeChartData.map((item, index) => {
                  const percentage = todayData?.totalCollected
                    ? ((item.value / todayData.totalCollected) * 100).toFixed(1)
                    : 0;

                  return (
                    <div
                      key={item.name}
                      className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></span>
                        <span className="text-xs font-bold text-slate-700">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-800 block">
                          {formatCurrency(item.value)}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs font-medium">
              <Receipt size={32} className="text-slate-300 mb-2" />
              No collection data recorded for today yet.
            </div>
          )}
        </div>
      </div>

      {/* TODAY'S CLASS-WISE ATTENDANCE SUMMARY (Compact List View) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <UserCheck size={18} className="text-blue-600" />
              Today's Class-wise Attendance Summary
            </h3>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Real-time attendance status breakdown across all classrooms
            </p>
          </div>

          {classwiseAttendance.length > 0 && (
            <div className="flex items-center gap-4 text-xs font-semibold self-start sm:self-auto bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-100">
              <span className="text-slate-500">
                Total Enrolled: <strong className="text-slate-800 font-extrabold">{overallAttendanceSummary.totalEnrolled}</strong>
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">
                Avg Present Rate:{' '}
                <strong className="text-emerald-600 font-extrabold">
                  {overallAttendanceSummary.presentPercentage}%
                </strong>
              </span>
            </div>
          )}
        </div>

        {loadingAttendance || loadingActiveYear ? (
          <div className="h-40 flex items-center justify-center text-slate-400 text-xs font-semibold gap-2">
            <Loader2 size={18} className="animate-spin text-blue-600" />
            Loading Today's Classwise Attendance...
          </div>
        ) : classwiseAttendance.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Enrolled</th>
                  <th className="py-2.5 px-3 w-1/3">Attendance Rate</th>
                  <th className="py-2.5 px-3 text-center">Present</th>
                  <th className="py-2.5 px-3 text-center">Absent</th>
                  <th className="py-2.5 px-3 text-center">Late</th>
                  <th className="py-2.5 px-3 text-center">Unmarked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {classwiseAttendance.map((cls) => {
                  const total = cls.totalStudents || 0;
                  const present = cls.presentCount || 0;
                  const absent = cls.absentCount || 0;
                  const late = cls.lateCount || 0;
                  const unmarked = cls.unmarkedCount || 0;
                  const presentRate = total > 0 ? Math.round((present / total) * 100) : 0;

                  return (
                    <tr key={cls.classroomId} className="hover:bg-slate-50/80 transition-colors">
                      {/* Class Name */}
                      <td className="py-3 px-3 font-bold text-slate-800 whitespace-nowrap">
                        {cls.className}
                      </td>

                      {/* Total Enrolled */}
                      <td className="py-3 px-3 font-semibold text-slate-600">
                        {total}
                      </td>

                      {/* Attendance Rate Progress Bar */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                            <div
                              style={{ width: `${total > 0 ? (present / total) * 100 : 0}%` }}
                              className="bg-emerald-500 h-full"
                              title={`Present: ${present}`}
                            />
                            <div
                              style={{ width: `${total > 0 ? (late / total) * 100 : 0}%` }}
                              className="bg-amber-400 h-full"
                              title={`Late: ${late}`}
                            />
                            <div
                              style={{ width: `${total > 0 ? (absent / total) * 100 : 0}%` }}
                              className="bg-rose-500 h-full"
                              title={`Absent: ${absent}`}
                            />
                          </div>
                          <span
                            className={`text-[11px] font-extrabold min-w-[36px] text-right ${
                              presentRate >= 75
                                ? 'text-emerald-600'
                                : presentRate >= 50
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {presentRate}%
                          </span>
                        </div>
                      </td>

                      {/* Present Badge */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold text-[11px]">
                          <CheckCircle2 size={12} /> {present}
                        </span>
                      </td>

                      {/* Absent Badge */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-bold text-[11px]">
                          <XCircle size={12} /> {absent}
                        </span>
                      </td>

                      {/* Late Badge */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-bold text-[11px]">
                          <Clock size={12} /> {late}
                        </span>
                      </td>

                      {/* Unmarked Status */}
                      <td className="py-3 px-3 text-center">
                        {unmarked > 0 ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-bold text-[11px]">
                            <HelpCircle size={12} /> {unmarked}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center text-slate-400 text-xs font-medium">
            <UserCheck size={28} className="text-slate-300 mb-1.5" />
            No classwise attendance data found for today.
          </div>
        )}
      </div>

      {/* SECTION: YEARLY ACTIVE STUDENTS BY GENDER GRAPH */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              Year-wise Active Students Growth (By Gender)
            </h3>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Historical count of active enrolled students categorized by Male, Female, and Others
            </p>
          </div>

          {activeYear && activeYearStats && (
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 self-start sm:self-auto">
              <span>Total Active ({activeYear.name}):</span>
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded-lg text-[11px]">
                {activeYearStats.totalCount}
              </span>
            </div>
          )}
        </div>

        {loadingStudentStats ? (
          <div className="h-72 flex items-center justify-center text-slate-400 text-xs font-semibold gap-2">
            <Loader2 size={18} className="animate-spin text-blue-600" />
            Loading Student Statistics Chart...
          </div>
        ) : studentStatsData.length > 0 ? (
          <div className="pt-6">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={studentStatsData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="academicYear"
                    tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '15px', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="maleCount" name="Male Students" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={28} />
                  <Bar dataKey="femaleCount" name="Female Students" fill="#EC4899" radius={[6, 6, 0, 0]} barSize={28} />
                  <Bar dataKey="otherCount" name="Other Students" fill="#8B5CF6" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs font-medium">
            <Users size={32} className="text-slate-300 mb-2" />
            No student enrollment history available to display.
          </div>
        )}
      </div>

      {/* LOWER SECTION PLACEHOLDER FOR FUTURE DASHBOARD MODULES */}
      <div className="pt-4 border-t border-dashed border-slate-300">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Upcoming Analytics Modules
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border border-dashed border-slate-300 rounded-2xl text-center text-slate-400 text-xs font-semibold">
            <TrendingUp size={20} className="mx-auto mb-1 text-slate-300" />
            Monthly Revenue Trends (Coming Soon)
          </div>
          <div className="p-4 border border-dashed border-slate-300 rounded-2xl text-center text-slate-400 text-xs font-semibold">
            <Receipt size={20} className="mx-auto mb-1 text-slate-300" />
            Fee Defaulters List (Coming Soon)
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;