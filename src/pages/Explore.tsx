import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CircleHelp,
  Fish,
  Footprints,
  Images,
  Mail,
  Music2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";
import {
  aquariumBackground,
  decorations,
  fishChoices,
  letter,
  photos,
  quiz,
  songs,
} from "../data/content";

type View =
  | "desk"
  | "photos"
  | "quiz"
  | "dino"
  | "music"
  | "letter"
  | "final-question"
  | "aquarium";

type ExploreProps = {
  setMusic: (value: boolean) => void;
  goHome: () => void;
  selectedFish: string[];
  setSelectedFish: (fish: string[]) => void;
};

type PetProps = {
  petFish: string[];
  openAquarium: () => void;
};

export function Explore({
  setMusic,
  goHome,
  selectedFish,
  setSelectedFish,
}: ExploreProps) {
  const [view, setView] = useState<View>("desk");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [finalAnswer, setFinalAnswer] = useState<"try-again" | "need-time" | null>(null);
  const hasNotifiedYesRef = useRef(false);

  const open = (next: View) => {
    setView(next);
    setMusic(next === "music");
  };

  const backToDesk = () => open("desk");

  if (view === "photos") {
    return (
      <Gallery
        back={backToDesk}
        selected={selectedPhoto}
        setSelected={setSelectedPhoto}
        petFish={selectedFish}
        openAquarium={() => open("aquarium")}
      />
    );
  }

  if (view === "quiz") {
    return (
      <Quiz
        back={backToDesk}
        questionIndex={questionIndex}
        setQuestionIndex={setQuestionIndex}
        score={score}
        setScore={setScore}
        answer={answer}
        setAnswer={setAnswer}
        petFish={selectedFish}
        openAquarium={() => open("aquarium")}
      />
    );
  }

  if (view === "dino") {
    return <DinoGame back={backToDesk} />;
  }

  if (view === "music") {
    return (
      <Music
        back={backToDesk}
        petFish={selectedFish}
        openAquarium={() => open("aquarium")}
      />
    );
  }

  if (view === "letter") {
    return (
      <Letter
        back={backToDesk}
        openFinalQuestion={() => open("final-question")}
        petFish={selectedFish}
        openAquarium={() => open("aquarium")}
      />
    );
  }

  if (view === "final-question") {
    return (
      <FinalQuestion
        back={backToDesk}
        answer={finalAnswer}
        setAnswer={setFinalAnswer}
        hasNotifiedRef={hasNotifiedYesRef}
        petFish={selectedFish}
        openAquarium={() => open("aquarium")}
      />
    );
  }

  if (view === "aquarium") {
    return (
      <Aquarium
        back={backToDesk}
        selectedFish={selectedFish}
        setSelectedFish={setSelectedFish}
      />
    );
  }

  return (
    <main className="desk">
      <button
        className="landing-back"
        onClick={goHome}
        aria-label="Back to the welcome page"
        title="Back to the welcome page"
      >
        <ArrowLeft size={18} />
      </button>

      <div className="desk-note paper">
        <span>a little place</span>
        <b>look around.</b>
      </div>

      <img className="desk-art art-butterfly" src={decorations.butterfly} alt="" aria-hidden="true" />
      <img className="desk-art art-lily-soft" src={decorations.lilySoft} alt="" aria-hidden="true" />
      <img className="desk-art art-bow" src={decorations.bow} alt="" aria-hidden="true" />
      <img className="desk-art art-mirror" src={decorations.mirror} alt="" aria-hidden="true" />
      <img className="desk-art art-lily-speckled" src={decorations.lilySpeckled} alt="" aria-hidden="true" />
      <div className="desk-tape tape-one" aria-hidden="true" />
      <div className="desk-tape tape-two" aria-hidden="true" />
      <div className="desk-caption" aria-hidden="true">
        <span>little things</span>
      </div>

      <DraggableObject
        className="photo-object"
        label="photos"
        onClick={() => open("photos")}
      >
        <Images />
      </DraggableObject>

      <DraggableObject
        className="game-object"
        label="quiz"
        onClick={() => open("quiz")}
      >
        <CircleHelp />
      </DraggableObject>

      <DraggableObject
        className="dino-object"
        label="dino"
        onClick={() => open("dino")}
      >
        <Footprints />
      </DraggableObject>

      <DraggableObject
        className="music-object"
        label="music"
        onClick={() => open("music")}
      >
        <Music2 />
      </DraggableObject>

      <DraggableObject
        className="letter-object"
        label="letter"
        onClick={() => open("letter")}
      >
        <Mail />
      </DraggableObject>

      {/* The aquarium icon is always the same. */}
      <DraggableObject
        className="aquarium-object"
        label="aquarium"
        onClick={() => open("aquarium")}
      >
        <Fish />
      </DraggableObject>

      <button className="polaroid" onClick={() => open("photos")} aria-label="Open photos">
        <img src="/assets/photos/IMG_4448.jpg" alt="A memory" />
        <small>something is waiting to be found.</small>
      </button>

      {selectedFish.length > 0 && (
        <Pet
          petFish={selectedFish}
          openAquarium={() => open("aquarium")}
        />
      )}
    </main>
  );
}

