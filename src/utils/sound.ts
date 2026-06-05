let sharedCtx: AudioContext | null = null;

export const playClickSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!sharedCtx || sharedCtx.state === 'closed') {
      sharedCtx = new AudioContextClass();
    }

    if (sharedCtx.state === 'suspended') {
      sharedCtx.resume().catch(() => {});
    }

    const ctx = sharedCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Mechanical switch pop sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {
    console.warn('AudioContext failed:', e);
  }
};
