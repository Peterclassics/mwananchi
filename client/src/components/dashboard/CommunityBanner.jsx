import { Link } from 'react-router-dom';
import { Info, ArrowRight } from 'lucide-react';
export default function CommunityBanner() {
  return (
    <section className="community-banner">
      <div className="banner-icon">
        <Info size={23} />
      </div>
      <div>
        <h2>Your reports help your community thrive.</h2>
        <p>
          Spotted something that needs attention? We’ll help you track it
          through to resolution.
        </p>
      </div>
      <Link to="/submit">
        Make a report <ArrowRight size={17} />
      </Link>
    </section>
  );
}