type DraggableObjectProps = {
  className: string;
  label: string;
  onClick: () => void;
  children: ReactNode;
};

function DraggableObject({
  className,
  label,
  onClick,
  children,
}: DraggableObjectProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
      moved: false,
    };
    suppressClick.current = false;
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (Math.abs(dx) + Math.abs(dy) > 6) {
      drag.moved = true;
    }

    if (drag.moved) {
      setOffset({
        x: drag.originX + dx,
        y: drag.originY + dy,
      });
    }
  };

  const handlePointerUp = () => {
    if (!dragRef.current) return;
    suppressClick.current = dragRef.current.moved;
    dragRef.current = null;
  };

  const handleClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    onClick();
  };

  return (
    <button
      className={`object draggable-object ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
      style={{
        translate: `${offset.x}px ${offset.y}px`,
      }}
      aria-label={label}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

function Pet({ petFish, openAquarium }: PetProps) {
  return (
    <button
      className="pet-aquarium"
      onClick={openAquarium}
      aria-label="Open my aquarium"
      title="Open my aquarium"
    >
      <div className="pet-aquarium-scene">
        <img className="pet-aquarium-bg" src={aquariumBackground} alt="" />
        <div className="pet-bubbles" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        {petFish.map((src, index) => (
          <span
            key={src}
            style={{
              ...getPetFishPlacement(Math.min(petFish.length, 3), index),
              width: getPetFishWidth(Math.min(petFish.length, 3)),
            }}
            className="pet-fish-slot"
          >
            <img className="pet-fish" src={src} alt="" />
          </span>
        ))}
      </div>
    </button>
  );
}

function Shell({
  children,
  back,
  petFish,
  openAquarium,
}: {
  children: ReactNode;
  back: () => void;
  petFish?: string[];
  openAquarium?: () => void;
}) {
  return (
    <main className="subpage">
      <button
        className="back"
        onClick={back}
        aria-label="Back to main page"
        title="Back to main page"
      >
        <ArrowLeft size={18} />
      </button>

      {children}

      {petFish && petFish.length > 0 && openAquarium && (
        <Pet petFish={petFish} openAquarium={openAquarium} />
      )}
    </main>
  );
}

function Gallery({
  back,
  selected,
  setSelected,
  petFish,
  openAquarium,
}: {
  back: () => void;
  selected: string | null;
  setSelected: (photo: string | null) => void;
} & PetProps) {
  return (
    <Shell back={back} petFish={petFish} openAquarium={openAquarium}>
      <h2>archive</h2>
      <p className="sub">photos can come later.</p>

      <div className="gallery">
        {photos.map((photo, index) => (
          <button key={photo} onClick={() => setSelected(photo)}>
            <img
              src={photo}
              alt={`memory ${index + 1}`}
              onError={(event) => {
                event.currentTarget.style.opacity = "0";
              }}
            />
            <span>{String(index + 1).padStart(2, "0")}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="lightbox" onClick={() => setSelected(null)}>
          <img src={selected} alt="Selected memory" />
        </div>
      )}
    </Shell>
  );
}

function Aquarium({
  back,
  selectedFish,
  setSelectedFish,
}: {
  back: () => void;
  selectedFish: string[];
  setSelectedFish: (fish: string[]) => void;
}) {
  const MAX_FISH = 3;
  const [jarFish, setJarFish] = useState<string[]>(selectedFish.slice(0, MAX_FISH));
  const [pendingFish, setPendingFish] = useState<string[]>([]);

  const previewFish = [...jarFish, ...pendingFish];
  const totalFish = Math.min(previewFish.length, MAX_FISH);

  const toggleFish = (src: string) => {
    if (jarFish.includes(src)) return;

    setPendingFish((current) => {
      if (current.includes(src)) {
        return current.filter((item) => item !== src);
      }
      if (jarFish.length + current.length >= MAX_FISH) {
        return current;
      }
      return [...current, src];
    });
  };

  const putInJar = () => {
    if (pendingFish.length === 0) return;

    setJarFish((current) => {
      const room = MAX_FISH - current.length;
      return [...current, ...pendingFish.slice(0, room)];
    });
    setPendingFish([]);
  };

  const addToMain = () => {
    if (jarFish.length === 0) return;
    setSelectedFish(jarFish.slice(0, MAX_FISH));
    back();
  };

  const reset = () => {
    setJarFish([]);
    setPendingFish([]);
    setSelectedFish([]);
  };

  return (
    <Shell back={back}>
      <div className="aquarium-page">
        <div className="aquarium-heading">
          <span className="sub">little aquarium</span>
          <h2>choose your fish</h2>
          <p className="aquarium-help">
            up to {MAX_FISH} fish. adding a new one won't reset the others.
          </p>
        </div>

        <div className="aquarium-layout">
          <section className="fish-picker paper">
            <div className="picker-title">
              <span>
                {jarFish.length}/{MAX_FISH} swimming
                {pendingFish.length > 0 ? ` · ${pendingFish.length} new` : ""}
              </span>
              <Fish size={18} />
            </div>

            <div className="fish-options">
              {fishChoices.map((fish) => {
                const added = jarFish.includes(fish.src);
                const isPending = pendingFish.includes(fish.src);
                const full = jarFish.length + pendingFish.length >= MAX_FISH;

                return (
                  <button
                    key={fish.id}
                    className={`fish-choice ${
                      added || isPending ? "chosen" : ""
                    } ${added ? "already-added" : ""}`}
                    onClick={() => toggleFish(fish.src)}
                    aria-pressed={added || isPending}
                    disabled={added || (full && !isPending)}
                    title={added ? "Already in the aquarium" : undefined}
                  >
                    <img src={fish.src} alt={fish.label} />
                    <span>
                      {added
                        ? "already swimming"
                        : isPending
                          ? "ready to add"
                          : fish.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              className="pink-btn fish-enter"
              disabled={pendingFish.length === 0}
              onClick={putInJar}
            >
              {pendingFish.length > 0
                ? `add ${pendingFish.length} new fish`
                : "choose a fish"}
              <ArrowDown size={16} />
            </button>
          </section>

          <section className="jar-stage" aria-label="Aquarium preview">
            <div className="jar-wrap">
              <img
                className="jar-reference"
                src={aquariumBackground}
                alt="Pixel aquarium with water and seaweed"
              />

              <div className="aquarium-bubbles" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>

              {previewFish.map((src, index) => (
                <span
                  key={src}
                  style={{
                    ...getFishPlacement(totalFish, index),
                    width: getFishWidth(totalFish),
                  }}
                  className="jar-fish-slot"
                >
                  <img className="jar-fish" src={src} alt="" />
                </span>
              ))}
            </div>

            <div className="jar-actions">
              <button className="secondary-btn" onClick={reset}>
                <RotateCcw size={15} />
                reset
              </button>

              <button
                className="pink-btn"
                disabled={jarFish.length === 0}
                onClick={addToMain}
              >
                <Plus size={16} />
                add to main page
              </button>
            </div>
          </section>
        </div>
      </div>
    </Shell>
  );
}

function getFishWidth(total: number) {
  if (total <= 1) return "31%";
  if (total === 2) return "21%";
  return "16%";
}

const WATER_BOUNDS = { left: 15, right: 85, top: 20, bottom: 76 };
const SWIM_PADDING = 3;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function getFishPlacement(total: number, index: number) {
  // Each coordinate is a safe-water target rather than a temporary spawn point.
  // They are percentages of the rendered jar, so the layout scales with the jar
  // on desktop, tablet, and mobile.
  const slots: Record<number, Array<[number, number]>> = {
    1: [[50, 47]],
    2: [
      [34, 45],
      [67, 51],
    ],
    3: [
      [31, 48],
      [55, 40],
      [70, 55],
    ],
  };

  const positions = slots[Math.max(1, Math.min(total, 3))];
  const [left, top] = positions[index % positions.length];
  const fishWidth = Number.parseFloat(getFishWidth(total));
  // The fish slot is centered on its coordinates. Reserve half the rendered
  // sprite plus a little room for its gentle CSS swim animation.
  const fishHalfWidth = fishWidth / 2 + SWIM_PADDING;
  const fishHalfHeight = fishWidth / 2 + SWIM_PADDING;

  return {
    left: `${clamp(left, WATER_BOUNDS.left + fishHalfWidth, WATER_BOUNDS.right - fishHalfWidth)}%`,
    top: `${clamp(top, WATER_BOUNDS.top + fishHalfHeight, WATER_BOUNDS.bottom - fishHalfHeight)}%`,
  };
}

function getPetFishWidth(total: number) {
  if (total <= 1) return "27%";
  if (total === 2) return "17%";
  return "13%";
}

function getPetFishPlacement(total: number, index: number) {
  const slots: Record<number, Array<[number, number]>> = {
    1: [[50, 47]],
    2: [
      [35, 47],
      [65, 51],
    ],
    3: [
      [31, 48],
      [57, 43],
      [70, 54],
    ],
  };

  const positions = slots[Math.max(1, Math.min(total, 3))];
  const [left, top] = positions[index % positions.length];

  return {
    left: `${left}%`,
    top: `${top}%`,
  };
}

function Music({
  back,
  petFish,
  openAquarium,
}: {
  back: () => void;
} & PetProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audio = useMemo(() => new Audio(), []);

  useEffect(() => {
    audio.src = songs[index].src;
    audio.load();
  }, [audio, index]);

  useEffect(() => {
    return () => {
      audio.pause();
    };
  }, [audio]);

  const play = () => {
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => {});
  };

  const stop = () => {
    audio.pause();
    setPlaying(false);
  };

  const previous = () => {
    stop();
    setIndex((value) => (value - 1 + songs.length) % songs.length);
  };

  const next = () => {
    stop();
    setIndex((value) => (value + 1) % songs.length);
  };

  const selectSong = (nextIndex: number) => {
    stop();
    setIndex(nextIndex);
  };

  return (
    <Shell
      back={() => {
        stop();
        back();
      }}
      petFish={petFish}
      openAquarium={openAquarium}
    >
      <h2>music</h2>
      <p className="sub">the background is taking a little break.</p>

      <div className="music-layout">
        <div className="player paper">
          <img
            className="album"
            src={songs[index].albumArt}
            alt={`${songs[index].title} album artwork`}
          />
          <b>{songs[index].title}</b>
          <span>{songs[index].artist}</span>

          <div className="player-actions">
            <button onClick={previous} aria-label="Previous song" title="Previous song">
              <SkipBack size={18} />
            </button>
            <button
              onClick={playing ? stop : play}
              aria-label={playing ? "Pause song" : "Play song"}
              title={playing ? "Pause song" : "Play song"}
            >
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={next} aria-label="Next song" title="Next song">
              <SkipForward size={18} />
            </button>
          </div>
        </div>

        <div className="playlist paper" aria-label="Song list">
          <span className="playlist-title">on the playlist</span>
          {songs.map((song, songIndex) => (
            <button
              key={song.src}
              className={songIndex === index ? "active" : ""}
              onClick={() => selectSong(songIndex)}
              aria-pressed={songIndex === index}
            >
              <img src={song.albumArt} alt="" />
              <span>
                <b>{song.title}</b>
                <small>{song.artist}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function Quiz({
  back,
  questionIndex,
  setQuestionIndex,
  score,
  setScore,
  answer,
  setAnswer,
  petFish,
  openAquarium,
}: {
  back: () => void;
  questionIndex: number;
  setQuestionIndex: (value: number) => void;
  score: number;
  setScore: (value: number) => void;
  answer: number | null;
  setAnswer: (value: number | null) => void;
} & PetProps) {
  const done = questionIndex >= quiz.length;

  const chooseAnswer = (index: number) => {
    setAnswer(index);
  };

  const submitAnswer = () => {
    if (answer === null) return;
    const selected = quiz[questionIndex].a[answer].toLowerCase();
    if (selected === quiz[questionIndex].correctAnswer) {
      setScore(score + 1);
    }
    setQuestionIndex(questionIndex + 1);
    setAnswer(null);
  };

  return (
    <Shell back={back} petFish={petFish} openAquarium={openAquarium}>
      <h2>one tiny quiz</h2>

      {done ? (
        <div className="paper result">
          <h3>
            {score}/{quiz.length}
          </h3>
          <p>okay. you know each other.</p>
          <button
            className="pink-btn"
            onClick={() => {
              setQuestionIndex(0);
              setScore(0);
              setAnswer(null);
            }}
          >
            again
          </button>
        </div>
      ) : (
        <div className="paper quiz">
          <span>
            {questionIndex + 1}/{quiz.length}
          </span>
          <h3>{quiz[questionIndex].q}</h3>

          {quiz[questionIndex].a.map((option, index) => (
            <button
              key={option}
              onClick={() => chooseAnswer(index)}
              className={answer === index ? "selected" : ""}
            >
              {option}
            </button>
          ))}

          {answer !== null && (
            <button
              className="pink-btn next"
              onClick={submitAnswer}
            >
              next →
            </button>
          )}
        </div>
      )}
    </Shell>
  );
}

type DinoObstacle = {
  id: number;
  x: number;
  width: number;
  height: number;
  bottom: number;
  kind: "ground" | "flying";
  variant: "cactus" | "flower" | "thorn" | "moth" | "paper-bird";
};

const DINO_GROUND = 22;
const DINO_WIDTH = 58;
const DINO_RUN_HEIGHT = 38;
const DINO_DUCK_HEIGHT = 27;

function DinoGame({ back }: { back: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const playerYRef = useRef(0);
  const velocityRef = useRef(0);
  const duckingRef = useRef(false);
  const obstaclesRef = useRef<DinoObstacle[]>([]);
  const spawnInRef = useRef(0.9);
  const scoreRef = useRef(0);
  const obstacleIdRef = useRef(0);
  const [status, setStatus] = useState<"idle" | "running" | "game-over">("idle");
  const statusRef = useRef(status);
  const [playerY, setPlayerY] = useState(0);
  const [ducking, setDucking] = useState(false);
  const [obstacles, setObstacles] = useState<DinoObstacle[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const begin = () => {
    playerYRef.current = 0;
    velocityRef.current = 0;
    duckingRef.current = false;
    obstaclesRef.current = [];
    spawnInRef.current = 0.85;
    scoreRef.current = 0;
    previousTimeRef.current = null;
    setPlayerY(0);
    setDucking(false);
    setObstacles([]);
    setScore(0);
    setStatus("running");
  };

  const jump = () => {
    if (statusRef.current === "idle" || statusRef.current === "game-over") {
      begin();
      velocityRef.current = 650;
      return;
    }
    if (playerYRef.current <= 1) velocityRef.current = 650;
  };

  const startDuck = () => {
    if (statusRef.current !== "running") return;
    duckingRef.current = true;
    setDucking(true);
    if (playerYRef.current > 1) velocityRef.current = Math.min(velocityRef.current, -900);
  };

  const stopDuck = () => {
    duckingRef.current = false;
    setDucking(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "ArrowDown") {
        event.preventDefault();
        startDuck();
        return;
      }
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        jump();
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "ArrowDown") stopDuck();
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  });

  useEffect(() => {
    if (status !== "running") return;

    const tick = (time: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      const previous = previousTimeRef.current ?? time;
      const delta = Math.min((time - previous) / 1000, 0.035);
      previousTimeRef.current = time;

      velocityRef.current -= 1700 * delta;
      playerYRef.current = Math.max(0, playerYRef.current + velocityRef.current * delta);
      if (playerYRef.current === 0 && velocityRef.current < 0) velocityRef.current = 0;

      scoreRef.current += delta * 10;
      const speed = Math.min(365, 195 + scoreRef.current * 1.5);
      spawnInRef.current -= delta;
      if (spawnInRef.current <= 0) {
        const flyingChance = scoreRef.current < 65 ? 0 : scoreRef.current < 170 ? 0.28 : 0.42;
        const flying = Math.random() < flyingChance;
        obstaclesRef.current.push({
          id: obstacleIdRef.current++,
          x: stage.clientWidth + 26,
          width: flying ? 34 : 22 + Math.round(Math.random() * 8),
          height: flying ? 22 : 28 + Math.round(Math.random() * 14),
          bottom: flying ? 70 : DINO_GROUND,
          kind: flying ? "flying" : "ground",
          variant: flying
            ? (Math.random() < 0.5 ? "moth" : "paper-bird")
            : (["cactus", "flower", "thorn"] as const)[Math.floor(Math.random() * 3)],
        });
        spawnInRef.current = Math.max(.78, 1.38 - scoreRef.current * .002) + Math.random() * .34;
      }

      obstaclesRef.current = obstaclesRef.current
        .map((obstacle) => ({ ...obstacle, x: obstacle.x - speed * delta }))
        .filter((obstacle) => obstacle.x + obstacle.width > -12);

      const playerLeft = stage.clientWidth * 0.15;
      const playerRight = playerLeft + DINO_WIDTH;
      const playerBottom = stage.clientHeight - DINO_GROUND - playerYRef.current;
      const playerTop = playerBottom - (duckingRef.current && playerYRef.current <= 1 ? DINO_DUCK_HEIGHT : DINO_RUN_HEIGHT);
      const hit = obstaclesRef.current.some((obstacle) => {
        const obstacleBottom = stage.clientHeight - obstacle.bottom;
        const obstacleTop = obstacleBottom - obstacle.height;
        return obstacle.x < playerRight - 8 && obstacle.x + obstacle.width > playerLeft + 8 && obstacleTop < playerBottom - 6 && obstacleBottom > playerTop + 7;
      });

      setPlayerY(playerYRef.current);
      setObstacles([...obstaclesRef.current]);
      setScore(Math.floor(scoreRef.current));

      if (hit) {
        setHighScore((current) => Math.max(current, Math.floor(scoreRef.current)));
        setStatus("game-over");
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      previousTimeRef.current = null;
    };
  }, [status]);

  return (
    <Shell back={back}>
      <section className="dino-page">
        <span className="sub">one tiny game</span>
        <h2>run, little dino.</h2>
        <div className="dino-score">score {String(score).padStart(5, "0")} <span>hi {String(highScore).padStart(5, "0")}</span></div>
        <div className="dino-stage paper" ref={stageRef} onClick={jump} role="button" tabIndex={0} aria-label="Dino game area. Tap or press space to jump.">
          <div className="dino-cloud cloud-one" aria-hidden="true">✦</div>
          <div className="dino-cloud cloud-two" aria-hidden="true">♥</div>
          <PixelDino running={status === "running"} jumping={playerY > 1} ducking={ducking && playerY <= 1} bottom={DINO_GROUND + playerY} />
          {obstacles.map((obstacle) => (
            <div key={obstacle.id} className={`dino-obstacle ${obstacle.kind}`} style={{ left: obstacle.x, bottom: obstacle.bottom, width: obstacle.width, height: obstacle.height }} aria-hidden="true">
              <PixelObstacle variant={obstacle.variant} />
            </div>
          ))}
          <div className="dino-ground" aria-hidden="true" />
          {status !== "running" && (
            <div className="dino-message">
              {status === "game-over" ? <><b>game over</b><span>score: {String(score).padStart(5, "0")}</span><button className="pink-btn" onClick={(event) => { event.stopPropagation(); begin(); }}>again</button></> : <><b>run, little dino.</b><span>tap / press space to start</span></>}
            </div>
          )}
        </div>
        <div className="dino-controls">
          <button className="secondary-btn" onClick={jump}>jump</button>
          <button className="secondary-btn dino-duck" onPointerDown={startDuck} onPointerUp={stopDuck} onPointerCancel={stopDuck} onPointerLeave={stopDuck}>duck</button>
        </div>
      </section>
    </Shell>
  );
}

const DINO_PIXEL_ROWS = [
  "..................##########",
  "................################",
  "...............#################",
  "...............#################",
  "...............#################",
  "................##########......",
  "................####............",
  ".................###............",
  ".....###############............",
  "...###################..........",
  "..######################........",
  ".#######################........",
  "..##################............",
  "..###################...........",
  "...##################...........",
  "....#####.....#####.............",
  "....#####.....#####.............",
  "....#####.....#####.............",
  ".....###.......###..............",
  ".....###.......###..............",
];

function PixelDino({ running, jumping, ducking, bottom }: { running: boolean; jumping: boolean; ducking: boolean; bottom: number }) {
  const pose = ducking ? "ducking" : jumping ? "jumping" : running ? "running" : "idle";
  return (
    <svg className={`pink-dino ${pose}`} style={{ bottom }} viewBox="0 0 64 40" aria-hidden="true" shapeRendering="crispEdges">
      <g className="dino-pixel-sprite" transform={ducking ? "translate(0 5) scale(1 .78)" : undefined}>
        {DINO_PIXEL_ROWS.flatMap((row, y) => [...row].map((pixel, x) => pixel === "#" ? <rect key={`${x}-${y}`} className="dino-pixel-outline" x={x * 2} y={y * 2} width="2" height="2" /> : null))}
        {/* inset fills preserve the single chunky T-Rex silhouette */}
        <rect className="dino-fill" x="38" y="4" width="22" height="10" />
        <rect className="dino-fill" x="34" y="10" width="18" height="10" />
        <rect className="dino-fill" x="18" y="18" width="22" height="12" />
        <rect className="dino-fill" x="6" y="22" width="14" height="6" />
        <rect className="dino-shadow" x="18" y="26" width="22" height="4" />
        <rect className="dino-highlight" x="22" y="20" width="10" height="2" />
        {/* compact head, short snout, eye and tiny teeth */}
        <rect className="dino-eye" x="48" y="8" width="2" height="2" />
        <rect className="dino-mouth" x="46" y="14" width="14" height="2" />
        <rect className="dino-tooth" x="48" y="16" width="2" height="2" /><rect className="dino-tooth" x="54" y="16" width="2" height="2" />
        {/* one visible little arm */}
        <rect className="dino-arm" x="34" y="20" width="6" height="2" /><rect className="dino-arm" x="38" y="22" width="2" height="4" />
        {/* the only animated pieces: two short, strong legs */}
        <rect className="dino-leg left-leg" x="10" y="30" width="6" height="8" /><rect className="dino-foot left-leg" x="8" y="36" width="8" height="2" />
        <rect className="dino-leg right-leg" x="28" y="30" width="6" height="8" /><rect className="dino-foot right-leg" x="26" y="36" width="8" height="2" />
      </g>
    </svg>
  );
}

function PixelObstacle({ variant }: { variant: DinoObstacle["variant"] }) {
  if (variant === "moth" || variant === "paper-bird") {
    return (
      <svg viewBox="0 0 40 28" className={`pixel-obstacle-art ${variant}`} shapeRendering="crispEdges">
        <path className="obstacle-outline" d="M2 10h7V5h7v5h8V4h7v6h7v12h-8v4h-8v-4h-6v4H8v-4H2Z" />
        <path className="obstacle-fill" d="M7 12h6V9h4v6h8V8h3v7h6v4h-8v3h-6v-3h-6v3h-4v-3H7Z" />
        <rect className="obstacle-eye" x="27" y="11" width="3" height="3" />
      </svg>
    );
  }
  if (variant === "flower") {
    return (
      <svg viewBox="0 0 32 46" className="pixel-obstacle-art" shapeRendering="crispEdges">
        <path className="obstacle-outline" d="M13 42V26H7v-8h5V12h7V6h8v6h5v8h-5v6h-6v16Z" />
        <path className="obstacle-fill" d="M17 40V22h-6v-3h6v-5h5v5h6v3h-6v18Z" />
        <rect className="obstacle-light" x="19" y="9" width="5" height="5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 34 46" className="pixel-obstacle-art" shapeRendering="crispEdges">
      <path className="obstacle-outline" d="M11 45V30H4V17h7V8h11v10h8v15h-8v12Z" />
      <path className="obstacle-fill" d="M15 41V26H8v-5h7V13h4v12h7v4h-7v12Z" />
      {variant === "thorn" ? <><rect className="obstacle-light" x="3" y="20" width="5" height="4" /><rect className="obstacle-light" x="25" y="22" width="5" height="4" /></> : <rect className="obstacle-light" x="16" y="15" width="4" height="7" />}
    </svg>
  );
}

function Letter({
  back,
  openFinalQuestion,
  petFish,
  openAquarium,
}: {
  back: () => void;
  openFinalQuestion: () => void;
} & PetProps) {
  return (
    <Shell back={back} petFish={petFish} openAquarium={openAquarium}>
      <div className="letter paper">
        <span></span>
        <h2>halo sayang,</h2>
        <p>{letter}</p>
        <button className="pink-btn letter-next" onClick={openFinalQuestion}>
          one more thing →
        </button>
      </div>
    </Shell>
  );
}

function FinalQuestion({
  back,
  answer,
  setAnswer,
  hasNotifiedRef,
  petFish,
  openAquarium,
}: {
  back: () => void;
  answer: "try-again" | "need-time" | null;
  setAnswer: (answer: "try-again" | "need-time") => void;
  hasNotifiedRef: { current: boolean };
} & PetProps) {
  const dodgeAreaRef = useRef<HTMLDivElement>(null);
  const dodgeButtonRef = useRef<HTMLButtonElement>(null);
  const [dodgePosition, setDodgePosition] = useState<{ x: number; y: number } | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  const notifyYes = async () => {
    try {
      const response = await fetch("/api/notify-yes", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Notification request failed with status ${response.status}`);
      }
    } catch (error) {
      // A notification problem should never interrupt the celebration.
      console.error("Notification failed:", error);
    }
  };

  const celebrate = () => {
    setAnswer("try-again");
    setCelebrating(true);

    if (!hasNotifiedRef.current) {
      hasNotifiedRef.current = true;
      void notifyYes();
    }
  };

  const dodge = () => {
    const area = dodgeAreaRef.current;
    const button = dodgeButtonRef.current;
    if (!area || !button) return;

    const areaBox = area.getBoundingClientRect();
    const buttonBox = button.getBoundingClientRect();
    const maxX = Math.max(0, areaBox.width - buttonBox.width);
    const maxY = Math.max(0, areaBox.height - buttonBox.height);
    const currentX = dodgePosition?.x ?? (areaBox.width - buttonBox.width) / 2;
    const currentY = dodgePosition?.y ?? 0;
    let nextX = Math.random() * maxX;
    let nextY = Math.random() * maxY;

    // Try a few times to make each dodge feel meaningfully different.
    for (let attempt = 0; attempt < 5 && Math.hypot(nextX - currentX, nextY - currentY) < 44; attempt += 1) {
      nextX = Math.random() * maxX;
      nextY = Math.random() * maxY;
    }

    setDodgePosition({ x: nextX, y: nextY });
  };

  return (
    <Shell back={back} petFish={petFish} openAquarium={openAquarium}>
      <section className="final-question" aria-labelledby="final-question-title">
        {celebrating && <Celebration />}
        <p className="sub">after everything we've been through...</p>
        <h2 id="final-question-title">we should give us another chance ga sih?</h2>
        <p className="final-question-copy">
          {"no promises that it’ll be easy\nbut maybe this time, we do it right\n\numm so...be my girlfriend?"}
        </p>
        <div className="final-question-actions">
          <button
            className={`pink-btn ${answer === "try-again" ? "selected" : ""}`}
            onClick={celebrate}
          >
            YES
          </button>
        </div>
        <div className="dodge-area" ref={dodgeAreaRef}>
          <button
            ref={dodgeButtonRef}
            className="secondary-btn dodge-button"
            onClick={dodge}
            style={dodgePosition ? { left: dodgePosition.x, top: dodgePosition.y } : undefined}
          >
            I NEED SOME TIME
          </button>
        </div>
        {answer === "try-again" && (
          <p className="final-answer"><b>you said yes yaa</b><br />me bisa tau yk:v</p>
        )}
      </section>
    </Shell>
  );
}

function Celebration() {
  return (
    <div className="celebration" aria-hidden="true">
      {Array.from({ length: 18 }, (_, index) => (
        <span className={`celebration-piece piece-${index % 3}`} key={index} style={{ left: `${7 + ((index * 23) % 86)}%`, animationDelay: `${(index % 6) * 90}ms` }}>
          {index % 3 === 0 ? "♥" : index % 3 === 1 ? "✦" : "•"}
        </span>
      ))}
    </div>
  );
}
