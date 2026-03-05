const TopStrip = () => {
  const text = [
    'Live Gold Price Updates',
    'Live Silver Price Updates',
    'Festive Offers on Digital Gold & SIP Plans'
  ];

  return (
    <div className="top-strip">
      <div className="top-strip-inner" aria-label="Live updates">
        <div className="marquee">
          <div className="marquee-track">
            {[...text, ...text].map((t, idx) => (
              <span key={`${t}-${idx}`} className="top-strip-item">
                {t}
                <span className="top-strip-sep"> • </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopStrip;

