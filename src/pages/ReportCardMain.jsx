import React, { useState } from 'react';
import ReportCardView from './ReportCardView';
import ReportCardDetails from './ReportCardDetails';

const ReportCardMain = () => {
  const [selectedDataForReport, setSelectedDataForReport] = useState(null);

  return (
    <div>
      {/* ReportCardView ব্যাকগ্রাউন্ডে সবসময় থাকবে, শুধু লুকানো থাকবে যাতে ফিল্টার ও লিস্ট মুছে না যায় */}
      <div className={selectedDataForReport ? 'hidden' : 'block'}>
        <ReportCardView
          onSelectExamForReportCard={(data) => setSelectedDataForReport(data)}
        />
      </div>

      {/* স্টুডেন্ট ও টার্ম সিলেক্ট করলে রিপোর্ট কার্ড ডিটেইলস দেখাবে */}
      {selectedDataForReport && (
        <ReportCardDetails
          selectedData={selectedDataForReport}
          onBack={() => setSelectedDataForReport(null)}
        />
      )}
    </div>
  );
};

export default ReportCardMain;