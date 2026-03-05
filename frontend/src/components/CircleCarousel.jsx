import { useEffect, useState } from 'react';
import { SIP1, SIP2, SIP3 } from '../assets/carousel';
import { BuyBack3, BuyBack2, BuyBack1 } from '../assets/carousel';
import { DigitalGold1, DigitalGold4, DigitalGold5 } from '../assets/carousel';
import { ELease3, ELease2, ELease1 } from '../assets/carousel';
import {  PhysicalGold2, PhysicalGold1 } from '../assets/carousel';
const items = [
  {
    id: 'digital-gold',
    title: 'Digital Gold',
    subtitle: 'Instant, 24x7',
    images: [
      DigitalGold1,
      DigitalGold4,
      DigitalGold5
    ],
    interval: 3000
  },
  {
    id: 'digital-silver',
    title: 'Digital Silver',
    subtitle: 'Affordable entry',
    images: [
      DigitalGold1,
      DigitalGold4,
      DigitalGold5
    ],
    interval: 3500
  },
  {
    id: 'sip',
    title: 'Gold SIP',
    subtitle: 'Discipline, not timing',
    images: [
      SIP1,
      SIP2,
      SIP3
    ],
    interval: 4000
  },
  {
    id: 'physical-gold',
    title: 'Coins & Bars',
    subtitle: 'Certified Purity',
    images: [
      PhysicalGold1,
      PhysicalGold2,
    ],
    interval: 2500
  },
  {
    id: 'buyback',
    title: 'Gold Buy Back',
    subtitle: 'Real-time valuation',
    images: [
      BuyBack1,
      BuyBack2,
      BuyBack3
    ],
    interval: 3200
  },
  {
    id: 'lease',
    title: 'E-Lease',
    subtitle: 'Earn on idle gold',
    images: [
      ELease1,
      ELease2,
      ELease3
    ],
    interval: 3800
  },
  {
    id: 'knowledge',
    title: 'Knowledge Hub',
    subtitle: 'Learn & Grow',
    images: [
      SIP1,
      SIP2,
      SIP3
    ],
    interval: 4200
  },
  {
    id: 'media',
    title: 'Media',
    subtitle: 'Latest News',
    images: [
      DigitalGold1,
      DigitalGold4,
      DigitalGold5
    ],
    interval: 2800
  }
];

const CarouselCard = ({ item }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [prevImageIndex, setPrevImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPrevImageIndex(currentImageIndex);
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    }, item.interval);

    return () => clearInterval(timer);
  }, [item.images.length, item.interval, currentImageIndex]);

  return (
    <div className="carousel-card">
      <div className="carousel-card-image">
        <div className="carousel-image-slider">
          {item.images.map((img, idx) => (
            <img 
              key={idx}
              src={img} 
              alt={item.title}
              className={
                idx === currentImageIndex 
                  ? 'active' 
                  : idx === prevImageIndex && idx !== currentImageIndex
                  ? 'prev'
                  : ''
              }
            />
          ))}
        </div>
      </div>
      {/* Radio Button Indicators */}
      <div className="carousel-indicators">
        {item.images.map((_, idx) => (
          <input
            key={idx}
            type="radio"
            name={`carousel-${item.id}`}
            checked={idx === currentImageIndex}
            readOnly
            className="carousel-radio"
          />
        ))}
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

