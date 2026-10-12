import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { PlusCircle, Filter, Link } from 'lucide-react';

const TeacherAssignment = () => {
  // Dropdown options data states
  const [academicYears, setAcademicYears] = useState([]);
  const [activeTeachers, setActiveTeachers] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);

  // Left Form state (Assign Class & Subjects)
  const [assignmentForm, setAssignmentForm] = useState({
    academicYearId: '',
    teacherId: '',
    classroomSubjectIds: []
  });

  const [classroomSubjects, setClassroomSubjects] = useState([]);
  const [clsSubjectLoading, setClsSubjectLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Right Viewer state (View Assignments)
  const [filterAcademicYearId, setFilterAcademicYearId] = useState('');
  const [filterTeacherId, setFilterTeacherId] = useState('');
  const [viewAssignments, setViewAssignments] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);

  // Initial Load: Academic Years and Teachers Lists
  useEffect(() => {
    fetchAcademicYears();
    fetchActiveTeachers();
    fetchAllTeachers();
  }, []);

  // Fetch Academic Years
  const fetchAcademicYears = async () => {
    try {
      const data = await apiRequest('/academic-years', 'GET');
      setAcademicYears(data || []);
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  // Fetch Active Teachers for Assignment Form
  const fetchActiveTeachers = async () => {
    try {
      const data = await apiRequest('/teachers/active', 'GET');
      setActiveTeachers(data || []);
    } catch (error) {
      console.error('Error fetching active teachers:', error);
    }
  };

  // Fetch All Teachers for Filter Dropdown
  const fetchAllTeachers = async () => {
    try {
      const data = await apiRequest('/teachers', 'GET');
      setAllTeachers(data || []);
    } catch (error) {
      console.error('Error fetching all teachers:', error);
    }
  };

  // Fetch Classroom Subjects when Academic Year is selected in Form
  useEffect(() => {
    if (assignmentForm.academicYearId) {
      fetchClassroomSubjects(assignmentForm.academicYearId);
    } else {
      setClassroomSubjects([]);
      setAssignmentForm(prev => ({
        ...prev,
        classroomSubjectIds: []
      }));
    }
  }, [assignmentForm.academicYearId]);

  const fetchClassroomSubjects = async (academicYearId) => {
    setClsSubjectLoading(true);

    try {
      const endpoint =
        `/classroom-subjects/academic-year?academicYearId=${academicYearId}`;

      const data = await apiRequest(endpoint, 'GET');

      setClassroomSubjects(data || []);
    } catch (error) {
      console.error('Error fetching classroom subjects:', error);
      setClassroomSubjects([]);
    } finally {
      setClsSubjectLoading(false);
    }
  };

  // Handle Checkbox Toggle for Classroom Subjects
  const handleCheckboxChange = (id) => {
    setAssignmentForm(prev => {
      const currentIds = prev.classroomSubjectIds;

      if (currentIds.includes(id)) {
        return {
          ...prev,
          classroomSubjectIds: currentIds.filter(item => item !== id)
        };
      } else {
        return {
          ...prev,
          classroomSubjectIds: [...currentIds, id]
        };
      }
    });
  };

  // Handle Assignment Form Submit
  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();

    if (
      !assignmentForm.classroomSubjectIds ||
      assignmentForm.classroomSubjectIds.length === 0
    ) {
      alert('Atleast select one Classroom-Subject');
      return;
    }

    setSubmitLoading(true);

    try {
      const payload = {
        teacherId: Number(assignmentForm.teacherId),
        academicYearId: Number(assignmentForm.academicYearId),
        classroomSubjectIds:
          assignmentForm.classroomSubjectIds.map(id => Number(id))
      };

      await apiRequest(
        '/teacher-assignments',
        'POST',
        payload
      );

      alert('Teacher Assignments save successfully');

      // Auto-refresh right side viewer if same filter is selected
      if (
        filterTeacherId === assignmentForm.teacherId &&
        filterAcademicYearId === assignmentForm.academicYearId
      ) {
        fetchAssignmentsByTeacher(
          filterTeacherId,
          filterAcademicYearId
        );
      }

      // Reset form subjects selection
      setAssignmentForm(prev => ({
        ...prev,
        classroomSubjectIds: []
      }));
    } catch (error) {
      console.error('Error saving assignments:', error);
      alert(error.message || 'Failed to complete the assignments');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Fetch Assignments by Teacher & Academic Year for Right Column Viewer
  useEffect(() => {
    if (filterTeacherId && filterAcademicYearId) {
      fetchAssignmentsByTeacher(
        filterTeacherId,
        filterAcademicYearId
      );
    } else {
      setViewAssignments([]);
    }
  }, [filterTeacherId, filterAcademicYearId]);

  const fetchAssignmentsByTeacher = async (
    teacherId,
    academicYearId
  ) => {
    setViewLoading(true);

    try {
      const endpoint =
        `/teacher-assignments?teacherId=${teacherId}&academicYearId=${academicYearId}`;

      const data = await apiRequest(endpoint, 'GET');

      setViewAssignments(data || []);
    } catch (error) {
      console.error('Error fetching teacher assignments:', error);
      setViewAssignments([]);
    } finally {
      setViewLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-800">
          Teacher Assignments
        </h1>

        <p className="text-sm text-slate-500">
          Manage teacher's assigment
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* ================= LEFT COLUMN: ASSIGNMENT FORM ================= */}
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm h-fit xl:col-span-1">

          <h3 className="text-md font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <PlusCircle
              size={18}
              className="text-emerald-600"
            />
            Assign Class & Subjects
          </h3>

          <form
            onSubmit={handleAssignmentSubmit}
            className="space-y-4"
          >

            {/* Academic Year Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Academic Year{' '}
                <span className="text-rose-500">*</span>
              </label>

              <select
                required
                value={assignmentForm.academicYearId}
                onChange={(e) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    academicYearId: e.target.value
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">
                  Select Academic Year
                </option>

                {academicYears.map(ay => (
                  <option
                    key={ay.id}
                    value={ay.id}
                  >
                    {ay.name} {ay.active ? '(Active)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Teacher Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Select Active Teacher{' '}
                <span className="text-rose-500">*</span>
              </label>

              <select
                required
                value={assignmentForm.teacherId}
                onChange={(e) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    teacherId: e.target.value
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">
                  Select Teacher
                </option>

                {activeTeachers.map(t => (
                  <option
                    key={t.id}
                    value={t.id}
                  >
                    {t.name} ({t.teacherCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Classroom Subjects Checklist */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                Classroom Subjects{' '}
                <span className="text-rose-500">*</span>
              </label>

              <div className="border border-slate-200 rounded-lg p-3 max-h-56 overflow-y-auto space-y-2.5 bg-slate-50/50">

                {!assignmentForm.academicYearId ? (
                  <p className="text-xs text-slate-400 italic">
                    First select a academic year
                  </p>
                ) : clsSubjectLoading ? (
                  <p className="text-xs text-slate-400">
                    Classroom Subjects Loading...
                  </p>
                ) : classroomSubjects.length === 0 ? (
                  <p className="text-xs text-slate-400">
                      Classroom-Subject not present
                  </p>
                ) : (
                  classroomSubjects.map(clsSub => (
                    <label
                      key={clsSub.id}
                      className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer p-1 hover:bg-slate-100/80 rounded transition"
                    >
                      <input
                        type="checkbox"
                        checked={assignmentForm.classroomSubjectIds.includes(
                          clsSub.id
                        )}
                        onChange={() =>
                          handleCheckboxChange(clsSub.id)
                        }
                        className="rounded text-emerald-600 h-4 w-4 mt-0.5 border-slate-300 focus:ring-emerald-500"
                      />

                      <div className="leading-tight">
                        <span className="font-semibold text-slate-900">
                          {clsSub.classroom}
                        </span>

                        <span className="text-xs text-slate-600 font-medium">
                          {' '}
                          - {clsSub.subject}
                        </span>

                        <p className="text-[10px] text-slate-400 font-mono">
                          Year: {clsSub.academicYear}
                        </p>
                      </div>
                    </label>
                  ))
                )}

              </div>
            </div>

            <button
              type="submit"
              disabled={
                submitLoading ||
                classroomSubjects.length === 0
              }
              className="w-full bg-slate-900 text-white font-medium py-2.5 rounded-lg text-sm hover:bg-slate-800 disabled:bg-slate-300 transition"
            >
              {submitLoading
                ? 'Saving Assignments...'
                : 'Save Assignments'}
            </button>

          </form>
        </div>

        {/* ================= RIGHT COLUMN: VIEW ASSIGNMENTS BY TEACHER ================= */}
        <div className="xl:col-span-2 space-y-4">

          {/* Filters Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">

            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Filter
                size={18}
                className="text-slate-500"
              />

              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">
                View Assignments by Faculty
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Academic Year
                </label>

                <select
                  value={filterAcademicYearId}
                  onChange={(e) =>
                    setFilterAcademicYearId(e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">
                    Choose Year
                  </option>

                  {academicYears.map(ay => (
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
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Select Teacher (All Roster)
                </label>

                <select
                  value={filterTeacherId}
                  onChange={(e) =>
                    setFilterTeacherId(e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">
                    Choose Teacher
                  </option>

                  {allTeachers.map(t => (
                    <option
                      key={t.id}
                      value={t.id}
                      className={
                        !t.active
                          ? 'text-slate-400 bg-slate-50'
                          : ''
                      }
                    >
                      {t.name} ({t.teacherCode}) —{' '}
                      {t.active
                        ? '● Active'
                        : '○ Inactive'}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Table / Results Display */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[300px]">

            {viewLoading ? (
              <div className="p-12 text-center text-sm text-slate-400">
                Loading assignments...
              </div>
            ) : (
              !filterTeacherId ||
              !filterAcademicYearId
            ) ? (
              <div className="p-12 text-center text-sm text-slate-400 flex flex-col items-center justify-center gap-2">
                <Link
                  size={28}
                  className="text-slate-300"
                />

                <span>
                  Select academic year and teacher to view live assignments
                </span>
              </div>
            ) : viewAssignments.length === 0 ? (
              <div className="p-12 text-center text-sm text-rose-500 font-medium">
                No assignments
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full text-left border-collapse">

                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                      <th className="py-3.5 px-4">
                        Classroom Name / Sec
                      </th>

                      <th className="py-3.5 px-4">
                        Mapped Subject
                      </th>

                      <th className="py-3.5 px-4 text-center">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-sm">

                    {viewAssignments.map(item => (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50/80 transition-all ${
                          !item.active
                            ? 'text-slate-400 bg-slate-50/20'
                            : ''
                        }`}
                      >

                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {item.className}{' '}
                          <span className="text-xs text-slate-500 font-normal ml-2">
                            (Section: {item.section})
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-700 font-semibold">
                          {item.subjectName}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {item.active ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                              Live Assignment
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
                              Suspended
                            </span>
                          )}
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAssignment;