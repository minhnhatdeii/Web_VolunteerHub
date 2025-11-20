"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { CheckCircle, XCircle, Eye, Calendar, Users, MapPin, AlertCircle, Clock, Check } from "lucide-react"

// Function to get appropriate image for an event
const getEventImage = (event: any) => {
  // If there's a thumbnail URL, use it
  if (event.thumbnailUrl) {
    return event.thumbnailUrl;
  }

  // Otherwise, return a default image based on category
  const category = event.category?.toLowerCase() || '';

  if (category.includes('clean') || category.includes('environment') || category.includes('park')) {
    return "/park-cleanup-event.jpg";
  } else if (category.includes('blood') || category.includes('donation') || category.includes('health')) {
    return "/blood-donation-event.jpg";
  } else if (category.includes('tutor') || category.includes('education') || category.includes('teach')) {
    return "/tutoring-event.jpg";
  } else if (category.includes('build') || category.includes('house') || category.includes('construction')) {
    return "/house-building.jpg";
  } else {
    // Default placeholder for other categories
    return "/placeholder.svg";
  }
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Check if user has admin role and fetch events
  useEffect(() => {
    const checkUserRole = () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        alert('Bạn cần đăng nhập để truy cập trang quản trị');
        window.location.href = '/login';
        return false;
      }
      
      try {
        const user = JSON.parse(userStr);
        if (user.role !== 'ADMIN') {
          alert('Bạn không có quyền truy cập trang quản trị');
          window.location.href = '/';
          return false;
        }
        return true;
      } catch (error) {
        console.error('Error parsing user data:', error);
        alert('Đã xảy ra lỗi khi xác thực quyền truy cập');
        window.location.href = '/login';
        return false;
      }
    };

    if (!checkUserRole()) {
      setLoading(false);
      return; // Don't proceed with the fetch if not admin
    }

    const fetchEvents = async () => {
      try {
        // Get the access token from localStorage
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
          console.error('No access token found');
          setLoading(false);
          return;
        }

        // Use the same API base URL as other parts of the application
        const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

        const response = await fetch(`${BACKEND_API_BASE_URL}/admin/events`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Transform data to match the expected format
          const transformedEvents = data.data.map((event: any) => ({
            id: event.id,
            title: event.title,
            organizer: `${event.creator.firstName} ${event.creator.lastName}`,
            startDate: new Date(event.startDate).toLocaleDateString('vi-VN'),
            endDate: new Date(event.endDate).toLocaleDateString('vi-VN'),
            location: event.location,
            volunteers: (event.registrations || []).length, // assuming registrations represent volunteer count
            status: event.status.toLowerCase(),
            image: getEventImage(event),
            description: event.description,
            category: event.category,
            maxParticipants: event.maxParticipants,
            createdAt: event.createdAt
          }));
          setEvents(transformedEvents);
        } else {
          console.error('Failed to fetch events:', response.status);
          const errorData = await response.json();
          console.error('Error details:', errorData);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      // Get the access token from localStorage
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        alert('Bạn cần đăng nhập để thực hiện hành động này');
        return;
      }

      // Use the same API base URL as other parts of the application
      const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(`${BACKEND_API_BASE_URL}/admin/events/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: 'Event approved by admin' })
      });

      if (response.ok) {
        const updatedEvents = events.map(event =>
          event.id === id ? { ...event, status: 'approved' } : event
        );
        setEvents(updatedEvents);
        alert("Sự kiện đã được duyệt!");
      } else {
        const errorData = await response.json();
        alert(`Không thể duyệt sự kiện: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error approving event:', error);
      alert("Đã xảy ra lỗi khi duyệt sự kiện");
    }
  };

  const handleReject = async (id: string) => {
    try {
      // Get the access token from localStorage
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        alert('Bạn cần đăng nhập để thực hiện hành động này');
        return;
      }

      // Use the same API base URL as other parts of the application
      const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(`${BACKEND_API_BASE_URL}/admin/events/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: 'Event rejected by admin' })
      });

      if (response.ok) {
        // Update the event status to 'rejected' instead of removing it
        const updatedEvents = events.map(event =>
          event.id === id ? { ...event, status: 'rejected' } : event
        );
        setEvents(updatedEvents);
        alert("Sự kiện đã bị từ chối!");
      } else {
        const errorData = await response.json();
        alert(`Không thể từ chối sự kiện: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error rejecting event:', error);
      alert("Đã xảy ra lỗi khi từ chối sự kiện");
    }
  };

  // Filter events by status
  const pendingEvents = events.filter((e) => e.status === 'pending_approval' || e.status === 'pending')
  const approvedEvents = events.filter((e) => e.status === 'approved')
  const rejectedEvents = events.filter((e) => e.status === 'rejected')
  const draftEvents = events.filter((e) => e.status === 'draft')

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle size={18} className="text-success" />
      case 'pending_approval':
      case 'pending':
        return <Clock size={18} className="text-warning" />
      case 'rejected':
        return <XCircle size={18} className="text-error" />
      case 'draft':
        return <AlertCircle size={18} className="text-muted" />
      default:
        return <AlertCircle size={18} className="text-muted" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'Đã duyệt'
      case 'pending_approval':
      case 'pending':
        return 'Chờ duyệt'
      case 'rejected':
        return 'Đã từ chối'
      case 'draft':
        return 'Bản nháp'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-neutral-50 py-12">
          <div className="container-custom">
            <h1 className="text-4xl font-bold mb-8">Quản lý duyệt sự kiện</h1>
            <div className="text-center py-12">
              <p>Đang tải sự kiện...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-8">Quản lý duyệt sự kiện</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="card-base p-6">
              <p className="text-muted text-sm mb-2">Tổng sự kiện</p>
              <p className="text-4xl font-bold text-primary">{events.length}</p>
            </div>
            <div className="card-base p-6">
              <p className="text-muted text-sm mb-2">Chờ duyệt</p>
              <p className="text-4xl font-bold text-warning">{pendingEvents.length}</p>
            </div>
            <div className="card-base p-6">
              <p className="text-muted text-sm mb-2">Đã duyệt</p>
              <p className="text-4xl font-bold text-success">{approvedEvents.length}</p>
            </div>
            <div className="card-base p-6">
              <p className="text-muted text-sm mb-2">Đã từ chối</p>
              <p className="text-4xl font-bold text-error">{rejectedEvents.length}</p>
            </div>
          </div>

          {/* Pending Events */}
          <div className="card-base p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Sự kiện chờ duyệt ({pendingEvents.length})</h2>
            {pendingEvents.length > 0 ? (
              <div className="space-y-4">
                {pendingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex gap-4 p-4 border border-border rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{event.title}</h3>
                      <div className="space-y-1 text-sm text-muted mb-3">
                        <p className="flex items-center gap-2">
                          <Users size={16} />
                          Tổ chức: {event.organizer}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar size={16} />
                          {event.startDate} - {event.endDate}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin size={16} />
                          {event.location}
                        </p>
                        <p className="flex items-center gap-2">
                          <Users size={16} />
                          Tình nguyện viên: {event.volunteers}/{event.maxParticipants}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 self-center">
                      <button
                        onClick={() => handleApprove(event.id)}
                        className="flex items-center gap-2 bg-green-100 text-success px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <Check size={18} />
                        Duyệt
                      </button>
                      <button
                        onClick={() => handleReject(event.id)}
                        className="flex items-center gap-2 bg-red-100 text-error px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <XCircle size={18} />
                        Từ chối
                      </button>
                      <Link
                        href={`/events/${event.id}`}
                        className="flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Eye size={18} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center py-8">Không có sự kiện chờ duyệt</p>
            )}
          </div>

          {/* Approved Events */}
          <div className="card-base p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Sự kiện đã duyệt ({approvedEvents.length})</h2>
            {approvedEvents.length > 0 ? (
              <div className="space-y-4">
                {approvedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex gap-4 p-4 border border-border rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{event.title}</h3>
                      <div className="space-y-1 text-sm text-muted">
                        <p className="flex items-center gap-2">
                          <Users size={16} />
                          Tổ chức: {event.organizer}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar size={16} />
                          {event.startDate} - {event.endDate}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin size={16} />
                          {event.location}
                        </p>
                        <p className="flex items-center gap-2">
                          <Users size={16} />
                          Tình nguyện viên: {event.volunteers}/{event.maxParticipants}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-center">
                      <span className="bg-green-100 text-success px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        {getStatusIcon(event.status)} {getStatusText(event.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center py-8">Không có sự kiện đã duyệt</p>
            )}
          </div>

          {/* Rejected Events */}
          <div className="card-base p-8">
            <h2 className="text-2xl font-bold mb-6">Sự kiện đã từ chối ({rejectedEvents.length})</h2>
            {rejectedEvents.length > 0 ? (
              <div className="space-y-4">
                {rejectedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex gap-4 p-4 border border-border rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{event.title}</h3>
                      <div className="space-y-1 text-sm text-muted">
                        <p className="flex items-center gap-2">
                          <Users size={16} />
                          Tổ chức: {event.organizer}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar size={16} />
                          {event.startDate} - {event.endDate}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin size={16} />
                          {event.location}
                        </p>
                        <p className="flex items-center gap-2">
                          <Users size={16} />
                          Tình nguyện viên: {event.volunteers}/{event.maxParticipants}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-center">
                      <span className="bg-red-100 text-error px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        {getStatusIcon(event.status)} {getStatusText(event.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center py-8">Không có sự kiện đã từ chối</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}