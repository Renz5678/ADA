"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import Link from "next/link";
import Topbar from "@/components/Topbar";

interface SceneProps {
  image: string;
  index: number;
  progress: MotionValue<number>;
  title: string;
  description: string;
  cta?: { text: string; link: string };
  eyebrow: string;
}

const numScenes = 6;
const sceneDuration = 1 / numScenes;

function Scene({ image, index, progress, title, description, eyebrow, cta }: SceneProps) {
  // Each scene takes up an equal slice of the scroll progress
  const start = index * sceneDuration;
  const end = start + sceneDuration;

  // Scale up rapidly during the scene's active scroll window
  const scale = useTransform(progress, [start, end], [1, 4]);

  // Fade in at the start, fade out at the end
  const opacity = useTransform(
    progress,
    [start, start + 0.05, end - 0.05, end],
    [0, 1, 1, 0]
  );

  // Content fades in slightly after the scene starts and fades out before it ends
  const contentOpacity = useTransform(
    progress,
    [start + 0.02, start + 0.08, end - 0.08, end - 0.02],
    [0, 1, 1, 0]
  );
  
  const contentY = useTransform(
    progress,
    [start + 0.02, start + 0.08],
    [30, 0]
  );

  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <motion.img
        src={image}
        alt={title}
        style={{ scale }}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      
      {/* Overlay scrim for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F1D29]/80 via-[#0F1D29]/40 to-transparent z-10" />

      {/* Content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-20 container mx-auto px-6 text-center mt-64"
      >
        <div className="max-w-3xl mx-auto">
          <p className="text-[#FFF7E6] font-bold tracking-widest uppercase text-sm mb-4">
            {eyebrow}
          </p>
          <h2 className="font-headline text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-md">
            {title}
          </h2>
          <p className="text-xl text-gray-200 mb-10 drop-shadow">
            {description}
          </p>
          {cta && (
            <Link
              href={cta.link}
              className="inline-flex items-center justify-center rounded-full bg-[#8D4A52] px-10 py-4 text-lg font-semibold text-white transition-all hover:bg-white hover:text-[#0F1D29] hover:shadow-[0_0_40px_rgba(141,74,82,0.6)] hover:-translate-y-1 gap-2"
            >
              {cta.text}
            </Link>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function DesktopScrollDive() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const scenes = [
    {
      image: "/scenes/hero.jpg",
      eyebrow: "The Modern ERP",
      title: "Intelligent Inventory & Management",
      description: "A centralized dashboard to control your entire business operations from your home office.",
    },
    {
      image: "/scenes/materials.jpg",
      eyebrow: "BOM Automation",
      title: "Never manually count materials again.",
      description: "ADA automatically deducts the raw components used from your inventory the moment a product is built.",
    },
    {
      image: "/scenes/store.jpg",
      eyebrow: "Client Ordering",
      title: "Direct Client Storefronts",
      description: "Offer a clean, minimalist storefront on any device for clients to place orders seamlessly.",
    },
    {
      image: "/scenes/shipping.jpg",
      eyebrow: "Order Tracking",
      title: "From Pending to Delivered",
      description: "Track the full lifecycle of your customer orders with a single click, automating revenue logging.",
    },
    {
      image: "/scenes/expenses.jpg",
      eyebrow: "Expense & Analytics",
      title: "Crystal clear visibility into profits.",
      description: "Beautiful, intuitive charts that track operational costs and show you your true profit margins.",
    },
    {
      image: "/scenes/finale.jpg",
      eyebrow: "Ready to scale?",
      title: "Your entire business in one place.",
      description: "Join ADA today and simplify your inventory, orders, and expense management in one powerful platform.",
      cta: { text: "Start Managing Today", link: "https://app.ada-erp.com/signup" }
    }
  ];

  return (
    <div className="relative bg-[#0F1D29]">
      <div className="absolute top-0 w-full z-50">
        <Topbar />
      </div>
      
      {/* 
        The container height controls how long the scroll takes.
        600vh means 6 screens worth of scrolling for the whole experience.
      */}
      <div ref={containerRef} className="h-[600vh] w-full">
        {/* Sticky container that stays fixed while we scroll through the tall div */}
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
          {scenes.map((scene, i) => (
            <Scene
              key={i}
              index={i}
              progress={scrollYProgress}
              {...scene}
            />
          ))}

          {/* Simple scroll indicator */}
          <motion.div 
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center opacity-70"
            style={{ opacity: useTransform(scrollYProgress, [0.9, 1], [1, 0]) }}
          >
            <span className="text-white text-xs tracking-widest uppercase mb-2">Scroll</span>
            <div className="w-px h-12 bg-white/30 relative overflow-hidden">
              <motion.div 
                className="w-full h-full bg-white origin-top"
                animate={{ scaleY: [0, 1, 0], y: ["-100%", "0%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
