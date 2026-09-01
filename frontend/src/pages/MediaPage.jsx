import { useMemo, useState } from 'react';
import {
  img801,
  img802,
  img810,
  img811,
  img817,
  img818,
  img819,
  img820,
  img821,
  img822,
  img824,
  img831,
  img832,
  img833,
  img834,
  img835,
  img836,
  img837,
  img838,
  img839,
  img840,
  img841,
  img842,
  img847,
  img848,
  img850,
  img851,
  img852,
  img853,
  img854,
  img855,
  img856,
  rect628
} from '../assets/media';
import heroBanner from '../assets/media/image 797.png';
import './PageShell.css';
import './MediaPage.css';

const printMediaModules = import.meta.glob('../assets/media/print-media/print-media-*.png', {
  eager: true,
  import: 'default'
});

const printMediaImages = Object.keys(printMediaModules)
  .sort((a, b) => {
    const na = Number(a.match(/print-media-(\d+)/)?.[1] || 0);
    const nb = Number(b.match(/print-media-(\d+)/)?.[1] || 0);
    return na - nb;
  })
  .map((key) => printMediaModules[key]);

/** Figma collage layout — grid spans & aspect ratios per clip */
const PRINT_MEDIA_LAYOUT = [
  { gridColumn: 'span 7', aspectRatio: '587 / 430' },
  { gridColumn: 'span 5', aspectRatio: '463 / 271' },
  { gridColumn: 'span 6', aspectRatio: '414 / 652' },
  { gridColumn: 'span 6', aspectRatio: '420 / 626' },
  { gridColumn: 'span 5', aspectRatio: '308 / 625' },
  { gridColumn: 'span 7', aspectRatio: '486 / 577' },
  { gridColumn: 'span 8', aspectRatio: '703 / 478' },
  { gridColumn: 'span 4', aspectRatio: '332 / 278' }
];

const MEDIA_TABS = [
  { id: 'print', label: 'Print Media' },
  { id: 'tv', label: 'TV Media' },
  { id: 'social', label: 'Social Media' }
];

const FILTER_TABS = [
  { id: 'latest', label: 'Latest' },
  { id: 'month', label: 'One Month' },
  { id: 'archives', label: 'Archives' }
];

const ARCHIVE_FILTERS = ['12 months', '2025', '2024', '2023', '2022'];

const LAUNCH_CAPTION =
  'Launch of E-commerce Portal Goldnsilver of Nihar info Global Ltd by Dr. Dasari Narayana Rao (Film Director), Jayasudha Kapoor (famous film artist) and Jeevitha Rajashekhar (famous film artist) in Hyderabad, India.';

const facebookEmbedUrl = (url) =>
  `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&t=0`;

const featuredVideos = [
  {
    id: 'sakshi',
    channel: 'Sakshi',
    url: 'https://www.facebook.com/reel/442890822561661',
    title: LAUNCH_CAPTION,
    date: '30th Oct 2015'
  },
  {
    id: 'etv',
    channel: 'ETV',
    url: 'https://www.facebook.com/reel/442889529228457',
    title: LAUNCH_CAPTION,
    date: '30th Oct 2015'
  },
  {
    id: 'tv5',
    channel: 'TV5',
    url: 'https://www.facebook.com/reel/443436279173782',
    title: LAUNCH_CAPTION,
    date: '30th Oct 2015'
  }
];

