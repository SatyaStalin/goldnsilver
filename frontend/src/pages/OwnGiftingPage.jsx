const OwnGiftingPage = () => {
  const giftingProducts = [
    {
      title: 'Festive Gift Boxes',
      desc: 'Curated festive gift boxes with gold & silver coins. Perfect for Diwali, weddings, and special occasions.',
      price: 4999
    },
    {
      title: 'Corporate Gift Sets',
      desc: 'Custom branded coins & hampers for corporates. Ideal for employee rewards and client gifting.',
      price: 9999
    },
    {
      title: 'Wedding Gift Collection',
      desc: 'Elegant gold and silver gift sets for weddings and engagements.',
      price: 15000
    },
    {
      title: 'Birthday & Anniversary Gifts',
      desc: 'Personalized gold and silver coins for birthdays and anniversaries.',
      price: 7500
    },
    {
      title: 'Custom Gift Packs',
      desc: 'Create your own custom gift pack with gold and silver coins of your choice.',
      price: 10000
    }
  ];

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">Gifting Solutions</h1>
        <p className="page-hero-desc">
          Thoughtful gold and silver gift options for every occasion - festivals, weddings, corporate, and more.
        </p>
      </div>

      <div className="grid-two">
        <section className="panel page-feature">
          <h2>Gift Collections</h2>
          <div className="list-cards">
            {giftingProducts.map((item, idx) => (
              <article key={idx} className="list-card" style={{ justifyContent: 'flex-start' }}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <p className="muted">From ₹{item.price.toLocaleString()}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel page-feature">
          <h2>Why Choose Gold & Silver Gifts?</h2>
          <ul className="bullet-list">
            <li>Timeless and valuable - gifts that appreciate over time</li>
            <li>Certified purity with authenticity guarantees</li>
            <li>Elegant packaging suitable for all occasions</li>
            <li>Customizable options for personalization</li>
            <li>Corporate branding available for business gifts</li>
            <li>Direct delivery to recipient with gift message</li>
          </ul>

          <h3>Gift Services</h3>
          <p>
            We offer gift wrapping, personalized messages, direct delivery to recipients, and custom packaging options
            to make your gift extra special.
          </p>
        </section>
      </div>
    </div>
  );
};

export default OwnGiftingPage;
