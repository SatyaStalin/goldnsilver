import { useToast } from '../state/ToastContext';

const BuyBackPage = () => {
  const { showToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('Buy-back request submitted successfully!', 'success');
  };

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">Gold Buy Back</h1>
        <p className="page-hero-desc">
          Get real-time valuation, raise buy-back requests, and receive funds in your wallet or bank.
        </p>
      </div>

      <div className="grid-two">
        <section className="panel page-feature">
          <h2>Request Buy Back</h2>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Metal
              <select defaultValue="gold">
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
              </select>
            </label>
            <label>
              Weight (grams)
              <input type="number" defaultValue={10} required />
            </label>
            <label>
              Preferred Payout
              <select defaultValue="wallet">
                <option value="wallet">Wallet Credit</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </label>
            <button className="btn-primary" type="submit">
              Submit Request
            </button>
          </form>
        </section>

        <section className="panel page-feature">
          <h2>Workflow</h2>
          <ol className="numbered-list">
            <li>We lock the price for a limited time based on live feeds.</li>
            <li>Our team reviews purity &amp; documentation.</li>
            <li>Approval / rejection communicated on your dashboard.</li>
            <li>Wallet credit or bank transfer is processed.</li>
          </ol>
        </section>
      </div>
    </div>
  );
};

export default BuyBackPage;

