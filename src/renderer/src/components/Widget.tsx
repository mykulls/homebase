import React from "react";
import YoutubePlayer from "./YoutubePlayer";

interface WidgetProps {
  audioOnly?: boolean;
}

function Widget({ audioOnly }: WidgetProps) {
  return (
    <div className="clickable">
      <YoutubePlayer audioOnly={audioOnly} />
    </div>
  );
}

export default Widget;
