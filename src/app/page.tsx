"use client";

import { useMemo, useState } from "react";

type Job = {
  id: string;
  status: string;
  prompt: string;
  createdAt: string;
  message: string;
};
type Shot = { index: number; durationSeconds: number; title: string; visual: string; camera: string; audio: string };
type Storyboard = { prompt: string; style: string; durationSeconds: number; shots: Shot[]; note: string };

const examples = [
  "A cinematic Minecraft survival base reveal at golden hour, sweeping camera movement, dramatic lighting",
  "A tiny astronaut discovers a glowing garden on a distant planet, dreamy science-fiction film",
  "A cozy rainy-night gaming desk, neon reflections, slow camera push-in, cinematic 4K look",
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Cinematic");
  const [ratio, setRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [duration, setDuration] = useState("10");
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
  const [storyboardLoading, setStoryboardLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("generator");

  const previewTitle = useMemo(() => {
    if (!prompt.trim()) return "Your next idea starts here";
    return prompt.trim().split(/[.!?]/)[0].slice(0, 72) || "Untitled concept";
  }, [prompt]);

  async function generate() {
    setError("");
    if (!prompt.trim()) {
      setError("Write a prompt or choose one of the ideas to get started.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style, aspectRatio: ratio, duration: Number(duration) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not start a project.");
      setJob(data.job);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function createStoryboard() {
    setError("");
    if (!prompt.trim()) {
      setError("Write a prompt before building a storyboard.");
      return;
    }
    setStoryboardLoading(true);
    try {
      const response = await fetch("/api/storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style, duration: Number(duration) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not build storyboard.");
      setStoryboard(data as Storyboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Storyboard creation failed.");
    } finally {
      setStoryboardLoading(false);
    }
  }

  const nav = [
    ["✦", "AI Generator", "generator"],
    ["▤", "My Projects", "projects"],
    ["◷", "Recent Renders", "renders"],
  ] as const;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">F</span><span className="brand-name">FRAMEFORGE</span></div>
        <div>
          <div className="eyebrow" style={{ padding: "0 12px", marginBottom: 10 }}>Workspace</div>
          <nav className="nav">
            {nav.map(([icon, label, key]) => (
              <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)} title={label}>
                <span className="nav-icon">{icon}</span><span className="nav-label">{label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="side-bottom">
          <div className="eyebrow">Creator plan</div>
          <div style={{ fontWeight: 700, fontSize: 12, marginTop: 9 }}>Your creative studio</div>
          <p style={{ color: "#858b97", fontSize: 10, lineHeight: 1.7, margin: "7px 0 0" }}>Provider rendering is not connected yet. Your ideas and settings are ready to configure.</p>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="topbar-left"><span>Studio</span><span style={{ color: "#555a65" }}>/</span><strong>{nav.find(n => n[2] === tab)?.[1] ?? "AI Generator"}</strong></div>
          <div className="pill"><span className="dot" /> BETA WORKSPACE</div>
        </header>
        <div className="main-inner">
          <div className="page-heading">
            <div>
              <div className="eyebrow">AI CREATIVE SUITE / 001</div>
              <h1>{tab === "generator" ? <>Turn imagination<br />into <span style={{ color: "var(--lime)" }}>moving pictures.</span></> : tab === "projects" ? <>Your creative<br /><span style={{ color: "var(--lime)" }}>workspace.</span></> : <>Recent render<br /><span style={{ color: "var(--lime)" }}>activity.</span></>}</h1>
              <div className="subtitle">{tab === "generator" ? "Describe the scene. Shape the style. Build a video concept ready for your AI rendering pipeline." : tab === "projects" ? "Your current browser session shows projects created in this workspace." : "Recent generation requests appear here as you work."}</div>
            </div>
            <div className="heading-tag">VERSION 0.1.0 / PREVIEW</div>
          </div>

          {tab !== "generator" ? (
            <section className="panel">
              <div className="panel-head"><div><div className="panel-title">{tab === "projects" ? "Project library" : "Generation activity"}</div><div className="panel-sub">This demo keeps the latest request in local page state.</div></div><span className="pill">{job ? "1 PROJECT" : "NO PROJECTS"}</span></div>
              <div className="panel-body">
                {job ? <div style={{ padding: 16, border: "1px solid #30333d", borderRadius: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center" }}><strong style={{ fontSize: 13 }}>{job.prompt.slice(0, 70)}{job.prompt.length > 70 ? "…" : ""}</strong><span className="status-tag">{job.status.toUpperCase()}</span></div>
                  <p style={{ color: "#8e94a1", fontSize: 11, lineHeight: 1.7 }}>{job.message}</p>
                  <button className="suggest-chip" onClick={() => setTab("generator")}>Back to generator ↗</button>
                </div> : <div style={{ padding: "45px 10px", textAlign: "center", color: "#8b909d", fontSize: 12 }}>No projects yet. Open AI Generator to create your first video brief.</div>}
              </div>
            </section>
          ) : (
            <div className="workspace">
              <section className="panel">
                <div className="panel-head"><div><div className="panel-title">Create a video</div><div className="panel-sub">Prompt your next scene into existence</div></div><span className="pill">✦ TEXT TO VIDEO</span></div>
                <div className="panel-body">
                  <div className="field-label"><label htmlFor="prompt">YOUR PROMPT</label><span className="field-help">BE DESCRIPTIVE</span></div>
                  <div className="prompt-box">
                    <textarea id="prompt" maxLength={4000} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="A cinematic shot of a futuristic city floating above the clouds at sunrise, soft volumetric light, slow aerial camera movement..." />
                    <div className="prompt-footer"><span>✧ Describe subject, setting, motion, and mood</span><span>{prompt.length}/4000</span></div>
                  </div>
                  <div className="suggests">{examples.map((example, i) => <button className="suggest-chip" key={example} onClick={() => setPrompt(example)}>{["▧ Minecraft cinematic", "✧ Sci-fi story", "◌ Atmospheric"][i]}</button>)}</div>

                  <div className="field two-col">
                    <div><div className="field-label"><label htmlFor="style">VISUAL STYLE</label></div><select id="style" value={style} onChange={e => setStyle(e.target.value)}><option>Cinematic</option><option>Anime</option><option>Photorealistic</option><option>3D Animation</option><option>Pixel Art</option><option>Documentary</option></select></div>
                    <div><div className="field-label"><label htmlFor="duration">DURATION</label><span className="field-help">SECONDS</span></div><select id="duration" value={duration} onChange={e => setDuration(e.target.value)}>{[5, 10, 15, 20, 30, 60].map(n => <option key={n} value={n}>{n} seconds</option>)}</select></div>
                  </div>

                  <div className="field">
                    <div className="field-label"><span>ASPECT RATIO</span><span className="field-help">CHOOSE YOUR CANVAS</span></div>
                    <div className="ratio-options">
                      {(["16:9", "9:16", "1:1"] as const).map(r => <button key={r} className={"ratio " + (ratio === r ? "selected" : "")} onClick={() => setRatio(r)}><span className="ratio-shape" style={{ width: r === "9:16" ? 12 : r === "1:1" ? 17 : 25, height: r === "9:16" ? 20 : r === "1:1" ? 17 : 15 }} />{r}<div style={{ fontSize: 9, opacity: .65, marginTop: 4 }}>{r === "16:9" ? "Landscape" : r === "9:16" ? "Shorts / Reels" : "Square"}</div></button>)}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                    <button className="generate-btn" style={{ marginTop: 24 }} onClick={createStoryboard} disabled={storyboardLoading}>{storyboardLoading ? "◌  Building…" : <>▤ &nbsp; Build storyboard</>}</button>
                    <button className="generate-btn" onClick={generate} disabled={loading}>{loading ? "◌  Preparing…" : <>✦ &nbsp; Create video project <span>↗</span></>}</button>
                  </div>
                  {error && <div role="alert" style={{ color: "#ff9e9e", fontSize: 11, marginTop: 10 }}>{error}</div>}
                  <div className="notice">This creates a project request in the starter build. Actual MP4 generation becomes available once a video model provider is connected.</div>
                </div>
              </section>

              <div className="right-col" style={{ display: "grid", gap: 16 }}>
                <section className="panel preview-panel">
                  <div className="panel-head"><div><div className="panel-title">Scene preview</div><div className="panel-sub">Live concept canvas</div></div><span className="pill">PREVIEW</span></div>
                  <div className="preview-screen" style={{ aspectRatio: ratio.replace(":", " / "), minHeight: ratio === "9:16" ? 300 : 265 }}>
                    <div className="preview-orb" /><div className="preview-ring" />
                    <div className="preview-center"><div className="play-icon">▶</div><div className="preview-title">{previewTitle}</div><div className="preview-desc">{style} · {ratio} · {duration}s concept</div></div>
                    <div className="preview-label">FRAMEFORGE / SCENE 01</div><div className="preview-time">00:00 / 00:{duration.padStart(2, "0")}</div>
                  </div>
                  <div className="meta-grid"><div className="meta"><span>Style</span><strong>{style}</strong></div><div className="meta"><span>Canvas</span><strong>{ratio}</strong></div><div className="meta"><span>Duration</span><strong>{duration}s</strong></div></div>
                  {job && <div className="job-message"><strong>Latest project · {job.id.slice(0, 8)}</strong><br />{job.message}</div>}
                  {storyboard && <div className="job-message"><strong>Storyboard · {storyboard.shots.length} shots</strong>
                    <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                      {storyboard.shots.map(shot => <div key={shot.index} style={{ border: "1px solid #343842", borderRadius: 9, padding: 11 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 7 }}><strong>{String(shot.index).padStart(2, "0")} / {shot.title}</strong><span className="field-help">{shot.durationSeconds}s</span></div>
                        <p style={{ color: "#a3a9b4", lineHeight: 1.7, margin: "0 0 5px" }}>{shot.visual}</p>
                        <p style={{ color: "#7e8490", lineHeight: 1.6, margin: 0 }}>Camera: {shot.camera}</p>
                      </div>)}
                    </div>
                    <p style={{ color: "#8e94a1", marginTop: 12 }}>{storyboard.note}</p>
                  </div>}
                </section>
                <section className="panel">
                  <div className="research">
                    <div className="research-title">Research assistant <span style={{ color: "var(--lime)", fontSize: 10 }}>OPTIONAL</span></div>
                    <p>TinyFish can research real web sources for factual videos, collect reference links, and help ground scripts. It does not render video frames by itself.</p>
                    <div className="research-row"><span className="research-icon">⌕</span><span><strong style={{ display: "block", fontSize: 11, fontWeight: 600 }}>TinyFish Search / Fetch</strong><span style={{ display: "block", color: "#7d8490", fontSize: 10, marginTop: 3 }}>Server-side integration point</span></span><span style={{ marginLeft: "auto" }} className="pill">PLANNED</span></div>
                  </div>
                </section>
              </div>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginTop: 22, color: "#606673", font: "10px 'DM Mono', monospace" }}><span>FRAMEFORGE STUDIO © 2026</span><span>MADE FOR IDEAS THAT MOVE</span></div>
        </div>
      </main>
    </div>
  );
}
