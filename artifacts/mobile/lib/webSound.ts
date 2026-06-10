let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!_ctx || _ctx.state === 'closed') {
      const AC =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      _ctx = new AC() as AudioContext;
    }
    return _ctx;
  } catch {
    return null;
  }
}

function doPlayClick(ctx: AudioContext): void {
  const t = ctx.currentTime;
  const duration = 0.05;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, t);
  osc.frequency.exponentialRampToValueAtTime(800, t + duration);

  gain.gain.setValueAtTime(0.06, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(t);
  osc.stop(t + duration + 0.02);
}

export function playWebClickSound(): void {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => doPlayClick(ctx)).catch(() => {});
    } else {
      doPlayClick(ctx);
    }
  } catch {
  }
}
