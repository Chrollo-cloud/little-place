import { useEffect, useRef, useState } from "react";
import { site } from "../data/content";

export function AudioManager({
  enabled,
  musicArea,
}: {
  enabled: boolean;
  musicArea: boolean;
}) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const wasPlaying = useRef(false);
  const startedForThisEntry = useRef(false);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;

    const syncPlayingState = () => setPlaying(!audio.paused);

    syncPlayingState();
    audio.addEventListener("play", syncPlayingState);
    audio.addEventListener("playing", syncPlayingState);
    audio.addEventListener("pause", syncPlayingState);
    audio.addEventListener("ended", syncPlayingState);

    return () => {
      audio.removeEventListener("play", syncPlayingState);
      audio.removeEventListener("playing", syncPlayingState);
      audio.removeEventListener("pause", syncPlayingState);
      audio.removeEventListener("ended", syncPlayingState);
    };
  }, [enabled]);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;

    if (!enabled) {
      audio.pause();
      audio.currentTime = 0;
      startedForThisEntry.current = false;
      wasPlaying.current = false;
      return;
    }

    if (!startedForThisEntry.current) {
      startedForThisEntry.current = true;
      audio.play().catch(() => {
        // The Enter click normally allows autoplay. If the browser still
        // blocks it, the small player button can start it manually.
      });
    }
  }, [enabled]);

  useEffect(() => {
    const audio = ref.current;
    if (!audio || !enabled) return;

    if (musicArea) {
      wasPlaying.current = !audio.paused;
      audio.pause();
      return;
    }

    if (wasPlaying.current) {
      audio.play().catch(() => {});
      wasPlaying.current = false;
    }
  }, [musicArea, enabled]);

  if (!enabled) return null;

  const toggle = () => {
    const audio = ref.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  };

  return (
    <>
      <audio
        ref={ref}
        src={site.backgroundSong}
        loop
        preload="auto"
      />

      <button
        className="now-playing"
        onClick={toggle}
        aria-label={playing ? "Pause background music" : "Play background music"}
      >
        <span className={playing ? "disc spinning" : "disc"}>✦</span>
        {playing ? " resume" : " paused"}
      </button>
    </>
  );
}
