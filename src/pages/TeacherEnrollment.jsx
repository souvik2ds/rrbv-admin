import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import {
  Users, UserPlus, Search, RefreshCw, AlertCircle, CheckCircle2,
  X, Briefcase, Calendar, Phone, Mail, MapPin, Shield, Edit3, Power
} from 'lucide-react';

const TeacherEnrollment = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Active Selections
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form States
  const initialFormState = {
    name: '',
    gender: 'MALE',
    dateOfBirth: '',
    phone: '',
    email: '',
    aadhaarNumber: '',
    panNumber: '',
    qualification: '',
    designation: '',
    joiningDate: '',
    address: '',
    photoUrl: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [updateData, setUpdateData] = useState(initialFormState);

  // Process payload to convert empty optional strings to null or clean values
  const sanitizePayload = (data) => {
    return {
      name: data.name,
      gender: data.gender,
      phone: data.phone,
      qualification: data.qualification,
      joiningDate: data.joiningDate,
      dateOfBirth: data.dateOfBirth || null,
      email: data.email?.trim() === '' ? null : data.email,
      aadhaarNumber: data.aadhaarNumber?.trim() === '' ? null : data.aadhaarNumber,
      panNumber: data.panNumber?.trim() === '' ? null : data.panNumber,
      designation: data.designation?.trim() === '' ? null : data.designation,
      address: data.address?.trim() === '' ? null : data.address,
      photoUrl: data.photoUrl?.trim() === '' ? null : data.photoUrl,
    };
  };

  // 1. Fetch All Teachers (GET /teachers)
  const fetchTeachers = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await apiRequest('/teachers', 'GET');

      setTeachers(data || []);
    } catch (err) {
      setError(err.message || 'network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // 2. Fetch Single Teacher Details (GET /teachers/{id})
  const handleTeacherClick = async (teacherId) => {
    setIsFetchingDetails(true);
    setError('');
    setIsUpdating(false);

    try {
      const data = await apiRequest(`/teachers/${teacherId}`, 'GET');

      setSelectedTeacher(data);

      setUpdateData({
        name: data.name || '',
        gender: data.gender || 'MALE',
        dateOfBirth: data.dateOfBirth || '',
        phone: data.phone || '',
        email: data.email || '',
        aadhaarNumber: data.aadhaarNumber || '',
        panNumber: data.panNumber || '',
        qualification: data.qualification || '',
        designation: data.designation || '',
        joiningDate: data.joiningDate || '',
        address: data.address || '',
        photoUrl: data.photoUrl || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  // 3. Create Teacher (POST /teachers)
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = sanitizePayload(formData);

    try {
      await apiRequest('/teachers', 'POST', payload);

      await fetchTeachers();
      setIsAdding(false);
      setFormData(initialFormState);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Update Teacher Profile (PUT /teachers/{id})
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = sanitizePayload(updateData);

    try {
      const updatedTeacher = await apiRequest(
        `/teachers/${selectedTeacher.id}`,
        'PUT',
        payload
      );

      setSelectedTeacher(updatedTeacher);
      await fetchTeachers();
      setIsUpdating(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Activate / Deactivate Account
  // PUT /teachers/{id}/activate or /deactivate
  const handleStatusToggle = async (action) => {
    setLoading(true);
    setError('');

    try {
      await apiRequest(
        `/teachers/${selectedTeacher.id}/${action}`,
        'PUT'
      );

      // Refresh teacher details and main list
      await handleTeacherClick(selectedTeacher.id);
      await fetchTeachers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtered List based on Search Term
  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.teacherCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.phone?.includes(searchTerm)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header with Enroll Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="text-emerald-600" /> Faculty Management
          </h1>

          <p className="text-xs text-slate-500 mt-1">
            Enroll new teachers, view profiles, edit info, and manage account statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTeachers}
            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600 transition-all"
            title="Refresh List"
          >
            <RefreshCw
              size={18}
              className={loading ? 'animate-spin' : ''}
            />
          </button>

          <button
            onClick={() => {
              setError('');
              setIsAdding(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm transition-all"
          >
            <UserPlus size={18} /> Enroll New Teacher
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search
          className="absolute left-3 top-2.5 text-slate-400"
          size={18}
        />

        <input
          type="text"
          placeholder="Search by Teacher Name, Code or Phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
        />
      </div>

      {/* Teachers List Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-4 py-3">Code / Name</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Joining Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="hover:bg-slate-50 transition-all"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="font-bold">{teacher.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {teacher.teacherCode}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {teacher.designation || 'N/A'}
                    </td>

                    <td className="px-4 py-3">
                      {teacher.phone}
                    </td>

                    <td className="px-4 py-3">
                      {teacher.joiningDate || 'N/A'}
                    </td>

                    <td className="px-4 py-3">
                      {teacher.active ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          INACTIVE
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleTeacherClick(teacher.id)}
                        className="text-emerald-600 hover:text-emerald-800 font-bold text-xs"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-6 text-slate-400"
                  >
                    {loading
                      ? 'Loading Teachers...'
                      : 'No teachers found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enroll New Teacher Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">

            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <UserPlus size={20} className="text-emerald-600" />
                Enroll New Teacher
              </h3>

              <button
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleCreateSubmit}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-600 uppercase mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>

                  <input
                    type="text"
                    maxLength={100}
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 uppercase mb-1">
                    Gender <span className="text-rose-500">*</span>
                  </label>

                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gender: e.target.value
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white outline-none text-sm"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 uppercase mb-1">
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dateOfBirth: e.target.value
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 uppercase mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>

                  <input
                    type="text"
                    required
                    pattern="^[6-9]\d{9}$"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm"
                    placeholder="10 digit phone number"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 uppercase mb-1">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm"
                    placeholder="teacher@example.com"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 uppercase mb-1">
                    Aadhaar Number
                  </label>

                  <input
                    type="text"
                    pattern="^[0-9]{12}$"
                    value={formData.aadhaarNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        aadhaarNumber: e.target.value
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm font-mono"
                    placeholder="12 digit number"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 uppercase mb-1">
                    PAN Number
                  </label>

                  <input
                    type="text"
                    pattern="^[A-Z]{5}[0-9]{4}[A-Z]$"
                    value={formData.panNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        panNumber: e.target.value.toUpperCase()
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm font-mono"
                    placeholder="ABCDE1234F"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 uppercase mb-1">
                    Qualification <span className="text-rose-500">*</span>
                  </label>

                  <input
                    type="text"
                    maxLength={100}
                    required
                    value={formData.qualification}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        qualification: e.target.value
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm"
                    placeholder="e.g. M.Sc in Physics"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 uppercase mb-1">
                    Designation
                  </label>

                  <input
                    type="text"
                    maxLength={100}
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        designation: e.target.value
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm"
                    placeholder="e.g. Senior Lecturer"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-600 uppercase mb-1">
                    Joining Date <span className="text-rose-500">*</span>
                  </label>

                  <input
                    type="date"
                    required
                    value={formData.joiningDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        joiningDate: e.target.value
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-600 uppercase mb-1">
                    Photo URL
                  </label>

                  <input
                    type="text"
                    value={formData.photoUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        photoUrl: e.target.value
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-600 uppercase mb-1">
                    Residential Address
                  </label>

                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: e.target.value
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm resize-none"
                    placeholder="Full residential address"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 py-2 rounded-lg font-medium text-slate-700 transition-all text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium transition-all text-sm"
                >
                  {loading ? 'Saving...' : 'Enroll Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Details Modal / Drawer */}
      {selectedTeacher && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-xl bg-white h-screen shadow-2xl p-6 flex flex-col justify-between overflow-y-auto transition-all">

            <div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-5">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Users size={18} className="text-emerald-600" />
                  Teacher Profile Details
                </h3>

                <button
                  onClick={() => setSelectedTeacher(null)}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              {isFetchingDetails ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  Loading profile details...
                </div>
              ) : !isUpdating ? (
                /* Profile Summary View */
                <div className="space-y-6 text-sm">

                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="h-14 w-14 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white border border-emerald-700 text-lg uppercase shadow-sm overflow-hidden">
                      {selectedTeacher.photoUrl ? (
                        <img
                          src={selectedTeacher.photoUrl}
                          alt="Teacher"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        selectedTeacher.name?.substring(0, 2)
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="text-xs text-slate-400 font-mono">
                        Code: {selectedTeacher.teacherCode} | @{selectedTeacher.username}
                      </div>

                      <div className="text-lg font-bold text-slate-900">
                        {selectedTeacher.name}
                      </div>

                      <div className="text-xs text-slate-500 font-medium">
                        {selectedTeacher.designation || 'Faculty Member'}
                      </div>
                    </div>

                    <div>
                      {selectedTeacher.active ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          Active
                        </span>
                      ) : (
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">

                    <h4 className="font-bold text-slate-700 border-b pb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                      <Briefcase size={14} /> Professional Details
                    </h4>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">
                          Designation
                        </span>
                        <span className="font-bold text-slate-800">
                          {selectedTeacher.designation || 'N/A'}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block font-medium">
                          Qualification
                        </span>
                        <span className="font-bold text-slate-800">
                          {selectedTeacher.qualification || 'N/A'}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block font-medium">
                          Joining Date
                        </span>
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Calendar size={12} />
                          {selectedTeacher.joiningDate || 'N/A'}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block font-medium">
                          Gender
                        </span>
                        <span className="font-bold text-slate-800 uppercase">
                          {selectedTeacher.gender}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-700 border-b pt-2 pb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                      <Phone size={14} /> Communication Records
                    </h4>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">
                          Phone Number
                        </span>

                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Phone size={12} />
                          {selectedTeacher.phone}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block font-medium">
                          Email Address
                        </span>

                        <span className="font-bold text-slate-800 flex items-center gap-1 truncate">
                          <Mail size={12} />
                          {selectedTeacher.email || 'N/A'}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <span className="text-slate-400 block font-medium">
                          Residential Address
                        </span>

                        <span className="font-medium text-slate-700 bg-slate-50 p-2 rounded border block mt-1">
                          <MapPin
                            size={12}
                            className="inline mr-1 text-slate-400"
                          />
                          {selectedTeacher.address || 'No address recorded.'}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-700 border-b pt-2 pb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                      <Shield size={14} /> Personal Identifiers
                    </h4>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">
                          PAN Card Number
                        </span>

                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                          {selectedTeacher.panNumber || 'N/A'}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block font-medium">
                          Aadhaar Reference
                        </span>

                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                          [Aadhaar Redacted]
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block font-medium">
                          Date of Birth
                        </span>

                        <span className="font-bold text-slate-800">
                          {selectedTeacher.dateOfBirth || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="border-t pt-4 space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Administrative Actions
                    </span>

                    <div className="flex gap-2">
                      {selectedTeacher.active ? (
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleStatusToggle('deactivate')}
                          className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Power size={14} /> Deactivate Account
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleStatusToggle('activate')}
                          className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all"
                        >
                          <CheckCircle2 size={14} /> Activate Account
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setIsUpdating(true)}
                        className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg text-xs flex items-center gap-1 transition-all"
                      >
                        <Edit3 size={14} /> Update Teacher
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Edit Teacher Profile Form */
                <form
                  onSubmit={handleUpdateSubmit}
                  className="space-y-4 text-xs"
                >
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 max-h-[70vh] overflow-y-auto">

                    <div>
                      <label className="block font-semibold text-slate-600 uppercase mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>

                      <input
                        type="text"
                        maxLength={100}
                        required
                        value={updateData.name}
                        onChange={(e) =>
                          setUpdateData({
                            ...updateData,
                            name: e.target.value
                          })
                        }
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-600 uppercase mb-1">
                          Gender <span className="text-rose-500">*</span>
                        </label>

                        <select
                          value={updateData.gender}
                          onChange={(e) =>
                            setUpdateData({
                              ...updateData,
                              gender: e.target.value
                            })
                          }
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white outline-none text-sm"
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 uppercase mb-1">
                          Date of Birth
                        </label>

                        <input
                          type="date"
                          value={updateData.dateOfBirth}
                          onChange={(e) =>
                            setUpdateData({
                              ...updateData,
                              dateOfBirth: e.target.value
                            })
                          }
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-600 uppercase mb-1">
                          Phone Number <span className="text-rose-500">*</span>
                        </label>

                        <input
                          type="text"
                          required
                          pattern="^[6-9]\d{9}$"
                          value={updateData.phone}
                          onChange={(e) =>
                            setUpdateData({
                              ...updateData,
                              phone: e.target.value
                            })
                          }
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 uppercase mb-1">
                          Email Address
                        </label>

                        <input
                          type="email"
                          value={updateData.email}
                          onChange={(e) =>
                            setUpdateData({
                              ...updateData,
                              email: e.target.value
                            })
                          }
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-600 uppercase mb-1">
                          Aadhaar Number
                        </label>

                        <input
                          type="text"
                          pattern="^[0-9]{12}$"
                          value={updateData.aadhaarNumber}
                          onChange={(e) =>
                            setUpdateData({
                              ...updateData,
                              aadhaarNumber: e.target.value
                            })
                          }
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 uppercase mb-1">
                          PAN Number
                        </label>

                        <input
                          type="text"
                          pattern="^[A-Z]{5}[0-9]{4}[A-Z]$"
                          value={updateData.panNumber}
                          onChange={(e) =>
                            setUpdateData({
                              ...updateData,
                              panNumber: e.target.value.toUpperCase()
                            })
                          }
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-600 uppercase mb-1">
                          Qualification <span className="text-rose-500">*</span>
                        </label>

                        <input
                          type="text"
                          maxLength={100}
                          required
                          value={updateData.qualification}
                          onChange={(e) =>
                            setUpdateData({
                              ...updateData,
                              qualification: e.target.value
                            })
                          }
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 uppercase mb-1">
                          Designation
                        </label>

                        <input
                          type="text"
                          maxLength={100}
                          value={updateData.designation}
                          onChange={(e) =>
                            setUpdateData({
                              ...updateData,
                              designation: e.target.value
                            })
                          }
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-600 uppercase mb-1">
                        Joining Date <span className="text-rose-500">*</span>
                      </label>

                      <input
                        type="date"
                        required
                        value={updateData.joiningDate}
                        onChange={(e) =>
                          setUpdateData({
                            ...updateData,
                            joiningDate: e.target.value
                          })
                        }
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-600 uppercase mb-1">
                        Photo URL
                      </label>

                      <input
                        type="text"
                        value={updateData.photoUrl}
                        onChange={(e) =>
                          setUpdateData({
                            ...updateData,
                            photoUrl: e.target.value
                          })
                        }
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-600 uppercase mb-1">
                        Residential Address
                      </label>

                      <textarea
                        rows={2}
                        value={updateData.address}
                        onChange={(e) =>
                          setUpdateData({
                            ...updateData,
                            address: e.target.value
                          })
                        }
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 text-sm">
                    <button
                      type="button"
                      onClick={() => setIsUpdating(false)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 py-2 rounded-lg font-medium transition-all"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg font-medium transition-all"
                    >
                      {loading ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherEnrollment;