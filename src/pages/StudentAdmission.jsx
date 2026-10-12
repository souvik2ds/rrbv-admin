import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  FileSpreadsheet,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  XCircle,
  ShieldCheck,
  IdCard
} from 'lucide-react';

import {
  apiRequest,
  downloadFile,
  uploadFile
} from '../api';

const StudentAdmission = () => {
  // Navigation: 'single' or 'bulk'
  const [admissionType, setAdmissionType] = useState('single');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);

  // Metadata Dropdowns States
  const [academicYears, setAcademicYears] = useState([]);
  const [activeClassrooms, setActiveClassrooms] = useState([]);

  // ================= STATES FOR BULK ADMISSION =================
  const [selectedFile, setSelectedFile] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);

  // ================= STATE FOR SINGLE ADMISSION RESPONSE =================
  const [enrollmentResponse, setEnrollmentResponse] = useState(null);

  // ================= STATES FOR SINGLE ADMISSION =================
  const [singleFormData, setSingleFormData] = useState({
    name: '',
    gender: 'MALE',
    dateOfBirth: '',
    bloodGroup: '',
    religion: '',
    phone: '',
    email: '',
    aadhaarNumber: '',
    fatherName: '',
    fatherQualification: '',
    fatherOccupation: '',
    fatherPhone: '',
    motherName: '',
    motherQualification: '',
    motherOccupation: '',
    motherPhone: '',
    guardianName: '',
    guardianRelation: '',
    guardianPhone: '',
    address: '',
    photoUrl: '',
    academicYearId: '',
    classroomId: '',
    rollNumber: '',
    admissionNumber: '',
    admissionDate: ''
  });

  // ============================================================
  // LOAD METADATA
  // ============================================================

  useEffect(() => {
    const loadMetadata = async () => {
      setMetaLoading(true);

      try {
        const [yearsData, activeClsData] = await Promise.all([
          apiRequest('/academic-years', 'GET'),
          apiRequest('/classrooms/active', 'GET')
        ]);

        setAcademicYears(yearsData || []);
        setActiveClassrooms(activeClsData || []);
      } catch (error) {
        console.error(
          'Error loading admission metadata:',
          error
        );

        setMessage({
          type: 'error',
          text: 'Failed to load Academic Years or Classrooms from backend.'
        });
      } finally {
        setMetaLoading(false);
      }
    };

    loadMetadata();
  }, []);

  // ============================================================
  // DOWNLOAD EXCEL TEMPLATE
  // ============================================================

  const handleDownloadTemplate = async () => {
    try {
      setMessage({ type: '', text: '' });

      const blob = await downloadFile(
        '/bulk-admission/template'
      );

      if (blob.size === 0) {
        throw new Error(
          'Received an empty file template from the server.'
        );
      }

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'Bulk_Admission_Template.xlsx';

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      a.remove();

      setMessage({
        type: 'success',
        text: 'Template Excel downloaded successfully!'
      });
    } catch (error) {
      console.error(
        'Template download error:',
        error
      );

      setMessage({
        type: 'error',
        text:
          error.message ||
          'Failed to download template.'
      });
    }
  };

  // ============================================================
  // UPLOAD EXCEL TEMPLATE
  // ============================================================

  const handleFileUploadSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setMessage({
        type: 'error',
        text: 'Please select an Excel file first!'
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    setBulkResult(null);

    try {
      const formData = new FormData();

      formData.append(
        'file',
        selectedFile
      );

      const data = await uploadFile(
        '/bulk-admission/upload',
        formData
      );

      if (data && !data.failures) {
        data.failures = [];
      }

      setBulkResult(data);

      if (data.failedCount === 0) {
        setMessage({
          type: 'success',
          text: `Excellent! All ${data.successCount} students admitted successfully.`
        });

        setSelectedFile(null);
      } else {
        setMessage({
          type: 'warning',
          text: `Bulk processing completed with issues. Success: ${data.successCount}, Failed: ${data.failedCount}.`
        });
      }
    } catch (error) {
      console.error(error);

      setMessage({
        type: 'error',
        text:
          error.message ||
          'Something went wrong during file upload.'
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SINGLE ADMISSION
  // ============================================================

  const handleSingleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage({ type: '', text: '' });
    setEnrollmentResponse(null);

    try {
      const payload = {
        ...singleFormData,

        academicYearId:
          Number(singleFormData.academicYearId),

        classroomId:
          Number(singleFormData.classroomId),

        rollNumber:
          Number(singleFormData.rollNumber),

        phone:
          singleFormData.phone || null,

        email:
          singleFormData.email || null,

        aadhaarNumber:
          singleFormData.aadhaarNumber || null,

        fatherPhone:
          singleFormData.fatherPhone || null,

        motherPhone:
          singleFormData.motherPhone || null,

        guardianPhone:
          singleFormData.guardianPhone || null
      };

      const responseData = await apiRequest(
        '/admissions',
        'POST',
        payload
      );

      setEnrollmentResponse(responseData);

      setMessage({
        type: 'success',
        text: `Student "${responseData.studentName}" has been successfully admitted!`
      });

      // Reset Form
      setSingleFormData({
        name: '',
        gender: 'MALE',
        dateOfBirth: '',
        bloodGroup: '',
        religion: '',
        phone: '',
        email: '',
        aadhaarNumber: '',
        fatherName: '',
        fatherQualification: '',
        fatherOccupation: '',
        fatherPhone: '',
        motherName: '',
        motherQualification: '',
        motherOccupation: '',
        motherPhone: '',
        guardianName: '',
        guardianRelation: '',
        guardianPhone: '',
        address: '',
        photoUrl: '',
        academicYearId: '',
        classroomId: '',
        rollNumber: '',
        admissionNumber: '',
        admissionDate: ''
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error.message ||
          'Failed to complete admission process.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const {
      name,
      value
    } = e.target;

    setSingleFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="space-y-6">

      {/* Top Main Navigation Tabs */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-2">

        <div className="flex space-x-2">

          <button
            onClick={() => {
              setAdmissionType('single');
              setMessage({
                type: '',
                text: ''
              });
              setBulkResult(null);
            }}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-all flex items-center gap-2 ${
              admissionType === 'single'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus size={16} />
            Single Admission
          </button>

          <button
            onClick={() => {
              setAdmissionType('bulk');
              setMessage({
                type: '',
                text: ''
              });
              setEnrollmentResponse(null);
            }}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-all flex items-center gap-2 ${
              admissionType === 'bulk'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet size={16} />
            Bulk Admission (Excel)
          </button>

        </div>

      </div>

      {/* Global Message Alerts */}
      {message.text && (
        <div
          className={`p-4 rounded-lg text-sm font-medium border flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : message.type === 'warning'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {message.type === 'success' && (
            <CheckCircle2 size={18} />
          )}

          {message.type === 'warning' && (
            <AlertTriangle size={18} />
          )}

          {message.type === 'error' && (
            <XCircle size={18} />
          )}

          <span>{message.text}</span>
        </div>
      )}

      {/* Student Enrollment Receipt */}
      {admissionType === 'single' &&
        enrollmentResponse && (

        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-5 rounded-xl shadow-sm space-y-3 max-w-2xl">

          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm uppercase tracking-wider">
            <ShieldCheck
              size={18}
              className="text-emerald-600"
            />

            Admission Receipt Generated Successfully
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-700 bg-white/80 p-4 rounded-lg border border-emerald-100/50">

            <div>
              <span className="text-slate-400 block font-medium">
                System Code
              </span>

              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                {enrollmentResponse.studentCode}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">
                Student Name
              </span>

              <span className="font-bold text-slate-900">
                {enrollmentResponse.studentName}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">
                Class / Section
              </span>

              <span className="font-semibold text-slate-800">
                {enrollmentResponse.className}{' '}
                ({enrollmentResponse.section})
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">
                Roll Number
              </span>

              <span className="font-bold text-slate-900">
                #{enrollmentResponse.rollNumber}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">
                Admission No
              </span>

              <span className="font-semibold text-slate-800">
                {enrollmentResponse.admissionNumber}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">
                Status / Roster
              </span>

              <span
                className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                  enrollmentResponse.active
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {enrollmentResponse.status ||
                  'PROVISIONAL'}
              </span>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================
          BULK ADMISSION
      ====================================================== */}

      {admissionType === 'bulk' && (

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm h-fit space-y-6 xl:col-span-1">

            <div className="space-y-2">

              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                Step 1: Get Layout
              </span>

              <h4 className="text-sm font-bold text-slate-800">
                Download Official Template
              </h4>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 text-sm font-semibold py-2 rounded-lg transition"
              >
                <Download size={16} />
                Download Sheet Template
              </button>

            </div>

            <hr className="border-slate-100" />

            <div className="space-y-3">

              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                Step 2: Upload Roster
              </span>

              <form
                onSubmit={handleFileUploadSubmit}
                className="space-y-3"
              >

                <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-lg p-4 text-center cursor-pointer relative bg-slate-50/50">

                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={(e) =>
                      setSelectedFile(
                        e.target.files
                          ? e.target.files[0]
                          : null
                      )
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  <UploadCloud
                    size={28}
                    className="mx-auto text-slate-400 mb-2"
                  />

                  <span className="text-xs font-medium text-slate-600 block truncate">
                    {selectedFile
                      ? selectedFile.name
                      : 'Click or Drag Excel file here'}
                  </span>

                </div>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !selectedFile
                  }
                  className="w-full bg-slate-900 text-white font-medium py-2 rounded-lg text-sm hover:bg-slate-800 transition disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    'Upload & Process Admission'
                  )}
                </button>

              </form>

            </div>

          </div>

          <div className="xl:col-span-2 space-y-4">

            {bulkResult && (
              <div className="grid grid-cols-3 gap-4">

                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center">
                  <span className="text-xs text-slate-400 font-medium uppercase">
                    Total Rows
                  </span>

                  <p className="text-2xl font-black text-slate-800 mt-1">
                    {bulkResult?.totalRows || 0}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center border-l-4 border-l-emerald-500">
                  <span className="text-xs text-emerald-600 font-bold uppercase">
                    Success
                  </span>

                  <p className="text-2xl font-black text-emerald-700 mt-1">
                    {bulkResult?.successCount || 0}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center border-l-4 border-l-rose-500">
                  <span className="text-xs text-rose-600 font-bold uppercase">
                    Failures
                  </span>

                  <p className="text-2xl font-black text-rose-700 mt-1">
                    {bulkResult?.failedCount || 0}
                  </p>
                </div>

              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[250px] flex flex-col justify-between">

              {!bulkResult ? (

                <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center space-y-2 my-auto">

                  <FileSpreadsheet
                    size={32}
                    className="text-slate-300"
                  />

                  <span>
                    No bulk upload operations run yet.
                  </span>

                </div>

              ) : (
                (bulkResult?.failures || []).length === 0
                  ? (

                    <div className="p-12 text-center text-emerald-600 text-sm flex flex-col items-center justify-center space-y-2 my-auto font-medium">

                      <CheckCircle2 size={32} />

                      <span>
                        Roster Clean! Zero runtime validation errors.
                      </span>

                    </div>

                  ) : (

                    <div>

                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Detailed Conflict Log Report
                        </span>
                      </div>

                      <div className="overflow-x-auto">

                        <table className="w-full text-left border-collapse">

                          <thead>
                            <tr className="bg-slate-100 text-slate-600 text-xs uppercase border-b border-slate-200 font-mono">
                              <th className="py-2.5 px-4 text-center w-20">
                                Row No.
                              </th>

                              <th className="py-2.5 px-4 w-52">
                                Student Context
                              </th>

                              <th className="py-2.5 px-4">
                                Encountered Validations
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100 text-sm">

                            {(bulkResult?.failures || []).map(
                              (fail, index) => (

                                <tr
                                  key={index}
                                  className="hover:bg-rose-50/30"
                                >

                                  <td className="py-3 px-4 font-mono text-center font-bold text-slate-700 bg-slate-50/50">
                                    {fail?.rowNumber}
                                  </td>

                                  <td className="py-3 px-4 font-semibold text-slate-900">
                                    {fail?.studentName || (
                                      <span className="text-slate-400 italic font-normal text-xs">
                                        Blank
                                      </span>
                                    )}
                                  </td>

                                  <td className="py-3 px-4">

                                    <div className="flex flex-wrap gap-1.5">

                                      {(fail?.errors || []).map(
                                        (err, errIdx) => (
                                          <span
                                            key={errIdx}
                                            className="inline-flex text-[11px] bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded-md font-medium"
                                          >
                                            ⚠️ {err}
                                          </span>
                                        )
                                      )}

                                    </div>

                                  </td>

                                </tr>
                              )
                            )}

                          </tbody>

                        </table>

                      </div>

                    </div>
                  )
              )}

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          SINGLE ADMISSION
      ====================================================== */}

      {admissionType === 'single' && (

        <form
          onSubmit={handleSingleSubmit}
          className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm space-y-6"
        >

          {metaLoading && (
            <div className="p-2 text-xs bg-amber-50 text-amber-700 rounded border border-amber-200 flex items-center gap-1">

              <RefreshCw
                size={12}
                className="animate-spin"
              />

              Synchronizing Academic Sessions & Active Classes...

            </div>
          )}

          {/* SECTION A */}
          <div className="space-y-3">

            <h4 className="text-sm font-bold text-indigo-600 border-b border-slate-100 pb-1 uppercase tracking-wider">
              A. School Enrollment Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Academic Year *
                </label>

                <select
                  name="academicYearId"
                  required
                  value={singleFormData.academicYearId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white outline-none"
                >
                  <option value="">
                    Select Year
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
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Classroom *
                </label>

                <select
                  name="classroomId"
                  required
                  value={singleFormData.classroomId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white outline-none"
                >
                  <option value="">
                    Select Class
                  </option>

                  {activeClassrooms.map(c => (
                    <option
                      key={c.id}
                      value={c.id}
                    >
                      {c.name} ({c.section})
                    </option>
                  ))}

                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Roll Number *
                </label>

                <input
                  type="number"
                  name="rollNumber"
                  min="1"
                  required
                  value={singleFormData.rollNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., 5"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Admission No. *
                </label>

                <input
                  type="text"
                  name="admissionNumber"
                  maxLength={30}
                  required
                  value={singleFormData.admissionNumber}
                  onChange={handleInputChange}
                  placeholder="ADM-2026-001"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Admission Date *
                </label>

                <input
                  type="date"
                  name="admissionDate"
                  required
                  value={singleFormData.admissionDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Student Photo URL
                </label>

                <input
                  type="text"
                  name="photoUrl"
                  value={singleFormData.photoUrl}
                  onChange={handleInputChange}
                  placeholder="https://domain.com/avatar.jpg"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>

            </div>

          </div>

          {/* SECTION B */}
          <div className="space-y-3">

            <h4 className="text-sm font-bold text-indigo-600 border-b border-slate-100 pb-1 uppercase tracking-wider">
              B. Student Personal Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Full Name *
                </label>

                <input
                  type="text"
                  name="name"
                  maxLength={100}
                  required
                  value={singleFormData.name}
                  onChange={handleInputChange}
                  placeholder="Student full name"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Gender *
                </label>

                <select
                  name="gender"
                  value={singleFormData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white outline-none"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Date of Birth
                </label>

                <input
                  type="date"
                  name="dateOfBirth"
                  value={singleFormData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Blood Group
                </label>

                <input
                  type="text"
                  name="bloodGroup"
                  maxLength={20}
                  value={singleFormData.bloodGroup}
                  onChange={handleInputChange}
                  placeholder="e.g., O+"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Religion
                </label>

                <input
                  type="text"
                  name="religion"
                  maxLength={50}
                  value={singleFormData.religion}
                  onChange={handleInputChange}
                  placeholder="e.g., Hinduism"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Identity Number (Aadhaar)
                </label>

                <input
                  type="text"
                  name="aadhaarNumber"
                  placeholder="12 digit identifier"
                  value={singleFormData.aadhaarNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Student Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  pattern="^[6-9]\d{9}$"
                  value={singleFormData.phone}
                  onChange={handleInputChange}
                  placeholder="Optional 10 digit phone"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Student Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={singleFormData.email}
                  onChange={handleInputChange}
                  placeholder="student@example.com"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>

            </div>

          </div>

          {/* SECTION C */}
          <div className="space-y-3">

            <h4 className="text-sm font-bold text-indigo-600 border-b border-slate-100 pb-1 uppercase tracking-wider">
              C. Family & Guardians Relationship Records
            </h4>

            {/* Father */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/50 p-3 rounded-lg border border-slate-100">

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Father's Name *
                </label>

                <input
                  type="text"
                  name="fatherName"
                  maxLength={100}
                  required
                  value={singleFormData.fatherName}
                  onChange={handleInputChange}
                  placeholder="Father name"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Father Qualification
                </label>

                <input
                  type="text"
                  name="fatherQualification"
                  maxLength={100}
                  value={singleFormData.fatherQualification}
                  onChange={handleInputChange}
                  placeholder="e.g., B.Tech"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Father Occupation
                </label>

                <input
                  type="text"
                  name="fatherOccupation"
                  maxLength={100}
                  value={singleFormData.fatherOccupation}
                  onChange={handleInputChange}
                  placeholder="e.g., Business"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Father Phone
                </label>

                <input
                  type="text"
                  name="fatherPhone"
                  pattern="^[6-9]\d{9}$"
                  value={singleFormData.fatherPhone}
                  onChange={handleInputChange}
                  placeholder="10 digits"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none bg-white"
                />
              </div>

            </div>

            {/* Mother */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/50 p-3 rounded-lg border border-slate-100">

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Mother's Name *
                </label>

                <input
                  type="text"
                  name="motherName"
                  maxLength={100}
                  required
                  value={singleFormData.motherName}
                  onChange={handleInputChange}
                  placeholder="Mother name"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Mother Qualification
                </label>

                <input
                  type="text"
                  name="motherQualification"
                  maxLength={100}
                  value={singleFormData.motherQualification}
                  onChange={handleInputChange}
                  placeholder="e.g., M.A"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Mother Occupation
                </label>

                <input
                  type="text"
                  name="motherOccupation"
                  maxLength={100}
                  value={singleFormData.motherOccupation}
                  onChange={handleInputChange}
                  placeholder="e.g., Homemaker"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Mother Phone
                </label>

                <input
                  type="text"
                  name="motherPhone"
                  pattern="^[6-9]\d{9}$"
                  value={singleFormData.motherPhone}
                  onChange={handleInputChange}
                  placeholder="10 digits"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none bg-white"
                />
              </div>

            </div>

            {/* Guardian */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Guardian Name (Optional)
                </label>

                <input
                  type="text"
                  name="guardianName"
                  maxLength={100}
                  value={singleFormData.guardianName}
                  onChange={handleInputChange}
                  placeholder="Guardian full name"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Guardian Relation
                </label>

                <input
                  type="text"
                  name="guardianRelation"
                  maxLength={50}
                  value={singleFormData.guardianRelation}
                  onChange={handleInputChange}
                  placeholder="e.g., Uncle"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Guardian Phone
                </label>

                <input
                  type="text"
                  name="guardianPhone"
                  pattern="^[6-9]\d{9}$"
                  value={singleFormData.guardianPhone}
                  onChange={handleInputChange}
                  placeholder="10 digits"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>

            </div>

          </div>

          {/* SECTION D */}
          <div className="space-y-3">

            <h4 className="text-sm font-bold text-indigo-600 border-b border-slate-100 pb-1 uppercase tracking-wider">
              D. Communication Address
            </h4>

            <div>
              <textarea
                name="address"
                rows={2}
                value={singleFormData.address}
                onChange={handleInputChange}
                placeholder="Full residential permanent/current address lines..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none resize-none"
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-medium py-2.5 rounded-lg text-sm hover:bg-slate-800 transition shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw
                size={16}
                className="animate-spin"
              />
            ) : (
              'Register Student & Complete Admission'
            )}
          </button>

        </form>
      )}

    </div>
  );
};

export default StudentAdmission;
