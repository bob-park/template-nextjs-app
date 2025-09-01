'use client';

import { useEffect } from 'react';

import { scan } from 'react-scan';

export default function ReactScan() {
  // useEffect
  useEffect(() => {
    scan({
      enabled: process.env.NODE_ENV !== 'production',
    });
  }, []);

  return <></>;
}
