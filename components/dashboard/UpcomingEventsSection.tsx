import React from 'react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Card, Button, EmptyState } from '../ui';

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description?: string;
}

interface UpcomingEventsSectionProps {
  events: Event[];
  onViewDetails: (eventId: string) => void;
  onBrowseAll: () => void;
}

const formatDate = (dateString: string): { day: string; month: string; year: string } => {
  const date = new Date(dateString);
  return {
    day: date.getDate().toString().padStart(2, '0'),
    month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
    year: date.getFullYear().toString(),
  };
};

const EventCard: React.FC<{ event: Event; onViewDetails: () => void }> = ({ event, onViewDetails }) => {
  const { day, month } = formatDate(event.date);

  return (
    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-shrink-0 w-14 h-14 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-primary leading-none">{day}</span>
        <span className="text-xs text-primary/80 font-medium">{month}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-light-text-primary truncate">{event.title}</h4>
        <div className="flex items-center gap-1 mt-1 text-sm text-light-text-secondary">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onViewDetails}
        icon={<ArrowRight className="w-4 h-4" />}
        className="flex-shrink-0 self-center"
      >
        View
      </Button>
    </div>
  );
};

const UpcomingEventsSection: React.FC<UpcomingEventsSectionProps> = ({
  events,
  onViewDetails,
  onBrowseAll,
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
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default UpcomingEventsSection;
