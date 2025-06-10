import React, { useEffect, useState } from "react";

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
}

function CalendarWidget() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await window.electron?.googleAuth();
      setIsSignedIn(true);
      console.log("Signed in successfully");
      await fetchEvents();
      console.log("Events fetched successfully");
    } catch (err) {
      console.error("Auth failed:", err);
      setError("Authentication failed. Please try again.");
      setIsSignedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    if (!isSignedIn) {
      setError("Please sign in first");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedEvents = await window.electron?.getEvents();

      if (!fetchedEvents) {
        throw new Error("No events received");
      }

      const formattedEvents: CalendarEvent[] = fetchedEvents.map((event: any) => ({
        id: event.id,
        summary: event.summary,
        start: { dateTime: event.start.dateTime || event.start.date },
        end: { dateTime: event.end.dateTime || event.end.date },
      }));

      setEvents(formattedEvents);
    } catch (err) {
      console.error("Fetching events failed:", err);
      if ((err as Error).message.includes("Not authenticated")) {
        setIsSignedIn(false);
        setError("Please sign in to view your calendar");
      } else {
        setError("Failed to fetch events. Please try again.");
      }
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Remove the initialization useEffect since we want to show the sign-in button first

  if (loading) {
    return (
      <div style={{ padding: "16px", maxWidth: "600px", display: "flex", justifyContent: "center" }}>Loading...</div>
    );
  }

  if (!isSignedIn || error) {
    return (
      <div style={{ padding: "16px", maxWidth: "600px", textAlign: "center" }}>
        {error && <p style={{ color: "red", marginBottom: "16px" }}>{error}</p>}
        <button
          onClick={handleSignIn}
          style={{
            padding: "8px 16px",
            backgroundColor: "#4285f4",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px", maxWidth: "600px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ margin: 0 }}>Today's Events</h3>
        <button
          onClick={() => fetchEvents()}
          style={{
            padding: "4px 8px",
            backgroundColor: "#4285f4",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          Refresh
        </button>
      </div>
      {events.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {events.map((event) => (
            <li
              key={event.id}
              style={{
                padding: "12px",
                marginBottom: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "4px",
              }}
            >
              <strong>{event.summary}</strong>
              <br />
              <span style={{ fontSize: "14px", opacity: 0.8 }}>
                {new Date(event.start.dateTime).toLocaleTimeString()} –{" "}
                {new Date(event.end.dateTime).toLocaleTimeString()}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ textAlign: "center", color: "#666" }}>No events scheduled for today</p>
      )}
    </div>
  );
}

export default CalendarWidget;
