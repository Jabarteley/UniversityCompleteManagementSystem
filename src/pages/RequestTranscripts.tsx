import React from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../hooks/useAuth';
import { requestTranscriptsAPI } from '../api/requestTranscripts';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import { FileText, Send } from 'lucide-react';

interface TranscriptRequestForm {
  reason: string;
  destinationName: string;
  destinationAddress: string;
  destinationCity: string;
  destinationState: string;
  destinationZipCode: string;
  destinationCountry: string;
}

interface TranscriptRequest {
  _id: string;
  studentId: string;
  requestDate: string;
  reason: string;
  destination: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

const RequestTranscripts: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TranscriptRequestForm>();

  const { data: requestsData, isLoading: isLoadingRequests, isError: isErrorRequests, error: requestsError } = useQuery<{ requests: TranscriptRequest[] }>(
    ['transcriptRequests', user?.id],
    () => requestTranscriptsAPI.getStudentRequests(user?.id || ''),
    { enabled: !!user?.id }
  );

  const requestMutation = useMutation(
    (data: { studentId: string; reason: string; destination: any }) => requestTranscriptsAPI.requestTranscript(data),
    {
      onSuccess: () => {
        toast.success('Transcript request submitted successfully!');
        queryClient.invalidateQueries(['transcriptRequests', user?.id]);
        reset();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to submit transcript request.');
      },
    }
  );

  const onSubmit = (formData: TranscriptRequestForm) => {
    if (!user?.id) {
      toast.error('User not authenticated.');
      return;
    }

    const requestData = {
      studentId: user.id,
      reason: formData.reason,
      destination: {
        name: formData.destinationName,
        address: formData.destinationAddress,
        city: formData.destinationCity,
        state: formData.destinationState,
        zipCode: formData.destinationZipCode,
        country: formData.destinationCountry,
      },
    };
    requestMutation.mutate(requestData);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center mb-6">
          <div className="bg-pink-500 rounded-lg p-3 mr-4">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Request Transcripts</h1>
        </div>

        <p className="text-gray-600 mb-6">
          Submit a request for your academic transcripts.
        </p>

        {/* New Request Form */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">New Transcript Request</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-8">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason for Request</label>
            <textarea
              id="reason"
              {...register('reason', { required: 'Reason is required' })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            ></textarea>
            {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>}
          </div>

          <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-2">Destination Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="destinationName" className="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
              <input
                type="text"
                id="destinationName"
                {...register('destinationName', { required: 'Recipient name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              {errors.destinationName && <p className="text-red-500 text-sm mt-1">{errors.destinationName.message}</p>}
            </div>
            <div>
              <label htmlFor="destinationAddress" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                id="destinationAddress"
                {...register('destinationAddress', { required: 'Address is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              {errors.destinationAddress && <p className="text-red-500 text-sm mt-1">{errors.destinationAddress.message}</p>}
            </div>
            <div>
              <label htmlFor="destinationCity" className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                id="destinationCity"
                {...register('destinationCity', { required: 'City is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              {errors.destinationCity && <p className="text-red-500 text-sm mt-1">{errors.destinationCity.message}</p>}
            </div>
            <div>
              <label htmlFor="destinationState" className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                id="destinationState"
                {...register('destinationState', { required: 'State is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              {errors.destinationState && <p className="text-red-500 text-sm mt-1">{errors.destinationState.message}</p>}
            </div>
            <div>
              <label htmlFor="destinationZipCode" className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
              <input
                type="text"
                id="destinationZipCode"
                {...register('destinationZipCode', { required: 'Zip Code is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              {errors.destinationZipCode && <p className="text-red-500 text-sm mt-1">{errors.destinationZipCode.message}</p>}
            </div>
            <div>
              <label htmlFor="destinationCountry" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                id="destinationCountry"
                {...register('destinationCountry', { required: 'Country is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              {errors.destinationCountry && <p className="text-red-500 text-sm mt-1">{errors.destinationCountry.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={requestMutation.isLoading}
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {requestMutation.isLoading ? (
              'Submitting...'
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Submit Request
              </>
            )}
          </button>
        </form>

        {/* Past Requests Section */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Past Transcript Requests</h2>
        {isLoadingRequests && <LoadingSpinner />}
        {isErrorRequests && <p className="text-red-500 text-center">Error loading past requests: {(requestsError as any).message}</p>}

        {requestsData?.requests && requestsData.requests.length > 0 ? (
          <div className="space-y-4">
            {requestsData.requests.map((request) => (
              <div key={request._id} className="p-4 border border-gray-200 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold">Request Date: {new Date(request.requestDate).toLocaleDateString()}</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    request.status === 'completed' ? 'bg-green-100 text-green-800' :
                    request.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-700"><strong>Reason:</strong> {request.reason}</p>
                <p className="text-gray-700"><strong>Destination:</strong> {request.destination.name}, {request.destination.address}, {request.destination.city}, {request.destination.state}, {request.destination.zipCode}, {request.destination.country}</p>
              </div>
            ))}
          </div>
        ) : (
          !isLoadingRequests && !isErrorRequests && (
            <p className="text-center text-gray-500">No past transcript requests found.</p>
          )
        )}
      </div>
    </div>
  );
};

export default RequestTranscripts;