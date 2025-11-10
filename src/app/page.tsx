'use client';


setBusy('Writing files…');
ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoFile));
ffmpeg.FS('writeFile', 'subs.ass', new TextEncoder().encode(toASS(cues)));
// provide font to libass
const fontResp = await fetch('/fonts/KOMIKAX_.ttf');
ffmpeg.FS('writeFile', 'KOMIKAX_.ttf', await fontResp.arrayBuffer());


setBusy('Burning subtitles…');
// Use -vf subtitles with font provider (ass autocaches attached fonts). Some builds need FONTCONFIG.
await ffmpeg.run(
'-i', 'input.mp4',
'-vf', "ass=subs.ass",
'-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
'-c:a', 'copy',
'output.mp4'
);


const data = ffmpeg.FS('readFile', 'output.mp4');
const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
const a = document.createElement('a');
a.href = url; a.download = 'short-with-subtitles.mp4'; a.click();
URL.revokeObjectURL(url);
setBusy(null);
}


function download(type: 'srt' | 'vtt') {
const text = type === 'srt' ? toSRT(cues) : toVTT(cues);
const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url; a.download = `captions.${type}`; a.click();
URL.revokeObjectURL(url);
}


return (
<main className="min-h-screen bg-slate-50">
<div className="max-w-5xl mx-auto p-4 sm:p-8">
<h1 className="text-3xl font-bold tracking-tight">Shorts Subtitles — Komika Axis</h1>
<p className="text-sm text-slate-600 mt-1">Upload, auto-transcribe to English, edit, export SRT/VTT, or burn-in.</p>


<div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
<section className="p-4 rounded-2xl bg-white shadow">
<label className="block text-sm font-medium">Video (9:16 preferred)</label>
<input className="mt-2" type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} />
{videoUrl && (
<div className="mt-4">
<video src={videoUrl} className="rounded-xl w-full" controls playsInline />
</div>
)}
<div className="mt-4 flex gap-2">
<button onClick={transcribe} disabled={!videoFile || !!busy} className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50">Transcribe</button>
<button onClick={() => download('srt')} disabled={!cues.length} className="px-4 py-2 rounded-lg border">Download SRT</button>
<button onClick={() => download('vtt')} disabled={!cues.length} className="px-4 py-2 rounded-lg border">Download VTT</button>
<button onClick={burnIn} disabled={!cues.length || !!busy} className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50">Burn-In (ASS)</button>
</div>
{busy && <p className="mt-3 text-sm text-slate-600">{busy}</p>}
</section>


<section className="p-4 rounded-2xl bg-white shadow">
<h2 className="font-semibold">Captions</h2>
{!cues.length && <p className="text-sm text-slate-500 mt-2">No captions yet. Click Transcribe.</p>}
<ul className="mt-3 space-y-2 max-h-[520px] overflow-auto">
{cues.map((c, i) => (
<li key={i} className="border rounded-lg p-2">
<div className="text-[10px] text-slate-500">{c.start.toFixed(2)} → {c.e
