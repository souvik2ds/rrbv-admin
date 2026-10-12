import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AcademicYear from './pages/AcademicYear';
import ManageStaff from './pages/ManageStaff';
import Classroom from './pages/Classroom';
import TeacherEnrollment from './pages/TeacherEnrollment';
import TeacherAssignment from './pages/TeacherAssignment';
import StudentAdmission from './pages/StudentAdmission';
import StudentDirectory from './pages/StudentDirectory';
import StudentPromotion from './pages/StudentPromotion';
import FeeTypeManagement from './pages/FeeTypeManagement';
import FeeStructure from './pages/FeeStructure';
import EnrollmentFeeDetails from './pages/EnrollmentFeeDetails';
import ClasswiseDueSummary from './pages/ClasswiseDueSummary';
import OverallDueSummary from './pages/OverallDueSummary';
import CollectionReport from './pages/CollectionReport';
import ExamSchedule from './pages/ExamSchedule';
import ExamSubjects from './pages/ExamSubjects';
import GenerateResult from './pages/GenerateResult';
import ReportCardView from './pages/ReportCardView';
import Login from './pages/Login';
import ClassAttendanceReport from './pages/ClassAttendanceReport';
import AllClassTodayAttendanceReport from './pages/AllClassTodayAttendanceReport';
import AdminStudentAttendanceReport from './pages/AdminStudentAttendanceReport';
import ReportCardMain from './pages/ReportCardMain';
import { LogOut } from 'lucide-react';
import { apiRequest } from './api';

