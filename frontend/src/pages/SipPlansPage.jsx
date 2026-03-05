import { useToast } from '../state/ToastContext';

const SipPlansPage = () => {
  const { showToast } = useToast();

  const handleSipSetup = (e) => {
    e.preventDefault();
    showToast('SIP plan setup initiated!', 'success');
  };

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">SIP Plans</h1>
        <p className="page-hero-desc">
          Structure your savings into goal-based gold &amp; silver SIPs and accumulation plans.
        </p>
      </div>

      <div className="grid-two">
        <section className="panel page-feature">
          <h2>Popular SIP Types</h2>
          <ul className="bullet-list">
            <li>Digital Gold SIP</li>
            <li>Mutual Fund SIP (Gold &amp; Silver funds)</li>
            <li>Gold Accumulation Plans (grams per month)</li>
            <li>Goal-based SIP (Marriage, Education, Home)</li>
          </ul>
          <form onSubmit={handleSipSetup} style={{ marginTop: '1.5rem' }}>
            <button className="btn-primary" type="submit">
              Setup SIP Plan
            </button>
          </form>
        </section>

        <section className="panel page-feature">
          <h2>Setup Flow</h2>
          <ol className="numbered-list">
            <li>Select goal and target date.</li>
            <li>Choose SIP amount and metal allocation (Gold vs Silver).</li>
            <li>Complete KYC and mandate (auto-debit).</li>
            <li>Track progress in dashboard.</li>
          </ol>
        </section>
      </div>
    </div>
  );
};

export default SipPlansPage;

