import React from 'react';

const ReviewFlowHero = () => {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 relative overflow-hidden">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50" />
            
            {/* Floating Gradient Orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-200 rounded-full opacity-40 blur-3xl animate-float-slow" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-200 rounded-full opacity-40 blur-3xl animate-float-slower" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-100 rounded-full opacity-30 blur-3xl" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center max-w-4xl mx-auto">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-blue-100  text-blue-700 px-4 py-2 rounded-full text-sm font-medium font-bricolage mb-8">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Accelerate Your Research Workflow
                </div>

{/* Headline */}
<h1 className="text-5xl md:text-7xl font-bold font-bricolage text-black mb-6 leading-tight">
    The Future of
    <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-2">
        Research Discovery
    </span>
</h1>

{/* Subtitle */}
<p className="text-xl md:text-2xl text-gray-600 font-bricolage mb-12 max-w-2xl mx-auto leading-relaxed">
    Transform how you conduct systematic reviews with AI that learns, adapts, and accelerates your work.
</p>
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a href="/register">
                    <button className="bg-black text-white px-8 py-4 rounded-xl text-lg font-bricolage font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                        Start Screening Free →
                    </button>
                  </a>  
                </div>
            </div>

            {/* Add floating animation to tailwind config */}
            <style jsx>{`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
                @keyframes float-slower {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(90deg); }
                }
                .animate-float-slow {
                    animation: float-slow 8s ease-in-out infinite;
                }
                .animate-float-slower {
                    animation: float-slower 12s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default ReviewFlowHero;