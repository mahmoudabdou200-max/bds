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

export function ScoreBar({ score, label, factor }) {
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

function getRating(score) {
  if (score >= 90) return { color: '#4CAF50', label: 'Excellent' };
  if (score >= 70) return { color: '#8BC34A', label: 'Good' };
  if (score >= 50) return { color: '#FFC107', label: 'Acceptable' };
  if (score >= 30) return { color: '#FF9800', label: 'Weak' };
  return { color: '#F44336', label: 'Failed' };
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