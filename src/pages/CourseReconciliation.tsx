
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

const CourseReconciliation: React.FC = () => {
  const [reportId, setReportId] = useState<string | null>(null);

  const { data: report, isLoading: isReportLoading, error: reportError } = useQuery(
    ['reconciliationReport', reportId],
    async () => {
      const response = await apiClient.get(`/course-reconciliation/report/${reportId}`);
      return response.data.report;
    },
    {
      enabled: !!reportId,
      refetchInterval: (data) => (data?.status === 'running' ? 5000 : false),
    }
  );

  const reconcileMutation = useMutation(
    async () => {
      const response = await apiClient.post('/course-reconciliation/reconcile');
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Course reconciliation started.');
        setReportId(data.reportId);
      },
      onError: () => {
        toast.error('Failed to start course reconciliation.');
      },
    }
  );

  const handleReconcile = () => {
    reconcileMutation.mutate();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Course Reconciliation</h1>
        <button
          onClick={handleReconcile}
          disabled={reconcileMutation.isLoading || (report && report.status === 'running')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {reconcileMutation.isLoading || (report && report.status === 'running')
            ? 'Reconciliation in progress...'
            : 'Start New Reconciliation'}
        </button>
      </div>

      {isReportLoading && <p>Loading report...</p>}
      {reportError && <p className="text-red-500">Error loading report.</p>}

      {report && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Reconciliation Report</h2>
          <p><strong>Report ID:</strong> {report._id}</p>
          <p><strong>Run Date:</strong> {new Date(report.runDate).toLocaleString()}</p>
          <p><strong>Run By:</strong> {report.runBy?.username}</p>
          <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-sm ${report.status === 'completed' ? 'bg-green-200 text-green-800' : report.status === 'failed' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>{report.status}</span></p>

          <h3 className="text-lg font-semibold mt-6 mb-2">Discrepancies ({report.discrepancies.length})</h3>
          {report.discrepancies.length === 0 ? (
            <p>No discrepancies found.</p>
          ) : (
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2">Student</th>
                  <th className="py-2">Course</th>
                  <th className="py-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                {report.discrepancies.map((d: any, index: number) => (
                  <tr key={index} className="border-t">
                    <td className="py-2 px-4">{d.student?.profile?.firstName} {d.student?.profile?.lastName} ({d.student?.studentId})</td>
                    <td className="py-2 px-4">{d.course?.title} ({d.course?.courseCode})</td>
                    <td className="py-2 px-4">{d.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseReconciliation;
