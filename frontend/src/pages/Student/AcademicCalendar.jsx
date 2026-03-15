import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';

const AcademicCalendar = () => {
  const { user } = useContext(AuthContext);
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        // Try to get university from user profile or assume endpoint exists
        const response = await api.get('/dashboard/upcoming-events/');
        setCalendarData(response.data);
      } catch (error) {
        console.error('Error fetching calendar:', error);
        // Fallback to mock data
        setCalendarData([
          {
            id: 1,
            title: 'Fall Semester 2024',
            type: 'Semester',
            start_date: '2024-09-01',
            end_date: '2024-12-20',
            description: 'Main academic semester'
          },
          {
            id: 2,
            title: 'Spring Semester 2025',
            type: 'Semester',
            start_date: '2025-01-15',
            end_date: '2025-05-30',
            description: 'Second academic semester'
          },
          {
            id: 3,
            title: 'Registration Deadline',
            type: 'Deadline',
            start_date: '2024-08-25',
            end_date: '2024-08-25',
            description: 'Course registration deadline'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Loading academic calendar...</div>;
  }

  return (
    <div className="academic-calendar-page">
      <h1>Academic Calendar</h1>
      <p className="page-description">Important dates, deadlines, and academic schedules.</p>

      <div className="calendar-filters">
        <button className="filter-btn active">All Events</button>
        <button className="filter-btn">Semesters</button>
        <button className="filter-btn">Deadlines</button>
        <button className="filter-btn">Exams</button>
      </div>

      <div className="calendar-events">
        {calendarData.length === 0 ? (
          <div className="no-events">
            <p>No upcoming events</p>
          </div>
        ) : (
          calendarData.map(event => (
            <div key={event.id} className={`calendar-event ${event.type.toLowerCase()}`}>
              <div className="event-header">
                <h3>{event.title}</h3>
                <span className={`event-type ${event.type.toLowerCase()}`}>{event.type}</span>
              </div>
              <div className="event-dates">
                <span className="start-date">{formatDate(event.start_date)}</span>
                {event.start_date !== event.end_date && (
                  <>
                    <span className="date-separator"> - </span>
                    <span className="end-date">{formatDate(event.end_date)}</span>
                  </>
                )}
              </div>
              <div className="event-description">
                <p>{event.description}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="calendar-actions">
        <button className="btn-primary">Download Calendar</button>
        <button className="btn-secondary">Subscribe to Calendar</button>
      </div>
    </div>
  );
};

export default AcademicCalendar;
