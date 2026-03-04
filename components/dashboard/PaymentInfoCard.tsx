import React from 'react';
import { CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface PaymentInfoCardProps {
  status: 'pending' | 'verified' | 'rejected';
  rejectionComments?: string;
}

const PaymentInfoCard: React.FC<PaymentInfoCardProps> = ({ status, rejectionComments }) => {
  if (status === 'verified') return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-light-border overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-4 ${
        status === 'rejected' ? 'bg-red-50 border-b border-red-100' : 'bg-amber-50 border-b border-amber-100'
      }`}>
        <div className="flex items-center gap-3">
          {status === 'rejected' ? (
            <AlertCircle className="w-6 h-6 text-red-600" />
          ) : (
            <Clock className="w-6 h-6 text-amber-600" />
          )}
          <div>
            <h3 className={`font-bold text-lg ${
              status === 'rejected' ? 'text-red-800' : 'text-amber-800'
            }`}>
              {status === 'rejected'
                ? 'Registration Rejected'
                : 'Registration Pending Verification'}
            </h3>
            <p className={`text-sm ${
              status === 'rejected' ? 'text-red-600' : 'text-amber-600'
            }`}>
              {status === 'rejected'
                ? 'Your registration was rejected. Please review the comments and re-submit.'
                : 'Your payment receipt is being reviewed by the admin. You will be notified once verified.'}
            </p>
          </div>
        </div>
      </div>

      {/* Rejection Comments */}
      {status === 'rejected' && rejectionComments && (
        <div className="px-6 py-4 bg-red-50/50 border-b border-red-100">
          <p className="text-sm font-medium text-red-700 mb-1">Admin Comments:</p>
          <p className="text-sm text-red-600 bg-white p-3 rounded-lg border border-red-200">
            {rejectionComments}
          </p>
        </div>
      )}

      {/* Fee Structure */}
      <div className="p-6">
        <h4 className="font-semibold text-light-text-primary mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          Membership Fee Structure
        </h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div>
              <p className="font-medium text-light-text-primary">One-time Registration Fee</p>
              <p className="text-xs text-light-text-secondary">Paid once at the time of registration</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-primary">&#8377;100</span>
              <p className="text-xs text-light-text-secondary">One-time</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div>
              <p className="font-medium text-light-text-primary">Yearly Subscription</p>
              <p className="text-xs text-light-text-secondary">Annual membership renewal fee</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-primary">&#8377;600</span>
              <p className="text-xs text-light-text-secondary">Per year</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div>
              <p className="font-bold text-light-text-primary">Total (First Year)</p>
              <p className="text-xs text-light-text-secondary">Registration + First year subscription</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">&#8377;700</span>
            </div>
          </div>
        </div>

        {/* What you get */}
        <div className="mt-6">
          <h5 className="font-medium text-light-text-primary mb-3">Benefits after verification:</h5>
          <ul className="space-y-2">
            {[
              'Official Alumni ID Card (Digital)',
              'Access to Alumni Directory',
              'Event Registration & Sponsorship',
              'Networking with fellow alumni',
              'Profile visibility in the directory',
            ].map((benefit, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-light-text-secondary">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {status === 'pending' && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> If you have already uploaded your payment receipt during registration,
              please wait for admin verification. You will receive your Alumni ID card once approved.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentInfoCard;
