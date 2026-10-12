import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, BookOpen,
  Calendar, CreditCard, FileSpreadsheet,
  ChevronDown, ChevronUp, ClipboardList, UserCheck, TrendingUp,
  Settings, Layers, BarChart3, PieChart,
  FileText, Award, Edit3, CheckCircle2, UserPlus, Briefcase, Clock
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  // স্কুলের লোগো ইমেজ পাথ (public/logo.png)
  const logoImage = "/images/school-campus.png";

  const [isTeacherMenuOpen, setIsTeacherMenuOpen] = useState(false);
  const [isStudentMenuOpen, setIsStudentMenuOpen] = useState(false);
  const [isFinanceMenuOpen, setIsFinanceMenuOpen] = useState(false);
  const [isExamMenuOpen, setIsExamMenuOpen] = useState(false);
  const [isResultMenuOpen, setIsResultMenuOpen] = useState(false);
  const [isAttendanceMenuOpen, setIsAttendanceMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'academic-year', name: 'Academic Year', icon: Calendar },
    { id: 'manage-staff', name: 'Manage Staff', icon: Users },
    { id: 'classrooms', name: 'Classrooms', icon: BookOpen },
  ];

  // 👨‍🏫 Teacher Sub-items
  const teacherSubItems = [
    { id: 'teacher-enrollment', name: 'Teacher Enrollment', icon: UserPlus },
    { id: 'teacher-assignment', name: 'Teacher Assignment', icon: Briefcase },
  ];

  const studentSubItems = [
    { id: 'admissions', name: 'Student Admission', icon: FileSpreadsheet },
    { id: 'student-directory', name: 'Student Directory', icon: ClipboardList },
    { id: 'student-attendance', name: 'Daily Attendance', icon: UserCheck },
    { id: 'student-promotion', name: 'Student Promotion', icon: TrendingUp },
  ];

  const financeSubItems = [
    { id: 'fee-types', name: 'Fee Type', icon: Settings },
    { id: 'fee-structure', name: 'Fee Structure', icon: FileSpreadsheet },
    { id: 'enrollment-fee', name: 'Enrollment Fee Details', icon: Layers },
    { id: 'classwise-due-summary', name: 'Classwise Due Summary', icon: BarChart3 },
    { id: 'overall-due-summary', name: 'Overall Due Summary', icon: PieChart },
    { id: 'fee-collection-report', name: 'Fee Collection Report', icon: PieChart },
  ];

  const examSubItems = [
    { id: 'exam-schedule', name: 'Exam Setup & Schedule', icon: FileText },
    { id: 'exam-marks-entry', name: 'Marks Entry Panel', icon: Edit3 },
  ];

  const resultSubItems = [
    { id: 'result-view', name: 'Generate Result', icon: CheckCircle2 },
    { id: 'report-card', name: 'Get/View Result', icon: Award },
  ];

  // ⏰ Attendance Sub-items (ভবিষ্যতে নতুন সাব-মেনু যুক্ত করার জন্য তৈরি রাখা হলো)
  const attendanceSubItems = [
    { id: 'student-attendance-report', name: 'Student Report', icon: Clock },
    { id: 'class-attendance-report', name: 'Classroom Report', icon: Clock },
    { id: 'all-class-today-attendance-report', name: 'All Classrooms Report For Today', icon: Clock },
  ];

  const isTeacherTabActive = teacherSubItems.some(subItem => subItem.id === activeTab);
  const isStudentTabActive = studentSubItems.some(subItem => subItem.id === activeTab);
  const isFinanceTabActive = financeSubItems.some(subItem => subItem.id === activeTab);
  const isExamTabActive = examSubItems.some(subItem => subItem.id === activeTab);
  const isResultTabActive = resultSubItems.some(subItem => subItem.id === activeTab);
  const isAttendanceTabActive = attendanceSubItems.some(subItem => subItem.id === activeTab);

  useEffect(() => {
    if (isTeacherTabActive) setIsTeacherMenuOpen(true);
    if (isStudentTabActive) setIsStudentMenuOpen(true);
    if (isFinanceTabActive) setIsFinanceMenuOpen(true);
    if (isExamTabActive) setIsExamMenuOpen(true);
    if (isResultTabActive) setIsResultMenuOpen(true);
    if (isAttendanceTabActive) setIsAttendanceMenuOpen(true);
  }, [activeTab, isTeacherTabActive, isStudentTabActive, isFinanceTabActive, isExamTabActive, isResultTabActive, isAttendanceTabActive]);

  const closeOtherMenus = (current) => {
    if (current !== 'teacher') setIsTeacherMenuOpen(false);
    if (current !== 'student') setIsStudentMenuOpen(false);
    if (current !== 'finance') setIsFinanceMenuOpen(false);
    if (current !== 'exam') setIsExamMenuOpen(false);
    if (current !== 'result') setIsResultMenuOpen(false);
    if (current !== 'attendance') setIsAttendanceMenuOpen(false);
  };

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-2xl border-r border-slate-800/50">

      {/* 🏫 BRAND HEADER WITH LOGO */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3 bg-slate-950/40 relative overflow-hidden group">
        <div className="absolute -inset-y-0 -left-10 w-24 bg-emerald-500/10 blur-xl rounded-full transition-all duration-500 group-hover:left-20" />

        {/* LOGO CONTAINER */}
        <div className="w-16 h-16 rounded-full border border-emerald-500/30 p-0.1 flex items-center justify-center shadow-inner shadow-emerald-500/5 group-hover:scale-105 transition-all duration-200 shrink-0 overflow-hidden">
          <img
            src={logoImage}
            alt="School Logo"
            className="w-full h-full object-contain rounded-lg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://ui-avatars.com/api/?name=Rani+Bhabani&background=059669&color=fff';
            }}
          />
        </div>

        <div className="flex flex-col relative z-10">
          <span className="text-sm font-extrabold text-white tracking-wider leading-none uppercase">
            Raghunathganj
          </span>
          <span className="text-xs font-bold text-emerald-400 tracking-widest mt-1 uppercase opacity-90">
            Rani Bhabani Vidyaniketan
          </span>
          <span className="text-[8px] font-semibold text-slate-500 tracking-wider mt-0.5 uppercase">
            Admin Portal
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                closeOtherMenus(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </button>
          );
        })}

        {/* 👨‍🏫 TEACHER MANAGEMENT */}
        <div>
          <button
            type="button"
            onClick={() => {
              const nextState = !isTeacherMenuOpen;
              setIsTeacherMenuOpen(nextState);
              closeOtherMenus('teacher');
              if (nextState && !isTeacherTabActive) setActiveTab('teacher-enrollment');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 text-left ${
              isTeacherTabActive ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Users size={20} />
              <span>Teacher Management</span>
            </div>
            {isTeacherMenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isTeacherMenuOpen && (
            <div className="mt-1 ml-4 pl-3 border-l-2 border-slate-800 space-y-1">
              {teacherSubItems.map((subItem) => {
                const SubIcon = subItem.icon;
                return (
                  <button
                    key={subItem.id}
                    type="button"
                    onClick={() => setActiveTab(subItem.id)}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150 text-left ${
                      activeTab === subItem.id ? 'text-emerald-400 font-bold bg-slate-800/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <SubIcon size={16} />
                    <span>{subItem.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 🌟 STUDENT MANAGEMENT */}
        <div>
          <button
            type="button"
            onClick={() => {
              setIsStudentMenuOpen(!isStudentMenuOpen);
              closeOtherMenus('student');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 text-left ${
              isStudentTabActive ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Users size={20} />
              <span>Student Management</span>
            </div>
            {isStudentMenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isStudentMenuOpen && (
            <div className="mt-1 ml-4 pl-3 border-l-2 border-slate-800 space-y-1">
              {studentSubItems.map((subItem) => {
                const SubIcon = subItem.icon;
                return (
                  <button
                    key={subItem.id}
                    type="button"
                    onClick={() => setActiveTab(subItem.id)}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150 text-left ${
                      activeTab === subItem.id ? 'text-emerald-400 font-bold bg-slate-800/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <SubIcon size={16} />
                    <span>{subItem.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 💸 FINANCE & FEES */}
        <div>
          <button
            type="button"
            onClick={() => {
              const nextState = !isFinanceMenuOpen;
              setIsFinanceMenuOpen(nextState);
              closeOtherMenus('finance');
              if (nextState && !isFinanceTabActive) setActiveTab('fee-types');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 text-left ${
              isFinanceTabActive ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <CreditCard size={20} />
              <span>Finance & Fees</span>
            </div>
            {isFinanceMenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isFinanceMenuOpen && (
            <div className="mt-1 ml-4 pl-3 border-l-2 border-slate-800 space-y-1">
              {financeSubItems.map((subItem) => {
                const SubIcon = subItem.icon;
                return (
                  <button
                    key={subItem.id}
                    type="button"
                    onClick={() => setActiveTab(subItem.id)}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150 text-left ${
                      activeTab === subItem.id ? 'text-emerald-400 font-bold bg-slate-800/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <SubIcon size={16} />
                    <span>{subItem.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 📝 EXAM MANAGEMENT */}
        <div>
          <button
            type="button"
            onClick={() => {
              const nextState = !isExamMenuOpen;
              setIsExamMenuOpen(nextState);
              closeOtherMenus('exam');
              if (nextState && !isExamTabActive) setActiveTab('exam-schedule');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 text-left ${
              isExamTabActive ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <FileText size={20} />
              <span>Exam Management</span>
            </div>
            {isExamMenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isExamMenuOpen && (
            <div className="mt-1 ml-4 pl-3 border-l-2 border-slate-800 space-y-1">
              {examSubItems.map((subItem) => {
                const SubIcon = subItem.icon;
                return (
                  <button
                    key={subItem.id}
                    type="button"
                    onClick={() => setActiveTab(subItem.id)}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150 text-left ${
                      activeTab === subItem.id ? 'text-emerald-400 font-bold bg-slate-800/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <SubIcon size={16} />
                    <span>{subItem.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 🏆 RESULT MANAGEMENT */}
        <div>
          <button
            type="button"
            onClick={() => {
              const nextState = !isResultMenuOpen;
              setIsResultMenuOpen(nextState);
              closeOtherMenus('result');
              if (nextState && !isResultTabActive) setActiveTab('result-view');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 text-left ${
              isResultTabActive ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Award size={20} />
              <span>Result Management</span>
            </div>
            {isResultMenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isResultMenuOpen && (
            <div className="mt-1 ml-4 pl-3 border-l-2 border-slate-800 space-y-1">
              {resultSubItems.map((subItem) => {
                const SubIcon = subItem.icon;
                return (
                  <button
                    key={subItem.id}
                    type="button"
                    onClick={() => setActiveTab(subItem.id)}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150 text-left ${
                      activeTab === subItem.id ? 'text-emerald-400 font-bold bg-slate-800/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <SubIcon size={16} />
                    <span>{subItem.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ⏰ ATTENDANCE MANAGEMENT */}
        <div>
          <button
            type="button"
            onClick={() => {
              const nextState = !isAttendanceMenuOpen;
              setIsAttendanceMenuOpen(nextState);
              closeOtherMenus('attendance');
              if (nextState && !isAttendanceTabActive) setActiveTab('attendance-overview');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 text-left ${
              isAttendanceTabActive ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Clock size={20} />
              <span>Attendance Management</span>
            </div>
            {isAttendanceMenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isAttendanceMenuOpen && (
            <div className="mt-1 ml-4 pl-3 border-l-2 border-slate-800 space-y-1">
              {attendanceSubItems.map((subItem) => {
                const SubIcon = subItem.icon;
                return (
                  <button
                    key={subItem.id}
                    type="button"
                    onClick={() => setActiveTab(subItem.id)}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150 text-left ${
                      activeTab === subItem.id ? 'text-emerald-400 font-bold bg-slate-800/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <SubIcon size={16} />
                    <span>{subItem.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        Admin Portal v1.0
      </div>
    </div>
  );
};

export default Sidebar;