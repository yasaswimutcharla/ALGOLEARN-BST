import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  FastForward,
  Rewind,
  FileVideo,
  Download,
  Camera,
  CheckCircle2,
  AlertCircle,
  Film,
  Trash2,
  Clock,
  HardDrive,
  Monitor,
  Link as LinkIcon,
  BookmarkPlus,
  Tag,
  Share2,
  Sparkles,
  Repeat,
  Tv,
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

export interface VideoMetadata {
  name: string;
  sizeFormatted: string;
  sizeBytes: number;
  type: string;
  duration: number;
  width: number;
  height: number;
  aspectRatio: string;
  uploadedAt: string;
  isSample?: boolean;
}

export interface VideoBookmark {
  id: string;
  timestamp: number;
  title: string;
  createdAt: string;
}

const SAMPLE_VIDEOS = [
  {
    title: 'Binary Tree Traversal Demo',
    desc: 'Sample educational demonstration video (MP4)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    size: '15.4 MB',
    type: 'video/mp4',
  },
  {
    title: 'Algorithm Animation Clip',
    desc: 'Short sample clip for video testing (MP4)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    size: '158 MB',
    type: 'video/mp4',
  },
];

export const VideoPage: React.FC = () => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoMeta, setVideoMeta] = useState<VideoMetadata | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPiPActive, setIsPiPActive] = useState<boolean>(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [urlInput, setUrlInput] = useState<string>('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<VideoBookmark[]>([]);
  const [newBookmarkTitle, setNewBookmarkTitle] = useState<string>('');
  const [isAddingBookmark, setIsAddingBookmark] = useState<boolean>(false);
  const [snapshotPreview, setSnapshotPreview] = useState<string | null>(null);
  const [uploadSuccessToast, setUploadSuccessToast] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Load a video from a File object
  const handleFileLoad = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please upload a valid video file (.mp4, .webm, .ogg, .mov, etc.)');
      return;
    }

    // Revoke previous object URL if any
    if (videoSrc && videoSrc.startsWith('blob:')) {
      URL.revokeObjectURL(videoSrc);
    }

    const objectUrl = URL.createObjectURL(file);
    setVideoSrc(objectUrl);
    setBookmarks([]);
    setIsPlaying(false);
    setCurrentTime(0);

    setVideoMeta({
      name: file.name,
      sizeFormatted: formatFileSize(file.size),
      sizeBytes: file.size,
      type: file.type || 'video/mp4',
      duration: 0,
      width: 0,
      height: 0,
      aspectRatio: '16:9',
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSample: false,
    });

    setUploadSuccessToast(`"${file.name}" uploaded successfully!`);
    setTimeout(() => setUploadSuccessToast(null), 4000);
    soundManager.playSuccess();
  };

  // Handle URL video loading
  const handleUrlLoad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    try {
      new URL(urlInput.trim());
    } catch {
      setUrlError('Please enter a valid video URL (e.g. https://.../video.mp4)');
      return;
    }

    setUrlError(null);
    if (videoSrc && videoSrc.startsWith('blob:')) {
      URL.revokeObjectURL(videoSrc);
    }

    const cleanUrl = urlInput.trim();
    const urlParts = cleanUrl.split('/');
    const inferredName = urlParts[urlParts.length - 1] || 'Web Video Stream';

    setVideoSrc(cleanUrl);
    setBookmarks([]);
    setIsPlaying(false);
    setCurrentTime(0);

    setVideoMeta({
      name: inferredName,
      sizeFormatted: 'Remote Stream',
      sizeBytes: 0,
      type: 'video/mp4',
      duration: 0,
      width: 0,
      height: 0,
      aspectRatio: '16:9',
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSample: false,
    });

    setUrlInput('');
    setUploadSuccessToast('Remote video stream loaded!');
    setTimeout(() => setUploadSuccessToast(null), 4000);
    soundManager.playSuccess();
  };

  // Load sample video
  const handleLoadSample = (sample: typeof SAMPLE_VIDEOS[0]) => {
    if (videoSrc && videoSrc.startsWith('blob:')) {
      URL.revokeObjectURL(videoSrc);
    }
    setVideoSrc(sample.url);
    setBookmarks([]);
    setIsPlaying(false);
    setCurrentTime(0);

    setVideoMeta({
      name: sample.title,
      sizeFormatted: sample.size,
      sizeBytes: 0,
      type: sample.type,
      duration: 0,
      width: 1280,
      height: 720,
      aspectRatio: '16:9',
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSample: true,
    });

    setUploadSuccessToast(`Loaded sample: "${sample.title}"`);
    setTimeout(() => setUploadSuccessToast(null), 3000);
    soundManager.playClick();
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileLoad(e.dataTransfer.files[0]);
    }
  };

  // Video playback listeners & controls
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current.play().catch(() => {
        // Autoplay policy or interrupt
      });
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const handleSkip = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.min(Math.max(videoRef.current.currentTime + seconds, 0), duration);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    soundManager.playClick();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
    soundManager.playClick();
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
    soundManager.playClick();
  };

  const toggleLoop = () => {
    const nextLoop = !isLooping;
    setIsLooping(nextLoop);
    if (videoRef.current) {
      videoRef.current.loop = nextLoop;
    }
    soundManager.playClick();
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiPActive(false);
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
        setIsPiPActive(true);
      }
    } catch (err) {
      console.warn('PiP not available:', err);
    }
  };

  // Capture frame snapshot to PNG
  const captureFrameSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    setSnapshotPreview(dataUrl);
    soundManager.playSuccess();
  };

  const downloadSnapshot = () => {
    if (!snapshotPreview) return;
    const a = document.createElement('a');
    a.href = snapshotPreview;
    a.download = `video-snapshot-${Math.floor(currentTime)}s.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Bookmarking timestamps
  const handleAddBookmark = () => {
    if (!newBookmarkTitle.trim()) return;
    const bookmark: VideoBookmark = {
      id: `bm-${Date.now()}`,
      timestamp: currentTime,
      title: newBookmarkTitle.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setBookmarks((prev) => [...prev, bookmark].sort((a, b) => a.timestamp - b.timestamp));
    setNewBookmarkTitle('');
    setIsAddingBookmark(false);
    soundManager.playSuccess();
  };

  const handleJumpToBookmark = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      soundManager.playClick();
    }
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((bm) => bm.id !== id));
    soundManager.playClick();
  };

  const handleRemoveVideo = () => {
    if (videoSrc && videoSrc.startsWith('blob:')) {
      URL.revokeObjectURL(videoSrc);
    }
    setVideoSrc(null);
    setVideoMeta(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setBookmarks([]);
    soundManager.playClick();
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if focus is on an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space' && videoSrc) {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft' && videoSrc) {
        e.preventDefault();
        handleSkip(-5);
      } else if (e.code === 'ArrowRight' && videoSrc) {
        e.preventDefault();
        handleSkip(5);
      } else if (e.code === 'KeyM' && videoSrc) {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'KeyF' && videoSrc) {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [videoSrc, togglePlay]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div id="video-section-container" className="space-y-6 pb-12">
      {/* Hidden offscreen canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Success Notification Toast */}
      {uploadSuccessToast && (
        <div
          id="video-toast-notification"
          className="fixed top-20 right-6 z-50 bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <CheckCircle2 className="w-5 h-5 text-indigo-200 flex-shrink-0" />
          <span className="text-sm font-medium">{uploadSuccessToast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-2xs">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Video Player & Uploader
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Upload your video files, analyze video metrics, take high-resolution frame snapshots, and mark timestamps.
              </p>
            </div>
          </div>
        </div>

        {videoSrc && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="upload-new-video-btn"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Another
            </button>
            <button
              id="remove-video-btn"
              onClick={handleRemoveVideo}
              className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
              title="Remove current video"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        )}
      </div>

      {/* If No Video is Loaded: Rich Upload Zone */}
      {!videoSrc ? (
        <div className="space-y-6">
          {/* Drag and Drop Zone */}
          <div
            id="video-dropzone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center transition-all duration-200 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.008]'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,.mp4,.webm,.ogg,.mov,.mkv"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileLoad(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 shadow-sm">
                <Upload className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Drag and drop your video file here
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Supports MP4, WebM, MOV, OGG, and MKV formats. No server upload required — processed entirely on your machine.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  id="browse-files-button"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2"
                >
                  <FileVideo className="w-4 h-4" />
                  Browse Video File
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-mono">.MP4</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-mono">.WEBM</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-mono">.MOV</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-mono">.OGG</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-mono">.MKV</span>
              </div>
            </div>
          </div>

          {/* Quick Options: URL Loader or Preloaded Educational Samples */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Direct URL Loader */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <LinkIcon className="w-3.5 h-3.5" />
                </div>
                <span>Load from Web Video URL</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste any direct video streaming link (.mp4, .webm) to test playback without downloading.
              </p>

              <form onSubmit={handleUrlLoad} className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    id="video-url-input"
                    type="url"
                    placeholder="https://example.com/video.mp4"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 font-mono"
                  />
                  <button
                    id="load-url-btn"
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
                  >
                    Load
                  </button>
                </div>
                {urlError && (
                  <p className="text-[11px] text-red-500 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {urlError}
                  </p>
                )}
              </form>
            </div>

            {/* Test with Sample Video */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span>Test with Sample Video</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Don't have a video handy? Try one of these pre-configured educational sample clips:
              </p>

              <div className="space-y-2 pt-1">
                {SAMPLE_VIDEOS.map((sample, idx) => (
                  <button
                    key={idx}
                    id={`load-sample-btn-${idx}`}
                    onClick={() => handleLoadSample(sample)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/60 hover:border-indigo-300 dark:hover:border-indigo-700 flex items-center justify-between text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100/60 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {sample.title}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {sample.desc} • {sample.size}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform ml-2">
                      Play →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Video Loaded: Interactive Player & Details Layout */
        <div className="space-y-6">
          {/* Main Video Player Container */}
          <div
            ref={playerContainerRef}
            id="video-player-frame"
            className="relative bg-black rounded-3xl overflow-hidden shadow-xl border border-slate-800 group select-none"
          >
            {/* HTML5 Video Element */}
            <video
              ref={videoRef}
              src={videoSrc}
              onClick={togglePlay}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                }
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  const v = videoRef.current;
                  setDuration(v.duration);
                  setVideoMeta((prev) =>
                    prev
                      ? {
                          ...prev,
                          duration: v.duration,
                          width: v.videoWidth,
                          height: v.videoHeight,
                          aspectRatio: `${(v.videoWidth / v.videoHeight).toFixed(2)}:1`,
                        }
                      : null
                  );
                }
              }}
              onEnded={() => setIsPlaying(false)}
              className="w-full max-h-[70vh] object-contain mx-auto cursor-pointer"
              playsInline
            />

            {/* Center Play/Pause Overlay Indicator on Click */}
            {!isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer backdrop-blur-[2px] transition-all"
              >
                <div className="w-20 h-20 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                  <Play className="w-9 h-9 fill-white ml-1" />
                </div>
              </div>
            )}

            {/* Bottom Custom Video Controls Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 sm:p-5 flex flex-col gap-2.5 transition-opacity duration-200">
              {/* Scrubbing Timeline Slider */}
              <div className="flex items-center gap-3">
                <input
                  id="video-scrubber"
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:h-2 transition-all"
                />
              </div>

              {/* Controls Strip */}
              <div className="flex items-center justify-between gap-2 text-white flex-wrap">
                {/* Left Controls: Play/Pause, Skips, Volume, Timer */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    id="video-play-toggle"
                    onClick={togglePlay}
                    className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-white" />
                    ) : (
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    )}
                  </button>

                  <button
                    id="video-rewind-btn"
                    onClick={() => handleSkip(-10)}
                    className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                    title="Rewind 10 seconds"
                  >
                    <Rewind className="w-4 h-4" />
                  </button>

                  <button
                    id="video-forward-btn"
                    onClick={() => handleSkip(10)}
                    className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                    title="Forward 10 seconds"
                  >
                    <FastForward className="w-4 h-4" />
                  </button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-1.5 group/vol">
                    <button
                      id="video-mute-btn"
                      onClick={toggleMute}
                      className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4 text-red-400" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      id="video-volume-slider"
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-14 sm:w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                    />
                  </div>

                  {/* Time Counter */}
                  <div className="text-xs font-mono text-white/90 pl-1">
                    <span>{formatTime(currentTime)}</span>
                    <span className="text-white/50 mx-1">/</span>
                    <span className="text-white/70">{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Right Controls: Speed, Loop, Snapshot, PiP, Fullscreen */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Playback Speed Menu */}
                  <div className="relative">
                    <button
                      id="playback-speed-button"
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 text-xs font-mono font-semibold transition-colors"
                      title="Playback Speed"
                    >
                      {playbackSpeed}x
                    </button>

                    {showSpeedMenu && (
                      <div className="absolute bottom-full right-0 mb-2 bg-slate-900 border border-slate-700 rounded-xl p-1 shadow-xl flex flex-col gap-0.5 z-30">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
                          <button
                            key={spd}
                            onClick={() => handleSpeedChange(spd)}
                            className={`px-3 py-1 rounded-md text-xs font-mono text-left transition-colors ${
                              playbackSpeed === spd
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Loop Toggle */}
                  <button
                    id="video-loop-toggle"
                    onClick={toggleLoop}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isLooping
                        ? 'bg-indigo-600 text-white'
                        : 'hover:bg-white/20 text-white/80 hover:text-white'
                    }`}
                    title={isLooping ? 'Looping enabled' : 'Enable loop'}
                  >
                    <Repeat className="w-4 h-4" />
                  </button>

                  {/* Frame Snapshot */}
                  <button
                    id="video-snapshot-btn"
                    onClick={captureFrameSnapshot}
                    className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                    title="Capture current frame as PNG snapshot"
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  {/* Picture-in-Picture */}
                  <button
                    id="video-pip-btn"
                    onClick={togglePiP}
                    className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                    title="Picture-in-Picture mode"
                  >
                    <Tv className="w-4 h-4" />
                  </button>

                  {/* Fullscreen */}
                  <button
                    id="video-fullscreen-btn"
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F)'}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Video Metadata & Interactive Actions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Details & Bookmarks */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Info Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Video Information
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                      {videoMeta?.name || 'Uploaded Video'}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      id="snapshot-frame-action-btn"
                      onClick={captureFrameSnapshot}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5 text-indigo-500" />
                      Snapshot
                    </button>

                    {videoSrc && (
                      <a
                        id="download-video-file-link"
                        href={videoSrc}
                        download={videoMeta?.name || 'video.mp4'}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-500" />
                        Download
                      </a>
                    )}
                  </div>
                </div>

                {/* 4 Metadata Grid Items */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs mb-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Duration</span>
                    </div>
                    <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                      {formatTime(duration)}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs mb-1">
                      <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Resolution</span>
                    </div>
                    <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                      {videoMeta?.width && videoMeta?.height
                        ? `${videoMeta.width} × ${videoMeta.height}`
                        : 'Auto'}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs mb-1">
                      <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
                      <span>File Size</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {videoMeta?.sizeFormatted || 'Loaded'}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs mb-1">
                      <Tag className="w-3.5 h-3.5 text-indigo-500" />
                      <span>MIME Type</span>
                    </div>
                    <p className="text-sm font-bold font-mono text-slate-900 dark:text-white truncate">
                      {videoMeta?.type || 'video/*'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamp Bookmarks Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <BookmarkPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Timestamps & Bookmarks
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Pin important moments in the video and jump to them in 1 click.
                      </p>
                    </div>
                  </div>

                  {!isAddingBookmark && (
                    <button
                      id="open-add-bookmark-btn"
                      onClick={() => setIsAddingBookmark(true)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      Mark at {formatTime(currentTime)}
                    </button>
                  )}
                </div>

                {/* Add Bookmark Input */}
                {isAddingBookmark && (
                  <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                    <div className="flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200 font-semibold">
                      <span>Bookmark note for timestamp: {formatTime(currentTime)}</span>
                      <button
                        onClick={() => setIsAddingBookmark(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        id="bookmark-title-input"
                        type="text"
                        placeholder="e.g. BST root insertion, traversal phase..."
                        value={newBookmarkTitle}
                        onChange={(e) => setNewBookmarkTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddBookmark();
                        }}
                        autoFocus
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        id="save-bookmark-btn"
                        onClick={handleAddBookmark}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}

                {/* Bookmark List */}
                {bookmarks.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
                    No bookmarks saved yet. Scrub to any position and click "Mark" to record points of interest.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {bookmarks.map((bm) => (
                      <div
                        key={bm.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors group"
                      >
                        <button
                          onClick={() => handleJumpToBookmark(bm.timestamp)}
                          className="flex items-center gap-3 text-left flex-1 min-w-0"
                        >
                          <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold">
                            {formatTime(bm.timestamp)}
                          </span>
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                            {bm.title}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteBookmark(bm.id)}
                          className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1 opacity-60 group-hover:opacity-100 transition-opacity"
                          title="Delete bookmark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right 1 Col: Keyboard Guide & Snapshot Modal/Preview */}
            <div className="space-y-6">
              {/* Snapshot Preview Card if captured */}
              {snapshotPreview && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-indigo-200 dark:border-indigo-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <Camera className="w-4 h-4" />
                      Frame Snapshot Captured
                    </span>
                    <button
                      onClick={() => setSnapshotPreview(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                    >
                      Dismiss
                    </button>
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black">
                    <img
                      src={snapshotPreview}
                      alt="Captured video frame"
                      className="w-full h-auto object-contain"
                    />
                  </div>

                  <button
                    id="download-snapshot-btn"
                    onClick={downloadSnapshot}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PNG Snapshot
                  </button>
                </div>
              )}

              {/* Keyboard Shortcuts Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Keyboard Shortcuts
                </h3>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Play / Pause</span>
                    <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                      Space
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rewind 5s</span>
                    <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                      ←
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Forward 5s</span>
                    <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                      →
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Mute / Unmute</span>
                    <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                      M
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Fullscreen</span>
                    <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                      F
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
