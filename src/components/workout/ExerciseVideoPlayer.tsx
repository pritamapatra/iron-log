"use client";

import { useEffect, useRef, useState } from "react";

interface ExerciseVideoPlayerProps {
  youtubeVideoId: string;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: HTMLElement,
        options: {
          videoId: string;
          playerVars?: Record<string, number>;
        }
      ) => unknown;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

let isApiScriptLoading = false;

function loadYouTubeApi(onReady: () => void) {
  if (window.YT && window.YT.Player) {
    onReady();
    return;
  }

  const existingCallback = window.onYouTubeIframeAPIReady;

  window.onYouTubeIframeAPIReady = () => {
    if (existingCallback) existingCallback();
    onReady();
  };

  if (isApiScriptLoading) return;
  isApiScriptLoading = true;

  const script = document.createElement("script");
  script.src = "https://www.youtube.com/iframe_api";
  document.body.appendChild(script);
}

export function ExerciseVideoPlayer({
  youtubeVideoId,
}: ExerciseVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    loadYouTubeApi(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (!isReady || !containerRef.current) return;

    new window.YT.Player(containerRef.current, {
      videoId: youtubeVideoId,
      playerVars: {
        rel: 0,
        modestbranding: 1,
      },
    });
  }, [isReady, youtubeVideoId]);

  useEffect(() => {
    if (!anchorRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCollapsed(!entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    observer.observe(anchorRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={anchorRef}>
      <div
        onClick={() => isCollapsed && setIsCollapsed(false)}
        className={
          isCollapsed
            ? "fixed right-4 top-4 z-40 w-32 cursor-pointer overflow-hidden rounded-xl bg-black shadow-lg aspect-video"
            : "aspect-video w-full overflow-hidden rounded-2xl bg-black"
        }
      >
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}