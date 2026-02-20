import React from 'react';

const Logo: React.FC<{ imageUrl?: string }> = ({ imageUrl }) => {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt="RoadRunner Logo"
        className="h-10 w-auto object-contain cursor-pointer"
      />
    );
  }

  return (
    <div className="flex items-center gap-2 cursor-pointer group">
      <div className="w-8 h-8 bg-white flex items-center justify-center rounded-sm group-hover:bg-zinc-200 transition-colors">
        <span className="text-black font-black text-xl italic leading-none">R</span>
      </div>
      <span className="text-white font-bold text-xl tracking-tighter uppercase">
        Road<span className="text-zinc-500">Runner</span>
      </span>
    </div>
  );
};

export default Logo;
