import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Printer,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { apiRequest } from '../api';

const ReportCardDetails = ({ selectedData, onBack }) => {
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { student, reportType } = selectedData || {};

  // Extract IDs from student enrollment object
  const academicYearId = student?.academicYearId || student?.academicYear?.id;
  const classroomId = student?.classroomId || student?.classroom?.id;
  const studentEnrollmentId = student?.id;

  // 1. Fetch Result Data based on reportType (FIRST_TERM, SECOND_TERM, THIRD_TERM)
  useEffect(() => {
    const fetchResult = async () => {
      if (!academicYearId || !classroomId || !studentEnrollmentId) {
        setError('Missing required parameters for fetching report card.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        let endpoint = '/terms/first';
        if (reportType === 'SECOND_TERM') {
          endpoint = '/terms/second';
        } else if (reportType === 'THIRD_TERM') {
          endpoint = '/terms/third';
        }

        const queryParams =
          `?academicYearId=${academicYearId}` +
          `&classroomId=${classroomId}` +
          `&studentEnrollmentId=${studentEnrollmentId}`;

        const response = await apiRequest(`${endpoint}${queryParams}`, 'GET');
        setResultData(response);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load report card data.');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [academicYearId, classroomId, studentEnrollmentId, reportType]);

  // Handle Browser Print
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <RefreshCw size={32} className="animate-spin text-emerald-600" />
        <p className="text-sm text-slate-600 font-medium">
          Generating Official Academic Report Card...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4">
        <div className="p-4 bg-rose-50 text-rose-700 rounded-lg flex items-center gap-3 border border-rose-200 text-sm">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2 hover:bg-slate-700"
        >
          <ArrowLeft size={16} /> Back to Student List
        </button>
      </div>
    );
  }

  const studentInfo = resultData?.student;
  const examInfo = resultData?.exam;
  const summary = resultData?.summary;
  const subjects = resultData?.subjects || [];
  const classTests = resultData?.classTests || [];

  // Grade Scale Reference
  const gradeRanges = [
    { grade: 'A+', range: '90 - 100%', label: 'Excellent' },
    { grade: 'A', range: '80 - 89%', label: 'Very Good' },
    { grade: 'B+', range: '70 - 79%', label: 'Good' },
    { grade: 'B', range: '60 - 69%', label: 'Satisfactory' },
    { grade: 'C+', range: '50 - 59%', label: 'Fair' },
    { grade: 'C', range: '40 - 49%', label: 'Poor' },
    { grade: 'D', range: '30 - 39%', label: 'Very Poor' }
  ];

  // Helper to render Term Marks Separate Column Blocks (W, V, P, Total, Grade)
  const renderTermBlockColumns = (termPart) => {
    if (!termPart) {
      return (
        <>
          <td className="py-1 px-1 text-center border-l border-slate-300 font-mono text-[9.5px]"></td>
          <td className="py-1 px-1 text-center border-l border-slate-300 font-mono text-[9.5px]"></td>
          <td className="py-1 px-1 text-center border-l border-slate-300 font-mono text-[9.5px]"></td>
          <td className="py-1 px-1 text-center border-l border-slate-300 font-mono text-[9.5px]"></td>
          <td className="py-1 px-1 text-center border-l border-slate-300 text-[9.5px]"></td>
        </>
      );
    }

    const { writtenObtained, vivaObtained, practicalObtained, totalObtained, fullMarks, grade } = termPart;

    return (
      <>
        {/* Written */}
        <td className="py-1 px-1 text-center border-l border-slate-300 font-mono font-bold text-[9.5px] text-slate-900">
          {writtenObtained !== null && writtenObtained !== undefined ? writtenObtained : ''}
        </td>

        {/* Viva */}
        <td className="py-1 px-1 text-center border-l border-slate-300 font-mono font-bold text-[9.5px] text-slate-900">
          {vivaObtained !== null && vivaObtained !== undefined ? vivaObtained : ''}
        </td>

        {/* Practical */}
        <td className="py-1 px-1 text-center border-l border-slate-300 font-mono font-bold text-[9.5px] text-slate-900">
          {practicalObtained !== null && practicalObtained !== undefined ? practicalObtained : ''}
        </td>

        {/* Total / Full */}
        <td className="py-1 px-1 text-center border-l border-slate-300 font-mono text-[10px] font-black text-slate-950">
          {totalObtained !== null && totalObtained !== undefined ? (
            <span>
              {totalObtained}
              <span className="text-[8.5px] text-slate-500 font-semibold"> / {fullMarks ?? '-'}</span>
            </span>
          ) : (
            ''
          )}
        </td>

        {/* Grade */}
        <td className="py-1 px-1 text-center border-l border-slate-300 font-extrabold text-[10px] text-slate-900">
          {grade || ''}
        </td>
      </>
    );
  };

  // Check if student failed (Grade D or below)
  const isFailedStudent = summary?.overallGrade === 'D' || (summary?.percentage !== undefined && summary?.percentage < 30);

  return (
    <div className="space-y-6">
      {/* PRINT STYLES */}
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 0;
            }
            html, body {
              width: 210mm;
              height: 297mm;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              overflow: hidden !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body * {
              visibility: hidden;
            }
            #result-card-print, #result-card-print * {
              visibility: visible;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #result-card-print {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 210mm !important;
              max-height: 297mm !important;
              margin: 0 !important;
              padding: 6mm !important;
              box-sizing: border-box;
              background: white !important;
              border: none !important;
              border-radius: 0 !important;
              box-shadow: none !important;
            }
            #result-card-print table {
              width: 100% !important;
            }
            #result-card-print table, #result-card-print tr, #result-card-print .grid {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        `}
      </style>

      {/* TOP ACTION BAR */}
      <div className="print:hidden flex justify-between items-center bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Search
        </button>

        <button
          onClick={handlePrint}
          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow flex items-center gap-2"
        >
          <Printer size={16} />
          Print Report Card
        </button>
      </div>

      {/* A4 REPORT CARD */}
      <div
        id="result-card-print"
        className="bg-white border-2 border-slate-400 rounded-xl p-6 shadow-lg max-w-[210mm] mx-auto text-slate-800 font-sans space-y-3.5 print:border-none print:shadow-none print:w-[210mm] print:rounded-none"
      >
        {/* SCHOOL HEADER WITH LOGO */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
          <div className="w-16 h-16 flex items-center justify-center">
            <img
              src="/images/school-campus.png"
              alt="School Logo"
              className="max-h-16 max-w-16 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          <div className="text-center">
            <h1 className="text-base print:text-sm font-black uppercase tracking-wide text-slate-900 whitespace-nowrap">
              Raghunathganj Rani Bhabani Vidyaniketan(H.S.)
            </h1>
            <p className="text-[11px] print:text-[9.5px] font-bold text-slate-700 mt-0.5">
              Sadarghat, Raghunathganj, Murshidabad
            </p>
            <p className="text-[10px] print:text-[8.5px] font-semibold text-slate-600">
              AFFILIATED TO WBBSE and WBCHSE, INDEX NO: E3-099 (H.S.CODE: 116140)
            </p>
          </div>

          <div className="w-16 text-right">
            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block">
              PROGRESS REPORT
            </span>
          </div>
        </div>

        {/* REPORT CARD TITLE */}
        <div className="text-center py-1 bg-slate-100 border-2 border-slate-400 rounded-md">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            {examInfo?.examName ||
              (reportType === 'FIRST_TERM'
                ? 'FIRST TERM EVALUATION REPORT'
                : reportType === 'SECOND_TERM'
                ? 'SECOND TERM EVALUATION REPORT'
                : 'THIRD TERM EVALUATION REPORT')}
          </h2>
        </div>

        {/* STUDENT DEMOGRAPHICS GRID */}
        <div className="border-2 border-slate-400 rounded-lg p-2.5 bg-slate-50/50 text-xs print:text-[10px] grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
          <div>
            <span className="text-slate-600 font-semibold">Student Name:</span>{' '}
            <strong className="text-slate-900 font-bold uppercase">{studentInfo?.studentName || '-'}</strong>
          </div>

          <div>
            <span className="text-slate-600 font-semibold">Roll No:</span>{' '}
            <strong className="text-slate-900 font-mono font-bold">{studentInfo?.rollNumber || '-'}</strong>
          </div>

          <div>
            <span className="text-slate-600 font-semibold">Admission No:</span>{' '}
            <strong className="text-slate-900 font-mono font-bold">{studentInfo?.admissionNumber || '-'}</strong>
          </div>

          <div>
            <span className="text-slate-600 font-semibold">Classroom:</span>{' '}
            <strong className="text-slate-900 font-bold">
              {studentInfo?.classroomName || '-'} {studentInfo?.section && `(${studentInfo.section})`}
            </strong>
          </div>

          <div>
            <span className="text-slate-600 font-semibold">Academic Year:</span>{' '}
            <strong className="text-slate-900 font-bold">{studentInfo?.academicYearName || '-'}</strong>
          </div>

          <div>
            <span className="text-slate-600 font-semibold">Student Code:</span>{' '}
            <strong className="text-slate-900 font-mono font-bold">{studentInfo?.studentCode || '-'}</strong>
          </div>

          <div>
            <span className="text-slate-600 font-semibold">Father's Name:</span>{' '}
            <span className="text-slate-900 font-bold">{studentInfo?.fatherName || '-'}</span>
          </div>

          <div>
            <span className="text-slate-600 font-semibold">Mother's Name:</span>{' '}
            <span className="text-slate-900 font-bold">{studentInfo?.motherName || '-'}</span>
          </div>

          <div>
            <span className="text-slate-600 font-semibold">Date of Birth:</span>{' '}
            <span className="text-slate-900 font-mono font-bold">{studentInfo?.dateOfBirth || '-'}</span>
          </div>

          {studentInfo?.gender && (
            <div>
              <span className="text-slate-600 font-semibold">Gender:</span>{' '}
              <span className="text-slate-900 font-bold uppercase">{studentInfo.gender}</span>
            </div>
          )}
        </div>

        {/* MAIN TERM SUBJECTS TABLE */}
        <div className="overflow-x-auto border-2 border-slate-400 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white text-[9.5px] uppercase tracking-wider">
                <th className="py-1.5 px-2 font-bold" rowSpan={2}>Subject Name</th>

                {/* 1st Term Headers */}
                <th colSpan={5} className="py-1 px-1 text-center border-l border-slate-600 font-bold bg-slate-700">
                  1st Term
                </th>

                {/* 2nd Term Headers */}
                {(reportType === 'SECOND_TERM' || reportType === 'THIRD_TERM') && (
                  <th colSpan={5} className="py-1 px-1 text-center border-l border-slate-600 font-bold bg-slate-800">
                    2nd Term
                  </th>
                )}

                {/* 3rd Term Headers */}
                {reportType === 'THIRD_TERM' && (
                  <th colSpan={5} className="py-1 px-1 text-center border-l border-slate-600 font-bold bg-slate-900">
                    3rd Term
                  </th>
                )}
              </tr>

              <tr className="bg-slate-700 text-slate-200 text-[8px] uppercase tracking-wider border-t border-slate-600">
                {/* 1st Term Sub-headers */}
                <th className="py-0.5 px-1 text-center border-l border-slate-600">W</th>
                <th className="py-0.5 px-1 text-center border-l border-slate-600">V</th>
                <th className="py-0.5 px-1 text-center border-l border-slate-600">P</th>
                <th className="py-0.5 px-1 text-center border-l border-slate-600">Total</th>
                <th className="py-0.5 px-1 text-center border-l border-slate-600">Grade</th>

                {/* 2nd Term Sub-headers */}
                {(reportType === 'SECOND_TERM' || reportType === 'THIRD_TERM') && (
                  <>
                    <th className="py-0.5 px-1 text-center border-l border-slate-600">W</th>
                    <th className="py-0.5 px-1 text-center border-l border-slate-600">V</th>
                    <th className="py-0.5 px-1 text-center border-l border-slate-600">P</th>
                    <th className="py-0.5 px-1 text-center border-l border-slate-600">Total</th>
                    <th className="py-0.5 px-1 text-center border-l border-slate-600">Grade</th>
                  </>
                )}

                {/* 3rd Term Sub-headers */}
                {reportType === 'THIRD_TERM' && (
                  <>
                    <th className="py-0.5 px-1 text-center border-l border-slate-600">W</th>
                    <th className="py-0.5 px-1 text-center border-l border-slate-600">V</th>
                    <th className="py-0.5 px-1 text-center border-l border-slate-600">P</th>
                    <th className="py-0.5 px-1 text-center border-l border-slate-600">Total</th>
                    <th className="py-0.5 px-1 text-center border-l border-slate-600">Grade</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-300 text-xs print:text-[10px]">
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-4 text-center text-slate-400 font-semibold">
                    No subject marks available.
                  </td>
                </tr>
              ) : (
                subjects.map((sub, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-100/70'}>
                    <td className="py-1 px-2 font-bold text-slate-900">{sub.subjectName}</td>

                    {/* Render 1st Term Block Columns */}
                    {renderTermBlockColumns(sub.firstTerm)}

                    {/* Render 2nd Term Block Columns */}
                    {(reportType === 'SECOND_TERM' || reportType === 'THIRD_TERM') &&
                      renderTermBlockColumns(sub.secondTerm)}

                    {/* Render 3rd Term Block Columns */}
                    {reportType === 'THIRD_TERM' &&
                      renderTermBlockColumns(sub.thirdTerm)}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* CLASS TEST HORIZONTAL TABLE (MOVED BELOW TERM RESULT TABLE) */}
        {classTests && classTests.length > 0 && (
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
              Class Test Evaluation Summary
            </h3>
            <div className="overflow-x-auto border-2 border-slate-400 rounded-lg">
              <table className="w-full text-center border-collapse text-xs print:text-[9.5px]">
                <thead>
                  <tr className="bg-slate-800 text-white font-bold uppercase">
                    <th className="py-1 px-2 border-r border-slate-600 text-left bg-slate-900">Subject</th>
                    {classTests.map((ct, idx) => (
                      <th key={idx} className="py-1 px-1.5 border-r border-slate-600 font-semibold">
                        {ct.subjectName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="py-1 px-2 font-bold text-slate-800 text-left border-r border-slate-300">Marks Obtained</td>
                    {classTests.map((ct, idx) => (
                      <td key={idx} className="py-1 px-1.5 font-mono font-bold text-slate-900 border-r border-slate-300">
                        {ct.obtained !== null && ct.obtained !== undefined ? ct.obtained : '-'}
                        <span className="text-[8.5px] text-slate-500 font-semibold"> / {ct.fullMarks ?? '-'}</span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GRADE REFERENCE SCALE */}
        <div className="border-2 border-slate-300 rounded-lg p-1.5 bg-slate-50">
          <div className="text-[9px] font-bold text-slate-800 uppercase tracking-wide mb-1">
            Grading Scale Reference:
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {gradeRanges.map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-300 rounded p-0.5 text-[8.5px]">
                <div className="font-extrabold text-slate-900">{item.grade}</div>
                <div className="text-slate-600 font-mono font-bold text-[7.5px]">{item.range}</div>
                <div className="text-[7px] text-slate-500 font-medium truncate">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SUMMARY & PERFORMANCE OVERVIEW */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 items-stretch">
            {/* Stats Table */}
            <div className="border-2 border-slate-400 rounded-lg p-2 bg-slate-50 space-y-1 text-xs print:text-[10px]">
              <h4 className="font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-0.5 text-[9.5px]">
                Marks Summary & Statistics
              </h4>

              <div className="grid grid-cols-2 gap-1 pt-0.5">
                <div>
                  <span className="text-slate-600 font-semibold">Total Obtained:</span>
                  <div className="font-bold text-slate-900 font-mono text-xs">
                    {summary.totalMarksObtained} / {summary.totalMaxMarks}
                  </div>
                </div>

                <div>
                  <span className="text-slate-600 font-semibold">Percentage:</span>
                  <div className="font-bold text-emerald-800 font-mono text-xs">
                    {summary.percentage}%
                  </div>
                </div>

                <div>
                  <span className="text-slate-600 font-semibold">Overall Grade:</span>
                  <div className="font-bold text-slate-900 font-mono text-xs">
                    {summary.overallGrade || '-'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-600 font-semibold">Class Rank:</span>
                  <div className="font-bold font-mono text-xs">
                    {isFailedStudent || summary.rank == null ? (
                      <span className="text-rose-600 font-bold">----</span>
                    ) : (
                      <span className="text-slate-900">
                        {summary.rank}{' '}
                        <span className="text-[9px] text-slate-500 font-normal">
                          (Out of {summary.totalStudentsInExam})
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Remarks Box */}
            <div className="border-2 border-slate-400 rounded-lg p-2 bg-slate-50 flex flex-col justify-between space-y-1">
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-0.5 text-[9.5px]">
                  Teacher's Remarks
                </h4>
                <div className="text-[10px] text-slate-700 bg-white p-1.5 rounded border border-slate-300 font-bold mt-1 min-h-[35px]">
                  {summary.remarks || 'No remarks provided.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SIGNATURE FOOTER */}
        <div className="pt-5 grid grid-cols-3 gap-2 text-center text-[9px] font-bold text-slate-800 border-t-2 border-slate-300">
          <div>
            <div className="border-b-2 border-slate-600 w-3/4 mx-auto mb-1"></div>
            <span>Class Teacher's Signature</span>
          </div>

          <div>
            <div className="border-b-2 border-slate-600 w-3/4 mx-auto mb-1"></div>
            <span>Principal's Signature</span>
          </div>

          <div>
            <div className="border-b-2 border-slate-600 w-3/4 mx-auto mb-1"></div>
            <span>Parent's Signature</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCardDetails;