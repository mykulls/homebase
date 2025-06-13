import React, { useState, useEffect } from "react";
import ICAL from "ical.js";
import "./CalendarWidget.css";

interface CalendarEvent {
  summary: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
}

function CalendarWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const icsUrl = import.meta.env.VITE_ICS_URL;

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const parseIcsText = (ics: string): CalendarEvent[] => {
    try {
      const jcalData = ICAL.parse(ics);
      const comp = new ICAL.Component(jcalData);
      const vevents = comp.getAllSubcomponents("vevent");

      return vevents.map((vevent) => {
        const event = new ICAL.Event(vevent);
        return {
          summary: event.summary,
          start: event.startDate.toJSDate().toISOString(),
          end: event.endDate.toJSDate().toISOString(),
          location: event.location,
          description: event.description,
        };
      });
    } catch (err) {
      setError("Failed to parse ICS file.");
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    setError(null);
    setLoading(true);
    fetch(icsUrl)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch ICS file.");
        return response.text();
      })
      .then((icsText) => {
        const parsedEvents = parseIcsText(icsText);
        // Filter events for only today's
        const todaysEvents = parsedEvents.filter((event) => isToday(event.start));
        setEvents(todaysEvents);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Failed to fetch or parse ICS.");
      });
  }, [icsUrl]);

  return (
    <div className="container">
      <h3>Today's Events</h3>
      <div className="calendar-scroll">
        {events.map((event, index) => (
          <div key={index} className="event">
            <div style={{ fontWeight: 600 }}>{event.summary}</div>
            <div style={{ opacity: 0.8, fontSize: "14px" }}>
              {new Date(event.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
              {new Date(event.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            {event.location && <div style={{ fontSize: "14px", opacity: 0.8 }}>📍 {event.location}</div>}
          </div>
        ))}
        {events.length === 0 && !error && (
          <div style={{ textAlign: "center", opacity: 0.8 }}>
            {loading ? "Loading..." : "No events scheduled for today"}
          </div>
        )}
      </div>
    </div>
  );
}

export default CalendarWidget;