function App() {

  // null = checking authentication
  // true = authenticated
  // false = not authenticated
  const [authStatus, setAuthStatus] = useState(null);

  const [username, setUsername] = useState(
    () => localStorage.getItem('username') || 'System Admin'
  );

  const [role, setRole] = useState(
    () => localStorage.getItem('role') || ''
  );

  const [userId, setUserId] = useState(
    () => localStorage.getItem('userId') || ''
  );

  const [passwordChanged, setPasswordChanged] = useState(
    () => localStorage.getItem('passwordChanged') === 'true'
  );

  const [activeTab, setActiveTab] = useState('dashboard');

  // Select করা Exam এর তথ্য স্টোর করার জন্য state
  const [selectedExamForSubjects, setSelectedExamForSubjects] = useState(null);


  // ============================================================
  // Authentication Check
  // ============================================================
  useEffect(() => {

    const checkAuthentication = async () => {

      try {

        const data = await apiRequest('/auth/me', 'GET');

        if (data.role !== 'ADMIN') {
          localStorage.clear();
          setAuthStatus(false);
          return;
        }

        setUsername(data.username || 'System Admin');
        setRole(data.role || 'ADMIN');
        setUserId(data.userId || '');
        setPasswordChanged(
          data.passwordChanged === true ||
          data.passwordChanged === 'true'
        );

        // Keep existing frontend information
        localStorage.setItem('role', data.role);
        localStorage.setItem('username', data.username || 'System Admin');
        localStorage.setItem('userId', data.userId || '');
        localStorage.setItem(
          'passwordChanged',
          data.passwordChanged
        );

        setAuthStatus(true);

      } catch (error) {

        localStorage.clear();

        setUsername('System Admin');
        setRole('');
        setUserId('');
        setPasswordChanged(false);

        setAuthStatus(false);
      }
    };

    checkAuthentication();

  }, []);


  // ============================================================
  // Login Success
  // ============================================================
  const handleLoginSuccess = (loginResponse) => {

    if (!loginResponse) return;

    const targetData =
      loginResponse.data
        ? loginResponse.data
        : loginResponse;

    if (targetData.role !== 'ADMIN') return;

    // JWT is handled by HttpOnly cookie.
    // No token is stored in localStorage.

    setUsername(targetData.username || 'System Admin');
    setRole(targetData.role || 'ADMIN');
    setUserId(targetData.userId || '');

    setPasswordChanged(
      targetData.passwordChanged === true ||
      targetData.passwordChanged === 'true'
    );

    // Keep existing frontend information
    localStorage.setItem('role', targetData.role);
    localStorage.setItem(
      'username',
      targetData.username || 'System Admin'
    );
    localStorage.setItem(
      'userId',
      targetData.userId || ''
    );
    localStorage.setItem(
      'passwordChanged',
      targetData.passwordChanged
    );

    setAuthStatus(true);
    setActiveTab('dashboard');
  };


  // ============================================================
  // Logout
  // ============================================================
  const handleLogout = async () => {

    try {
      await apiRequest('/auth/logout', 'POST');
    } catch (error) {
      // Continue frontend logout even if request fails
    } finally {

      localStorage.clear();

      setAuthStatus(false);
      setUsername('System Admin');
      setRole('');
      setUserId('');
      setPasswordChanged(false);
      setActiveTab('dashboard');
    }
  };


  // ============================================================
  // Exam Navigation
  // ============================================================
  const handleNavigateFromExam = (view, examData) => {

    if (view === 'exam-subjects') {
      setSelectedExamForSubjects(examData);
      setActiveTab('exam-subjects');
    }
  };
  // ============================================================
  // Exam Back Navigation
  // ============================================================
  const handleBackToExamSchedule = () => {

    setActiveTab('exam-schedule');
    setSelectedExamForSubjects(null);
  };


  // ============================================================
  // Authentication Check In Progress
  // ============================================================
  if (authStatus === null) {
    return null;
  }


  // ============================================================
  // Not Authenticated
  // ============================================================
  if (authStatus === false) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }


  // ============================================================
  // Render Content
  // ============================================================
  const renderContent = () => {

    switch (activeTab) {

      case 'dashboard':
        return <Dashboard />

      case 'academic-year':
        return <AcademicYear />;

      case 'manage-staff':
        return <ManageStaff />;

      case 'classrooms':
        return <Classroom />;

      case 'teacher-enrollment':
        return <TeacherEnrollment />;

      case 'teacher-assignment':
        return <TeacherAssignment />;

      case 'admissions':
        return <StudentAdmission />;

      case 'student-directory':
        return <StudentDirectory />;

      case 'student-attendance':
        return (
          <h1 className="text-2xl font-bold text-slate-800">
            Daily Attendance Tracking (Coming Soon)
          </h1>
        );

      case 'student-promotion':
        return <StudentPromotion />;

      case 'fee-types':
        return <FeeTypeManagement />;

      case 'fee-structure':
        return <FeeStructure />;

      case 'enrollment-fee':
        return <EnrollmentFeeDetails />;

      case 'classwise-due-summary':
        return <ClasswiseDueSummary />;

      case 'overall-due-summary':
        return <OverallDueSummary />;

      case 'fee-collection-report':
            return <CollectionReport />;

      case 'exam-schedule':
        return (
          <ExamSchedule
            onNavigate={handleNavigateFromExam}
          />
        );

      case 'exam-subjects':
        return selectedExamForSubjects ? (
          <ExamSubjects
            exam={selectedExamForSubjects}
            onBack={handleBackToExamSchedule}
          />
        ) : (
          <ExamSchedule
            onNavigate={handleNavigateFromExam}
          />
        );

      case 'exam-marks-entry':
        return (
          <h1 className="text-2xl font-bold text-slate-800">
            Marks Entry Panel (Coming Soon)
          </h1>
        );

      case 'result-view':
        return <GenerateResult />;

      case 'report-card':
        return <ReportCardMain />;

      case 'student-attendance-report':
        return <AdminStudentAttendanceReport />;

      case 'class-attendance-report':
        return <ClassAttendanceReport />;

      case 'all-class-today-attendance-report':
        return <AllClassTodayAttendanceReport />;
      default:
        return (
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome to Dashboard Overview
          </h1>
        );
    }
  };


  // ============================================================
  // Main Application
  // ============================================================
  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 pl-64 flex flex-col min-h-screen">

        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">

          <div className="text-sm font-semibold text-slate-400 tracking-wide">
            SYSTEM DATE:{' '}
            {new Date().toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </div>

          <div className="flex items-center space-x-6">

            <div className="flex items-center space-x-3 border-r border-slate-200 pr-4">

              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold shadow-md">
                {username
                  ? username.charAt(0).toUpperCase()
                  : 'A'}
              </div>

              <div className="flex flex-col text-left">

                <span className="text-sm font-bold text-slate-700 leading-tight">
                  {username}
                </span>

                <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest mt-0.5">
                  {role}
                </span>

              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl transition-all duration-200 active:scale-95 shadow-sm border border-rose-100"
            >
              <LogOut size={14} className="stroke-[2.5]" />
              Logout
            </button>

          </div>

        </header>

        <main className="p-8 flex-1 bg-slate-50">

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 min-h-[calc(100vh-8rem)]">
            {renderContent()}
          </div>

        </main>

      </div>
    </div>
  );
}

export default App;