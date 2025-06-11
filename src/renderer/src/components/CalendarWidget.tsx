import React, { useState, useEffect } from "react";
import ICAL from "ical.js";

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
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Failed to fetch or parse ICS.");
      });
  }, [icsUrl]);

  return (
    <div style={{ padding: "16px", maxWidth: "600px", margin: "0 auto" }}>
      <h3>Today's Events</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ maxHeight: "300px", overflowY: "auto", marginTop: "16px" }}>
        {events.map((event, index) => (
          <div
            key={index}
            style={{
              padding: "12px",
              marginBottom: "8px",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px",
              border: "1px solid #dee2e6",
            }}
          >
            <div style={{ fontWeight: "bold" }}>{event.summary}</div>
            <div style={{ fontSize: "14px", color: "#666" }}>
              {new Date(event.start).toLocaleTimeString()} – {new Date(event.end).toLocaleTimeString()}
            </div>
            {event.location && <div style={{ fontSize: "14px", color: "#333" }}>📍 {event.location}</div>}
          </div>
        ))}
        {events.length === 0 && !error && (
          <div style={{ textAlign: "center", color: "#666" }}>No events scheduled for today</div>
        )}
      </div>
    </div>
  );
}

export default CalendarWidget;
