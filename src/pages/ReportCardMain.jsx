import React, { useState } from 'react';
import ReportCardView from './ReportCardView';
import ReportCardDetails from './ReportCardDetails';

const ReportCardMain = () => {
  const [selectedDataForReport, setSelectedDataForReport] = useState(null);

  return (
    <div>
      {!selectedDataForReport ? (
        <ReportCardView
          onSelectExamForReportCard={(data) => setSelectedDataForReport(data)}
        />
      ) : (
        <ReportCardDetails
          selectedData={selectedDataForReport}
          onBack={() => setSelectedDataForReport(null)}
        />
      )}
    </div>
  );
};

export default ReportCardMain;