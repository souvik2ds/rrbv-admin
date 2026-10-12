import React, { useState, useEffect } from 'react';
import {
  Save,
  Plus,
  Trash2,
  Calendar,
  BookOpen,
  Layers,
  CheckSquare,
  Square,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { apiRequest } from '../api';

const MONTHS = [
  { value: 1, name: 'Jan' },
  { value: 2, name: 'Feb' },
  { value: 3, name: 'Mar' },
  { value: 4, name: 'Apr' },
  { value: 5, name: 'May' },
  { value: 6, name: 'Jun' },
  { value: 7, name: 'Jul' },
  { value: 8, name: 'Aug' },
  { value: 9, name: 'Sep' },
  { value: 10, name: 'Oct' },
  { value: 11, name: 'Nov' },
  { value: 12, name: 'Dec' }
];

const FeeStructure = () => {
  // এপিআই ডেটা লোডিং স্টেট
  const [academicYears, setAcademicYears] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [allFeeTypes, setAllFeeTypes] = useState([]);

  // সিলেকশন স্টেট
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');

  // ফি টাইপ সিলেক্ট করার মোডাল/পপওভার স্টেট
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [checkedFeeTypeIds, setCheckedFeeTypeIds] = useState([]);

  // ম্যাট্রিক্স ফর্ম স্টেট: { [feeTypeId]: { [month]: amount } }
  const [matrixData, setMatrixData] = useState({});

  // 🕒 লেট ফাইন ফর্ম স্টেট (Late Fine States)
  const [lateFineConfig, setLateFineConfig] = useState({
    id: null,
    lateFineFeeTypeId: '',
    dueDayOfMonth: 10,
    fineAmount: '',
    active: true
  });

  const [savingLateFine, setSavingLateFine] = useState(false);

  // নোটিফিকেশন ও ইউজার ফিডব্যাক
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ১. পেজ লোড হওয়ার সাথে সাথে ড্রপডাউন এবং ফি টাইপের ডেটা ফেচ করা
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [ayData, classData, ftData] = await Promise.all([
          apiRequest('/academic-years', 'GET'),
          apiRequest('/classrooms/active', 'GET'),
          apiRequest('/fee/fee-types', 'GET')
        ]);

        setAcademicYears(ayData);
        setClassrooms(classData);
        setAllFeeTypes(ftData.filter(t => t.active));
      } catch (err) {
        console.error('Failed to fetch configuration data:', err);
        setError(
          err.message ||
          'Failed to fetch configuration data from backend.'
        );
      }
    };

    fetchInitialData();
  }, []);

  // 🔄 ২. যখনই Academic Year এবং Classroom দুটোই সিলেক্ট হবে,
  // তখন এক্সিস্টিং ফি স্ট্রাকচার ও লেট ফাইন রুল লোড করা
  useEffect(() => {
    const fetchDataForClassAndYear = async () => {
      if (!selectedAcademicYear || !selectedClassroom) {
        setMatrixData({});
        setCheckedFeeTypeIds([]);
        resetLateFineForm();
        return;
      }

      setLoading(true);
      setError('');
      setSuccess('');

      // 🅰️ ১. ফি স্ট্রাকচার লোড করা
      try {
        const response = await apiRequest(
          `/fee-structures?classroomId=${selectedClassroom}&academicYearId=${selectedAcademicYear}`,
          'GET'
        );

        if (response && response.items && response.items.length > 0) {
          const newMatrix = {};
          const uniqueTypeIds = new Set();

          response.items.forEach(item => {
            uniqueTypeIds.add(item.feeTypeId);

            if (!newMatrix[item.feeTypeId]) {
              newMatrix[item.feeTypeId] = {};

              MONTHS.forEach(m => {
                newMatrix[item.feeTypeId][m.value] = '';
              });
            }

            newMatrix[item.feeTypeId][item.month] =
              item.amount !== null
                ? item.amount.toString()
                : '';
          });

          setMatrixData(newMatrix);
          setCheckedFeeTypeIds(Array.from(uniqueTypeIds));
        } else {
          setMatrixData({});
          setCheckedFeeTypeIds([]);
        }
      } catch (err) {
        console.error('Failed to fetch fee structure:', err);
        setMatrixData({});
        setCheckedFeeTypeIds([]);
      }

      // 🅱️ ২. লেট ফাইন রুল লোড করা
      try {
        const lfData = await apiRequest(
          `/late-fine-rules?classroomId=${selectedClassroom}&academicYearId=${selectedAcademicYear}`,
          'GET'
        );

        if (lfData) {
          setLateFineConfig({
            id: lfData.id || null,
            lateFineFeeTypeId: lfData.lateFineFeeTypeId || '',
            dueDayOfMonth: lfData.dueDayOfMonth || 10,
            fineAmount:
              lfData.fineAmount !== null
                ? lfData.fineAmount.toString()
                : '',
            active:
              lfData.active !== undefined
                ? lfData.active
                : true
          });
        } else {
          resetLateFineForm();
        }
      } catch (err) {
        console.error('Failed to fetch late fine rule:', err);
        resetLateFineForm();
      } finally {
        setLoading(false);
      }
    };

    fetchDataForClassAndYear();
  }, [selectedAcademicYear, selectedClassroom]);

  const resetLateFineForm = () => {
    setLateFineConfig({
      id: null,
      lateFineFeeTypeId: '',
      dueDayOfMonth: 10,
      fineAmount: '',
      active: true
    });
  };

  // চেকবক্সে ফি টাইপ সিলেক্ট/ডিসিলেক্ট করা
  const toggleFeeTypeCheckbox = (id) => {
    setCheckedFeeTypeIds(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // ফর্মের টেবিলে ফি টাইপগুলো যুক্ত করা
  const handleAddSelectedTypes = () => {
    const newMatrix = { ...matrixData };

    checkedFeeTypeIds.forEach(typeId => {
      if (!newMatrix[typeId]) {
        newMatrix[typeId] = {};

        MONTHS.forEach(m => {
          newMatrix[typeId][m.value] = '';
        });
      }
    });

    Object.keys(newMatrix).forEach(typeId => {
      if (!checkedFeeTypeIds.includes(Number(typeId))) {
        delete newMatrix[typeId];
      }
    });

    setMatrixData(newMatrix);
    setShowTypeSelector(false);
  };

  // নির্দিষ্ট কোনো মাসের ইনপুট চেঞ্জ হ্যান্ডেল করা
  const handleAmountChange = (typeId, monthValue, amount) => {
    setMatrixData(prev => ({
      ...prev,
      [typeId]: {
        ...prev[typeId],
        [monthValue]: amount
      }
    }));
  };

  // টেবিল থেকে কোনো নির্দিষ্ট ফি রো (Row) ডিলিট করা
  const handleRemoveRow = (typeId) => {
    const newMatrix = { ...matrixData };

    delete newMatrix[typeId];

    setMatrixData(newMatrix);

    setCheckedFeeTypeIds(prev =>
      prev.filter(id => id !== Number(typeId))
    );
  };

  // 🚀 ১. ফি স্ট্রাকচার সেভ (POST /fee-structures)
  const handleSubmitFeeStructure = async (e) => {
    e.preventDefault();

    if (!selectedClassroom || !selectedAcademicYear) {
      setError(
        'Please select both Academic Year and Classroom.'
      );
      return;
    }

    const items = [];

    Object.keys(matrixData).forEach(typeId => {
      MONTHS.forEach(m => {
        const amt = matrixData[typeId][m.value];

        const parsedAmount =
          amt === ''
            ? 0.0
            : parseFloat(amt);

        items.push({
          feeTypeId: Number(typeId),
          month: m.value,
          amount: parsedAmount
        });
      });
    });

    if (items.length === 0) {
      setError(
        'Please add at least one Fee Type to the structure.'
      );
      return;
    }

    const requestPayload = {
      classroomId: Number(selectedClassroom),
      academicYearId: Number(selectedAcademicYear),
      items: items
    };

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await apiRequest(
        '/fee-structures',
        'POST',
        requestPayload
      );

      setSuccess(
        `Fee structure saved successfully for ${result.className}!`
      );
    } catch (err) {
      console.error('Error saving fee structure:', err);

      setError(
        err.message ||
        'Error occurred while saving fee structure.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 🕒 ২. লেট ফাইন সেভ (POST /late-fine-rules)
  const handleSaveLateFine = async (e) => {
    e.preventDefault();

    if (!selectedClassroom || !selectedAcademicYear) {
      setError(
        'Please select Academic Year and Classroom first.'
      );
      return;
    }

    if (!lateFineConfig.lateFineFeeTypeId) {
      setError(
        'Please select a Fee Type for Late Fine.'
      );
      return;
    }

    if (
      !lateFineConfig.fineAmount ||
      parseFloat(lateFineConfig.fineAmount) < 0
    ) {
      setError(
        'Please enter a valid fine amount.'
      );
      return;
    }

    const payload = {
      classroomId: Number(selectedClassroom),
      academicYearId: Number(selectedAcademicYear),
      lateFineFeeTypeId: Number(
        lateFineConfig.lateFineFeeTypeId
      ),
      dueDayOfMonth: Number(
        lateFineConfig.dueDayOfMonth
      ),
      fineAmount: parseFloat(
        lateFineConfig.fineAmount
      ),
      active: lateFineConfig.active
    };

    setSavingLateFine(true);
    setError('');
    setSuccess('');

    try {
      const result = await apiRequest(
        '/late-fine-rules',
        'POST',
        payload
      );

      setLateFineConfig(prev => ({
        ...prev,
        id: result.id
      }));

      setSuccess(
        'Late fine rule updated successfully!'
      );
    } catch (err) {
      console.error('Error saving late fine rule:', err);

      setError(
        err.message ||
        'Failed to save late fine rule.'
      );
    } finally {
      setSavingLateFine(false);
    }
  };

  return (
    <div className="space-y-6">

      <div className="border-b border-slate-200 pb-4 flex items-center justify-between">

        <div>

          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Layers
              className="text-emerald-600"
              size={24}
            />

            Fee Structure & Late Fine Master
          </h1>

          <p className="text-xs text-slate-500 mt-1">
            Setup month-wise fee distributions and late fine rules for classrooms.
          </p>

        </div>

      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl">
          ✅ {success}
        </div>
      )}

      {/* 📥 ধাপ ১: সিলেকশন প্যানেল */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-200">

        <div>

          <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider flex items-center gap-1">
            <Calendar
              size={14}
              className="text-slate-400"
            />

            Academic Year
          </label>

          <select
            value={selectedAcademicYear}
            onChange={(e) =>
              setSelectedAcademicYear(e.target.value)
            }
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500"
          >

            <option value="">
              -- Select Academic Session --
            </option>

            {academicYears.map(ay => (
              <option
                key={ay.id}
                value={ay.id}
              >
                {ay.name}{' '}
                {ay.active ? '(Active)' : ''}
              </option>
            ))}

          </select>

        </div>

        <div>

          <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider flex items-center gap-1">
            <BookOpen
              size={14}
              className="text-slate-400"
            />

            Target Classroom
          </label>

          <select
            value={selectedClassroom}
            onChange={(e) =>
              setSelectedClassroom(e.target.value)
            }
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500"
          >

            <option value="">
              -- Select Active Class --
            </option>

            {classrooms.map(c => (
              <option
                key={c.id}
                value={c.id}
              >
                {c.name} - Section {c.section}
              </option>
            ))}

          </select>

        </div>

      </div>

      {/* 📊 ধাপ ২: ফি ম্যাট্রিক্স ও লেট ফাইন কন্টেইনার */}
      {selectedAcademicYear && selectedClassroom && (

        <div className="space-y-6">

          {/* 💻 MATRIX GRID TABLE */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

            <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">

              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                1. Fee Mapping Sheet
              </h3>

              <button
                type="button"
                onClick={() =>
                  setShowTypeSelector(!showTypeSelector)
                }
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus size={14} />

                Add / Manage Fee Types
              </button>

            </div>

            {/* 🔍 ফি টাইপ সিলেকশন ট্রে */}
            {showTypeSelector && (

              <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs">

                <p className="font-bold text-slate-600 mb-3 uppercase tracking-wider">
                  Choose Fee Types to add into current Matrix:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">

                  {allFeeTypes.map(type => {

                    const isChecked =
                      checkedFeeTypeIds.includes(type.id);

                    return (

                      <div
                        key={type.id}
                        onClick={() =>
                          toggleFeeTypeCheckbox(type.id)
                        }
                        className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >

                        {isChecked ? (
                          <CheckSquare
                            size={16}
                            className="text-emerald-600"
                          />
                        ) : (
                          <Square
                            size={16}
                            className="text-slate-400"
                          />
                        )}

                        <div className="leading-tight">

                          <p className="font-bold">
                            {type.name}
                          </p>

                          <span className="text-[9px] text-slate-400 font-normal">
                            {type.description || 'No desc'}
                          </span>

                        </div>

                      </div>

                    );
                  })}

                </div>

                <div className="mt-4 flex justify-end">

                  <button
                    type="button"
                    onClick={handleAddSelectedTypes}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-lg transition shadow-sm"
                  >
                    Apply to Grid
                  </button>

                </div>

              </div>

            )}

            <div className="overflow-x-auto">

              <table className="w-full text-left border-collapse text-xs">

                <thead>

                  <tr className="bg-slate-900 text-white font-bold tracking-wider uppercase text-center">

                    <th className="p-3 text-left min-w-[160px] bg-slate-950 sticky left-0 z-10">
                      Fee Head / Type
                    </th>

                    {MONTHS.map(m => (
                      <th
                        key={m.value}
                        className="p-3 min-w-[75px] border-l border-slate-800"
                      >
                        {m.name}
                      </th>
                    ))}

                    <th className="p-3 min-w-[50px] border-l border-slate-800">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {Object.keys(matrixData).length === 0 ? (

                    <tr>

                      <td
                        colSpan={14}
                        className="p-8 text-center text-slate-400 font-medium bg-slate-50/30"
                      >
                        No Fee Types attached yet. Click
                        "Add / Manage Fee Types" to start mapping.
                      </td>

                    </tr>

                  ) : (

                    Object.keys(matrixData).map(typeId => {

                      const typeObj =
                        allFeeTypes.find(
                          t => t.id === Number(typeId)
                        );

                      return (

                        <tr
                          key={typeId}
                          className="hover:bg-slate-50/80 border-b border-slate-200 transition"
                        >

                          <td className="p-3 font-bold text-slate-700 bg-white sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-slate-100">
                            {typeObj
                              ? typeObj.name
                              : `Type ID: ${typeId}`}
                          </td>

                          {MONTHS.map(m => (

                            <td
                              key={m.value}
                              className="p-1.5 border-l border-slate-100"
                            >

                              <input
                                type="number"
                                min="0"
                                step="any"
                                placeholder="0.0"
                                value={
                                  matrixData[typeId][m.value]
                                }
                                onChange={(e) =>
                                  handleAmountChange(
                                    typeId,
                                    m.value,
                                    e.target.value
                                  )
                                }
                                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-center font-semibold bg-white focus:border-emerald-500 outline-none text-slate-800 transition shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />

                            </td>

                          ))}

                          <td className="p-1.5 border-l border-slate-100 text-center">

                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveRow(typeId)
                              }
                              className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition"
                              title="Remove Row"
                            >
                              <Trash2 size={16} />
                            </button>

                          </td>

                        </tr>

                      );
                    })

                  )}

                </tbody>

              </table>

            </div>

            {Object.keys(matrixData).length > 0 && (

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">

                <button
                  type="button"
                  onClick={handleSubmitFeeStructure}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition disabled:bg-slate-300"
                >

                  <Save size={16} />

                  {loading
                    ? 'Saving Structure...'
                    : 'Save Fee Structure'}

                </button>

              </div>

            )}

          </div>

          {/* 🕒 2. LATE FINE CONFIGURATION CARD */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">

              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">

                <Clock
                  size={18}
                  className="text-amber-500"
                />

                2. Late Fine Rule Configuration

              </h3>

              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                  lateFineConfig.id
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {lateFineConfig.id
                  ? 'Rule Active'
                  : 'No Rule Configured'}
              </span>

            </div>

            <form
              onSubmit={handleSaveLateFine}
              className="space-y-4"
            >

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* ১. লেট ফাইনের জন্য ফি হেড / টাইপ */}
                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Late Fine Fee Type{' '}
                    <span className="text-rose-500">*</span>
                  </label>

                  <select
                    value={
                      lateFineConfig.lateFineFeeTypeId
                    }
                    onChange={(e) =>
                      setLateFineConfig({
                        ...lateFineConfig,
                        lateFineFeeTypeId:
                          e.target.value
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-amber-500 focus:bg-white transition"
                    required
                  >

                    <option value="">
                      -- Select Fee Type --
                    </option>

                    {allFeeTypes.map(ft => (
                      <option
                        key={ft.id}
                        value={ft.id}
                      >
                        {ft.name}
                      </option>
                    ))}

                  </select>

                </div>

                {/* ২. মাসের কত তারিখের মধ্যে ফি জমা দিতে হবে */}
                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Due Day of Month (1-31){' '}
                    <span className="text-rose-500">*</span>
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="e.g. 10"
                    value={
                      lateFineConfig.dueDayOfMonth
                    }
                    onChange={(e) =>
                      setLateFineConfig({
                        ...lateFineConfig,
                        dueDayOfMonth:
                          e.target.value
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-amber-500 focus:bg-white transition"
                    required
                  />

                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Fine applies after this date
                  </span>

                </div>

                {/* ৩. কত টাকা ফাইন হিসেবে যোগ হবে */}
                <div>

                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Fine Amount (₹){' '}
                    <span className="text-rose-500">*</span>
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 50.00"
                    value={
                      lateFineConfig.fineAmount
                    }
                    onChange={(e) =>
                      setLateFineConfig({
                        ...lateFineConfig,
                        fineAmount:
                          e.target.value
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-amber-500 focus:bg-white transition"
                    required
                  />

                </div>

              </div>

              <div className="flex items-center justify-between pt-2">

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600">

                  <input
                    type="checkbox"
                    checked={lateFineConfig.active}
                    onChange={(e) =>
                      setLateFineConfig({
                        ...lateFineConfig,
                        active: e.target.checked
                      })
                    }
                    className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                  />

                  Enable Late Fine for this Class

                </label>

                <button
                  type="submit"
                  disabled={savingLateFine}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition disabled:bg-slate-300"
                >

                  <Save size={14} />

                  {savingLateFine
                    ? 'Saving Late Fine...'
                    : 'Save Late Fine Rule'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default FeeStructure;