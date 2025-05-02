import React from "react";
import YouTubePlayerWithControls from "./YoutubePlayer";

interface TestProps {
  audioOnly?: boolean;
}

function Test({ audioOnly }: TestProps) {
  return (
    <div className="clickable">
      <YouTubePlayerWithControls audioOnly={audioOnly} />
    </div>
  );
}

export default Test;
