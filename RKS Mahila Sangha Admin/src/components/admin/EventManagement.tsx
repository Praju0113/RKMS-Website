import { AdminLayout } from './AdminLayout';
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi, resolveBackendAssetUrl } from '../../services/api';

interface EventItem {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  image_url?: string;
  price: number;
  is_free: boolean;
  category: string;
}

export function EventManagement() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    imageUrlText: '',
    price: 0,
    isFree: true,
    category: 'upcoming' as 'upcoming' | 'past',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [savedImageUrl, setSavedImageUrl] = useState<string>('');

  const loadData = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error('Please login again');
      return;
    }
    try {
      const [eventsRes, regRes] = await Promise.all([
        adminApi.getEvents(token),
        adminApi.getEventRegistrations(token)
      ]);
      if (eventsRes.success && eventsRes.events) setEvents(eventsRes.events as EventItem[]);
      if (regRes.success && regRes.registrations) setRegistrations(regRes.registrations);
    } catch {
      toast.error('Failed to load event data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (event?: EventItem) => {
    if (event) {
      setEditingEvent(event);
      const existing = event.image_url || '';
      setSavedImageUrl(existing);
      setFormData({
        title: event.title,
        date: (event.date || '').slice(0, 10),
        location: event.location,
        description: event.description,
        imageUrlText: existing.startsWith('http') ? existing : '',
        price: event.price,
        isFree: !!event.is_free,
        category: (event.category as 'upcoming' | 'past') || 'upcoming',
      });
      setImagePreview(existing ? resolveBackendAssetUrl(existing) : '');
      setImageFile(null);
    } else {
      setEditingEvent(null);
      setSavedImageUrl('');
      setFormData({
        title: '',
        date: '',
        location: '',
        description: '',
        imageUrlText: '',
        price: 0,
        isFree: true,
        category: 'upcoming',
      });
      setImagePreview('');
      setImageFile(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setShowModal(false);
    setEditingEvent(null);
    setImageFile(null);
    setImagePreview('');
    setSavedImageUrl('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, imageUrlText: '' }));
    }
  };

  const buildEventFormData = (): FormData => {
    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('description', formData.description);
    fd.append('date', formData.date);
    fd.append('location', formData.location);
    fd.append('category', formData.category);
    fd.append('price', String(formData.isFree ? 0 : formData.price));
    fd.append('is_free', formData.isFree ? 'true' : 'false');

    if (imageFile) {
      fd.append('image', imageFile);
    } else {
      const urlText = formData.imageUrlText.trim();
      if (urlText.startsWith('http')) {
        fd.append('image_url', urlText);
      } else if (savedImageUrl) {
        fd.append('image_url', savedImageUrl);
      }
    }
    return fd;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error('Please login again');
      return;
    }

    if (!editingEvent && !imageFile && !formData.imageUrlText.trim().startsWith('http')) {
      toast.error('Add an event image (upload a file or paste an image URL)');
      return;
    }

    try {
      const fd = buildEventFormData();
      if (editingEvent) {
        const response = await adminApi.updateEvent(token, editingEvent.id, fd);
        if (!response.success) throw new Error((response as any).message || (response as any).errors?.[0]?.msg || 'Update failed');
        toast.success('Event updated successfully!');
      } else {
        const response = await adminApi.createEvent(token, fd);
        if (!response.success) throw new Error((response as any).message || (response as any).errors?.[0]?.msg || 'Create failed');
        toast.success('Event created successfully!');
      }
      await loadData();
      handleCloseModal();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save event');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      const response = await adminApi.deleteEvent(token, id);
      if (response.success) {
        setEvents(events.filter(event => event.id !== id));
        toast.success('Event deleted successfully!');
      } else {
        toast.error(response.message || 'Delete failed');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
            <p className="text-gray-600 mt-2">Create, update, and manage events</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Event
          </button>
        </div>

        {isLoading && <div className="bg-white rounded-lg p-4 shadow-md">Loading events...</div>}

        {/* Events List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={resolveBackendAssetUrl(event.image_url)}
                          alt={event.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{event.title}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{event.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(event.date).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {event.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.is_free ? 'Free' : `₹${event.price}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        event.category === 'upcoming' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {event.category === 'upcoming' ? 'Upcoming' : 'Past'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(event)}
                          className="text-cyan-600 hover:text-cyan-800"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Registrations List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">Event Registrations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Membership ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {registrations.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-sm">{r.event_title}</td>
                    <td className="px-4 py-3 text-sm">{r.name}</td>
                    <td className="px-4 py-3 text-sm">{r.email}</td>
                    <td className="px-4 py-3 text-sm">{r.membership_id || '-'}</td>
                    <td className="px-4 py-3 text-sm">{r.payment_status === 'completed' ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-sm">₹{Number(r.payment_amount || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
                <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      required
                    />
                  </div>

                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event image
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Upload a file (sent as multipart to the server) or paste a public image URL below.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Or image URL (https://…)</label>
                      <input
                        type="url"
                        value={formData.imageUrlText}
                        onChange={(e) => {
                          const v = e.target.value;
                          setFormData({ ...formData, imageUrlText: v });
                          if (v.trim().startsWith('http')) {
                            if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
                            setImageFile(null);
                            setImagePreview(v.trim());
                          }
                        }}
                        placeholder="https://example.com/banner.jpg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
                            setImageFile(null);
                            setFormData((prev) => ({ ...prev, imageUrlText: '' }));
                            setImagePreview(savedImageUrl ? resolveBackendAssetUrl(savedImageUrl) : '');
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Price (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.isFree ? 0 : formData.price}
                      onChange={(e) => {
                        const price = parseFloat(e.target.value) || 0;
                        setFormData({ 
                          ...formData, 
                          price: price,
                          isFree: price === 0 
                        });
                      }}
                      placeholder="0 for free events"
                      min="0"
                      step="1"
                      disabled={formData.isFree}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Free Event
                    </label>
                    <div className="flex items-center gap-3 pt-6">
                      <input
                        type="checkbox"
                        id="isFree"
                        checked={formData.isFree}
                        onChange={(e) => {
                          const isFree = e.target.checked;
                          setFormData({ 
                            ...formData, 
                            isFree: isFree,
                            price: isFree ? 0 : formData.price
                          });
                        }}
                        className="w-4 h-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isFree" className="text-sm text-gray-700">
                        This is a free event
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as 'upcoming' | 'past' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors"
                  >
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
