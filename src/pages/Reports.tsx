
import React from 'react';
import { useQuery } from 'react-query';
import { reportsAPI } from '../api/reports';
import { Download, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const Reports: React.FC = () => {
  const { data: reportsData, isLoading, isError } = useQuery('reports', reportsAPI.getAll);

  '''  const handleDownload = async (reportId: string, reportType: string) => {
    try {
      const response = await reportsAPI.download(reportId);
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers['content-disposition'];
      let filename = `${reportType.replace(/ /g, '_')}_${reportId}.csv`; // Default filename
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // You might want to show a user-friendly error message here
    }
  };''

  if (isLoading) {
    return <div className="text-center p-8">Loading reports...</div>;
  }

  if (isError) {
    return <div className="text-center p-8 text-red-500">Error loading reports.</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Generated Reports</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <FileText className="inline-block h-4 w-4 mr-2" />
                  Report Type
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <Calendar className="inline-block h-4 w-4 mr-2" />
                  Generated On
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {reportsData?.reports.map((report: any) => (
                <tr key={report._id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{report.reportType}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {format(new Date(report.createdAt), 'PPP p')}
                    </p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center">
                    <button
                      onClick={() => handleDownload(report._id, report.reportType)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reportsData?.reports.length === 0 && (
          <div className="text-center p-8 text-gray-500">
            No reports found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
