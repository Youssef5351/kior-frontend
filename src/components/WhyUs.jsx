import React, { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

const Ship = () => {
    const [activeFeature, setActiveFeature] = useState(0);
    const containerRef = useRef(null);
    const observerRef = useRef(null);

    const features = [
        {
            title: "Collaborative Review Sessions",
            description: "View and manage collaborators in real-time screening sessions with synchronized progress tracking and team coordination."
        },
        {
            title: "Intelligent Decision Interface",
            description: "Quick Include/Exclude decision buttons with customizable criteria and keyboard shortcuts for rapid screening workflow."
        },
        {
            title: "Advanced Articles Filtering",
            description: "Powerful filtering system with multiple criteria including keywords, publication dates, study types, and custom tags."
        },
        {
            title: "Industry-Leading Duplicate Resolver",
            description: "Automatically detect and resolve duplicate references with 99% accuracy using advanced matching algorithms."
        },
        {
            title: "Free Mobile Screening Access",
            description: "Complete mobile app for screening on-the-go with full feature parity and offline capability."
        },
        {
            title: "Comprehensive Export & Reporting",
            description: "Export screening results in multiple formats with detailed reports"
        }
    ];

    useEffect(() => {
        // Simple Intersection Observer - much more performant
        const options = {
            root: null,
            rootMargin: '-20% 0px -20% 0px',
            threshold: 0
        };

        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = parseInt(entry.target.dataset.index);
                    setActiveFeature(index);
                }
            });
        }, options);

        // Observe all feature elements
        const featureElements = containerRef.current?.querySelectorAll('[data-feature]');
        featureElements?.forEach(el => {
            observerRef.current.observe(el);
        });

        return () => {
            observerRef.current?.disconnect();
        };
    }, []);

    return (
        <div className="bg-white">
            {/* Title - OPTIMIZED - Removed blur effect */}
            <div className="py-20 bg-white">
                <h2 className="text-8xl lg:text-[14rem] -tracking-[.03em] font-medium leading-[1.2] text-center">
                    <span className="text-gray-200 font-bricolage">Screen</span>{' '}
                    <span className="relative inline-block text-[#24a2dc] font-bricolage">
                        faster
                        {/* Simplified gradient effect */}
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/50 to-transparent transform scale-110 opacity-30"></span>
                    </span>
                </h2>
            </div>

            {/* Why Teams Choose Section - HEAVILY OPTIMIZED */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    {/* Left Side - Sticky Content */}
                    <div className="lg:sticky lg:top-24 space-y-8">
                        <div className="space-y-6">
                            <h1 className="text-4xl lg:text-6xl font-bold text-[#24a2dc] leading-tight font-bricolage">
                                Why teams choose Kior
                            </h1>
                            <p className="text-lg lg:text-xl text-gray-600 leading-relaxed font-bricolage">
                                We're built to give Product, Engineering, Marketing, and Data teams the confidence to stop guessing and start growing.
                            </p>
                        </div>
<a href="/register">
                        <button className="bg-gray-900 font-bricolage text-white px-8 py-4 rounded-full font-normal hover:bg-gray-800 transition-colors duration-200 inline-flex items-center gap-2">
                            Start Free!
                            <span>→</span>
                        </button>
</a>
                    </div>

                    {/* Right Side - SIMPLIFIED Scrollable Features */}
                    <div ref={containerRef} className="space-y-6">
                        {features.map((feature, index) => (
                            <FeatureCard 
                                key={index}
                                feature={feature}
                                index={index}
                                isActive={activeFeature === index}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Separate memoized component for better performance
const FeatureCard = React.memo(({ feature, index, isActive }) => {
    return (
        <div
            data-feature="true"
            data-index={index}
            className={`group bg-white rounded-xl p-6 border-2 transition-all duration-200 ${
                isActive
                    ? 'border-[#24a2dc] shadow-lg scale-[1.01]'
                    : 'border-gray-100 shadow-sm'
            }`}
        >
            {/* Number Badge - Simplified */}
            <div className={`inline-flex w-8 h-8 rounded-full items-center justify-center text-white text-sm font-bold mb-4 transition-colors duration-200 ${
                isActive
                    ? 'bg-[#24a2dc]'
                    : 'bg-gray-400'
            }`}>
                {index + 1}
            </div>

            <div className="flex items-start gap-4">
                <div className={`mt-1 flex-shrink-0 transition-colors duration-200 ${
                    isActive ? 'text-[#24a2dc]' : 'text-gray-400'
                }`}>
                    <Check size={20} strokeWidth={2.5} />
                </div>
                <div className="space-y-3">
                    <h3 className={`text-xl font-bold transition-colors duration-200 font-bricolage ${
                        isActive ? 'text-[#24a2dc]' : 'text-gray-900'
                    }`}>
                        {feature.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed font-bricolage">
                        {feature.description}
                    </p>
                </div>
            </div>

            {/* Active Indicator - Simplified */}
            <div className={`h-1 bg-[#24a2dc] rounded-b-xl transition-all duration-200 mt-4 ${
                isActive ? 'w-full' : 'w-0'
            }`} />
        </div>
    );
});

export default Ship;