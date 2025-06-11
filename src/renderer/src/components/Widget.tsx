import React from "react";
import YoutubePlayer from "./YoutubePlayer";
import SpotifyPlayer from "./SpotifyPlayer";
import CalendarWidget from "./CalendarWidget";

export enum WidgetType {
  None = -1,
  Youtube = 0,
  Spotify = 1,
  Calendar = 2,
}

interface WidgetProps {
  audioOnly?: boolean;
  type: WidgetType;
}

function Widget({ audioOnly, type }: WidgetProps) {
  let widget: any = null;
  switch (type) {
    case WidgetType.Youtube:
      widget = <YoutubePlayer audioOnly={audioOnly} />;
      break;
    case WidgetType.Spotify:
      widget = <SpotifyPlayer audioOnly={audioOnly} />;
      break;
    case WidgetType.Calendar:
      widget = <CalendarWidget />;
      break;
    default:
      widget = null;
      break;
  }

  return <div className="clickable">{widget}</div>;
}

export default Widget;
