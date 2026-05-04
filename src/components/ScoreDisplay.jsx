import { getRating } from '../data/constants';

export default function StarRating({ count, max = 5, size = 'medium' }) {
  const fullStars = Math.min(count, max);
  const emptyStars = max - fullStars;

  return (
    <span className={`star-rating star-rating-${size}`}>
      {'★'.repeat(fullStars)}{'☆'.repeat(emptyStars)}
      <span className="sr-only">{count} of {max}</span>
    </span>
  );
}

export function ScoreBar({ score, label }) {
  const rating = getRating(score);

  return (
    <div className="score-bar-container">
      <div className="score-bar-header">
        <span className="score-bar-label">{label}</span>
        <span className="score-bar-value" style={{ color: rating.color }}>{score}/100</span>
      </div>
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{ width: `${score}%`, backgroundColor: rating.color }}
        />
      </div>
    </div>
  );
}

export function OverallScoreCircle({ score }) {
  const rating = getRating(score);
  return (
    <div className="overall-score-circle" style={{ borderColor: rating.color }}>
      <div className="score-number" style={{ color: rating.color }}>{score}</div>
      <div className="score-label" style={{ color: rating.color }}>{rating.label}</div>
    </div>
  );
}