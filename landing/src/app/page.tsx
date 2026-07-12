"use client";

import { useEffect, useState } from "react";
import DesktopScrollDive from "@/components/DesktopScrollDive";
import MobileLanding from "@/components/MobileLanding";

export default function Home() {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isDesktop ? <DesktopScrollDive /> : <MobileLanding />;
}
