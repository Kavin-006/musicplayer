import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Home, Search, Library } from "lucide-react";
import { useSpeechRecognition } from "react-speech-kit";
import Hammer from "hammerjs";
import auth from "@/utils/auth";
import cloudSync from "@/utils/cloudSync";

const YOUTUBE_API_KEY = "YOUR_YOUTUBE_API_KEY";

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "cyberpunk");
  const [activeTab, setActiveTab] = useState("home");
  const [playlists, setPlaylists] = useState([]);
  const [mood, setMood] = useState("Chill");
  const [currentSong, setCurrentSong] = useState({ src: "", cover: "", movieCover: "" });
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [smartShuffle, setSmartShuffle] = useState(false);
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [audioFilters, setAudioFilters] = useState("normal");
  const audioRef = useRef(null);
  const { listen, stop } = useSpeechRecognition({
    onResult: (command) => handleVoiceCommand(command),
  });

  useEffect(() => {
    auth.checkLogin(setPlaylists, setCurrentSong);
    cloudSync.loadSongs(setPlaylists);
  }, []);

  useEffect(() => {
    audioRef.current = new Audio(currentSong.src);
    applyAudioFilter(audioFilters);
  }, [currentSong, audioFilters]);

  useEffect(() => {
    const player = document.getElementById("player");
    const hammer = new Hammer(player);
    hammer.on("swipeleft", () => nextSong());
    hammer.on("swiperight", () => prevSong());
    hammer.on("tap", () => togglePlay());
    hammer.on("swipeup", () => changeVolume(0.1));
    hammer.on("swipedown", () => changeVolume(-0.1));
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const fetchRecommendedSongs = async () => {
    try {
      const response = await fetch("https://api.example.com/recommendations");
      const data = await response.json();
      setRecommendedSongs(data.songs);
    } catch (error) {
      console.error("Error fetching recommended songs:", error);
    }
  };

  const applyAudioFilter = (filter) => {
    if (!audioRef.current) return;
    switch (filter) {
      case "bass_boost":
        audioRef.current.preservesPitch = false;
        break;
      case "8d_sound":
        audioRef.current.pan = -1;
        break;
      case "vinyl":
        audioRef.current.playbackRate = 0.9;
        break;
      default:
        audioRef.current.preservesPitch = true;
        audioRef.current.pan = 0;
        audioRef.current.playbackRate = 1;
    }
    setAudioFilters(filter);
  };

  return (
    <div id="player" className={theme === "cyberpunk" ? "bg-black text-green-400" : "bg-blue-200 text-black"}>
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Music Player</h1>
        <div className="flex gap-2">
          <Button onClick={() => applyAudioFilter("bass_boost")}>Bass Boost</Button>
          <Button onClick={() => applyAudioFilter("8d_sound")}>8D Sound</Button>
          <Button onClick={() => applyAudioFilter("vinyl")}>Vinyl Effect</Button>
          <Button onClick={() => setSmartShuffle(!smartShuffle)}>{smartShuffle ? "Smart Shuffle: ON" : "Smart Shuffle: OFF"}</Button>
          <Button onClick={() => setTheme(theme === "cyberpunk" ? "glassmorphism" : "cyberpunk")}>Switch Theme</Button>
          <Button onClick={listen}>Voice Control</Button>
        </div>
      </header>

      <motion.div className="absolute bottom-20 left-1/2 transform -translate-x-1/2" animate={{ scale: isPlaying ? 1.2 : 1 }}>
        <div className="w-48 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
          {isPlaying ? "Visual Equalizer ON" : "Paused"}
        </div>
      </motion.div>

      <footer className="fixed bottom-0 w-full bg-gray-800 p-3 flex justify-around text-white">
        <Button onClick={() => setActiveTab("home")}><Home /></Button>
        <Button onClick={() => setActiveTab("search")}><Search /></Button>
        <Button onClick={() => setActiveTab("library")}><Library /></Button>
      </footer>
    </div>
  );
}
