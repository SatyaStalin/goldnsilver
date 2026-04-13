import { useState } from 'react';
import { mediaImages } from '../assets/media';

const MediaPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // YouTube video IDs extracted from the provided URLs
  const youtubeVideos = [
    { id: 'TYP2OKSDUhE', title: 'Video 1' },
    { id: 'dCM5Xv8Qwc4', title: 'Video 2' },
    { id: 'dE9GyK3wgcY', title: 'Video 3' },
    { id: 'dE9GyK3wgcY', title: 'Video 4' },
    { id: 'dE9GyK3wgcY', title: 'Video 5' }
  ];

  // Different styles for images - create variety
  const getImageStyle = (index) => {
    const styles = [
      { gridColumn: 'span 2', gridRow: 'span 2' }, // Large
      { gridColumn: 'span 1', gridRow: 'span 1' }, // Small
      { gridColumn: 'span 2', gridRow: 'span 1' }, // Wide
      { gridColumn: 'span 1', gridRow: 'span 2' }, // Tall
      { gridColumn: 'span 1', gridRow: 'span 1' }, // Small
      { gridColumn: 'span 2', gridRow: 'span 2' }, // Large
      { gridColumn: 'span 1', gridRow: 'span 1' }, // Small
      { gridColumn: 'span 1', gridRow: 'span 1' }, // Small
      { gridColumn: 'span 2', gridRow: 'span 1' }, // Wide
      { gridColumn: 'span 1', gridRow: 'span 1' }, // Small
      { gridColumn: 'span 1', gridRow: 'span 2' }, // Tall
      { gridColumn: 'span 1', gridRow: 'span 1' }, // Small
      { gridColumn: 'span 2', gridRow: 'span 2' }, // Large
      { gridColumn: 'span 1', gridRow: 'span 1' }, // Small
      { gridColumn: 'span 2', gridRow: 'span 1' }, // Wide
      { gridColumn: 'span 1', gridRow: 'span 1' }, // Small
      { gridColumn: 'span 1', gridRow: 'span 2' }, // Tall
      { gridColumn: 'span 1', gridRow: 'span 1' }, // Small
      { gridColumn: 'span 2', gridRow: 'span 1' }, // Wide
      { gridColumn: 'span 1', gridRow: 'span 1' }, // Small
      { gridColumn: 'span 2', gridRow: 'span 2' }, // Large
      { gridColumn: 'span 1', gridRow: 'span 1' }, // Small
      { gridColumn: 'span 1', gridRow: 'span 2' }, // Tall
      { gridColumn: 'span 1', gridRow: 'span 1' }, // Small
      { gridColumn: 'span 2', gridRow: 'span 1' }, // Wide
      { gridColumn: 'span 1', gridRow: 'span 1' }, // Small
      { gridColumn: 'span 1', gridRow: 'span 1' }, // Small
      { gridColumn: 'span 2', gridRow: 'span 2' }  // Large
    ];
    return styles[index % styles.length];
  };

  const getImageClass = (index) => {
    const classes = [
      'media-image-large',
      'media-image-small',
      'media-image-wide',
      'media-image-tall',
      'media-image-small',
      'media-image-large',
      'media-image-small',
      'media-image-small',
      'media-image-wide',
      'media-image-small',
      'media-image-tall',
      'media-image-small',
      'media-image-large',
      'media-image-small',
      'media-image-wide',
      'media-image-small',
      'media-image-tall',
      'media-image-small',
      'media-image-wide',
      'media-image-small',
      'media-image-large',
      'media-image-small',
      'media-image-tall',
      'media-image-small',
      'media-image-wide',
      'media-image-small',
      'media-image-small',
      'media-image-large'
    ];
    return classes[index % classes.length];
  };

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">Media Gallery</h1>
        <p className="page-hero-desc">
          Explore our media coverage, events, campaigns, and highlights featuring our gold &amp; silver solutions.
        </p>
      </div>

      {/* YouTube Videos Section */}
      <section className="panel page-feature">
        <h2>Featured Videos</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--muted)' }}>
          Watch our latest videos, tutorials, and insights about gold &amp; silver investments.
        </p>
        <div className="media-videos-grid">
          {youtubeVideos.map((video, index) => (
            <div 
              key={index} 
              className="media-video-item"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="media-video-wrapper">
                <img 
                  src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                  alt={video.title}
                  className="media-video-thumbnail"
                  onError={(e) => {
                    e.target.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                  }}
                />
                <div className="media-video-overlay">
                  <div className="media-video-play-button">
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="40" cy="40" r="40" fill="rgba(212, 175, 55, 0.9)"/>
                      <path d="M32 24L32 56L56 40L32 24Z" fill="#fff"/>
                    </svg>
                  </div>
                  <div className="media-video-info">
                    <span className="media-video-title">{video.title}</span>
                    <span className="media-video-click">Click to play</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel page-feature">
        <h2>Media Gallery</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--muted)' }}>
          Browse through our collection of media images, press coverage, and event highlights.
        </p>

        <div className="media-gallery">
          {mediaImages.map((image, index) => (
            <div
              key={index}
              className={`media-gallery-item ${getImageClass(index)}`}
              style={getImageStyle(index)}
              onClick={() => setSelectedImage(image)}
            >
              <div className="media-image-wrapper">
                <img src={image} alt={`Media ${1211 + index}`} />
                <div className="media-image-overlay">
                  <div className="media-image-info">
                    <span className="media-image-number">#{1211 + index}</span>
                    <span className="media-image-view">Click to view</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="media-modal" onClick={() => setSelectedVideo(null)}>
          <div className="media-modal-content media-modal-video" onClick={(e) => e.stopPropagation()}>
            <button 
              className="media-modal-close" 
              onClick={() => setSelectedVideo(null)}
              aria-label="Close video"
            >
              ×
            </button>
            <div className="media-video-modal-wrapper">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ width: '100%', height: '100%' }}
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="media-modal" onClick={() => setSelectedImage(null)}>
          <div className="media-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="media-modal-close" onClick={() => setSelectedImage(null)}>
              ×
            </button>
            <img src={selectedImage} alt="Media" />
          </div>
        </div>
      )}

      <section className="panel page-feature" style={{ marginTop: '2rem' }}>
        <h2>Press Highlights</h2>
        <ul className="bullet-list">
          <li>Featured in &quot;Economic Times&quot; as a top digital gold platform.</li>
          <li>Recognized at FinTech India Awards 2025.</li>
          <li>Partnered with leading NBFCs for gold solutions.</li>
          <li>Covered in major financial news outlets.</li>
          <li>Featured in investment and wealth management publications.</li>
        </ul>
      </section>
    </div>
  );
};

export default MediaPage;
