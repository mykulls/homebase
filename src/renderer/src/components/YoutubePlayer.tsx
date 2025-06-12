import React, { useState, useRef, useEffect, FormEvent } from "react";
import "./YoutubePlayer.css";

interface YoutubePlayerProps {
  width: number;
  audioOnly?: boolean;
}

function YoutubePlayer({ width, audioOnly = false }: YoutubePlayerProps) {
  const [isPlaying, setPlaying] = useState(false);
  const [videoId, setVideoId] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [volume, setVolume] = useState(100);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const ytPlayer = useRef<YT.Player | null>(null);

  const DEFAULT_WIDTH = width - 40;
  const DEFAULT_HEIGHT = DEFAULT_WIDTH * 0.5625; // 16:9

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
          onReady: () => {
            // console.log("Player ready");
          },
          onStateChange: (event) => {
            // Video has started playing at least once
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsInitialized(true);
            }
          },
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

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(event.target.value, 10);
    setVolume(newVolume);
    if (ytPlayer.current) {
      ytPlayer.current.setVolume(newVolume);
    }
  };

  const Controls = () => (
    <>
      <div className="button-container">
        <button onClick={() => skip(-10)} style={{ padding: "8px 12px" }}>
          <i className="bi bi-skip-start"></i> 10
        </button>
      </div>
      <div className="button-container">
        <button onClick={handlePlayPause} style={{ padding: "8px 12px" }}>
          {isPlaying ? <i className="bi bi-pause-fill"></i> : <i className="bi bi-play"></i>}
        </button>
      </div>
      <div className="button-container">
        <button onClick={() => skip(10)} style={{ padding: "8px 12px" }}>
          <i className="bi bi-skip-end"></i> 10
        </button>
      </div>
    </>
  );

  return (
    <div className="youtube-container">
      <form
        className="youtube-link"
        onSubmit={handleSubmit}
        style={{ marginBottom: "8px", display: "flex", gap: "8px" }}
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
              border: "1px solid #eee",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <div
              ref={playerContainerRef}
              id="yt-player"
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            />
            {!audioOnly && isInitialized && (
              <div className="video-controls-overlay">
                <Controls />
              </div>
            )}
          </div>

          {audioOnly && (
            <div className="audio-controls">
              <Controls />
            </div>
          )}
          <div className="volume-control">
            <div className="volume-control-wrapper">
              <i className="bi bi-volume-up"></i>
              <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} />
              <span>{volume}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default YoutubePlayer;
