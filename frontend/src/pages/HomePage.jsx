import CircleCarousel from '../components/CircleCarousel';
import HomeBlocks from '../components/HomeBlocks';

const HomePage = () => {
  return (
    <div className="page home-page">
      <section className="home-above-fold">
        <CircleCarousel />
      </section>

      <section className="home-below-fold">
        <HomeBlocks />
      </section>
    </div>
  );
};

export default HomePage;