"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedStat({
  value,
  label,
  sublabel,
}: {
  value: string;
  label: string;
  sublabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const match = value.match(/^([\d.]+)(.*)$/);
    if (!match) {
      setDisplay(value);
      return;
    }

    const target = parseFloat(match[1]);
    const suffix = match[2];
    const node = ref.current;
    let frame = 0;
    let started = false;

    const run = () => {
      const duration = 1400;
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        setDisplay(
          `${target % 1 === 0 ? Math.round(current) : current.toFixed(1)}${suffix}`
        );
        if (progress < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };

    if (typeof IntersectionObserver === "undefined") {
      setDisplay(value);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started) {
          started = true;
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    if (node) observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <div ref={ref} className="text-center sm:text-left">
      <p className="font-serif text-4xl font-semibold text-brand-deep sm:text-5xl">
        {display}
      </p>
      <p className="mt-2 text-sm font-medium text-ink/80">{label}</p>
      {sublabel && <p className="mt-0.5 text-[11.5px] text-muted">{sublabel}</p>}
    </div>
  );
}
