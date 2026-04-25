// Author: Jonathan Lamontagne-Kratz
import { useEffect, useRef } from "react";

// Polls the given refetch functions on `intervalMs` while the tab is visible.
// Pauses while hidden; on returning to visible, refetches immediately and resumes.
// Fns are read through a ref each tick, so callers don't need to memoize them
// or the array — the timer survives parent re-renders.
export default function useAutoRefresh(refetchFns, intervalMs = 30_000) {
  const fnsRef = useRef(refetchFns);

  useEffect(() => {
    fnsRef.current = refetchFns;
  });

  useEffect(() => {
    let intervalId = null;

    const runAll = () => {
      Promise.all(fnsRef.current.map((fn) => fn()));
    };

    const startPolling = () => {
      if (intervalId !== null) return;
      intervalId = setInterval(() => {
        if (document.visibilityState === "visible") runAll();
      }, intervalMs);
    };

    const stopPolling = () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        runAll();
        startPolling();
      } else {
        stopPolling();
      }
    };

    if (document.visibilityState === "visible") startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [intervalMs]);
}
