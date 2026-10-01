import { useState } from "react";
import { Home } from "./pages/Home";
import { Explore } from "./pages/Explore";
import { AudioManager } from "./components/AudioManager";
import "./styles.css";

export default function App() {
  const [entered, setEntered] = useState(false);
  const [musicArea, setMusicArea] = useState(false);
  const [selectedFish, setSelectedFish] = useState<string[]>([]);

  return (
    <div className="app">
      <AudioManager enabled={entered} musicArea={musicArea} />

      {entered ? (
        <Explore
          setMusic={setMusicArea}
          goHome={() => {
            setMusicArea(false);
            setEntered(false);
          }}
          selectedFish={selectedFish}
          setSelectedFish={setSelectedFish}
        />
      ) : (
        <Home enter={() => setEntered(true)} />
      )}
    </div>
  );
}
