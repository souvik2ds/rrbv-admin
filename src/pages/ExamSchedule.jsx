import React, { useState, useEffect } from 'react';
import {
  Plus,
  Calendar,
  BookOpen,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Clock,
  Eye,
  Power,
  Send,
  EyeOff,
  X,
  FileText,
  BookMarked,
  Filter,
  Layers,
  ChevronRight
} from 'lucide-react';
import { apiRequest } from '../api';

const ExamSchedule = ({ onNavigate }) => {
  // Dropdown States
  const [academicYears, setAcademicYears] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');

  // Exam List & Loading States
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Selected Exam Action Drawer/Modal State
  const [selectedExam, setSelectedExam] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // View Exam Modal State
  const [viewModalData, setViewModalData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    academicYearId: '',
    classroomId: '',
    name: '',
    examType: '',
    startDate: '',
    endDate: ''
  });

  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    fetchAcademicYears();
    fetchClassrooms();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear && selectedClassroom) {
      fetchExams(selectedAcademicYear, selectedClassroom);
      setSelectedExam(null);
    } else {
      setExams([]);
      setSelectedExam(null);
    }
  }, [selectedAcademicYear, selectedClassroom]);

  const fetchAcademicYears = async () => {
    try {
      const data = await apiRequest(
        '/academic-years',
        'GET'
      );

      setAcademicYears(data);

      const activeYear = data.find((y) => y.active);

      if (activeYear) {
        setSelectedAcademicYear(activeYear.id);
      }
    } catch (err) {
      console.error('Failed to fetch academic years', err);
    }
  };

  const fetchClassrooms = async () => {
    try {
      const data = await apiRequest(
        '/classrooms',
        'GET'
      );

      setClassrooms(data);
    } catch (err) {
      console.error('Failed to fetch classrooms', err);
    }
  };

  const fetchExams = async (
    academicYearId,
    classroomId
  ) => {
    setLoading(true);
    setError('');

    try {
      const data = await apiRequest(
        `/exams?academicYearId=${academicYearId}&classroomId=${classroomId}`,
        'GET'
      );

      setExams(data);
    } catch (err) {
      console.error('Failed to load exams:', err);
      setError(
        err.message || 'Failed to load exams.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 1. View Full Details API (GET /exams/{examId})
  const handleViewDetails = async (examId) => {
    setViewLoading(true);

    try {
      const data = await apiRequest(
        `/exams/${examId}`,
        'GET'
      );

      setViewModalData(data);
    } catch (err) {
      console.error('Failed to fetch exam details:', err);

      alert(
        err.message || 'Failed to fetch exam details.'
      );
    } finally {
      setViewLoading(false);
    }
  };

  // 2. Deactivate Exam API (DELETE /exams/{examId})
  const handleDeactivate = async (examId) => {
    if (
      !window.confirm(
        'Are you sure you want to deactivate this exam?'
      )
    ) {
      return;
    }

    setActionLoading(true);

    try {
      await apiRequest(
        `/exams/${examId}`,
        'DELETE'
      );

      alert('Exam deactivated successfully.');

      setSelectedExam(null);

      fetchExams(selectedAcademicYear,selectedClassroom);
    } catch (err) {
      console.error('Error deactivating exam:', err);

      alert(
        err.message || 'Failed to deactivate exam.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Mark Publish API (POST /exams/{examId}/publish)
  const handlePublish = async (examId) => {
    if (
      !window.confirm('Are you sure you want to publish the results?')
    ) {
      return;
    }

    setActionLoading(true);

    try {
      await apiRequest(
        `/exams/${examId}/publish`,
        'POST'
      );

      alert('Result published successfully.');

      fetchExams(
        selectedAcademicYear,
        selectedClassroom
      );

      setSelectedExam((prev) =>
        prev
          ? {
              ...prev,
              resultPublished: true
            }
          : null
      );
    } catch (err) {
      console.error('Error publishing result:', err);

      alert(
        err.message || 'Failed to publish result.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Mark Unpublish API (POST /exams/{examId}/unpublish)
  const handleUnpublish = async (examId) => {
    if (
      !window.confirm(
        'Are you sure you want to unpublish the results?'
      )
    ) {
      return;
    }

    setActionLoading(true);

    try {
      await apiRequest(
        `/exams/${examId}/unpublish`,
        'POST'
      );

      alert('Result unpublished successfully.');

      fetchExams(
        selectedAcademicYear,
        selectedClassroom
      );

      setSelectedExam((prev) =>
        prev
          ? {
              ...prev,
              resultPublished: false
            }
          : null
      );
    } catch (err) {
      console.error(
        'Error unpublishing result:',
        err
      );

      alert(
        err.message || 'Failed to unpublish result.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Manage Subjects Navigation Action
  const handleManageSubjects = (exam) => {
    if (onNavigate) {
      onNavigate('exam-subjects', exam);
    } else {
      console.log(
        'Navigate to Exam Subjects page for exam:',
        exam.id
      );
    }
  };

  const handleOpenModal = () => {
    setFormData({
      academicYearId:
        selectedAcademicYear || '',
      classroomId:
        selectedClassroom || '',
      name: '',
      examType: '',
      startDate: '',
      endDate: ''
    });

    setIsModalOpen(true);
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();

    setCreateLoading(true);

    const payload = {
      academicYearId: Number(
        formData.academicYearId
      ),
      classroomId: Number(
        formData.classroomId
      ),
      name: formData.name,
      examType: formData.examType,
      startDate: formData.startDate,
      endDate: formData.endDate
    };

    try {
      await apiRequest(
        '/exams',
        'POST',
        payload
      );

      setIsModalOpen(false);

      if (
        String(formData.academicYearId) ===
          String(selectedAcademicYear) &&
        String(formData.classroomId) ===
          String(selectedClassroom)
      ) {
        fetchExams(
          selectedAcademicYear,
          selectedClassroom
        );
      } else {
        setSelectedAcademicYear(
          formData.academicYearId
        );

        setSelectedClassroom(
          formData.classroomId
        );
      }
    } catch (err) {
      console.error('Error creating exam:', err);

      alert(
        err.message || 'Failed to create exam.'
      );
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">

      {/* Modern Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-5">

        <div className="flex items-center gap-3.5">

          <div className="p-3 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl shadow-lg shadow-emerald-100">
            <Calendar size={28} />
          </div>

          <div>

            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Exam Setup & Schedule
            </h1>

            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Manage examination schedules, types, and publications classwise.
            </p>

          </div>

        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold px-5 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-200 active:scale-95"
        >
          <Plus size={18} />
          Create New Exam
        </button>

      </div>

      {/* Main Dual-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT COLUMN: Filters Sidebar */}
        <div className="lg:col-span-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100 space-y-6 sticky top-6">

          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">

            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Filter size={20} />
            </div>

            <div>

              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Select Filters
              </h2>

              <p className="text-[11px] text-slate-400 font-medium">
                Configure target audience
              </p>

            </div>

          </div>

          <div className="space-y-4">

            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase mb-2 tracking-wide">
                Academic Year
              </label>

              <div className="relative">

                <select
                  value={selectedAcademicYear}
                  onChange={(e) =>
                    setSelectedAcademicYear(
                      e.target.value
                    )
                  }
                  className="w-full bg-slate-50 border border-slate-200/90 hover:border-emerald-300 rounded-2xl p-3.5 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all appearance-none cursor-pointer"
                >

                  <option value="">
                    -- Select Academic Year --
                  </option>

                  {academicYears.map((ay) => (
                    <option
                      key={ay.id}
                      value={ay.id}
                    >
                      {ay.name}{' '}
                      {ay.active
                        ? '(Active)'
                        : ''}
                    </option>
                  ))}

                </select>

                <Calendar
                  className="absolute right-3.5 top-4 text-slate-400 pointer-events-none"
                  size={18}
                />

              </div>

            </div>

            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase mb-2 tracking-wide">
                Classroom
              </label>

              <div className="relative">

                <select
                  value={selectedClassroom}
                  onChange={(e) =>
                    setSelectedClassroom(
                      e.target.value
                    )
                  }
                  className="w-full bg-slate-50 border border-slate-200/90 hover:border-emerald-300 rounded-2xl p-3.5 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all appearance-none cursor-pointer"
                >

                  <option value="">
                    -- Select Classroom --
                  </option>

                  {classrooms.map((cls) => (
                    <option
                      key={cls.id}
                      value={cls.id}
                    >
                      {cls.name}{' '}
                      {cls.section
                        ? `(${cls.section})`
                        : ''}
                    </option>
                  ))}

                </select>

                <BookOpen
                  className="absolute right-3.5 top-4 text-slate-400 pointer-events-none"
                  size={18}
                />

              </div>

            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Tabular Exam Response List */}
        <div className="lg:col-span-8 space-y-4">

          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100 p-6 space-y-5">

            <div className="flex items-center justify-between border-b border-slate-100 pb-4">

              <div className="flex items-center gap-2.5">

                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Layers size={18} />
                </div>

                <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Scheduled Examinations
                </h2>

              </div>

              {loading && (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full animate-pulse">
                  <RefreshCw
                    className="animate-spin"
                    size={13}
                  />
                  Fetching Exams...
                </span>
              )}

            </div>

            {!selectedAcademicYear ||
            !selectedClassroom ? (

              <div className="p-12 text-center text-slate-400 text-xs font-semibold bg-gradient-to-b from-slate-50/50 to-slate-100/30 rounded-2xl border border-dashed border-slate-200/80 space-y-2">

                <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <ChevronRight size={20} />
                </div>

                <p>
                  Please select Academic Year and Classroom on the left sidebar to view scheduled exams.
                </p>

              </div>

            ) : loading ? (

              <div className="p-12 text-center text-slate-400 text-xs font-semibold">
                Loading examinations list...
              </div>

            ) : error ? (

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold">

                <AlertCircle size={18} />

                <span>{error}</span>

              </div>

            ) : exams.length === 0 ? (

              <div className="p-12 text-center text-slate-500 text-xs font-semibold bg-slate-50/60 rounded-2xl border border-slate-200">
                No examinations found for the selected classroom and academic year.
              </div>

            ) : (

              /* Tabular View for Response List */
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm">

                <table className="w-full text-left border-collapse text-xs">

                  <thead>

                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[11px]">

                      <th className="p-4">
                        Exam Details
                      </th>

                      <th className="p-4">
                        Type
                      </th>

                      <th className="p-4">
                        Schedule
                      </th>

                      <th className="p-4">
                        Result Status
                      </th>

                      <th className="p-4 text-center">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">

                    {exams.map((exam) => {

                      const isSelected =
                        selectedExam?.id === exam.id;

                      return (

                        <tr
                          key={exam.id}
                          onClick={() =>
                            setSelectedExam(exam)
                          }
                          className={`transition-all cursor-pointer hover:bg-slate-50/80 ${
                            isSelected
                              ? 'bg-emerald-50/60 font-semibold'
                              : ''
                          }`}
                        >

                          <td className="p-4">

                            <div className="font-extrabold text-slate-800 text-sm">
                              {exam.name}
                            </div>

                            <span
                              className={`text-[10px] font-bold ${
                                exam.active
                                  ? 'text-emerald-600'
                                  : 'text-rose-500'
                              }`}
                            >
                              •{' '}
                              {exam.active
                                ? 'Active Schedule'
                                : 'Inactive Schedule'}
                            </span>

                          </td>

                          <td className="p-4">

                            <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-slate-100 text-slate-700 uppercase tracking-wider">
                              {exam.examType}
                            </span>

                          </td>

                          <td className="p-4 text-slate-600 font-medium">
                            {exam.startDate
                              ? `${exam.startDate} - ${exam.endDate}`
                              : 'N/A'}
                          </td>

                          <td className="p-4">

                            {exam.resultPublished ? (

                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">

                                <CheckCircle size={12} />

                                Published

                              </span>

                            ) : (

                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">

                                <Clock size={12} />

                                Pending

                              </span>

                            )}

                          </td>

                          <td className="p-4 text-center">

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedExam(exam);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 text-xs font-bold transition-all shadow-sm"
                            >
                              Manage
                            </button>

                          </td>

                        </tr>

                      );

                    })}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      </div>

      {/* EXAM CLICK ACTION POPUP MODAL */}
      {selectedExam && (

        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">

          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">

            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex justify-between items-center">

              <div className="flex items-center gap-3">

                <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <FileText
                    size={20}
                    className="text-emerald-400"
                  />
                </div>

                <div>

                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                    Exam Management
                  </p>

                  <h3 className="text-base font-black tracking-tight">
                    {selectedExam.name}
                  </h3>

                </div>

              </div>

              <button
                onClick={() =>
                  setSelectedExam(null)
                }
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>

            </div>

            {/* Modal Quick Actions Body */}
            <div className="p-6 space-y-3">

              <p className="text-xs font-semibold text-slate-500 mb-4">
                Select an administrative action for this examination:
              </p>

              {/* 1. Manage Subjects Action Button */}
              <button
                onClick={() =>
                  handleManageSubjects(
                    selectedExam
                  )
                }
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50/80 border border-slate-200/80 hover:border-indigo-300 rounded-2xl text-slate-800 transition-all group"
              >

                <div className="flex items-center gap-3">

                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                    <BookMarked size={18} />
                  </div>

                  <div className="text-left">

                    <h4 className="text-xs font-extrabold">
                      Manage Subjects
                    </h4>

                    <p className="text-[10px] text-slate-400 font-medium">
                      Configure subjects & weightage
                    </p>

                  </div>

                </div>

                <ChevronRight
                  size={16}
                  className="text-slate-400 group-hover:translate-x-0.5 transition-transform"
                />

              </button>

              {/* 2. View Details Action Button */}
              <button
                onClick={() =>
                  handleViewDetails(
                    selectedExam.id
                  )
                }
                disabled={
                  actionLoading ||
                  viewLoading
                }
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50/80 border border-slate-200/80 hover:border-emerald-300 rounded-2xl text-slate-800 transition-all group"
              >

                <div className="flex items-center gap-3">

                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Eye size={18} />
                  </div>

                  <div className="text-left">

                    <h4 className="text-xs font-extrabold">
                      {viewLoading
                        ? 'Loading Details...'
                        : 'View Details'}
                    </h4>

                    <p className="text-[10px] text-slate-400 font-medium">
                      Full parameters & metadata
                    </p>

                  </div>

                </div>

                <ChevronRight
                  size={16}
                  className="text-slate-400 group-hover:translate-x-0.5 transition-transform"
                />

              </button>

              {/* 3. Mark Publish / Unpublish Action Button */}
              {selectedExam.resultPublished ? (

                <button
                  onClick={() =>
                    handleUnpublish(
                      selectedExam.id
                    )
                  }
                  disabled={actionLoading}
                  className="w-full flex items-center justify-between p-4 bg-amber-50/60 hover:bg-amber-100/60 border border-amber-200 rounded-2xl text-amber-900 transition-all group"
                >

                  <div className="flex items-center gap-3">

                    <div className="p-2 bg-amber-200 text-amber-800 rounded-xl group-hover:scale-110 transition-transform">
                      <EyeOff size={18} />
                    </div>

                    <div className="text-left">

                      <h4 className="text-xs font-extrabold">
                        Mark Unpublish
                      </h4>

                      <p className="text-[10px] text-amber-700 font-medium">
                        Hide exam results from portal
                      </p>

                    </div>

                  </div>

                  <ChevronRight
                    size={16}
                    className="text-amber-500 group-hover:translate-x-0.5 transition-transform"
                  />

                </button>

              ) : (

                <button
                  onClick={() =>
                    handlePublish(
                      selectedExam.id
                    )
                  }
                  disabled={actionLoading}
                  className="w-full flex items-center justify-between p-4 bg-emerald-50/60 hover:bg-emerald-100/60 border border-emerald-200 rounded-2xl text-emerald-900 transition-all group"
                >

                  <div className="flex items-center gap-3">

                    <div className="p-2 bg-emerald-200 text-emerald-800 rounded-xl group-hover:scale-110 transition-transform">
                      <Send size={18} />
                    </div>

                    <div className="text-left">

                      <h4 className="text-xs font-extrabold">
                        Mark Publish
                      </h4>

                      <p className="text-[10px] text-emerald-700 font-medium">
                        Release exam results to students
                      </p>

                    </div>

                  </div>

                  <ChevronRight
                    size={16}
                    className="text-emerald-500 group-hover:translate-x-0.5 transition-transform"
                  />

                </button>

              )}

              {/* Deactivate Option */}
              {selectedExam.active && (

                <button
                  onClick={() =>
                    handleDeactivate(
                      selectedExam.id
                    )
                  }
                  disabled={actionLoading}
                  className="w-full flex items-center justify-between p-4 bg-rose-50/50 hover:bg-rose-100/50 border border-rose-200 rounded-2xl text-rose-900 transition-all group mt-2"
                >

                  <div className="flex items-center gap-3">

                    <div className="p-2 bg-rose-100 text-rose-600 rounded-xl group-hover:scale-110 transition-transform">
                      <Power size={18} />
                    </div>

                    <div className="text-left">

                      <h4 className="text-xs font-extrabold">
                        Deactivate Exam
                      </h4>

                      <p className="text-[10px] text-rose-600 font-medium">
                        Disable scheduled exam
                      </p>

                    </div>

                  </div>

                  <ChevronRight
                    size={16}
                    className="text-rose-400 group-hover:translate-x-0.5 transition-transform"
                  />

                </button>

              )}

            </div>

          </div>

        </div>

      )}

      {/* View Details Modal */}
      {viewModalData && (

        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">

          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">

            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">

              <h2 className="text-base font-black text-slate-800 tracking-tight">
                Exam Full Details
              </h2>

              <button
                onClick={() =>
                  setViewModalData(null)
                }
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-xl hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            <div className="p-6 space-y-4 text-xs">

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">

                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase">
                    Exam ID
                  </p>
                  <p className="font-bold text-slate-800">
                    {viewModalData.id}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase">
                    Exam Type
                  </p>
                  <p className="font-bold text-slate-800">
                    {viewModalData.examType}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-[10px] text-slate-400 font-black uppercase">
                    Exam Name
                  </p>
                  <p className="font-extrabold text-slate-900 text-sm">
                    {viewModalData.name}
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">

                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase">
                    Academic Year
                  </p>
                  <p className="font-bold text-slate-700">
                    {viewModalData.academicYearName}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase">
                    Classroom
                  </p>

                  <p className="font-bold text-slate-700">
                    {viewModalData.classroomName}{' '}
                    {viewModalData.classroomSection
                      ? `(${viewModalData.classroomSection})`
                      : ''}
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">

                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase">
                    Start Date
                  </p>

                  <p className="font-bold text-slate-700">
                    {viewModalData.startDate}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase">
                    End Date
                  </p>

                  <p className="font-bold text-slate-700">
                    {viewModalData.endDate}
                  </p>
                </div>

              </div>

              <div className="flex justify-between items-center pt-2">

                <div>

                  <p className="text-[10px] text-slate-400 font-black uppercase mb-1">
                    Result Status
                  </p>

                  {viewModalData.resultPublished ? (

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Published
                    </span>

                  ) : (

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                      Pending
                    </span>

                  )}

                </div>

                <div>

                  <p className="text-[10px] text-slate-400 font-black uppercase mb-1">
                    Active Status
                  </p>

                  <span
                    className={`text-xs font-extrabold ${
                      viewModalData.active
                        ? 'text-emerald-600'
                        : 'text-rose-500'
                    }`}
                  >
                    {viewModalData.active
                      ? 'Active'
                      : 'Inactive'}
                  </span>

                </div>

              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">

              <button
                onClick={() =>
                  setViewModalData(null)
                }
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
              >
                Close Window
              </button>

            </div>

          </div>

        </div>

      )}

      {/* Create Exam Modal */}
      {isModalOpen && (

        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">

          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">

            <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex justify-between items-center">

              <div>

                <h2 className="text-base font-black tracking-tight">
                  Create New Exam
                </h2>

                <p className="text-[11px] text-emerald-100 font-medium">
                  Add schedule parameters
                </p>

              </div>

              <button
                onClick={() =>
                  setIsModalOpen(false)
                }
                className="text-white/70 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleCreateExam}
              className="p-6 space-y-4"
            >

              <div>

                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1.5">
                  Academic Year
                </label>

                <select
                  required
                  value={formData.academicYearId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      academicYearId:
                        e.target.value
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                >

                  <option value="">
                    Select Academic Year
                  </option>

                  {academicYears.map((ay) => (
                    <option
                      key={ay.id}
                      value={ay.id}
                    >
                      {ay.name}
                    </option>
                  ))}

                </select>

              </div>

              <div>

                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1.5">
                  Classroom
                </label>

                <select
                  required
                  value={formData.classroomId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      classroomId:
                        e.target.value
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                >

                  <option value="">
                    Select Classroom
                  </option>

                  {classrooms.map((cls) => (
                    <option
                      key={cls.id}
                      value={cls.id}
                    >
                      {cls.name}{' '}
                      {cls.section
                        ? `(${cls.section})`
                        : ''}
                    </option>
                  ))}

                </select>

              </div>

              <div>

                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1.5">
                  Exam Name
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Examination"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />

              </div>

              <div>

                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1.5">
                  Exam Type
                </label>

                <select
                  required
                  value={formData.examType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      examType: e.target.value
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="CLASS_TEST_1">Class_Test_1</option>
                  <option value="FIRST_TERM">First Term</option>
                  <option value="CLASS_TEST_2">Class_Test_2</option>
                  <option value="SECOND_TERM">Second Term</option>
                  <option value="CLASS_TEST_3">Class_Test_3</option>
                  <option value="THIRD_TERM">Third Term</option>
                </select>

              </div>

              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1.5">
                    Start Date
                  </label>

                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        startDate: e.target.value
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  />

                </div>

                <div>

                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1.5">
                    End Date
                  </label>

                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        endDate: e.target.value
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  />

                </div>

              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">

                <button
                  type="button"
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 text-white transition-all shadow-md active:scale-95"
                >
                  {createLoading
                    ? 'Saving...'
                    : 'Save Exam'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default ExamSchedule;