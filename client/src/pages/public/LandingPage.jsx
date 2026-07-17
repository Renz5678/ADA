import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MdOutlineWorkOutline, MdOutlinePersonOutline } from "react-icons/md";
import Icon from "#components/ui/Icon.jsx";
import { ReactLenis } from 'lenis/react';
import * as THREE from 'three';
import NET from 'vanta/src/vanta.net';

export default function LandingPage() {
    const [vantaEffect, setVantaEffect] = useState(null);
    const vantaRef = useRef(null);

    useEffect(() => {
        if (!vantaEffect) {
            setVantaEffect(NET({
                el: vantaRef.current,
                THREE: THREE,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
                scale: 1.00,
                scaleMobile: 1.00,
                color: 0xE57A44, // ADA orange
                backgroundColor: 0xFFF7E6, // ADA cream
                points: 12.00,
                maxDistance: 22.00,
                spacing: 18.00,
                showDots: true
            }));
        }
        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, [vantaEffect]);

    return (
        <ReactLenis root>
            <div ref={vantaRef} className="relative w-full min-h-screen flex justify-center items-center py-10">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-[90%] md:w-[60%] lg:w-[40%] flex flex-col gap-6 items-center relative z-10"
                >
                    {/* Brand */}
                    <div className="text-center mb-4">
                        <div className="font-headline text-5xl text-[#0F1D29] font-semibold flex items-center justify-center gap-4">
                            <Icon height={4} width={4} />
                            ADA
                        </div>
                        <p className="font-label text-[#551E26] mt-3">Welcome to ADA. Are you a freelancer or a client?</p>
                    </div>

                    {/* Card */}
                    <div className="w-full bg-white/80 backdrop-blur-md rounded-3xl flex flex-col md:flex-row items-stretch overflow-hidden shadow-sm font-body border border-[#e8d5b5]/50">
                        {/* Freelancer Option */}
                        <div className="flex-1 flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-[#e8d5b5]/50 hover:bg-gray-50/50 transition">
                            <div className="bg-[#FFF7E6] p-4 rounded-full mb-4 shadow-sm">
                                <MdOutlineWorkOutline size={40} className="text-[#8D4A52]" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#0F1D29] mb-2">Freelancer</h2>
                            <p className="text-sm text-center text-gray-700 mb-6 font-medium">Manage your orders, inventory, and clients all in one place.</p>
                            <Link to="/login" className="mt-auto px-6 py-2 bg-[#8D4A52] text-white rounded-full font-medium hover:bg-[#0F1D29] transition w-full text-center">
                                Login as Freelancer
                            </Link>
                        </div>

                        {/* Client Option */}
                        <div className="flex-1 flex flex-col items-center justify-center p-8 hover:bg-gray-50/50 transition">
                            <div className="bg-[#FFF7E6] p-4 rounded-full mb-4 shadow-sm">
                                <MdOutlinePersonOutline size={40} className="text-[#8D4A52]" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#0F1D29] mb-2">Client</h2>
                            <p className="text-sm text-center text-gray-700 mb-6 font-medium">Track your orders and discover top-rated freelancers.</p>
                            <Link to="/login-client" className="mt-auto px-6 py-2 bg-[#0F1D29] text-white rounded-full font-medium hover:bg-[#8D4A52] transition w-full text-center">
                                Login as Client
                            </Link>
                        </div>
                    </div>

                    {/* Marketplace Option */}
                    <div className="w-full text-center mt-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-[#e8d5b5]/50 shadow-sm">
                        <p className="text-[#0F1D29] font-body mb-3 font-semibold">Just looking around?</p>
                        <Link to="/marketplace" className="inline-flex items-center gap-2 px-8 py-3 bg-[#E57A44] hover:bg-[#D46933] text-white rounded-full font-bold transition font-headline shadow-sm hover:shadow-md hover:-translate-y-0.5">
                            <MdOutlineWorkOutline size={20} />
                            Explore Marketplace
                        </Link>
                    </div>
                </motion.div>
            </div>
        </ReactLenis>
    );
}
