import React, { useState, useRef, useEffect, FormEvent } from "react";
import "./YoutubePlayer.css";

interface YoutubePlayerProps {
  audioOnly?: boolean;
}

function YoutubePlayer({ audioOnly = false }: YoutubePlayerProps) {
  const [isPlaying, setPlaying] = useState(false);
  const [videoId, setVideoId] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const ytPlayer = useRef<YT.Player | null>(null);

  const DEFAULT_WIDTH = 384;
  const DEFAULT_HEIGHT = 216;

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = () => loadPlayer();
    } else {
      loadPlayer();
    }
  }, [videoId]);

  const extractVideoId = (url: string): string | null => {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/);
    return match ? match[1] : null;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const id = extractVideoId(input);
    if (id) {
      setVideoId(id);
    } else {
      alert("Invalid YouTube link");
    }
  };

  const loadPlayer = () => {
    if (videoId && playerContainerRef.current) {
      ytPlayer.current = new window.YT.Player(playerContainerRef.current, {
        height: DEFAULT_HEIGHT.toString(),
        width: DEFAULT_WIDTH.toString(),
        videoId,
        playerVars: {
          controls: 0, // Hide YouTube controls
          modestbranding: 1, // Reduce YouTube branding
          rel: 0, // Don't show related videos after playback
          showinfo: 0, // Hide video info like title and uploader
          iv_load_policy: 3, // Disable annotations
          fs: 0, // Disable fullscreen button
          autohide: 1, // Hide controls after a few seconds
        },
        events: {
          onReady: () => console.log("Player ready"),
        },
      });
    }
  };

  const handlePlayPause = () => {
    const player = ytPlayer.current;
    if (!player) return;

    const state = player.getPlayerState();
    if (state === window.YT.PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
    setPlaying(!isPlaying);
  };

  const skip = (seconds: number) => {
    const player = ytPlayer.current;
    if (player) {
      const currentTime = player.getCurrentTime();
      player.seekTo(currentTime + seconds, true);
    }
  };

  return (
    <div className="youtube-container">
      <form
        className="youtube-link"
        onSubmit={handleSubmit}
        style={{ marginBottom: "16px", display: "flex", gap: "8px" }}
      >
        <input
          type="text"
          placeholder="Paste YouTube link"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: "8px", zIndex: 1 }}
        />
        <div className="button-container">
          <button type="submit" style={{ padding: "8px 16px" }}>
            Load
          </button>
        </div>
      </form>

      {videoId && (
        <>
          <div
            style={{
              display: audioOnly ? "none" : "flex",
              opacity: audioOnly ? 0 : 1,
              position: "relative",
              width: `${DEFAULT_WIDTH}px`,
              height: `${DEFAULT_HEIGHT}px`,
              marginBottom: "16px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              ref={playerContainerRef}
              id="yt-player"
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            ></div>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <div className="button-container">
              <button onClick={handlePlayPause} style={{ padding: "8px 12px" }}>
                {isPlaying ? (
                  <i className="bi bi-pause-fill" style={{ marginTop: 2 }}></i>
                ) : (
                  <i className="bi bi-play" style={{ marginTop: 2 }}></i>
                )}
              </button>
            </div>
            <div className="button-container">
              <button onClick={() => skip(-10)} style={{ padding: "8px 12px" }}>
                <i className="bi bi-skip-start" style={{ marginTop: 2 }}></i> 10
              </button>
            </div>
            <div className="button-container">
              <button onClick={() => skip(10)} style={{ padding: "8px 12px" }}>
                <i className="bi bi-skip-end" style={{ marginTop: 2 }}></i> 10
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default YoutubePlayer;
