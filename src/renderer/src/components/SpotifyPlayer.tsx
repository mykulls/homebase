import React, { useState, useEffect } from "react";
import { generateRandomString, sha256, base64encode } from "../utils/spotify";
import "./SpotifyPlayer.css";

interface SpotifyPlayerProps {
  audioOnly?: boolean;
}

interface CurrentTrack {
  id: string;
  name: string;
  artist: string;
  duration_ms: number;
}

interface Device {
  id: string;
  name: string;
  is_active: boolean;
  type: string;
}

function formatTime(ms: number) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function SpotifyPlayer({ audioOnly = false }: SpotifyPlayerProps) {
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeDevice, setActiveDevice] = useState<Device | null>(null);
  const [progressMs, setProgressMs] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState<number | null>(null);
  const [volume, setVolume] = useState(50);
  const [pendingVolume, setPendingVolume] = useState<number | null>(null);
  const [volumeChanging, setVolumeChanging] = useState(false);

  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

  useEffect(() => {
    window.electron?.onSpotifyCallback((data) => {
      const { code, state } = data;
      const storedState = localStorage.getItem("spotify_auth_state");
      const storedCodeVerifier = localStorage.getItem("spotify_code_verifier");

      if (state && storedState === state && storedCodeVerifier) {
        exchangeCodeForToken(code, storedCodeVerifier);
      }
    });

    // Check for existing token
    const savedToken = localStorage.getItem("spotify_access_token");
    if (savedToken) {
      // Validate token by making a test request
      fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      })
        .then((res) => {
          if (res.status === 401) {
            localStorage.removeItem("spotify_access_token");
            setAccessToken(null);
            setIsAuthorized(false);
          } else if (res.ok) {
            setAccessToken(savedToken);
            setIsAuthorized(true);
          }
        })
        .catch(() => {
          localStorage.removeItem("spotify_access_token");
          setAccessToken(null);
          setIsAuthorized(false);
        });
    }
  }, []);

  const exchangeCodeForToken = async (code: string, codeVerifier: string) => {
    try {
      const tokenUrl = "https://accounts.spotify.com/api/token";
      const payload = {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      };

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${window.btoa(`${clientId}:${clientSecret}`)}`,
        },
        body: new URLSearchParams(payload).toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Token exchange failed:", response.status, errorText);
        return;
      }

      const data = await response.json();
      if (data.access_token) {
        setAccessToken(data.access_token);
        setIsAuthorized(true);
        localStorage.setItem("spotify_access_token", data.access_token);
      }
    } catch (error) {
      console.error("Error exchanging code for token:", error);
    }
  };

  const handleAuth = async () => {
    const state = generateRandomString(16);
    const codeVerifier = generateRandomString(64);
    const codeChallenge = base64encode(await sha256(codeVerifier));

    localStorage.setItem("spotify_auth_state", state);
    localStorage.setItem("spotify_code_verifier", codeVerifier);

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      state: state,
      scope: "user-read-playback-state user-modify-playback-state user-read-email user-read-private streaming",
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
    });

    window.electron?.openExternal(`https://accounts.spotify.com/authorize?${params.toString()}`);
  };

  useEffect(() => {
    if (!accessToken) return;

    const fetchCurrentTrack = async () => {
      try {
        const response = await fetch("https://api.spotify.com/v1/me/player", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 204) {
          setIsPlaying(false);
          return;
        }

        const data = await response.json();

        if (data?.item) {
          setCurrentTrack({
            id: data.item.id,
            name: data.item.name,
            artist: data.item.artists[0].name,
            duration_ms: data.item.duration_ms,
          });
          setProgressMs(data.progress_ms || 0);
        }

        setIsPlaying(data.is_playing);
        if (typeof data.device?.volume_percent === "number") {
          setVolume(data.device.volume_percent);
        }
      } catch (error) {
        console.error("Error fetching current track:", error);
      }
    };

    const interval = setInterval(fetchCurrentTrack, 1000);
    fetchCurrentTrack();

    return () => clearInterval(interval);
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    const fetchDevices = async () => {
      try {
        const response = await fetch("https://api.spotify.com/v1/me/player/devices", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await response.json();
        setDevices(data.devices);
        const active = data.devices.find((d: Device) => d.is_active);
        if (active) setActiveDevice(active);
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };

    const interval = setInterval(fetchDevices, 5000);
    fetchDevices();

    return () => clearInterval(interval);
  }, [accessToken]);

  const transferPlayback = async (deviceId: string, play: boolean = true) => {
    if (!accessToken) return;

    try {
      await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play,
        }),
      });
    } catch (error) {
      console.error("Error transferring playback:", error);
    }
  };

  const handlePlayPause = async () => {
    if (!accessToken) return;
    if (!activeDevice) {
      console.warn("No active device found");
      return;
    }

    let targetDeviceId = activeDevice?.id;
    let shouldTransfer = false;
    // switch to computer on play (past state was paused = !isPlaying)
    if (!isPlaying) {
      // Try to find a computer device (type === "Computer")
      const computerDevice = devices.find((d) => d.type === "Computer");

      if (computerDevice && !computerDevice.is_active) {
        targetDeviceId = computerDevice.id;
        shouldTransfer = true;
      }

      if (shouldTransfer && targetDeviceId) {
        await transferPlayback(targetDeviceId, true);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    const endpoint = isPlaying
      ? "https://api.spotify.com/v1/me/player/pause"
      : "https://api.spotify.com/v1/me/player/play";

    if (targetDeviceId) {
      await fetch(endpoint + (targetDeviceId ? `?device_id=${targetDeviceId}` : ""), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
    }
  };

  const handleNext = async () => {
    if (!accessToken || !activeDevice) return;
    await fetch(`https://api.spotify.com/v1/me/player/next?device_id=${activeDevice.id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  };

  const handlePrevious = async () => {
    if (!accessToken || !activeDevice) return;
    await fetch(`https://api.spotify.com/v1/me/player/previous?device_id=${activeDevice.id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  };

  const handleSeekChange = (ms: number) => {
    setSeeking(true);
    setSeekValue(ms);
    setProgressMs(ms);
  };

  const handleSeekCommit = async () => {
    if (!accessToken || !activeDevice || seekValue === null) {
      setSeeking(false);
      return;
    }
    await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${seekValue}&device_id=${activeDevice.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setProgressMs(seekValue);
    setSeeking(false);
    setSeekValue(null);
  };

  const handleVolumeSliderChange = (value: number) => {
    setVolumeChanging(true);
    setPendingVolume(value);
    setVolume(value);
  };

  const handleVolumeCommit = async () => {
    if (!accessToken || !activeDevice || pendingVolume === null) {
      setVolumeChanging(false);
      return;
    }
    await fetch(
      `https://api.spotify.com/v1/me/player/volume?volume_percent=${pendingVolume}&device_id=${activeDevice.id}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    setVolume(pendingVolume);
    setVolumeChanging(false);
    setPendingVolume(null);
  };

  return (
    <div className="container">
      {!isAuthorized ? (
        <div className="button-container">
          <button onClick={handleAuth}>Sign in with Spotify</button>
        </div>
      ) : (
        <>
          {currentTrack ? (
            <>
              <div className="track" style={{ fontSize: audioOnly ? 10 : 16 }}>
                <div style={{ fontWeight: 600, marginBottom: "4px" }}>{currentTrack.name}</div>
                <div style={{ opacity: 0.69 }}>{currentTrack.artist}</div>
              </div>

              <div className="slider playback">
                <div className="slider-wrapper">
                  <span>{formatTime(seeking && seekValue !== null ? seekValue : progressMs)}</span>
                  <input
                    type="range"
                    min={0}
                    max={currentTrack.duration_ms}
                    value={seeking && seekValue !== null ? seekValue : progressMs}
                    onChange={(e) => handleSeekChange(Number(e.target.value))}
                    onMouseUp={handleSeekCommit}
                    onTouchEnd={handleSeekCommit}
                  />
                  <span>{formatTime(currentTrack.duration_ms)}</span>
                </div>
              </div>

              <div
                className="audio-controls"
                style={{ marginTop: audioOnly ? 4 : 12, marginBottom: audioOnly ? 4 : 12 }}
              >
                <div className="button-container" style={{ height: audioOnly ? 20 : 32 }}>
                  <button onClick={handlePrevious}>
                    <i className="bi bi-skip-start"></i>
                  </button>
                </div>
                <div className="button-container" style={{ height: audioOnly ? 20 : 32 }}>
                  <button onClick={handlePlayPause}>
                    {isPlaying ? <i className="bi bi-pause-fill"></i> : <i className="bi bi-play"></i>}
                  </button>
                </div>
                <div className="button-container" style={{ height: audioOnly ? 20 : 32 }}>
                  <button onClick={handleNext}>
                    <i className="bi bi-skip-end"></i>
                  </button>
                </div>
              </div>

              <div className="slider">
                <div className="slider-wrapper">
                  <i className="bi bi-volume-up"></i>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={volumeChanging && pendingVolume !== null ? pendingVolume : volume}
                    onChange={(e) => handleVolumeSliderChange(Number(e.target.value))}
                    onMouseUp={handleVolumeCommit}
                    onTouchEnd={handleVolumeCommit}
                  />
                  <span>{volumeChanging && pendingVolume !== null ? pendingVolume : volume}</span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "20px" }}>
              {/* Always show last known track if available */}
              {currentTrack === null ? "Open Spotify on any device to see your currently playing track" : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SpotifyPlayer;
