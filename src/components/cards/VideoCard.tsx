import React, { useState } from "react";
import { VideoItem } from "../../types";
import { Play, Clock, Eye, X } from "lucide-react";

interface VideoCardProps {
  video: VideoItem;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <>
      <div className="group rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
        {/* Thumbnail with overlay play button */}
        <div
          onClick={() => setIsPlaying(true)}
          className="relative aspect-video w-full bg-slate-950 overflow-hidden cursor-pointer group"
        >
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </div>
          </div>

          {video.duration && (
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 text-white text-[10px] font-bold">
              {video.duration}
            </span>
          )}
        </div>

        {/* Video Info */}
        <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              {video.channelTitle}
            </div>
            <h3
              onClick={() => setIsPlaying(true)}
              className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
            >
              {video.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 pt-1">
              {video.description}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {video.views || "100K+ views"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {video.publishedAt}
            </span>
          </div>
        </div>
      </div>

      {/* Embedded Video Modal */}
      {isPlaying && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <button
              onClick={() => setIsPlaying(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
                title={video.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-4 bg-slate-900 text-white">
              <h4 className="font-bold text-base">{video.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{video.channelTitle}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
