import { useEffect, useState } from 'react';

const items = [
  {
    id: 'digital-gold',
    title: 'Digital Gold',
    subtitle: 'Instant, 24x7',
    images: [
      'https://images.pexels.com/photos/315788/pexels-photo-315788.jpeg',
      'https://images.pexels.com/photos/210607/pexels-photo-210607.jpeg',
      'https://images.pexels.com/photos/706137/pexels-photo-706137.jpeg'
    ],
    interval: 3000
  },
  {
    id: 'digital-silver',
    title: 'Digital Silver',
    subtitle: 'Affordable entry',
    images: [
      'https://images.pexels.com/photos/1133505/pexels-photo-1133505.jpeg',
      'https://images.pexels.com/photos/5980647/pexels-photo-5980647.jpeg',
      'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg'
    ],
    interval: 3500
  },
  {
    id: 'sip',
    title: 'Gold SIP',
    subtitle: 'Discipline, not timing',
    images: [
      'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg',
      'https://images.pexels.com/photos/315788/pexels-photo-315788.jpeg',
      'https://images.pexels.com/photos/210607/pexels-photo-210607.jpeg'
    ],
    interval: 4000
  },
  {
    id: 'physical-gold',
    title: 'Coins & Bars',
    subtitle: 'MMTC-PAMP',
    images: [
      'https://images.pexels.com/photos/706137/pexels-photo-706137.jpeg',
      'https://images.pexels.com/photos/1133505/pexels-photo-1133505.jpeg',
      'https://images.pexels.com/photos/5980647/pexels-photo-5980647.jpeg'
    ],
    interval: 2500
  },
  {
    id: 'buyback',
    title: 'Gold Buy Back',
    subtitle: 'Real-time valuation',
    images: [
      'https://images.pexels.com/photos/5980647/pexels-photo-5980647.jpeg',
      'https://images.pexels.com/photos/706137/pexels-photo-706137.jpeg',
      'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg'
    ],
    interval: 3200
  },
  {
    id: 'lease',
    title: 'E-Lease',
    subtitle: 'Earn on idle gold',
    images: [
      'https://images.pexels.com/photos/210607/pexels-photo-210607.jpeg',
      'https://images.pexels.com/photos/315788/pexels-photo-315788.jpeg',
      'https://images.pexels.com/photos/1133505/pexels-photo-1133505.jpeg'
    ],
    interval: 3800
  },
  {
    id: 'knowledge',
    title: 'Knowledge Hub',
    subtitle: 'Learn & Grow',
    images: [
      'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg',
      'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg',
      'https://images.pexels.com/photos/210607/pexels-photo-210607.jpeg'
    ],
    interval: 4200
  },
  {
    id: 'media',
    title: 'Media',
    subtitle: 'Latest News',
    images: [
      'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg',
      'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg',
      'https://images.pexels.com/photos/706137/pexels-photo-706137.jpeg'
    ],
    interval: 2800
  }
];

const CarouselCard = ({ item }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    }, item.interval);

    return () => clearInterval(timer);
  }, [item.images.length, item.interval]);

  return (
    <div className="carousel-card">
      <div className="carousel-card-image">
        <img 
          src={item.images[currentImageIndex]} 
          alt={item.title}
          key={currentImageIndex}
        />
      </div>
    </div>
  );
};

const CircleCarousel = () => {
  const [selectedCarousel, setSelectedCarousel] = useState(null);


  // Arrange 8 carousels + 1 logo in 3x3 grid
  // Position 5 (index 4) is the center - logo
  const gridItems = [
    items[0], // Position 1: Top left
    items[1], // Position 2: Top center
    items[2], // Position 3: Top right
    items[3], // Position 4: Middle left
    'logo',   // Position 5: Middle center - LOGO
    items[4], // Position 6: Middle right
    items[5], // Position 7: Bottom left
    items[6], // Position 8: Bottom center
    items[7]  // Position 9: Bottom right
  ];

  return (
    <>
      <section className="circle-carousel">
        <div className="circle-carousel-grid">
          {gridItems.map((item, index) => {
            // Center position (index 4) shows circular logo
            if (item === 'logo') {
              return (
                <div key="logo" className="carousel-logo">
                  <div className="carousel-logo-circle">
                    <img 
                      src="https://images.pexels.com/photos/315788/pexels-photo-315788.jpeg" 
                      alt="Logo" 
                    />
                  </div>
                </div>
              );
            }

            // Regular rectangular carousel cards
            return (
              <div 
                key={item.id} 
                onClick={() => setSelectedCarousel(item)}
              >
                <CarouselCard item={item} />
              </div>
            );
          })}
        </div>
      </section>

      {selectedCarousel && (
        <div className="carousel-modal">
          <div className="carousel-modal-content">
            <div className="carousel-modal-header">
              <h3 className="carousel-modal-title">{selectedCarousel.title}</h3>
              <button 
                className="carousel-modal-close"
                onClick={() => setSelectedCarousel(null)}
              >
                ×
              </button>
            </div>
            <CarouselCard item={selectedCarousel} />
          </div>
        </div>
      )}
    </>
  );
};

export default CircleCarousel;

