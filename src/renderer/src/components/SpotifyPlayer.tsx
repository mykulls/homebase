import React, { useState, useEffect } from "react";
import { generateRandomString, sha256, base64encode } from "../utils/spotify";

interface SpotifyPlayerProps {
  audioOnly?: boolean;
}

interface CurrentTrack {
  id: string;
  name: string;
  artist: string;
  isPlaying: boolean;
}

function SpotifyPlayer({ audioOnly = false }: SpotifyPlayerProps) {
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

  useEffect(() => {
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
      scope: "user-read-playback-state user-modify-playback-state",
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
    });

    // Open auth in default browser instead of new window
    window.electron?.openExternal(`https://accounts.spotify.com/authorize?${params.toString()}`);
  };

  // Add polling for current track
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
          setCurrentTrack(null);
          return;
        }

        const data = await response.json();
        if (data && data.item) {
          setCurrentTrack({
            id: data.item.id,
            name: data.item.name,
            artist: data.item.artists[0].name,
            isPlaying: data.is_playing,
          });
        }
      } catch (error) {
        console.error("Error fetching current track:", error);
      }
    };

    // Poll every 3 seconds
    const interval = setInterval(fetchCurrentTrack, 3000);
    fetchCurrentTrack(); // Initial fetch

    return () => clearInterval(interval);
  }, [accessToken]);

  const handlePlayPause = async () => {
    if (!accessToken) return;

    try {
      const endpoint = currentTrack?.isPlaying ? "pause" : "play";
      await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
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
                  src={`https://open.spotify.com/embed/track/${currentTrack.id}`}
                  width="100%"
                  height="80"
                  allow="encrypted-media"
                  title="Spotify Player"
                ></iframe>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button onClick={handlePlayPause} style={{ padding: "8px 12px" }}>
                  {currentTrack.isPlaying ? "Pause" : "Play"}
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "20px" }}>No track currently playing</div>
          )}
        </>
      )}
    </div>
  );
}

export default SpotifyPlayer;
