import React from 'react';
import { Users, Calendar, User } from 'lucide-react';
import { Card, Button } from '../ui';

interface QuickActionsCardProps {
  onViewDirectory: () => void;
  onViewEvents: () => void;
  onViewProfile: () => void;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onViewDirectory,
  onViewEvents,
  onViewProfile,
}) => {
  const actions = [
    {
      label: 'View Directory',
      icon: <Users className="w-4 h-4" />,
      onClick: onViewDirectory,
    },
    {
      label: 'Upcoming Events',
      icon: <Calendar className="w-4 h-4" />,
      onClick: onViewEvents,
    },
    {
      label: 'My Profile',
      icon: <User className="w-4 h-4" />,
      onClick: onViewProfile,
    },
  ];

  return (
    <Card className="h-full">
      <h3 className="text-lg font-bold text-light-text-primary mb-4">Quick Actions</h3>
      <div className="flex flex-col gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="secondary"
            fullWidth
            icon={action.icon}
            onClick={action.onClick}
            className="justify-start"
          >
            {action.label}
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default QuickActionsCard;
