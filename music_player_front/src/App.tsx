import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import MediaList from './components/MediaList';
import MediaUpload from './components/MediaUpload';
import MyUploads from './components/MyUploads';
import AdminDashboard from './components/AdminDashboard';
import Navigation from './components/Navigation';
import Subscription from './components/Subscription';
import YouTubeMusic from './components/YouTubeMusic';
import Playlists from './components/Playlists';
import EnhancedMediaPlayer from './components/EnhancedMediaPlayer';
import Toast from './components/Toast';
import './App.css';

interface Media {
  mediaId: number;
  title: string;
  url: string;
  composer?: string;
}

enum UserRole {
  User = 1,
  Creator = 2,
  Admin = 3
}

interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  videoId: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.User);
  const [refreshMedia, setRefreshMedia] = useState(0);
  const [globalYouTubePlayer, setGlobalYouTubePlayer] = useState<{video: YouTubeVideo, videos: YouTubeVideo[], index: number} | null>(null);
  const [globalMusicPlayer, setGlobalMusicPlayer] = useState<{media: Media[], currentIndex: number, playlistName?: string, isShuffled?: boolean} | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info' | 'warning'} | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // Decode token to get user role (simplified)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        if (role === 'Creator') setUserRole(UserRole.Creator);
        else if (role === 'Admin') setUserRole(UserRole.Admin);
        else setUserRole(UserRole.User);
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
  }, []);

  const handleLogin = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    // Decode token to get user role and subscription
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      const subscriptionPlanId = payload['SubscriptionPlanId'];
      
      if (role === 'Creator') setUserRole(UserRole.Creator);
      else if (role === 'Admin') setUserRole(UserRole.Admin);
      else setUserRole(UserRole.User);
      
      // Set subscription plan based on token
      if (subscriptionPlanId === '1') {
        localStorage.setItem('subscriptionPlan', 'Free');
        localStorage.setItem('currentPlanId', '1');
      } else if (subscriptionPlanId === '2') {
        localStorage.setItem('subscriptionPlan', 'Premium');
        localStorage.setItem('currentPlanId', '2');
      } else if (subscriptionPlanId === '3') {
        localStorage.setItem('subscriptionPlan', 'Family');
        localStorage.setItem('currentPlanId', '3');
      }
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
    window.location.href = '/';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('subscriptionPlan');
    localStorage.removeItem('currentPlanId');
    setIsAuthenticated(false);
    setUserRole(UserRole.User);
    setGlobalMusicPlayer(null);
    setGlobalYouTubePlayer(null);
  };

  const handleRegister = () => {
    setToast({message: 'Registration successful! Please login.', type: 'success'});
    setTimeout(() => window.location.href = '/login', 1500);
  };

  const handleUploadSuccess = () => {
    setRefreshMedia(prev => prev + 1);
  };

  const handleSubscriptionUpgrade = () => {
    localStorage.setItem('subscriptionPlan', 'Premium');
    window.location.href = '/';
  };

  const LandingPage = () => (
    <div className="landing-page">
      <div className="landing-content">
        <div className="landing-icon">🎧</div>
        <h1 className="landing-title">Music Player</h1>
        <p className="landing-subtitle">Login to start listening to your favorite music</p>
        <div className="landing-buttons">
          <button className="landing-button-primary" onClick={() => window.location.href = '/login'}>Login</button>
          <button className="landing-button-secondary" onClick={() => window.location.href = '/register'}>Register</button>
        </div>
        <div className="landing-icons">
          <span className="landing-icon-small">💿</span>
          <span className="landing-icon-small">🎵</span>
          <span className="landing-icon-small">🎧</span>
        </div>
      </div>
    </div>
  );

  return (
    <BrowserRouter>
      {isAuthenticated && <Navigation userRole={userRole} onLogout={handleLogout} />}
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} onSwitchToRegister={() => window.location.href = '/register'} onSwitchToForgotPassword={() => window.location.href = '/forgot-password'} /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register onRegister={handleRegister} onSwitchToLogin={() => window.location.href = '/login'} /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword onBack={() => window.location.href = '/login'} /> : <Navigate to="/" />} />
        
        <Route path="/" element={isAuthenticated ? <MediaList onMusicPlay={(media, index) => { setGlobalYouTubePlayer(null); setGlobalMusicPlayer({media, currentIndex: index}); }} /> : <Navigate to="/login" />} />
        <Route path="/playlists" element={isAuthenticated ? <Playlists onMusicPlay={(media, index, playlistName, isShuffled) => { setGlobalYouTubePlayer(null); setGlobalMusicPlayer({media, currentIndex: index, playlistName, isShuffled}); }} /> : <Navigate to="/login" />} />
        <Route path="/upload" element={isAuthenticated && userRole >= UserRole.Creator ? <MediaUpload onUploadSuccess={handleUploadSuccess} /> : <Navigate to="/login" />} />
        <Route path="/myuploads" element={isAuthenticated && userRole >= UserRole.Creator ? <MyUploads /> : <Navigate to="/login" />} />
        <Route path="/subscription" element={isAuthenticated && userRole !== UserRole.Admin ? <Subscription onUpgrade={handleSubscriptionUpgrade} /> : <Navigate to="/login" />} />
        <Route path="/youtube" element={isAuthenticated && localStorage.getItem('subscriptionPlan') === 'Premium' ? <YouTubeMusic onPlayVideo={(data) => { setGlobalMusicPlayer(null); setGlobalYouTubePlayer(data); }} /> : <Navigate to="/login" />} />
        <Route path="/admin" element={isAuthenticated && userRole === UserRole.Admin ? <AdminDashboard /> : <Navigate to="/login" />} />
      </Routes>

      {globalMusicPlayer && (
        <EnhancedMediaPlayer
          media={globalMusicPlayer.media}
          currentIndex={globalMusicPlayer.currentIndex}
          onIndexChange={(index) => setGlobalMusicPlayer({...globalMusicPlayer, currentIndex: index})}
          playlistName={globalMusicPlayer.playlistName}
          isShuffled={globalMusicPlayer.isShuffled}
          onClose={() => setGlobalMusicPlayer(null)}
        />
      )}

      {globalYouTubePlayer && (
        <div className="youtube-player-container">
          <div className="youtube-player-content">
            <div className="youtube-player-info">
              <h3 className="youtube-player-title">{globalYouTubePlayer.video.title}</h3>
              <p className="youtube-player-channel">{globalYouTubePlayer.video.channel}</p>
            </div>
            <div className="youtube-player-video">
              <iframe
                key={globalYouTubePlayer.video.videoId}
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${globalYouTubePlayer.video.videoId}?autoplay=1`}
                title={globalYouTubePlayer.video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="youtube-player-controls">
              <button 
                className="youtube-control-button"
                onClick={() => {
                  const prevIndex = (globalYouTubePlayer.index - 1 + globalYouTubePlayer.videos.length) % globalYouTubePlayer.videos.length;
                  setGlobalYouTubePlayer({video: globalYouTubePlayer.videos[prevIndex], videos: globalYouTubePlayer.videos, index: prevIndex});
                }}
              >
                ⏪
              </button>
              <button className="youtube-control-button close" onClick={() => setGlobalYouTubePlayer(null)}>
                ✖
              </button>
              <button 
                className="youtube-control-button"
                onClick={() => {
                  const nextIndex = (globalYouTubePlayer.index + 1) % globalYouTubePlayer.videos.length;
                  setGlobalYouTubePlayer({video: globalYouTubePlayer.videos[nextIndex], videos: globalYouTubePlayer.videos, index: nextIndex});
                }}
              >
                ⏩
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </BrowserRouter>
  );
}

export default App
