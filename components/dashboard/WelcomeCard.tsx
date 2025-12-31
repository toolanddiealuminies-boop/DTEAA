import React from 'react';
import { User } from 'lucide-react';
import { Card, Badge } from '../ui';

interface WelcomeCardProps {
  userName: string;
  role?: string;
  status: 'pending' | 'verified' | 'rejected';
  profilePhoto?: string;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({
  userName,
  role = 'Alumni',
  status,
  profilePhoto,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'verified':
        return <Badge variant="success">Active</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'rejected':
        return <Badge variant="error">Inactive</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <Card className="h-full">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt={userName}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-light-text-primary truncate">
            Welcome, {userName}!
          </h2>
          <p className="text-sm text-light-text-secondary mt-1">{role}</p>
          <div className="mt-2">{getStatusBadge()}</div>
        </div>
      </div>
    </Card>
  );
};

export default WelcomeCard;
