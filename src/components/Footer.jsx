// components/Footer.js
import React from 'react';
import logo from "../assets/kior1.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#17394c] text-white font-bricolage relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5"></div>
      
      <div className="flex flex-col items-center justify-center w-full py-12 px-4 relative z-10">
        
        {/* Logo Section */}
        <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
          <img src={logo} className='h-30 w-58 object-contain filter drop-shadow-lg' alt="Kior Logo" />
        </div>


        {/* Description Text */}
        <p className="text-center max-w-2xl mx-auto text-lg mb-8 px-6 text-white font-bricolage leading-relaxed font-light italic">
          "We ensure a detailed description of the system, providing comprehensive insights and analysis for research excellence."
        </p>

        {/* Decorative Separator */}
        <div className="relative w-48 h-px my-6">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rotate-45 bg-cyan-400"></div>
        </div>

        <div className="text-center mb-6">
          <div className="text-xs uppercase tracking-widest text-white mb-3 font-semibold">
            © All Copy Rights Reserved to 
          </div>
          <div className="flex gap-8 text-lg font-semibold">
              <a href='https://scholar.google.com/citations?user=sUz12vMAAAAJ&hl=en' target="_blank" rel="noopener noreferrer">
           
            <span className="text-white hover:text-amber-50 transition-colors duration-300 cursor-pointer">
              Omar Elkoumi
            </span>
            </a>
            <span className="text-cyan-400">|</span>
            <a href="https://www.researchgate.net/profile/Ahmed-Elkoumi" target="_blank" rel="noopener noreferrer">
            <span className="text-white hover:text-amber-50 transition-colors duration-300 cursor-pointer">
              Ahmed Elkoumi 
            </span>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-sm text-white mb-6 font-light">
           {currentYear}
        </div>

      </div>

      {/* Floating particles animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30 animate-float"
            style={{
              left: `${20 + i * 15}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${8 + i * 2}s`
            }}
          />
        ))}
      </div>
    </footer>
  );
};

export default Footer;