import { ArrowRight } from 'lucide-react';
export default function StatusGuide() {
  return (
    <section className="tracking-explainer">
      <h2>A little clarity at every step</h2>
      <div>
        <span>
          <i className="step-dot pending-dot" />
          <strong>Pending</strong>
          <small>Your report is in the queue.</small>
        </span>
        <ArrowRight />
        <span>
          <i className="step-dot progress-dot" />
          <strong>In Progress</strong>
          <small>The issue is being addressed.</small>
        </span>
        <ArrowRight />
        <span>
          <i className="step-dot resolved-dot" />
          <strong>Resolved</strong>
          <small>A resolution has been recorded.</small>
        </span>
      </div>
    </section>
  );
}
