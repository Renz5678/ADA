"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Box, CheckCircle2, LayoutDashboard, Package, ShoppingCart, Zap, Shield, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { ReactLenis } from 'lenis/react';

const VantaBackground = () => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<unknown>(null);

  useEffect(() => {
    let effect: unknown;
    if (!vantaEffect && typeof window !== "undefined") {
      import("three").then((THREE) => {
        // Create a clone of THREE so we can monkey-patch it (ES modules are non-extensible)
        const patchedTHREE = { ...THREE, VertexColors: true };
        // @ts-expect-error adding property to window
        window.THREE = patchedTHREE;
        
        // @ts-expect-error missing vanta types
        import("vanta/src/vanta.net").then((VantaNet) => {
          const NET = VantaNet.default || VantaNet;
          effect = NET({
            el: vantaRef.current,
            THREE: patchedTHREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x8d4a52,
            backgroundColor: 0xffffff,
            points: 10.00,
            maxDistance: 20.00,
            spacing: 20.00,
            showDots: true
          });
          setVantaEffect(effect);
        });
      });
    }
    return () => {
      // @ts-expect-error calling destroy on unknown
      if (effect) effect.destroy();
      // @ts-expect-error calling destroy on unknown
      if (vantaEffect) (vantaEffect as { destroy: () => void }).destroy();
    };
  }, [vantaEffect]);

  return (
    <div ref={vantaRef} className="absolute inset-0 z-[0] pointer-events-none opacity-60" />
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
                <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary"/> No credit card required</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary"/> Setup in minutes</div>
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
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNlN2U1ZTQiLz48L3N2Zz4=')] opacity-[0.2] mix-blend-overlay"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm z-10 gap-4">
                   <div className="h-16 w-16 rounded-2xl bg-white shadow-xl flex items-center justify-center text-primary">
                     <LayoutDashboard size={32} />
                   </div>
                   <p className="text-gray-800 font-medium font-headline text-lg">
                     [ PLACEHOLDER: Full Dashboard Screenshot ]
                   </p>
                   <p className="text-sm text-gray-500 max-w-md text-center px-4">This space is reserved for a high-resolution screenshot of your analytics dashboard showing active orders, revenue charts, and recent activity.</p>
                </div>
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
                  <div className="aspect-[21/9] w-full rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden">
                    <p className="text-gray-400 font-medium text-sm flex items-center gap-2">
                       <Box size={16} /> [ PLACEHOLDER: BOM Configuration UI ]
                    </p>
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
                  <div className="flex-1 w-full bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <div className="space-y-4">
                      <div className="h-2 w-1/3 bg-gray-200 rounded-full"></div>
                      <div className="h-10 w-full bg-gray-50 border border-gray-200 rounded-lg"></div>
                      <div className="h-10 w-full bg-primary rounded-lg"></div>
                    </div>
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
                  <div className="aspect-[4/3] w-full rounded-2xl bg-white border border-gray-200 shadow-xl flex items-center justify-center overflow-hidden p-2">
                    <div className="w-full h-full bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center">
                       <p className="text-gray-400 font-medium text-sm">[ PLACEHOLDER: Material Transactions Table ]</p>
                    </div>
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
                  <div className="aspect-[4/3] w-full rounded-2xl bg-white border border-gray-200 shadow-xl flex items-center justify-center overflow-hidden p-2">
                    <div className="w-full h-full bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center">
                       <p className="text-gray-400 font-medium text-sm">[ PLACEHOLDER: Analytics / Charts ]</p>
                    </div>
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
                  <div className="aspect-[4/3] w-full rounded-2xl bg-white border border-gray-200 shadow-xl flex items-center justify-center overflow-hidden p-2">
                    <div className="w-full h-full bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center">
                       <p className="text-gray-400 font-medium text-sm">[ PLACEHOLDER: Client Portal UI ]</p>
                    </div>
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

              {/* Supplier Management */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="flex-1"
                >
                  <div className="aspect-[4/3] w-full rounded-2xl bg-white border border-gray-200 shadow-xl flex items-center justify-center overflow-hidden p-2">
                    <div className="w-full h-full bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center">
                       <p className="text-gray-400 font-medium text-sm">[ PLACEHOLDER: Supplier App View ]</p>
                    </div>
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
                    <Box size={16} /> Supplier Management
                  </div>
                  <h3 className="font-headline text-3xl md:text-4xl font-bold text-dark">Track incoming raw materials effortlessly</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Manage all your supplier contacts and incoming raw material shipments in a single view. Know exactly when your inventory is scheduled to arrive so you can fulfill orders on time.
                  </p>
                </motion.div>
              </div>

              {/* Team Collaboration */}
              <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="flex-1"
                >
                  <div className="aspect-[4/3] w-full rounded-2xl bg-white border border-gray-200 shadow-xl flex items-center justify-center overflow-hidden p-2">
                    <div className="w-full h-full bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center">
                       <p className="text-gray-400 font-medium text-sm">[ PLACEHOLDER: Team Management UI ]</p>
                    </div>
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
                    <CheckCircle2 size={16} /> Team Collaboration
                  </div>
                  <h3 className="font-headline text-3xl md:text-4xl font-bold text-dark">Built for your entire team</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Give customized access to your business partners or employees. Whether they are updating stock on the warehouse floor or fulfilling orders in the office, everyone stays in sync.
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

      <footer className="border-t border-gray-200 bg-white pt-16 pb-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Package size={24} className="text-primary" />
                <span className="font-headline text-xl font-bold text-dark">ADA</span>
              </div>
              <p className="text-gray-500 max-w-sm">The comprehensive ERP system designed for small businesses to track orders, manage expenses, and automate material inventory.</p>
            </div>
            <div>
              <h4 className="font-headline font-bold text-dark mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-500 hover:text-primary">Features</Link></li>
                <li><Link href="#how-it-works" className="text-gray-500 hover:text-primary">How it Works</Link></li>
                <li><Link href="#benefits" className="text-gray-500 hover:text-primary">Benefits</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-bold text-dark mb-4">Account</h4>
              <ul className="space-y-2">
                <li><Link href="https://ada-pied-iota.vercel.app/" className="text-gray-500 hover:text-primary">Log In</Link></li>
                <li><Link href="https://ada-pied-iota.vercel.app/" className="text-gray-500 hover:text-primary">Sign Up</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} ADA. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-gray-400">
              <span className="cursor-pointer hover:text-gray-600">Privacy Policy</span>
              <span className="cursor-pointer hover:text-gray-600">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </ReactLenis>
  );
}
