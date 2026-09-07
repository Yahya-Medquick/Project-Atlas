import React, { useState } from "react";
import { VideoItem } from "../../types";
import { Play, Clock, Eye, X, ExternalLink, Video } from "lucide-react";

interface VideoCardProps {
  video: VideoItem;
}

/**
 * Extracts clean 11-char YouTube video ID from various formats (URL, embed, ID string)
 */
export function extractYouTubeId(urlOrId?: string): string | null {
  if (!urlOrId || typeof urlOrId !== "string") return null;
  const trimmed = urlOrId.trim();

  // If already clean 11-char alphanumeric ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // If standard YouTube URL (youtube.com, youtu.be, embed, shorts)
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Extract valid YouTube Video ID if present
  const videoId =
    extractYouTubeId(video.videoId) ||
    extractYouTubeId(video.url) ||
    extractYouTubeId((video as any).videoUrl) ||
    extractYouTubeId((video as any).link) ||
    extractYouTubeId(video.id);

  // Determine actual target watch / search URL
  const rawUrl =
    video.url ||
    (video as any).videoUrl ||
    (video as any).link ||
    (videoId
      ? `https://www.youtube.com/watch?v=${videoId}`
      : `https://www.youtube.com/results?search_query=${encodeURIComponent(
          `${video.title || "lecture"} ${video.channelTitle || ""}`.trim()
        )}`);

  // Fallback thumbnails
  const fallbackThumb = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80";

  const currentThumbnail = !imgError && (video.thumbnailUrl || (video as any).thumbnail)
    ? video.thumbnailUrl || (video as any).thumbnail
    : fallbackThumb;

  // Log actual video item data for verification and debugging
  React.useEffect(() => {
    console.log("[VideoCard] Rendering video:", {
      id: video.id,
      title: video.title,
      channelTitle: video.channelTitle,
      videoId,
      targetUrl: rawUrl,
      rawItem: video,
    });
  }, [video, videoId, rawUrl]);

  const handleCardClick = (e: React.MouseEvent) => {
    if (videoId) {
      setIsPlaying(true);
    } else if (rawUrl) {
      // If there is no embedded player ID, open the real video URL directly
      window.open(rawUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <div className="group rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md">
        {/* Thumbnail with overlay play button */}
        <div
          onClick={handleCardClick}
          className="relative aspect-video w-full bg-slate-950 overflow-hidden cursor-pointer group"
          title={videoId ? "Click to play embedded lecture" : "Click to open video guide"}
        >
          <img
            src={currentThumbnail}
            alt={video.title || "Video lecture thumbnail"}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center group-hover:bg-slate-950/20 transition-colors">
            <div className="w-10 h-10 rounded-full bg-slate-900/80 text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-600 transition-all shadow-lg">
              {videoId ? (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              ) : (
                <ExternalLink className="w-4 h-4 text-white" />
              )}
            </div>
          </div>

          {video.duration && (
            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-slate-950/80 text-white text-[10px] font-medium backdrop-blur-xs">
              {video.duration}
            </span>
          )}

          {!videoId && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-rose-600/90 text-white text-[10px] font-semibold flex items-center gap-1 shadow">
              <Video className="w-3 h-3" />
              YouTube Guide
            </span>
          )}
        </div>

        {/* Video Info */}
        <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
              {video.channelTitle || (video as any).channel || "Educational Resource"}
            </div>
            <h3
              onClick={handleCardClick}
              className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors"
              title={video.title}
            >
              {video.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 pt-0.5 leading-relaxed">
              {video.description || "In-depth visual lecture and step-by-step academic explanation."}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {video.views || "100K+ views"}
            </span>
            <div className="flex items-center gap-3">
              {video.publishedAt && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {video.publishedAt}
                </span>
              )}
              {rawUrl && (
                <a
                  href={rawUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                  title="Open video on YouTube"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Video Modal */}
      {isPlaying && videoId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <button
              onClick={() => setIsPlaying(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 transition-colors"
              title="Close Player"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={video.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-base line-clamp-1">{video.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{video.channelTitle}</p>
              </div>
              {rawUrl && (
                <a
                  href={rawUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Watch on YouTube
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
