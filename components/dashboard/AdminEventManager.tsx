import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Edit2, Trash2, Calendar, MapPin, X, Save } from 'lucide-react';

interface EventRecord {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface AdminEventManagerProps {
  onEventChange?: () => void;
}

const AdminEventManager: React.FC<AdminEventManagerProps> = ({ onEventChange }) => {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const resetForm = () => {
    setFormData({ title: '', date: '', location: '', description: '', is_active: true });
    setEditingEvent(null);
    setShowForm(false);
  };

  const handleEdit = (event: EventRecord) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      location: event.location || '',
      description: event.description || '',
      is_active: event.is_active,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.date) {
      alert('Title and Date are required.');
      return;
    }

    setSaving(true);
    try {
      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update({
            title: formData.title,
            date: formData.date,
            location: formData.location,
            description: formData.description,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingEvent.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('events')
          .insert({
            title: formData.title,
            date: formData.date,
            location: formData.location,
            description: formData.description,
            is_active: formData.is_active,
          });

        if (error) throw error;
      }

      resetForm();
      fetchEvents();
      onEventChange?.();
    } catch (err) {
      console.error('Error saving event:', err);
      alert('Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      fetchEvents();
      onEventChange?.();
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Failed to delete event.');
    }
  };

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) >= now);
  const pastEvents = events.filter(e => new Date(e.date) < now);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Event Management
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create, edit, and manage alumni events.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition shadow-sm"
        >
          <Plus size={18} />
          Create Event
        </button>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-xl w-full max-w-lg shadow-2xl border border-light-border dark:border-dark-border">
            <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h3>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Alumni Meet 2026"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Institute of Tool Engineering, Dindigul"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Event description..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.is_active ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.is_active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="p-4 border-t border-light-border dark:border-dark-border flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Upcoming Events ({upcomingEvents.length})
        </h4>
        {upcomingEvents.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center text-gray-500">
            No upcoming events. Create one above.
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map(event => (
              <div key={event.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-semibold text-gray-900 dark:text-white">{event.title}</h5>
                    {!event.is_active && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600">Inactive</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(event.date).toLocaleDateString()}</span>
                    {event.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>}
                  </div>
                  {event.description && <p className="text-sm text-gray-500 mt-1">{event.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Events */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
          Past Events ({pastEvents.length})
        </h4>
        {pastEvents.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center text-gray-500">
            No past events.
          </div>
        ) : (
          <div className="space-y-3">
            {pastEvents.map(event => (
              <div key={event.id} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 opacity-75">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-semibold text-gray-700 dark:text-gray-300">{event.title}</h5>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600">Past</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(event.date).toLocaleDateString()}</span>
                    {event.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEventManager;
