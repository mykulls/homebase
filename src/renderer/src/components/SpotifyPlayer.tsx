import React, { useState } from "react";

interface SpotifyPlayerProps {
  audioOnly?: boolean;
}

function SpotifyPlayer({ audioOnly = false }: SpotifyPlayerProps) {
  const [trackId, setTrackId] = useState<string>("");
  const [input, setInput] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractTrackId(input);
    if (id) {
      setTrackId(id);
    } else {
      alert("Invalid Spotify link");
    }
  };

  const extractTrackId = (url: string): string | null => {
    const match = url.match(/(?:https?:\/\/)?(?:open\.spotify\.com\/(?:intl-[a-z]+\/)?track\/)([^\s?]+)/);
    return match ? match[1] : null;
  };

  const handlePlayPause = () => {
    console.log("Play/Pause functionality for Spotify");
  };

  const skip = (seconds: number) => {
    console.log(`Skip ${seconds} seconds for Spotify`);
  };

  return (
    <div style={{ padding: "16px", maxWidth: "600px", margin: "0 auto" }}>
      <form onSubmit={handleSubmit} style={{ marginBottom: "16px", display: "flex", gap: "8px" }}>
        <input
          type="text"
          placeholder="Paste Spotify track link"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: "8px", zIndex: 1 }}
        />
        <button type="submit" style={{ padding: "8px 16px" }}>
          Load
        </button>
      </form>

      {trackId && (
        <>
          <div
            style={{
              display: audioOnly ? "none" : "flex",
              opacity: audioOnly ? 0 : 1,
              position: "relative",
              width: "100%",
              height: "80px",
              marginBottom: "16px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <iframe
              src={`https://open.spotify.com/embed/track/${trackId}`}
              width="100%"
              height="80"
              allow="encrypted-media"
              title="Spotify Player"
            ></iframe>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button onClick={handlePlayPause} style={{ padding: "8px 12px" }}>
              Play / Pause
            </button>
            <button onClick={() => skip(-10)} style={{ padding: "8px 12px" }}>
              ⏪ -10s
            </button>
            <button onClick={() => skip(10)} style={{ padding: "8px 12px" }}>
              ⏩ +10s
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default SpotifyPlayer;
