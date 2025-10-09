import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { FileText, Search, Users, CheckCircle, ArrowRight, Play, Shield, Zap, BarChart3, Filter, Upload, Download, Star, Clock, BookOpen, ChevronRight, Eye, Settings, GitBranch, PieChart, Cpu, ShieldCheck } from "lucide-react";
import logo from "../assets/kior.webp";

export default function CenteredResearchPlatform() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Color variations based on #5b9ac0
  const colors = {
    primary: '#5b9ac0',
    primaryLight: '#7ab1d1',
    primaryLighter: '#9ac7e1',
    primaryLightest: '#b9ddef',
    primaryDark: '#24a2dc',
    primaryDarker: '#396180',
    accent: '#c05b7a',
    accentLight: '#d17a96',
    accentLighter: '#e19ab1',
    neutralLight: '#f8fafc',
    neutral: '#e2e8f0',
    neutralDark: '#cbd5e1'
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Left Gradient Side */}
        <div 
          className="absolute -left-40 top-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{ background: `linear-gradient(135deg, ${colors.primaryLight}20, ${colors.accent}10)` }}
        ></div>
        <div 
          className="absolute left-0 top-1/2 w-80 h-80 rounded-full blur-3xl animate-bounce" 
          style={{ 
            background: `linear-gradient(135deg, ${colors.primaryLighter}15, ${colors.primaryLight}10)`,
            animationDelay: '2s' 
          }}
        ></div>

      </div>

      {/* Header - Centered */}
      <header className="z-50 fixed w-full bg-white backdrop-blur-md border-b border-gray-100/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <img src={logo} className='h-20 w-35 mt-1.5' alt="" />
            
            {/* Navigation Links with Hover Effect */}
            <motion.nav 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden md:flex space-x-8"
            >
              {["Features", "Pricing", "Resources", "About"].map((item) => (
                <a 
                  key={item} 
                  href="#" 
                  className="font-light text-black font-bricolage relative group transition-colors duration-300"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#24a2dc] transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </motion.nav>
            
            {/* Auth Buttons */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <a 
                href="/login" 
                className="font-light text-black font-bricolage hidden md:block transition-colors relative group"
              >
                Sign In
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#24a2dc] transition-all duration-300 group-hover:w-full"></span>
              </a>
             <a href="/register">
              <button 
                
                className="px-3 cursor-pointer py-2 rounded-lg font-bricolage text-white font-light transition-transform duration-200 transform hover:scale-[1.02] bg-black active:scale-[0.98] shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M15 4a4 4 0 0 0-4 4a4 4 0 0 0 4 4a4 4 0 0 0 4-4a4 4 0 0 0-4-4m0 1.9a2.1 2.1 0 1 1 0 4.2A2.1 2.1 0 0 1 12.9 8A2.1 2.1 0 0 1 15 5.9M4 7v3H1v2h3v3h2v-3h3v-2H6V7zm11 6c-2.67 0-8 1.33-8 4v3h16v-3c0-2.67-5.33-4-8-4m0 1.9c2.97 0 6.1 1.46 6.1 2.1v1.1H8.9V17c0-.64 3.1-2.1 6.1-2.1"/>
                </svg>
                Get Started Free
              </button>
              </a>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-40 pb-20">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Trust Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex font-bricolage items-center px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-lg border border-white/50 text-white bg-[#24a2dc]"
            >
              <Zap className="w-4 h-4 mr-2 " />
              100% Free Tool and Free Access To All Features
            </motion.div>
            
            {/* Main Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl md:text-7xl lg:text-7xl font-bold text-black leading-tight mb-8 font-bricolage"
            >
              Screen your research in{' '}
              <span 
                className="block bg-clip-text text-[#24a2dc]"
              >
                 minutes!
              </span>
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl md:text-xl text-black mb-8 leading-relaxed max-w-4xl mx-auto font-light font-bricolage"
            >
              AI-powered systematic review platform that accelerates your research workflow 
              with intelligent screening and collaboration tools.
            </motion.p>

            {/* New Start For Free Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-12"
            >
              <a href="/register">
              <button 
                className="group cursor-pointer bg-[#24a2dc] text-white px-12 py-3 font-bricolage rounded-xl font-normal hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg"
              >
                <span className="relative z-10 flex items-center justify-center">
                 <svg className='mr-2 ' xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="currentColor" d="m10.55 18.2l5.175-6.2h-4l.725-5.675L7.825 13H11.3zm-1.396 2.685l1-6.885h-4.25l7.48-10.788h.462L12.866 11h5l-8.25 9.885zm2.621-8.635"/></svg>
                  Start For Free!
                </span>
              </button>
              </a>
            </motion.div>
            
           </motion.div>
        </div>
      </section>
    </div>
  );
}