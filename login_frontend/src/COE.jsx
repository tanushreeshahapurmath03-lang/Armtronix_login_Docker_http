
import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import HeaderSidebar_admin from './HeaderSidebar_admin.jsx';
import './COE.css';
import axios from 'axios';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
    baseURL: backendURL,
});

const formatKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const COEPage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState({});
    const [newEvent, setNewEvent] = useState('');
    const calendarRef = useRef(null);
    const [calendarKey, setCalendarKey] = useState(0);

    // Transform events to FullCalendar format (empty titles)
    const getCalendarEvents = () => {
        return Object.entries(events).flatMap(([date, eventList]) => {
            // Check if any event is a holiday
            const hasHoliday = eventList.some(e => e.toLowerCase().includes('holiday'));
            return [{
                title: '', // Empty title to hide text
                date: date,
                className: hasHoliday ? 'holiday-indicator' : 'event-indicator',
                display: 'background' // This will color the whole day cell
            }];
        });
    };


    const handleAddEvent = async () => {
        const key = formatKey(selectedDate);
        if (!newEvent.trim()) return;

        try {
            const res = await fetch(`${backendURL}/api/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: key,
                    event: newEvent.trim(),
                }),
            });

            if (res.ok) {
                setEvents((prev) => ({
                    ...prev,
                    [key]: [...(prev[key] || []), newEvent.trim()],
                }));
                setNewEvent('');
                setCalendarKey(prev => prev + 1);
            }
        } catch (err) {
            console.error('Error adding event:', err);
        }
    };

    const handleDeleteEvent = async (date, event) => {
        try {
            const res = await fetch(`${backendURL}/api/events`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ date, event }),
            });

            if (res.ok) {
                setEvents((prev) => {
                    const updatedEvents = { ...prev };
                    updatedEvents[date] = updatedEvents[date].filter((e) => e !== event);
                    if (updatedEvents[date].length === 0) {
                        delete updatedEvents[date];
                    }
                    return updatedEvents;
                });
                setCalendarKey(prev => prev + 1);
            }
        } catch (err) {
            console.error('Error deleting event:', err);
        }
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch(`${backendURL}/api/events`);
                const data = await res.json();

                const eventsFromDB = {};
                data.forEach((item) => {
                    eventsFromDB[item.date] = item.events;
                });

                setEvents(eventsFromDB);
            } catch (err) {
                console.error('Error fetching events:', err);
            }
        };

        fetchEvents();
    }, [selectedDate]);

    const monthEvents = Object.entries(events).filter(([dateStr]) => {
        const date = new Date(dateStr);
        return (
            date.getMonth() === selectedDate.getMonth() && 
            date.getFullYear() === selectedDate.getFullYear()
        );
    });

    return (
        <div className="dashboard-container">
            <HeaderSidebar_admin />
            <main className="main-content1">
                <h2>Calendar of Events (COE)</h2>

                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px' }}>
                    <div>
                        <div className="calendar-container">
                            <FullCalendar
                                key={calendarKey}
                                ref={calendarRef}
                                plugins={[dayGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                events={getCalendarEvents()}
                                headerToolbar={{
                                    left: 'prev',
                                    center: 'title',
                                    right: 'next'
                                }}
                                titleFormat={{ month: 'long', year: 'numeric' }}
                                dateClick={(info) => {
                                    setSelectedDate(info.date);
                                }}
                                height="auto"
                                fixedWeekCount={false}
                                eventContent={() => null} // Hide all event content
                                dayCellClassNames={(arg) => {
                                    const today = new Date();
                                    if (
                                        arg.date.getDate() === today.getDate() &&
                                        arg.date.getMonth() === today.getMonth() &&
                                        arg.date.getFullYear() === today.getFullYear()
                                    ) {
                                        return 'fc-day-today';
                                    }
                                    return '';
                                }}
                            />
                        </div>

                        <div className="calendar-container1">
                            <h4>Add Event on {selectedDate.toLocaleDateString('en-GB')}</h4>
                            <input
                                type="text"
                                value={newEvent}
                                onChange={(e) => setNewEvent(e.target.value)}
                                placeholder="Event or Holiday name"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') handleAddEvent();
                                }}
                            />
                            <button className="COEbutton" onClick={handleAddEvent}>
                                Add Event
                            </button>
                        </div>
                    </div>

                    <div className="event-list-container">
                        <h3 className="event-list-title">
                            Events & Holidays in {selectedDate.toLocaleString('default', { month: 'long' })} {selectedDate.getFullYear()}
                        </h3>

                        <div className="event-list-scroll">
                            {monthEvents.map(([dateStr, eventList]) => {
                                const formattedDate = new Date(dateStr).toLocaleDateString('en-GB');
                                return (
                                    <div key={dateStr}>
                                        <div className="event-date">{formattedDate}</div>
                                        {eventList.map((event, i) => (
                                            <div
                                                key={i}
                                                className={`event-item ${event.toLowerCase().includes('holiday') ? 'event-item-holiday' : 'event-item-regular'}`}
                                            >
                                                <span className="event-bullet" />
                                                <span className="event-text">{event}</span>
                                                <button
                                                    onClick={() => handleDeleteEvent(dateStr, event)}
                                                    className="delete-event-btn"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default COEPage;