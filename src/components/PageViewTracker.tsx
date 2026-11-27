"use client";

import { useEffect, useRef } from "react";
import { trackEngagement } from "@/lib/tracker";

export function PageViewTracker() {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    trackEngagement("page_view", "home", "Sonia Strategy Tree Portfolio");
  }, []);

  return null;
}

