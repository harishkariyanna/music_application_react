import { useState, useEffect } from 'react';
import { mediaService } from '../services/api';
import Toast from './Toast';
import './MediaUpload.css';

enum MediaType {
  Music = 1,
  Video = 2,
  Podcast = 3,
  AudioBook = 4
}

enum Genre {
  Pop = 1,
  Rock = 2,
  HipHop = 3,
  Electronic = 4,
  Classical = 5,
  Jazz = 6,
  Country = 7,
  RnB = 8,
  Reggae = 9,
  Folk = 10,
  Alternative = 11,
  Indie = 12,
  Other = 99
}

interface MediaUploadProps {
  onUploadSuccess: () => void;
}

interface ValidationErrors {
  file?: string;
  title?: string;
  durationInMinutes?: string;
  thumbnail?: string;
}

export default function MediaUpload({ onUploadSuccess }: MediaUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [thumbnailOptional, setThumbnailOptional] = useState(false);
  const [composerImage, setComposerImage] = useState<File | null>(null);
  const [composerImagePreview, setComposerImagePreview] = useState<string>('');
  const [showComposerImageUpload, setShowComposerImageUpload] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    mediaType: MediaType.Music,
    genre: Genre.Pop,
    durationInMinutes: 0,
    composer: '',
    album: '',
    description: '',
    language: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'warning'} | null>(null);
  const [composers, setComposers] = useState<string[]>([]);
  const [albums, setAlbums] = useState<string[]>([]);
  
  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi', 'Punjabi', 'Gujarati', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Chinese', 'Arabic', 'Portuguese', 'Russian', 'Italian'];

  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      const data = await mediaService.getAll();
      const uniqueComposers = [...new Set(data.map(m => m.composer).filter(Boolean))] as string[];
      const uniqueAlbums = [...new Set(data.map(m => m.album).filter(Boolean))] as string[];
      setComposers(uniqueComposers);
      setAlbums(uniqueAlbums);
    } catch (error) {
      console.error('Failed to load existing data:', error);
    }
  };

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'file':
        if (!value) return 'Media file is required';
        return '';
      case 'title':
        if (!value?.trim()) return 'Title is required';
        if (value.length < 2) return 'Title must be at least 2 characters';
        if (value.length > 100) return 'Title must be less than 100 characters';
        return '';
      case 'durationInMinutes':
        if (!value || value <= 0) return 'Duration must be greater than 0';
        if (value > 1440) return 'Duration cannot exceed 24 hours';
        return '';
      case 'thumbnail':
        if (!thumbnailOptional && !value) return 'Thumbnail is required (or check "No thumbnail available")';
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field === 'title' || field === 'durationInMinutes') {
      setFormData({ ...formData, [field]: value });
    }
    const error = validateField(field, value);
    setErrors({ ...errors, [field]: error });
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleComposerChange = (newValue: string) => {
    setFormData({ ...formData, composer: newValue });
    const isNewComposer = !composers.includes(newValue);
    setShowComposerImageUpload(isNewComposer && newValue.trim() !== '');
    if (!isNewComposer) {
      setComposerImage(null);
      setComposerImagePreview('');
    }
  };

  const detectMediaType = (fileName: string): MediaType => {
    const ext = fileName.toLowerCase().split('.').pop();
    const audioExts = ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg'];
    const videoExts = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv'];
    
    if (audioExts.includes(ext || '')) return MediaType.Music;
    if (videoExts.includes(ext || '')) return MediaType.Video;
    return MediaType.Music;
  };

  const getMediaDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const media = document.createElement(file.type.startsWith('video') ? 'video' : 'audio');
      media.preload = 'metadata';
      
      media.onloadedmetadata = () => {
        const duration = Math.ceil(media.duration / 60);
        resolve(duration || 3);
      };
      
      media.onerror = () => resolve(3);
      media.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    const title = selectedFile.name.replace(/\.[^/.]+$/, '');
    const mediaType = detectMediaType(selectedFile.name);
    const duration = await getMediaDuration(selectedFile);
    
    setFormData(prev => ({
      ...prev,
      title,
      mediaType,
      durationInMinutes: duration
    }));

    const fileError = validateField('file', selectedFile);
    setErrors({ ...errors, file: fileError });
    setTouched({ ...touched, file: true });
  };

  const handleThumbnailChange = (selectedFile: File) => {
    setThumbnail(selectedFile);
    setThumbnailPreview(URL.createObjectURL(selectedFile));
    const thumbnailError = validateField('thumbnail', selectedFile);
    setErrors({ ...errors, thumbnail: thumbnailError });
    setTouched({ ...touched, thumbnail: true });
  };

  const isFormValid = () => {
    const fileError = validateField('file', file);
    const titleError = validateField('title', formData.title);
    const durationError = validateField('durationInMinutes', formData.durationInMinutes);
    const thumbnailError = validateField('thumbnail', thumbnail);
    
    return !fileError && !titleError && !durationError && !thumbnailError &&
           file && formData.title && formData.durationInMinutes > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({ file: true, title: true, durationInMinutes: true, thumbnail: true });
    
    const fileError = validateField('file', file);
    const titleError = validateField('title', formData.title);
    const durationError = validateField('durationInMinutes', formData.durationInMinutes);
    const thumbnailError = validateField('thumbnail', thumbnail);
    
    setErrors({
      file: fileError,
      title: titleError,
      durationInMinutes: durationError,
      thumbnail: thumbnailError
    });

    if (fileError || titleError || durationError || thumbnailError) {
      return;
    }

    setLoading(true);
    setError('');

    const uploadData = new FormData();
    uploadData.append('file', file!);
    if (thumbnail) uploadData.append('thumbnail', thumbnail);
    if (composerImage) uploadData.append('composerImage', composerImage);
    uploadData.append('title', formData.title);
    uploadData.append('mediaType', formData.mediaType.toString());
    uploadData.append('genre', formData.genre.toString());
    uploadData.append('durationInMinutes', formData.durationInMinutes.toString());
    uploadData.append('releaseDate', new Date().toISOString());
    if (formData.composer) uploadData.append('composer', formData.composer);
    if (formData.album) uploadData.append('album', formData.album);
    if (formData.description) uploadData.append('description', formData.description);
    if (formData.language) uploadData.append('language', formData.language);

    try {
      await mediaService.upload(uploadData);
      setFile(null);
      setThumbnail(null);
      setThumbnailPreview('');
      setThumbnailOptional(false);
      setComposerImage(null);
      setComposerImagePreview('');
      setShowComposerImageUpload(false);
      setFormData({
        title: '',
        mediaType: MediaType.Music,
        genre: Genre.Pop,
        durationInMinutes: 0,
        composer: '',
        album: '',
        description: '',
        language: ''
      });
      setErrors({});
      setTouched({});
      setToast({message: 'Upload successful!', type: 'success'});
      onUploadSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data || 'Upload failed';
      setError(errorMsg);
      setToast({message: errorMsg, type: 'error'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1 className="upload-title">🎵 Upload Media</h1>
        <p className="upload-subtitle">Share your music, videos, and podcasts with the world</p>
      </div>

      <div className="upload-card">
        {error && <div className="alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Media File <span className="required">*</span></label>
            <div 
              className={`upload-zone ${file ? 'active' : ''} ${errors.file && touched.file ? 'error' : ''}`}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <div className="upload-icon">🎵</div>
              <div className="upload-text">{file ? file.name : 'Choose Media File'}</div>
              <div className="upload-hint">MP3, WAV, FLAC, MP4, AVI, MKV</div>
            </div>
            <input 
              id="file-input"
              type="file" 
              accept="audio/*,video/*" 
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])} 
              style={{ display: 'none' }}
            />
            {errors.file && touched.file && <div className="error-message">⚠ {errors.file}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Thumbnail {!thumbnailOptional && <span className="required">*</span>}</label>
            <div 
              className={`upload-zone ${thumbnail ? 'active' : ''} ${errors.thumbnail && touched.thumbnail ? 'error' : ''}`}
              onClick={() => !thumbnailOptional && document.getElementById('thumbnail-input')?.click()}
              style={{ opacity: thumbnailOptional ? 0.5 : 1, cursor: thumbnailOptional ? 'not-allowed' : 'pointer' }}
            >
              {thumbnailPreview ? (
                <div className="thumbnail-preview">
                  <img src={thumbnailPreview} alt="Thumbnail" className="thumbnail-image" />
                  <div className="thumbnail-info">✓ {thumbnail?.name}</div>
                </div>
              ) : (
                <>
                  <div className="upload-icon">🖼️</div>
                  <div className="upload-text">{thumbnailOptional ? 'Thumbnail Skipped' : 'Choose Thumbnail'}</div>
                  <div className="upload-hint">JPG, PNG, GIF (300x300px recommended)</div>
                </>
              )}
            </div>
            <input 
              id="thumbnail-input"
              type="file" 
              accept="image/*" 
              onChange={(e) => e.target.files?.[0] && handleThumbnailChange(e.target.files[0])} 
              style={{ display: 'none' }}
              disabled={thumbnailOptional}
            />
            <div className="checkbox-wrapper">
              <input 
                type="checkbox" 
                id="no-thumbnail"
                checked={thumbnailOptional}
                onChange={(e) => {
                  setThumbnailOptional(e.target.checked);
                  if (e.target.checked) setErrors({ ...errors, thumbnail: '' });
                }}
              />
              <label htmlFor="no-thumbnail">No thumbnail available</label>
            </div>
            {errors.thumbnail && touched.thumbnail && !thumbnailOptional && <div className="error-message">⚠ {errors.thumbnail}</div>}
          </div>

          <div className="section-divider">📝 Basic Information</div>

          <div className="form-group">
            <label className="form-label">Title <span className="required">*</span></label>
            <input 
              type="text"
              className={`form-input ${errors.title && touched.title ? 'error' : ''}`}
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              onBlur={() => handleBlur('title')}
              placeholder="Enter media title"
            />
            {errors.title && touched.title && <div className="error-message">⚠ {errors.title}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Duration (minutes) <span className="required">*</span></label>
            <input 
              type="number"
              className={`form-input ${errors.durationInMinutes && touched.durationInMinutes ? 'error' : ''}`}
              value={formData.durationInMinutes}
              onChange={(e) => handleInputChange('durationInMinutes', Number(e.target.value))}
              onBlur={() => handleBlur('durationInMinutes')}
              min="1"
              max="1440"
            />
            {errors.durationInMinutes && touched.durationInMinutes && <div className="error-message">⚠ {errors.durationInMinutes}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Media Type</label>
            <select 
              className="form-select"
              value={formData.mediaType}
              onChange={(e) => setFormData({ ...formData, mediaType: Number(e.target.value) as MediaType })}
            >
              <option value={MediaType.Music}>🎵 Music</option>
              <option value={MediaType.Video}>🎥 Video</option>
              <option value={MediaType.Podcast}>🎧 Podcast</option>
              <option value={MediaType.AudioBook}>📖 AudioBook</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Genre</label>
            <select 
              className="form-select"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: Number(e.target.value) as Genre })}
            >
              <option value={Genre.Pop}>Pop</option>
              <option value={Genre.Rock}>Rock</option>
              <option value={Genre.HipHop}>Hip Hop</option>
              <option value={Genre.Electronic}>Electronic</option>
              <option value={Genre.Classical}>Classical</option>
              <option value={Genre.Jazz}>Jazz</option>
              <option value={Genre.Country}>Country</option>
              <option value={Genre.RnB}>R&B</option>
              <option value={Genre.Other}>Other</option>
            </select>
          </div>

          <div className="section-divider">🎼 Additional Details</div>

          <div className="form-group">
            <label className="form-label">Composer/Artist</label>
            <input 
              type="text"
              className="form-input"
              value={formData.composer}
              onChange={(e) => handleComposerChange(e.target.value)}
              placeholder="Enter composer or artist name"
              list="composers-list"
            />
            <datalist id="composers-list">
              {composers.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div className="form-group">
            <label className="form-label">Album</label>
            <input 
              type="text"
              className="form-input"
              value={formData.album}
              onChange={(e) => setFormData({ ...formData, album: e.target.value })}
              placeholder="Enter album name"
              list="albums-list"
            />
            <datalist id="albums-list">
              {albums.map(a => <option key={a} value={a} />)}
            </datalist>
          </div>

          <div className="form-group">
            <label className="form-label">Language</label>
            <input 
              type="text"
              className="form-input"
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              placeholder="e.g., English, Hindi, Tamil"
              list="languages-list"
            />
            <datalist id="languages-list">
              {languages.map(lang => <option key={lang} value={lang} />)}
            </datalist>
          </div>

          {showComposerImageUpload && (
            <div className="form-group">
              <label className="form-label">🎤 {formData.composer}'s Image (Optional)</label>
              <div 
                className="upload-zone"
                onClick={() => document.getElementById('composer-input')?.click()}
                style={{ padding: '30px' }}
              >
                {composerImagePreview ? (
                  <div className="thumbnail-preview">
                    <img src={composerImagePreview} alt="Composer" className="thumbnail-image" style={{ borderRadius: '50%' }} />
                    <div className="thumbnail-info">✓ {composerImage?.name}</div>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon" style={{ fontSize: '40px' }}>👤</div>
                    <div className="upload-text" style={{ fontSize: '1rem' }}>Add Profile Image</div>
                  </>
                )}
              </div>
              <input 
                id="composer-input"
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setComposerImage(file);
                    setComposerImagePreview(URL.createObjectURL(file));
                  }
                }} 
                style={{ display: 'none' }}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell us about this media..."
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading || !isFormValid()}
          >
            {loading ? '⏳ Uploading...' : '🚀 Upload Media'}
          </button>
        </form>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
