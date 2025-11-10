"use client";
import { useState } from "react";

export default function Page() {
  const [video, setVideo] = useState<File | null>(null);
  const [subtitles, setSubtitles] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!video) return alert("Please choose a video first!");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", video);
    const res = await fetch("/api/transcribe", { method: "POST", body: formData });
    const data = await res.json();
    setSubtitles(data.text);
    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "Komika Axis, sans-serif" }}>
      <h1>🎬 Subtitle Generator</h1>
      <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files?.[0] || null)} />
      <button onClick={handleUpload} disabled={!video || loading}>
        {loading ? "Transcribing..." : "Generate Subtitles"}
      </button>
      {subtitles && (
        <div style={{ marginTop: "20px", whiteSpace: "pre-wrap", textAlign: "left" }}>
          <h3>📝 Subtitles:</h3>
          <p>{subtitles}</p>
        </div>
      )}
    </div>
  );
}

