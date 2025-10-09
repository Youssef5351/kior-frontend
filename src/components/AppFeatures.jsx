import React, { useMemo } from 'react';
import screening from "../assets/screening.png";
import team from "../assets/team1.png";
import collab from "../assets/team.png";
import ai from "../assets/duplicate.png";
export default function StickyScrollLayout() {
  const cards = useMemo(() => [
    {
      number: "01",
      title: "Desktop Screening & Mobile App Access",
      description: "Screen research papers anytime, anywhere with our powerful mobile app. Continue your systematic reviews on the go without missing a beat.",
      image: screening,
      type: "image"
    },
    {
      number: "02", 
      title: "Team Collaboration",
      description: "Work seamlessly with your research team in real-time. Assign papers, resolve conflicts, and maintain consistency across all screening decisions.",
      image: team,
      type: "image"
    },
    {
      number: "03",
      title: "Collaborator Session Tracking", 
      description: "Monitor team productivity with detailed session analytics. Track screening time, progress rates, and identify bottlenecks in your workflow.",
      image: collab,
      type: "image"
    },
    {
      number: "04",
      title: "AI Duplicate Resolver",
      image: ai,
      type: "image"
    }
  ], []);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sticky Left Section - Optimized */}
      <div className="w-[45%] sticky top-0 h-screen flex flex-col justify-center px-16 py-20 will-change-transform">
        <h1 className="text-6xl text-black font-semibold leading-tight font-bricolage mb-6">
          Accelerate research — from screening to insights
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-lg font-bricolage">
          Kior stands out with industry-first mobile screening, real-time team collaboration, and our advanced AI duplicate resolver—giving research teams unprecedented flexibility and accuracy in systematic reviews.
        </p>
        <a href="/register">
        <button 
          className="bg-[black] text-white px-3 py-3 font-bricolage rounded-xl cursor-pointer font-normal hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg active:scale-95"
        >
          <span className="relative z-10 flex items-center justify-center">
            <svg className='mr-2' xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
              <path fill="currentColor" d="m10.55 18.2l5.175-6.2h-4l.725-5.675L7.825 13H11.3zm-1.396 2.685l1-6.885h-4.25l7.48-10.788h.462L12.866 11h5l-8.25 9.885zm2.621-8.635"/>
            </svg>
            Start For Free!
          </span>
        </button>
</a>
      </div>

      {/* Scrolling Right Section - Optimized */}
      <div className="flex-1 bg-gray-50 px-16 py-20 space-y-10">
        {cards.map((card, index) => (
          <Card key={index} card={card} index={index} />
        ))}
      </div>
    </div>
  );
}

// Separate Card component to optimize rendering
const Card = React.memo(({ card, index }) => {
  const renderContent = () => {
    switch (card.type) {
      case "image":
        return (
          <img 
            src={card.image} 
            alt="" 
            loading="lazy"
            className="w-full h-auto rounded-lg mt-4"
          />
        );
      case "chart":
        return (
          <div className="mt-8 bg-gradient-to-br from-green-200 via-emerald-200 to-green-100 rounded-xl p-8 h-64 flex items-center justify-center">
            <div className="text-center w-full">
              <div className="grid grid-cols-3 gap-4 mb-4">
<img src={collab} alt="" />
              </div>
            </div>
          </div>
        );
      case "accuracy":
        return (
          <div className="mt-8 bg-gradient-to-br from-orange-200 via-red-200 to-orange-100 rounded-xl p-8 h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800 mb-2">Perfect</div>
              <p className="text-gray-700 font-semibold">Accuracy Rate</p>
              <p className="text-gray-600 text-sm mt-2">Industry-leading duplicate detection</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-12 shadow-sm font-bricolage will-change-transform">
      <span className="inline-block bg-indigo-100 text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold mb-6 font-bricolage">
        {card.number}
      </span>
      <h2 className="text-4xl font-semibold font-bricolage mb-4 text-[black]">
        {card.title}
      </h2>
      <p className="text-lg leading-relaxed mb-6 text-black font-bricolage">
        {card.description}
      </p>
      {renderContent()}
    </div>
  );
});