const galleryItems = [
  {
    img: img801,
    title: 'GoldnSilver Official Launch – 2015',
    text: 'A memorable moment from the official launch of GoldnSilver, held in Hyderabad on 30 October 2015. The event marked an important and milestone in GoldnSilver’s journey, bringing together distinguished guests and well-wishers.'
  },
  {
    img: img802,
    title: 'Gold & Silver Portal Launch Event',
    text: 'Dr. Dasari Narayana Rao garu and Jeevitha Rajasekhar garu lighting the Oil Lamp at the Launch Event of the ecommerce portal Goldnsilver — at Mari Gold (By Green Park ).'
  },
  {
    img: img839,
    title: 'GoldnSilver Official Launch – 2015',
    text: 'A memorable moment from the official launch of GoldnSilver, held in Hyderabad on 30 October 2015. The event marked an important and milestone in GoldnSilver’s journey, bringing together distinguished guests and well-wishers.'
  },
  {
    img: img837,
    title: 'Gold & Silver Portal Launch Event',
    text: 'Sahajanati Dr. Jayasudha Kapoor garu lighting the Oil Lamp at the Launch Event of the ecommerce portal Goldnsilver — at Mari Gold (By Green Park ).'
  },
  {
    img: img838,
    title: 'GoldnSilver Launch Event – Team & Dignitaries',
    text: 'Chief Guest, Dr. Dasari Narayana Rao garu officially launched the portal www. Goldnsilver.in during the event. — at Mari Gold (By Green Park ).'
  },
  {
    img: img811,
    title: 'GoldnSilver.shop Launch Event – A Memorable Moment',
    text: 'A special moment from the GoldnSilver launch event, celebrating collaboration, partnership, and the journey toward trusted gold and silver investments.'
  },
  {
    img: img817,
    title: 'Silver Craftsmanship & Elegance',
    text: 'Pure 92.5 Sterling Silver Products of Episode on display at the Launch Event of the eCommerce Portal Goldnsilver — at Mari Gold (By Green Park ).'
  },
  {
    img: img819,
    title: 'Elegant Silver Artistry – Traditional Craftsmanship',
    text: 'Pure 92.5 Sterling Silver Products of Episode on display at the Launch Event of the eCommerce Portal Goldnsilver.in — at Mari Gold (By Green Park ).'
  },
  {
    img: img820,
    title: 'Silver Collection – Timeless Designs',
    text: 'MMTC - PAMP Silver Coins being displayed at the Launch event of eCommerce portal Goldnsilver by StockHolding - SHCIL — at Mari Gold (By Green Park ).'
  },
  {
    img: img818,
    title: 'GoldnSilver Launch Event – Celebration & Elegance',
    text: 'A vibrant moment from the GoldnSilver launch event, featuring elegantly dressed guests showcasing the spirit of the celebration.'
  },
  {
    img: img821,
    title: 'Jeevta Rajshekar – GoldnSilver Launch Event',
    text: 'Guest of Honor, Mrs. Jeevitha Rajasekhar giving a speech at the Launch Event of the eCommerce Portal www.goldnsilver— at Mari Gold (By Green Park ).'
  },
  {
    img: img822,
    title: 'GoldnSilver Launch Event – Guest Address',
    text: 'A distinguished guest delivering an inspiring address at the official GoldnSilver launch event, celebrating the beginning of a new journey in gold and silver commerce.'
  },
  {
    img: img824,
    title: 'Dasari Narayanarao – GoldnSilver.shop Launch Event',
    text: 'Chief Guest of the event Dr. Dasari Narayana Rao garu speaking about #eCommerce and sharing his thoughts.'
  },
  {
    img: rect628,
    title: 'Jayasudha Kapoor – GoldnSilver Launch Event',
    text: 'Guest of Honor, Dr. Sahajanati Dr. Jayasudha Kapoor giving a speech at the Launch Event of the eCommerce Portal goldnsilver.shop'
  },
  {
    img: img831,
    title: 'GoldnSilver Launch Event – Guest Address',
    text: 'Managing Director of Nihar Info Global Ltd., Mr. Bsn Suryanarayana speaking about eCommerce and the Future Expansion plans of Goldnsilver— at Mari Gold (By Green Park ).'
  },
  {
    img: img832,
    title: 'GoldnSilver Official Launch – 2015',
    text: 'A memorable moment from the official launch of GoldnSilver.in, held in Hyderabad on 30 October 2015. The event marked an important and milestone in GoldnSilver’s journey, bringing together distinguished guests and well-wishers.'
  },
  {
    img: img833,
    title: 'Gold & Silver Portal Launch Event',
    text: 'A memorable launch ceremony celebrating the journey of GoldnSilver, with dignitaries and guests coming together for the traditional lamp-lighting ceremony.'
  },
  {
    img: img834,
    title: 'GoldnSilver Launch Event – Team & Dignitaries',
    text: 'A memorable moment from the GoldnSilver launch event, featuring the event’s distinguished guests and team members during the proceedings.'
  },
  {
    img: img835,
    title: 'Gold & Silver Portal Launch Event',
    text: 'Bharatanatyam being performed at the Launch event of the eCommerce Portal goldnsilver— at Mari Gold (By Green Park ).'
  },
  {
    img: img836,
    title: 'Gold & Silver Event Moment',
    text: 'Bharatanatyam being performed at the Launch event of the eCommerce Portal goldnsilver— at Mari Gold (By Green Park ).'
  },
  {
    img: img810,
    title: 'GoldnSilver Launch Event – A Memorable Moment',
    text: 'Bharatanatyam being performed at the Launch event of the eCommerce Portal goldnsilver— at Mari Gold (By Green Park ).'
  },
  {
    img: img840,
    title: 'Silver Craftsmanship & Elegance',
    text: 'A memorable gathering featuring distinguished guests and attendees during the GoldnSilver event, reflecting an atmosphere of engagement, collaboration, and shared interest in gold and silver opportunities.'
  },
  {
    img: img841,
    title: 'GoldnSilver Product Showcase – A Celebration of Elegance',
    text: 'A memorable event showcasing GoldnSilver’s gold and 92.5 sterling silver offerings, bringing together distinguished guests and team members.'
  },
  {
    img: img842,
    title: 'Distinguished Guests at the GoldnSilver Event',
    text: 'A memorable gathering featuring Dasari Narayana Rao Garu, Jayasudha Kapoor, and Jeevitha Rajasekhar, along with other distinguished guests, during the GoldnSilver event celebrating excellence in gold and silver products.'
  },
  {
    img: img847,
    title: 'Divine Silver Collection – Lord Shiva & Nandi',
    text: 'A beautifully crafted silver representation of Lord Shiva and Nandi, symbolizing devotion, strength, and spiritual elegance.'
  },
  {
    img: img848,
    title: 'Divine Silver Collection – Lord Ganesha',
    text: 'A beautifully crafted silver Lord Ganesha idol, symbolizing wisdom, prosperity, and auspicious beginnings, presented with traditional decorative elements.'
  },
  {
    img: img850,
    title: 'Divine Silver Collection – Sacred Puja Set',
    text: 'An exquisite silver devotional puja set featuring traditional idols, lamps, and intricate craftsmanship, symbolizing purity, prosperity, and spiritual elegance.'
  },
  {
    img: img852,
    title: 'Divine Silver Collection – Ganesha & Lakshmi',
    text: 'Beautifully crafted silver idols of Lord Ganesha and Goddess Lakshmi, complemented by elegant nature-inspired designs symbolizing prosperity, wisdom, and blessings.'
  },
  {
    img: img854,
    title: 'Lord Ganesha – Symbol of Auspiciousness',
    text: 'A beautifully crafted Ganesha design symbolizing prosperity, wisdom, and auspicious beginnings, reflecting the timeless cultural significance of precious metals and traditional artistry.'
  },
  {
    img: img856,
    title: 'Silver Collectible – Timeless Tradition',
    text: 'A beautifully presented silver collectible featuring an intricately detailed traditional design, showcasing the elegance and cultural heritage of fine silver craftsmanship.'
  },
  {
    img: img851,
    title: 'Distinguished Guests at the GoldnSilver Event',
    text: 'A memorable gathering featuring Jayasudha Kapoor, and Jeevitha Rajasekhar, during the GoldnSilver launching event celebrating excellence in gold and silver products.'
  },
  {
    img: img853,
    title: 'Distinguished Guests at the GoldnSilver Event',
    text: 'A memorable gathering featuring Dr. Dasari Narayana Rao gaaru, and BSN Suryanarayana Gaaru, during the GoldnSilver launching event celebrating excellence in gold and silver products.'
  },
  {
    img: img855,
    title: 'BSN Suryanarayana Garu – Auspicious Lamp Lighting',
    text: 'A memorable moment from the GoldnSilver event as BSN Suryanarayana Garu participates in the traditional lamp-lighting ceremony, marking an auspicious beginning to the celebration.'
  }
];

