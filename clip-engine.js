/* ReelStudio local clip engine — no server calls.
 * Clip suggestions are derived from timestamped Whisper transcript chunks.
 * Exports are rendered in-browser as WebM where supported.
 */
(() => {
  'use strict';
  const fmt = s => {
    s = Math.max(0, Math.floor(s));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  };
  function findCandidates(chunks, duration, options = {}) {
    const min = options.minSeconds || 25, max = options.maxSeconds || 90;
    const usable = (chunks || []).filter(c =>
      Array.isArray(c.timestamp) && Number.isFinite(c.timestamp[0]) &&
      Number.isFinite(c.timestamp[1]) && c.text && c.text.trim()
    );
    const candidates = [];
    const hook = /\b(why|how|what|because|but|however|important|listen|remember|truth|problem|solution|result|question|answer|breaking|today)\b|پاکستان|عمران|خان|حکومت|عوام|کیوں|کیا|لیکن|کیونکہ|حقیقت|سوال|جواب/i;
    for (let i = 0; i < usable.length; i++) {
      const start = Math.max(0, usable[i].timestamp[0] - 1.5);
      let end = start, text = '';
      for (let j = i; j < usable.length; j++) {
        end = usable[j].timestamp[1];
        text += ' ' + usable[j].text;
        const length = end - start;
        if (length >= min && length <= max) {
          const words = text.trim().split(/\s+/).length;
          const score = Math.min(99, Math.round(35 + Math.min(25, words / 2) +
            (hook.test(text) ? 18 : 0) + (length >= 40 && length <= 65 ? 12 : 0)));
          candidates.push({ start, end: Math.min(end, duration || end), text: text.trim(), score });
          break;
        }
        if (length > max) break;
      }
    }
    candidates.sort((a, b) => b.score - a.score);
    const chosen = [];
    for (const item of candidates) {
      if (chosen.every(x => item.start >= x.end || item.end <= x.start)) {
        chosen.push(item);
        if (chosen.length >= (options.limit || 8)) break;
      }
    }
    return chosen.sort((a, b) => a.start - b.start).map((x, i) => ({ ...x, index: i + 1, startLabel: fmt(x.start), endLabel: fmt(x.end) }));
  }

  function supportedMime() {
    const types = ['video/mp4', 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    return types.find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || '';
  }

  async function exportClip({ sourceBlob, start, end, watermark = 'ADEEL RAJA', onProgress = () => {} }) {
    if (!sourceBlob) throw new Error('Source video is missing.');
    if (!(end > start)) throw new Error('Clip end must be after its start.');
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream)
      throw new Error('This browser cannot render local video clips. Try current Chrome or Edge on desktop.');
    const mimeType = supportedMime();
    if (!mimeType) throw new Error('This browser does not support WebM video export.');
    const video = document.createElement('video');
    video.muted = false; video.playsInline = true; video.preload = 'auto';
    const url = URL.createObjectURL(sourceBlob); video.src = url;
    const wait = (event, fail = 'error') => new Promise((resolve, reject) => {
      video.addEventListener(event, resolve, { once: true });
      video.addEventListener(fail, () => reject(new Error('Could not decode this source video.')), { once: true });
    });
    try {
      await wait('loadedmetadata');
      if (end > video.duration) end = video.duration;
      if (start >= end) throw new Error('Clip start is beyond the video duration.');
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 1280 / video.videoWidth);
      canvas.width = Math.max(2, Math.round(video.videoWidth * scale));
      canvas.height = Math.max(2, Math.round(video.videoHeight * scale));
      const ctx = canvas.getContext('2d');
      const stream = canvas.captureStream(30);
      let audioContext, audioDestination;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          audioContext = new AudioCtx();
          const source = audioContext.createMediaElementSource(video);
          audioDestination = audioContext.createMediaStreamDestination();
          source.connect(audioDestination);
          source.connect(audioContext.destination);
          audioDestination.stream.getAudioTracks().forEach(t => stream.addTrack(t));
        }
      } catch (audioError) {
        console.warn('Audio capture unavailable; exporting video-only clip', audioError);
      }
      const recorder = new MediaRecorder(stream, { mimeType });
      const parts = [];
      recorder.ondataavailable = e => { if (e.data && e.data.size) parts.push(e.data); };
      const stopped = new Promise((resolve, reject) => {
        recorder.onstop = resolve;
        recorder.onerror = e => reject(e.error || new Error('Video recording failed.'));
      });
      let raf = 0, finished = false;
      const draw = () => {
        if (finished) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (watermark) {
          const pad = Math.round(canvas.width * .025);
          const font = Math.max(14, Math.round(canvas.width * .027));
          ctx.font = '700 ' + font + 'px Arial, sans-serif';
          const label = watermark.toUpperCase();
          const w = ctx.measureText(label).width + pad * 1.3;
          const h = font * 1.8;
          ctx.fillStyle = 'rgba(5,10,20,.52)';
          ctx.fillRect(canvas.width - w - pad, canvas.height - h - pad, w, h);
          ctx.fillStyle = 'rgba(255,255,255,.92)';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, canvas.width - w - pad * .35, canvas.height - h / 2 - pad);
        }
        const elapsed = Math.max(0, video.currentTime - start);
        onProgress(Math.min(99, Math.round(elapsed / (end - start) * 100)));
        if (video.currentTime >= end || video.ended) {
          finished = true; cancelAnimationFrame(raf); video.pause(); recorder.stop();
        } else raf = requestAnimationFrame(draw);
      };
      const seeked = wait('seeked');
      video.currentTime = start;
      await seeked;
      recorder.start(250);
      await video.play();
      draw();
      await stopped;
      if (audioDestination) audioDestination.stream.getTracks().forEach(t => t.stop());
      if (audioContext) await audioContext.close();
      stream.getTracks().forEach(t => t.stop());
      onProgress(100);
      return new Blob(parts, { type: mimeType });
    } finally {
      video.pause(); video.removeAttribute('src'); URL.revokeObjectURL(url);
    }
  }
  window.ReelStudioClipEngine = { findCandidates, exportClip, supportedMime };
})();