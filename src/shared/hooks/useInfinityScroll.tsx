'use client';

import { useEffect, useRef } from 'react';

export default function useInfinityScroll({
  hasMore,
  onNext,
}: Readonly<{ hasMore: boolean; onNext?: () => Promise<void> }>) {
  // ref
  const ref = useRef<HTMLDivElement>(null);

  // useEffect
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const observer = new IntersectionObserver(
      async (entries) => {
        const isExecute = entries.every((entry) => entry.intersectionRatio === 1);

        if (isExecute) {
          await onNext?.();
        }
      },
      { threshold: 1 },
    );

    hasMore ? observer.observe(ref.current) : observer.unobserve(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore]);

  return [ref];
}
