import React from 'react';
import { Calendar, MapPin, ArrowRight, CheckCircle, Clock, Heart } from 'lucide-react'; // Added icons
import { Card, Button, EmptyState } from '../ui';

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description?: string;
  registrationStatus?: 'pending' | 'approved' | 'rejected' | null; // Added field
}

interface UpcomingEventsSectionProps {
  events: Event[];
  onViewDetails: (eventId: string) => void;
  onBrowseAll: () => void;
  onSponsorClick: (eventId: string) => void;
}

const formatDate = (dateString: string): { day: string; month: string; year: string } => {
  const date = new Date(dateString);
  return {
    day: date.getDate().toString().padStart(2, '0'),
    month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
    year: date.getFullYear().toString(),
  };
};

const EventCard: React.FC<{ event: Event; onViewDetails: () => void; onSponsorClick?: (eventId: string) => void }> = ({ event, onViewDetails, onSponsorClick }) => {
  const { day, month } = formatDate(event.date);

  // Helper to render status badge
  const renderStatus = () => {
    if (!event.registrationStatus) return null;

    if (event.registrationStatus === 'approved') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" /> Registered
        </span>
      );
    }
    if (event.registrationStatus === 'pending') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          <Clock className="w-3 h-3 mr-1" /> Pending Approval
        </span>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex flex-1 gap-4">
        <div className="flex-shrink-0 w-14 h-14 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-primary leading-none">{day}</span>
          <span className="text-xs text-primary/80 font-medium">{month}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4 className="font-semibold text-light-text-primary truncate max-w-full">{event.title}</h4>
            {renderStatus()}
          </div>
          <div className="flex items-center gap-1 mt-1 text-sm text-light-text-secondary">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-4 sm:mt-0 sm:self-center">
        <Button
          variant="default" // Primary style for Sponsor
          size="sm"
          onClick={() => onSponsorClick && onSponsorClick(event.id)}
          icon={<Heart className="w-4 h-4 fill-current" />}
          className="w-full sm:w-auto flex-shrink-0 bg-red-500 hover:bg-red-600 text-white border-red-500"
        >
          Sponsor
        </Button>
        <Button
          variant={event.registrationStatus ? "outline" : "ghost"}
          size="sm"
          onClick={onViewDetails}
          icon={!event.registrationStatus ? <ArrowRight className="w-4 h-4" /> : undefined}
          className="w-full sm:w-auto flex-shrink-0"
        >
          {event.registrationStatus ? 'View Details' : 'View'}
        </Button>
      </div>
    </div>
  );
};

const UpcomingEventsSection: React.FC<UpcomingEventsSectionProps> = ({
  events,
  onViewDetails,
  onBrowseAll,
  onSponsorClick,
}) => {
  const displayEvents = events.slice(0, 3);

  return (
    <Card className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-bold text-light-text-primary">Upcoming Events</h3>
          <p className="text-sm text-light-text-secondary">Stay connected with your alumni network</p>
        </div>
        {events.length > 0 && (
          <Button variant="outline" size="sm" onClick={onBrowseAll}>
            View All
          </Button>
        )}
      </div>

      <div className="mt-4">
        {displayEvents.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-16 h-16" />}
            title="No upcoming events"
            description="Check back later for new events from your alumni network."
            actionLabel="Browse All Events"
            onAction={onBrowseAll}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {displayEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onViewDetails={() => onViewDetails(event.id)}
                onSponsorClick={onSponsorClick}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default UpcomingEventsSection;

