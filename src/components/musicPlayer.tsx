import React, { useState, useRef } from 'react';
import YouTube from 'react-youtube';
import { FaPlay, FaPause, FaForward, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { FiMenu, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const tracks = [
  { videoId: 'xaDrA52h7CQ', title: 'Aoi Sangosho' },
  { videoId: 'rGxC297V1wM', title: 'Where Our Blue Is' },
  { videoId: 'EJAEzPwcQPs', title: 'Peace Sign' },
  { videoId: 'ChukpOHfAI8', title: 'Nobody' },
  { videoId: 'jAcndcCIzQ4', title: 'Mixed Nuts' },
  { videoId: 'IYEjGdP0x1k', title: 'Genjyo Destruction'},
];

const getRandomTrack = (currentTrackIndex: number) => {
    let newTrackIndex;
    do {
      newTrackIndex = Math.floor(Math.random() * tracks.length);
    } while (newTrackIndex === currentTrackIndex);
    return tracks[newTrackIndex];
  };

const MusicPlayer: React.FC = () => {
    const [currentTrack, setCurrentTrack] = useState(tracks[0]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showPlaylist, setShowPlaylist] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const playerRef = useRef<any>(null);

  const onPlay = () => {
    setIsPlaying(true);
    if (playerRef.current) playerRef.current.playVideo();
  };

  const onPause = () => {
    setIsPlaying(false);
    if (playerRef.current) playerRef.current.pauseVideo();
  };

  const nextTrack = () => {
    const newTrack = getRandomTrack(currentTrackIndex);
    setCurrentTrack(newTrack);
    setCurrentTrackIndex(tracks.indexOf(newTrack));
    setIsPlaying(true);
    if (playerRef.current) playerRef.current.loadVideoById(newTrack.videoId);
  };

  const selectTrack = (track: { videoId: string, title: string }) => {
    setCurrentTrack(track);
    setCurrentTrackIndex(tracks.indexOf(track));
    setShowPlaylist(false);
    setIsPlaying(true);
    if (playerRef.current) playerRef.current.loadVideoById(track.videoId);
  };

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
      } else {
        playerRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const onReady = (event: any) => {
    playerRef.current = event.target;
  };


  const opts = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 1,
      controls: 0, // Hide default YouTube controls
      origin: window.location.origin, // Ensure the origin is set correctly
    },
  };

  return (
    <div className={`music-player ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="track-info" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h4>
          {isCollapsed ? 'Open Music Player' : (
            <>
              &nbsp;Now Playing.. <span>{currentTrack.title}</span>
            </>
          )}
        </h4>
        <button className="collapse-button">
          {isCollapsed ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      </div>
      {!isCollapsed && (
        <>
          <YouTube
            videoId={currentTrack.videoId}
            opts={opts}
            onReady={onReady}
            onPlay={onPlay}
            onPause={onPause}
            onEnd={nextTrack}
          />
          <div className="music-controls">
            <button onClick={() => setShowPlaylist(!showPlaylist)}><FiMenu /></button>
            <button onClick={isPlaying ? onPause : onPlay}>
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button onClick={nextTrack}><FaForward /></button>
            <button onClick={toggleMute}>
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
          </div>
          {showPlaylist && (
            <div className="playlist">
              {tracks.map((track, index) => (
                <div key={index} className="playlist-item" onClick={() => selectTrack(track)}>
                  {track.title}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MusicPlayer;
