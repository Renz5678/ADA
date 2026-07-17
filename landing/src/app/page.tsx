"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Box, CheckCircle2, LayoutDashboard, Package, ShoppingCart, Zap, Shield, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Topbar from "@/components/Topbar";
import { ReactLenis } from 'lenis/react';

const VantaBackground = () => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    
    if (typeof window !== "undefined") {
      import("three").then((THREE) => {
        // @ts-ignore
        window.THREE = THREE;
        
        // @ts-ignore
        import("vanta/dist/vanta.waves.min").then((VantaWaves) => {
          if (!isMounted) return;
          
          if (!effectRef.current && vantaRef.current) {
            const WAVES = VantaWaves.default || VantaWaves || (window as any).VANTA?.WAVES;
            try {
              effectRef.current = WAVES({
                el: vantaRef.current,
                THREE: THREE,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
                scale: 1.00,
                scaleMobile: 1.00,
                color: 0xe5e7eb, // Light gray waves to make them visible but subtle
                shininess: 35.00, // Increase shininess for better highlights/shadows
                waveHeight: 20.00, // Slightly taller waves
                waveSpeed: 0.70,
                zoom: 1.00
              });
              console.log("Vanta WAVES successfully initialized");
            } catch (e) {
              console.error("Vanta initialization error:", e);
            }
          }
        }).catch(e => console.error("Failed to load VantaWaves:", e));
      }).catch(e => console.error("Failed to load Three:", e));
    }
    
    return () => {
      isMounted = false;
      if (effectRef.current) {
        // @ts-ignore
        effectRef.current.destroy();
        effectRef.current = null;
      }
    };
  }, []); // Empty dependency array prevents re-render loops

  return (
    <div ref={vantaRef} className="fixed top-0 left-0 w-screen h-screen z-[0] pointer-events-none opacity-100" />
  );
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function Home() {
  return (
    <ReactLenis root>
      <Topbar />
      <VantaBackground />
      <main className="flex-1 relative z-10 bg-transparent">
        {/* Background Mesh/Grid for Hero */}
        <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden -z-10 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        </div>

        {/* Hero Section */}
        <section className="relative min-h-[100dvh] flex flex-col justify-center py-24 overflow-hidden">
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="mx-auto max-w-5xl"
            >

              <motion.h1 
                variants={fadeInUp}
                className="font-headline text-5xl md:text-6xl lg:text-[5rem] font-extrabold tracking-tight text-dark mb-8 leading-[1.1]"
              >
                Intelligent Inventory & <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8D4A52] to-[#AB626A]">
                  Business Management
                </span>
              </motion.h1>
              <motion.p 
                variants={fadeInUp}
                className="mx-auto max-w-2xl text-lg md:text-xl text-gray-600 mb-10 leading-relaxed"
              >
                ADA replaces messy spreadsheets with a unified system. Track orders, manage Bills of Materials (BOM), automate inventory deductions, and monitor your expenses—all in one beautiful dashboard.
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="https://ada-pied-iota.vercel.app/"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-medium text-white transition-all hover:bg-dark hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto gap-2"
                >
                  Start Managing Today <ArrowRight size={18} />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-8 py-4 text-base font-medium text-dark transition-all hover:border-primary hover:text-primary hover:shadow-md w-full sm:w-auto"
                >
                  See How It Works
                </Link>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="mt-10 flex items-center justify-center gap-8 text-sm text-gray-500 font-medium">
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mx-auto mt-20 max-w-6xl rounded-[2rem] border border-white/40 bg-white/40 p-2 md:p-4 shadow-2xl backdrop-blur-xl relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent rounded-[2rem] pointer-events-none"></div>
              <div className="aspect-[16/9] w-full rounded-[1.5rem] bg-gray-50 flex items-center justify-center border border-gray-200/50 shadow-inner relative overflow-hidden">
                <Image src="/images/dashboard-v2.png" alt="ADA Dashboard" fill sizes="(max-width: 768px) 100vw, 80vw" className="object-cover scale-[1.04] origin-left" priority />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Deep Dive Bento Grid Features */}
        <section className="bg-white py-24 lg:py-32 relative overflow-hidden" id="features">
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="font-headline text-3xl md:text-5xl font-bold text-dark mb-4">A unified command center</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">Everything you need to orchestrate your inventory, fulfill orders, and monitor your business health in real-time.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Feature 1 (Spans 2 columns on desktop) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="md:col-span-2 bg-white rounded-3xl p-8 border border-gray-200 hover:shadow-lg transition-all relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-primary mb-6">
                    <Package size={28} />
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-dark mb-3">Bill of Materials (BOM) Automation</h3>
                  <p className="text-gray-600 text-lg leading-relaxed max-w-md mb-8">
                    Link raw materials to your finished products. When a customer places an order, ADA automatically calculates and deducts the exact raw materials used from your inventory.
                  </p>
                  <div className="aspect-[16/9] w-full rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden relative">
                    <Image src="/images/bom.png" alt="BOM Configuration" fill sizes="(max-width: 768px) 100vw, 80vw" className="object-cover object-top" />
                  </div>
                </div>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-3xl p-8 border border-gray-200 hover:shadow-lg transition-all"
              >
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <ShoppingCart size={28} />
                </div>
                <h3 className="font-headline text-2xl font-bold text-dark mb-3">Order Tracking</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Manage the full lifecycle of customer orders. Move them from Pending, to Done, to Delivered with a single click while automatically tracking your revenue.
                </p>
                <ul className="space-y-3">
                  {['Custom status workflows', 'Revenue calculation', 'Customer history'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-dark font-medium">
                      <CheckCircle2 size={16} className="text-primary" /> {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-dark rounded-3xl p-8 border border-slate-800 hover:shadow-2xl transition-all relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(14,116,144,0.15),transparent_50%)]"></div>
                <div className="relative z-10">
                  <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-6 backdrop-blur-md">
                    <TrendingUp size={28} />
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-white mb-3">Expense & Analytics</h3>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    Log general business expenses and material purchases. View your true profit margins and operational costs in intuitive, beautiful charts.
                  </p>
                </div>
              </motion.div>

              {/* Feature 4 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="md:col-span-2 bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border border-gray-200 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col md:flex-row gap-8 items-center h-full">
                  <div className="flex-1">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                      <Shield size={28} />
                    </div>
                    <h3 className="font-headline text-2xl font-bold text-dark mb-3">Secure & Reliable</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Built with modern security practices. Your data is protected by secure JWT authentication, and critical actions are guarded with OTP email verification.
                    </p>
                  </div>
                  <div className="flex-1 w-full bg-white rounded-2xl border border-gray-100 p-8 shadow-lg shadow-gray-200/50 relative overflow-hidden group/modal">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform duration-700 group-hover/modal:scale-150"></div>
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                      <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                        <Shield className="text-green-500 w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-dark text-sm">Security Verification</h4>
                        <p className="text-xs text-gray-500">Enter the 6-digit code</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mb-6 justify-between relative z-10">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className={`w-10 h-12 rounded-lg border ${i <= 3 ? 'border-primary/50 bg-primary/5' : 'border-gray-200 bg-gray-50'} flex items-center justify-center font-bold text-dark shadow-sm`}>
                          {i === 1 ? '4' : i === 2 ? '0' : i === 3 ? '2' : ''}
                          {i === 4 && <div className="w-px h-5 bg-primary animate-pulse"></div>}
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-3 bg-dark text-white rounded-xl font-medium text-sm hover:bg-black transition-colors flex items-center justify-center gap-2 relative z-10">
                      Verify Identity <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Alternating Content / Benefits */}
        <section className="py-24 lg:py-32 bg-gray-50 border-t border-gray-200 relative overflow-hidden" id="benefits">
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="max-w-6xl mx-auto space-y-24">
              
              {/* Benefit 1 */}
              <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="flex-1"
                >
                  <div className="aspect-[16/9] w-full rounded-2xl bg-white border border-gray-200 shadow-xl flex items-center justify-center overflow-hidden relative group">
                    <Image src="/images/materials.png" alt="Material Transactions" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-top" />
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="flex-1 space-y-6"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold">
                    <Clock size={16} /> Save Hours Weekly
                  </div>
                  <h3 className="font-headline text-3xl md:text-4xl font-bold text-dark">Never manually update stock again</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Manual inventory counting is prone to errors and takes away time from growing your business. ADA&apos;s automated deduction engine ensures your raw material stock is always 100% accurate the moment an order is placed.
                  </p>
                </motion.div>
              </div>

              {/* Benefit 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="flex-1"
                >
                  <div className="aspect-[16/9] w-full rounded-2xl bg-white border border-gray-200 shadow-xl flex items-center justify-center overflow-hidden relative group">
                    <Image src="/images/expenses.png" alt="Analytics and Charts" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-top" />
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="flex-1 space-y-6"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold">
                    <Zap size={16} /> Data-Driven Decisions
                  </div>
                  <h3 className="font-headline text-3xl md:text-4xl font-bold text-dark">Crystal clear visibility into your profits</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    By tracking both your revenue from orders and your costs from expenses and material purchases, ADA calculates your true operational health. See instantly which products are most profitable.
                  </p>
                </motion.div>
              </div>

              {/* Client Storefront */}
              <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="flex-1"
                >
                  <div className="aspect-[16/9] w-full rounded-2xl bg-white border border-gray-200 shadow-xl flex items-center justify-center overflow-hidden relative group">
                    <Image src="/images/marketplace.png" alt="Client Portal" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-top scale-[1.04] origin-left" />
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="flex-1 space-y-6"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold">
                    <ShoppingCart size={16} /> Direct Client Portal
                  </div>
                  <h3 className="font-headline text-3xl md:text-4xl font-bold text-dark">Your Catalog, Order Requests, & Tracking</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Impress your clients with a beautiful, pastel-themed storefront. They can browse your product catalog, submit order requests directly to your dashboard, and track their shipping status all in one place.
                  </p>
                </motion.div>
              </div>



            </div>
          </div>
        </section>

        {/* How it works Section (Simplified Steps) */}
        <section className="py-24 lg:py-32 bg-white" id="how-it-works">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="text-center mb-20"
            >
              <h2 className="font-headline text-3xl md:text-5xl font-bold text-dark mb-4">How ADA Works</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">A seamless workflow designed specifically for makers, manufacturers, and small businesses.</p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {[
                { step: "01", title: "Add Materials", desc: "Input your raw inventory and unit costs." },
                { step: "02", title: "Build BOMs", desc: "Link materials to your finished products." },
                { step: "03", title: "Record Orders", desc: "Log sales and let ADA deduct stock automatically." },
                { step: "04", title: "Track Growth", desc: "Monitor revenue and expenses on your dashboard." },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }
                  }}
                  className="relative"
                >
                  <div className="text-6xl font-extrabold text-primary/10 mb-4 font-headline drop-shadow-sm">{item.step}</div>
                  <h3 className="font-headline text-xl font-bold text-dark mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                  {i !== 3 && <div className="hidden md:block absolute top-8 right-[-10%] w-[20%] h-px bg-gray-300"></div>}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-gray-50 border-t border-gray-200">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-dark">Frequently Asked Questions</h2>
            </motion.div>

            <div className="space-y-6">
              {[
                { q: "Is ADA suitable for my specific industry?", a: "ADA is designed for any business that builds or assembles products from raw materials. This includes bakeries, furniture makers, electronics assemblers, craft businesses, and more." },
                { q: "Does ADA integrate with my website?", a: "Currently, ADA acts as your internal command center to log orders manually. Future updates will include API endpoints for direct website integration." },
                { q: "Is my data secure?", a: "Yes. ADA uses secure, encrypted database connections, JWT-based authentication, and OTP email verification for sensitive actions like password resets." },
                { q: "Can I track non-material expenses?", a: "Absolutely. ADA includes a dedicated Expense tracking module where you can categorize and log operational costs like shipping, rent, or marketing." }
              ].map((faq, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm"
                >
                  <h4 className="font-headline text-lg font-bold text-dark mb-2">{faq.q}</h4>
                  <p className="text-gray-600">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-dark py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMzMzMiLz48L3N2Zz4=')] opacity-20"></div>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="max-w-3xl mx-auto"
            >
              <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">Ready to scale your operations?</h2>
              <p className="text-xl text-gray-300 mb-10">Join ADA today and simplify your inventory, orders, and expense management in one powerful platform.</p>
              <Link
                href="https://ada-pied-iota.vercel.app/"
                className="inline-flex items-center justify-center rounded-full bg-primary px-10 py-5 text-lg font-semibold text-white transition-all hover:bg-white hover:text-dark hover:shadow-[0_0_40px_rgba(14,116,144,0.6)] hover:-translate-y-1 gap-2"
              >
                Sign Up Now <CheckCircle2 size={20} />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0B0F19] text-gray-400 py-16 border-t border-gray-800 relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <Package size={28} className="text-primary" />
                <span className="font-headline text-2xl font-bold text-white">ADA</span>
              </div>
              <p className="text-gray-400 max-w-sm text-sm leading-relaxed">
                The comprehensive ERP system designed for makers, manufacturers, and small businesses. Take control of your inventory, automate your BOMs, and scale your operations with crystal clear analytics.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <a href="https://github.com/Renz5678" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary/20 flex items-center justify-center transition-colors text-white hover:text-primary">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-headline font-semibold text-white mb-6 text-lg">Product</h4>
              <ul className="space-y-3">
                <li><Link href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</Link></li>
                <li><Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">How it Works</Link></li>
                <li><Link href="#benefits" className="text-gray-400 hover:text-white transition-colors text-sm">Benefits</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-headline font-semibold text-white mb-6 text-lg">Developer</h4>
              <ul className="space-y-3">
                <li><a href="https://github.com/Renz5678" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm">GitHub</a></li>
                <li><a href="https://www.linkedin.com/in/lawrenz-matthew-garcia-a84018222/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm">LinkedIn</a></li>
                <li><a href="https://www.facebook.com/dwight.garcia.524/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm">Facebook</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-headline font-semibold text-white mb-6 text-lg">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="https://ada-pied-iota.vercel.app/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
                <li><Link href="https://ada-pied-iota.vercel.app/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} ADA. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              Designed with <span className="text-red-500">♥</span> for small businesses
            </div>
          </div>
        </div>
      </footer>
    </ReactLenis>
  );
}