const SectionIcon = () => (
  <svg className="mg-sec-ico" viewBox="0 0 48 32" fill="none" aria-hidden="true">
    <rect x="1" y="1" width="34" height="30" rx="4" stroke="#744D22" strokeWidth="2" />
    <path d="M18 10v12l10-6-10-6z" fill="#744D22" />
    <path d="M38 8l9-4v24l-9-4V8z" stroke="#744D22" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const GalleryIcon = () => (
  <svg className="mg-gallery-ico" viewBox="0 0 53 53" fill="none" aria-hidden="true">
    <rect x="4" y="10" width="36" height="30" rx="3" stroke="#3E0606" strokeWidth="2.5" />
    <rect x="12" y="16" width="36" height="30" rx="3" stroke="#3E0606" strokeWidth="2.5" />
    <circle cx="24" cy="28" r="5" stroke="#3E0606" strokeWidth="2" />
    <path d="M12 40l8-8 6 5 8-10 10 13" stroke="#3E0606" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

function MediaFilterTabs({ activeFilter, onChange }) {
  return (
    <div className="mg-filter-tabs" role="tablist" aria-label="Media time filter">
      {FILTER_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeFilter === tab.id}
          className={`mg-filter-tab${activeFilter === tab.id ? ' mg-filter-tab--active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function ArchivesBlock({ activeYear, onYearChange, showViewAll = true }) {
  return (
    <div className="mg-archives-block">
      <div className="mg-archives-head">
        <div className="gs-section-head mg-archives-title-row">
          <SectionIcon />
          <h2>Archives</h2>
        </div>
        {showViewAll && (
          <button type="button" className="mg-view-all-btn">
            View All
          </button>
        )}
      </div>
      <div className="mg-archive-years">
        {ARCHIVE_FILTERS.map((year) => (
          <button
            key={year}
            type="button"
            className={`mg-archive-year${activeYear === year ? ' mg-archive-year--active' : ''}`}
            onClick={() => onYearChange(year)}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
}

const MediaPage = () => {
  const [activeTab, setActiveTab] = useState('print');
  const [activeFilter, setActiveFilter] = useState('latest');
  const [archiveYear, setArchiveYear] = useState('12 months');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedPrint, setSelectedPrint] = useState(null);

  const activeTabLabel = useMemo(
    () => MEDIA_TABS.find((t) => t.id === activeTab)?.label || '',
    [activeTab]
  );

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setActiveFilter('latest');
    setArchiveYear('12 months');
  };

  const showLatestContent = activeFilter === 'latest' || activeFilter === 'month';
  const showArchivesOnly = activeFilter === 'archives';

  return (
    <div className="gs-page mg-page">
      <section
        className="gs-hero"
        aria-label="Media and gallery"
        style={{ backgroundImage: `url(${heroBanner})` }}
      >
        <div className="gs-hero-inner">
          <h1>Media &amp; Gallery</h1>
          <p className="gs-hero-copy">
            Discover our journey through impactful moments, trusted partnerships, Media coverage
            and events that reflect our commitment to Gold &amp; Silver excellence.
          </p>
        </div>
      </section>

      <section className="gs-section mg-tabs-section">
        <div className="mg-type-tabs" role="tablist" aria-label="Media type">
          {MEDIA_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`mg-tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`mg-panel-${tab.id}`}
              className={`mg-type-tab${activeTab === tab.id ? ' mg-type-tab--selected' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <section className="gs-section mg-content-section">
        <div
          className={`gs-panel mg-content-panel${
            activeTab === 'print' ? ' mg-content-panel' : ''
          }`}
        >
          {activeTab === 'print' && (
            <>
              <h2 className="mg-print-hero-title">Media Coverage</h2>
              <p className="mg-print-hero-sub">
                Nihar Info Global Ltd / GoldnSilver.shop Launch
              </p>
            </>
          )}
          {activeTab !== 'print' && <h2 className="mg-panel-title">{activeTabLabel}</h2>}

          <MediaFilterTabs activeFilter={activeFilter} onChange={setActiveFilter} />

          {activeTab === 'print' && (
            <div id="mg-panel-print" role="tabpanel" aria-labelledby="mg-tab-print" className="mg-tab-panel">
              {(showLatestContent || showArchivesOnly) && (
                <>
                  {showLatestContent && (
                    <>
                      <div className="mg-print-collage-wrap">
                        {printMediaImages.length === 0 && (
                          <p className="mg-empty-note">Print media images are loading…</p>
                        )}
                        <div className="mg-print-collage">
                          {printMediaImages.map((src, index) => {
                            const layout = PRINT_MEDIA_LAYOUT[index] || {
                              gridColumn: 'span 12',
                              aspectRatio: '4 / 3'
                            };
                            return (
                              <figure
                                key={`print-${index + 1}`}
                                className="mg-print-frame"
                                style={{
                                  gridColumn: layout.gridColumn,
                                  aspectRatio: layout.aspectRatio
                                }}
                                onClick={() => setSelectedPrint({ src, index: index + 1 })}
                                onKeyDown={(e) =>
                                  e.key === 'Enter' && setSelectedPrint({ src, index: index + 1 })
                                }
                                role="button"
                                tabIndex={0}
                              >
                                <img
                                  src={src}
                                  alt={`Print media coverage ${index + 1}`}
                                  loading={index < 2 ? 'eager' : 'lazy'}
                                  decoding="async"
                                />
                              </figure>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {showArchivesOnly && (
                    <p className="gs-section-sub mg-gallery-sub">
                      Browse archived print coverage by period below.
                    </p>
                  )}

                  <ArchivesBlock
                    activeYear={archiveYear}
                    onYearChange={setArchiveYear}
                    showViewAll={showLatestContent}
                  />
                </>
              )}
            </div>
          )}

          {activeTab === 'tv' && (
            <div id="mg-panel-tv" role="tabpanel" aria-labelledby="mg-tab-tv" className="mg-tab-panel">
              {showLatestContent && (
                <>
                  <div className="gs-section-head">
                    <SectionIcon />
                    <h2>Latest Videos</h2>
                  </div>
                  <p className="gs-section-sub mg-videos-sub">
                    Watch our latest videos and insights about GoldnSilver.
                  </p>
                  <div className="mg-video-grid">
                    {featuredVideos.map((video) => (
                      <article
                        key={video.id}
                        className="mg-card mg-video-card"
                        onClick={() => setSelectedVideo(video)}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedVideo(video)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="mg-card-media mg-card-media--yt">
                          <iframe
                            src={facebookEmbedUrl(video.url)}
                            title={`${video.channel} – Featured video`}
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                            allowFullScreen
                            loading="lazy"
                            tabIndex={-1}
                          />
                          <span className="mg-yt-hit" aria-hidden="true" />
                        </div>
                        <p className="mg-video-channel">{video.channel}</p>
                        <p className="mg-video-caption">{video.title}</p>
                        <p className="mg-video-date">{video.date}</p>
                      </article>
                    ))}
                  </div>
                </>
              )}

              {showArchivesOnly && (
                <p className="gs-section-sub mg-videos-sub">
                  Browse archived TV coverage by period below.
                </p>
              )}

              <ArchivesBlock
                activeYear={archiveYear}
                onYearChange={setArchiveYear}
                showViewAll={showLatestContent}
              />
            </div>
          )}

          {activeTab === 'social' && (
            <div id="mg-panel-social" role="tabpanel" aria-labelledby="mg-tab-social" className="mg-tab-panel">
              {showLatestContent && (
                <>
                  <div className="gs-section-head gs-section-head--display mg-gallery-head">
                    <GalleryIcon />
                    <h2>Media Gallery</h2>
                  </div>
                  <p className="gs-section-sub mg-gallery-sub">
                    Press Coverage and Event Highlights on 30th Oct 2015 in HYDERABAD.
                  </p>
                  <div className="mg-gallery-grid">
                    {galleryItems.map((item) => (
                      <article
                        key={`${item.title}-${item.img}`}
                        className="mg-card mg-gallery-card"
                        onClick={() => setSelectedImage(item)}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedImage(item)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="mg-card-media">
                          <img src={item.img} alt={item.title} />
                        </div>
                        <div className="mg-gallery-caption">
                          <strong>{item.title}</strong>
                          <span>{item.text}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}

              {showArchivesOnly && (
                <p className="gs-section-sub mg-gallery-sub">
                  Browse archived social media highlights by period below.
                </p>
              )}

              <ArchivesBlock
                activeYear={archiveYear}
                onYearChange={setArchiveYear}
                showViewAll={showLatestContent}
              />
            </div>
          )}
        </div>
      </section>

      {selectedVideo && (
        <div className="mg-modal" onClick={() => setSelectedVideo(null)} role="presentation">
          <div className="mg-modal-panel mg-modal-video" onClick={(e) => e.stopPropagation()} role="dialog">
            <button type="button" className="mg-modal-close" onClick={() => setSelectedVideo(null)} aria-label="Close">
              ×
            </button>
            <iframe
              src={facebookEmbedUrl(selectedVideo.url)}
              title={`${selectedVideo.channel} – Featured video`}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="mg-modal" onClick={() => setSelectedImage(null)} role="presentation">
          <div className="mg-modal-panel" onClick={(e) => e.stopPropagation()} role="dialog">
            <button type="button" className="mg-modal-close" onClick={() => setSelectedImage(null)} aria-label="Close">
              ×
            </button>
            <img src={selectedImage.img} alt={selectedImage.title} />
            <p className="mg-modal-caption">
              <strong>{selectedImage.title}</strong>
              {selectedImage.text}
            </p>
          </div>
        </div>
      )}

      {selectedPrint && (
        <div className="mg-modal" onClick={() => setSelectedPrint(null)} role="presentation">
          <div className="mg-modal-panel" onClick={(e) => e.stopPropagation()} role="dialog">
            <button type="button" className="mg-modal-close" onClick={() => setSelectedPrint(null)} aria-label="Close">
              ×
            </button>
            <img src={selectedPrint.src} alt={`Print media coverage ${selectedPrint.index}`} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaPage;
