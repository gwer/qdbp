import { useEffect, useRef, useState } from 'preact/hooks';
import type { T } from '@/i18n/t';
import { morseTimeline } from './morse';

// 18 слов в минуту: точка — 1200 / 18 ≈ 67 мс. Тон 600 Гц, как у учебных генераторов.
const UNIT = 1.2 / 18;
const FREQ = 600;

/** Проигрывает запись Морзе через WebAudio; повторное нажатие останавливает. */
export function Play({ morse, t }: { morse: string; t: T }) {
  const ctx = useRef<AudioContext | null>(null);
  const [playing, setPlaying] = useState(false);
  const stop = () => {
    ctx.current?.close();
    ctx.current = null;
    setPlaying(false);
  };
  // Кнопка исчезла (ввод очищен, режим сменился) или запись изменилась — старый звук не должен играть невидимо.
  useEffect(() => () => {
    ctx.current?.close();
    ctx.current = null;
  }, []);
  useEffect(() => {
    if (ctx.current) stop();
  }, [morse]);

  const play = () => {
    if (playing) return stop();
    const ac = new AudioContext();
    ctx.current = ac;
    const gain = ac.createGain();
    gain.gain.value = 0;
    gain.connect(ac.destination);
    const osc = ac.createOscillator();
    osc.frequency.value = FREQ;
    osc.connect(gain);
    const start = ac.currentTime + 0.05;
    let end = start;
    for (const [at, len] of morseTimeline(morse)) {
      const a = start + at * UNIT;
      const b = a + len * UNIT;
      // Короткие нарастание и спад убирают щелчки.
      gain.gain.setValueAtTime(0, a);
      gain.gain.linearRampToValueAtTime(0.4, a + 0.005);
      gain.gain.setValueAtTime(0.4, b - 0.005);
      gain.gain.linearRampToValueAtTime(0, b);
      end = b;
    }
    osc.start(start);
    osc.stop(end + 0.05);
    osc.onended = () => ctx.current === ac && stop();
    setPlaying(true);
  };
  return (
    <button type="button" class="btn btn-secondary" onClick={play}>
      {playing ? `■ ${t('ui.stop')}` : `▶ ${t('ui.play')}`}
    </button>
  );
}
