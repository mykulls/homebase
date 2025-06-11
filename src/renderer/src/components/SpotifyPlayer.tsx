import React, { useState, useEffect } from "react";
import { generateRandomString, sha256, base64encode } from "../utils/spotify";

interface SpotifyPlayerProps {
  audioOnly?: boolean;
}

interface CurrentTrack {
  id: string;
  name: string;
  artist: string;
}

interface Device {
  id: string;
  name: string;
  is_active: boolean;
  type: string;
}

function SpotifyPlayer({ audioOnly = false }: SpotifyPlayerProps) {
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeDevice, setActiveDevice] = useState<Device | null>(null);
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [webPlaybackDeviceId, setWebPlaybackDeviceId] = useState<string>("");

  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

  useEffect(() => {
    // localStorage.getItem("spotify_access_token"); // need if i want to reset the token
    // Listen for OAuth callback from main process
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
      setAccessToken(savedToken);
      setIsAuthorized(true);
    }
  }, []);

  const exchangeCodeForToken = async (code: string, codeVerifier: string) => {
    try {
      const tokenUrl = "https://accounts.spotify.com/api/token";
      const payload = {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri, // Hardcode this to ensure it matches exactly
        code_verifier: codeVerifier,
      };

      console.log("Token request payload:", payload); // Debug logging

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

    // Store state and code verifier
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

    // Open auth in default browser instead of new window
    window.electron?.openExternal(`https://accounts.spotify.com/authorize?${params.toString()}`);
  };

  // Modify the polling effect
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
          // Don't clear current track, just set isPlaying to false
          setIsPlaying(false);
          return;
        }

        const data = await response.json();

        // Update track info only if it changed
        if (data?.item?.id !== currentTrack?.id) {
          setCurrentTrack({
            id: data.item.id,
            name: data.item.name,
            artist: data.item.artists[0].name,
          });
        }

        // Always update playing state
        setIsPlaying(data.is_playing);
      } catch (error) {
        console.error("Error fetching current track:", error);
      }
    };

    // Poll more frequently to better sync play state
    const interval = setInterval(fetchCurrentTrack, 1000);
    fetchCurrentTrack();

    return () => clearInterval(interval);
  }, [accessToken, currentTrack?.id]);

  // Add this new effect to fetch devices
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

    // Poll for devices every 5 seconds
    const interval = setInterval(fetchDevices, 5000);
    fetchDevices();

    return () => clearInterval(interval);
  }, [accessToken]);

  // Add this new function to transfer playback
  const transferPlayback = async (deviceId: string) => {
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
          play: isPlaying, // Maintain current playing state
        }),
      });
    } catch (error) {
      console.error("Error transferring playback:", error);
    }
  };

  // Add Web Playback SDK initialization
  useEffect(() => {
    if (!accessToken) return;

    // Create script element for Spotify SDK
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    // Append script to document
    document.body.appendChild(script);

    // Define callback before adding script
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Homebase Web Player",
        getOAuthToken: (cb) => {
          cb(accessToken);
        },
        volume: 0.5,
      });

      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        setWebPlaybackDeviceId(device_id);
        setPlayer(player);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) return;

        setIsPlaying(!state.paused);
        if (state.track_window.current_track) {
          setCurrentTrack({
            id: state.track_window.current_track.id,
            name: state.track_window.current_track.name,
            artist: state.track_window.current_track.artists[0].name,
          });
        }
      });

      player.connect();
    };

    // Cleanup function to remove script and disconnect player
    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [accessToken]);

  // Update handlePlayPause to transfer playback to web player
  const handlePlayPause = async () => {
    if (!accessToken || !webPlaybackDeviceId) return;

    try {
      // If we're not the active device, transfer playback to web player first
      if (activeDevice?.id !== webPlaybackDeviceId) {
        await transferPlayback(webPlaybackDeviceId);
        // Wait a brief moment for the transfer to complete
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      // Now use the Web Playback SDK controls
      if (player) {
        if (isPlaying) {
          await player.pause();
        } else {
          await player.resume();
        }
      }
    } catch (error) {
      console.error("Error controlling playback:", error);
    }
  };

  return (
    <div style={{ padding: "16px", maxWidth: "600px", margin: "0 auto" }}>
      {!isAuthorized ? (
        <button onClick={handleAuth} className="sign-in">
          Sign in with Spotify
        </button>
      ) : (
        <>
          {currentTrack ? (
            <>
              <div style={{ marginBottom: "16px" }}>
                <select
                  value={activeDevice?.id || ""}
                  onChange={(e) => transferPlayback(e.target.value)}
                  style={{
                    padding: "8px",
                    width: "100%",
                    marginBottom: "8px",
                    borderRadius: "4px",
                  }}
                >
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name} {device.is_active ? "(Active)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button onClick={handlePlayPause} style={{ padding: "8px 12px" }}>
                  {isPlaying ? "Pause" : "Play"}
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "20px" }}>
              Open Spotify on any device to see your currently playing track
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SpotifyPlayer;
