import React from "react";
import YoutubePlayer from "./YoutubePlayer";
import SpotifyPlayer from "./SpotifyPlayer";

export enum WidgetType {
  None = -1,
  Youtube = 0,
  Spotify = 1,
}

interface WidgetProps {
  audioOnly?: boolean;
  type: WidgetType;
}

function Widget({ audioOnly, type }: WidgetProps) {
  if (type === WidgetType.None) {
    return null;
  }

  return (
    <div className="clickable">
      {type === WidgetType.Youtube ? <YoutubePlayer audioOnly={audioOnly} /> : <SpotifyPlayer audioOnly={audioOnly} />}
    </div>
  );
}

export default Widget;
