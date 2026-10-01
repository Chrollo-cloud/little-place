import { useEffect, useRef, useState } from "react";
import { Home } from "./pages/Home";
import { Explore } from "./pages/Explore";
import { AudioManager } from "./components/AudioManager";
import "./styles.css";

export default function App() {
  const [entered, setEntered] = useState(false);
  const [musicArea, setMusicArea] = useState(false);
  const [selectedFish, setSelectedFish] = useState<string[]>([]);
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  useEffect(() => {
    if (!instructionsOpen) return;

    document.body.classList.add("instructions-open");
    return () => document.body.classList.remove("instructions-open");
  }, [instructionsOpen]);

  const enterScrapbook = () => {
    try {
      setInstructionsOpen(localStorage.getItem("little-place-instructions-seen") !== "true");
    } catch {
      // If storage is unavailable, still show the welcome note for this visit.
      setInstructionsOpen(true);
    }
    setEntered(true);
  };

  const dismissInstructions = () => {
    try {
      localStorage.setItem("little-place-instructions-seen", "true");
    } catch {
      // The popup can still close in privacy-restricted browser sessions.
    }
    setInstructionsOpen(false);
  };

  return (
    <div className="app">
      <AudioManager enabled={entered} musicArea={musicArea} />

      {entered ? (
        <>
          <Explore
            setMusic={setMusicArea}
            goHome={() => {
              setMusicArea(false);
              setEntered(false);
            }}
            selectedFish={selectedFish}
            setSelectedFish={setSelectedFish}
          />
          {instructionsOpen && <FirstVisitInstructions onDismiss={dismissInstructions} />}
        </>
      ) : (
        <Home enter={enterScrapbook} />
      )}
    </div>
  );
}

function FirstVisitInstructions({ onDismiss }: { onDismiss: () => void }) {
  const [isClosing, setIsClosing] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const close = () => {
    if (isClosing) return;
    setIsClosing(true);
    window.setTimeout(onDismiss, 180);
  };

  return (
    <div className={`instructions-overlay${isClosing ? " is-closing" : ""}`}>
      <section
        ref={dialogRef}
        className="instructions-card paper"
        role="dialog"
        aria-modal="true"
        aria-labelledby="instructions-title"
        tabIndex={-1}
      >
        <h2 id="instructions-title">okayyy before you look around ♡</h2>
        <div className="instructions-copy">
          <p>happy girlfriend&apos;s day sayang ♡</p>
          <p>i made this little place with a few things for you to find.</p>
          <p>you can move the little things around, so don&apos;t be afraid to drag them wherever you want.</p>
          <p>there&apos;s a little aquarium too, where you can pick your own little fish and make it yours.</p>
          <p>there are also some photos, a tiny quiz, a little dino game, some songs, and a letter waiting for you.</p>
          <p>just take your time and look around. there&apos;s no right order to do things.</p>
          <p>and when you find the letter... open it, okay? ♡</p>
          <p>there&apos;s something i really want you to read.</p>
        </div>
        <button className="pink-btn instructions-close" onClick={close}>
          okay, let me look around ♡
        </button>
      </section>
    </div>
  );
}
