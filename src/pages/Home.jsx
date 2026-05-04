import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Home.css';

export default function Home() {
  const { state } = useApp();
  const hasDesign = state.design.countryId;

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-icon">🏗️</div>
        <h1>Building Design Simulator</h1>
        <p className="hero-subtitle">Design buildings that survive natural disasters</p>
        <div className="hero-badges">
          <span className="info-badge">📖 Educational</span>
          <span className="info-badge">🌍 9 Countries</span>
          <span className="info-badge">🏢 6 Building Types</span>
          <span className="info-badge">🎨 Interactive 2D</span>
          <span className="info-badge">🖱️ Drag & Drop</span>
          <span className="info-badge">⚡ Live Scoring</span>
        </div>
      </div>

      <div className="home-actions">
        <Link to="/design" className="home-btn primary-btn">
          Start New Design
        </Link>

        {hasDesign && (
          <Link to="/design/summary" className="home-btn secondary-btn">
            Continue Design
          </Link>
        )}

        <Link to="/saved" className="home-btn secondary-btn">
          Saved Projects
        </Link>

        <Link to="/leaderboard" className="home-btn secondary-btn">
          Leaderboard
        </Link>

        <Link to="/profile" className="home-btn secondary-btn">
          Profile
        </Link>
      </div>

      <div className="home-steps">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">1</div>
            <div className="step-icon">🌍</div>
            <h3>Select Country & Building</h3>
            <p>5 countries with different challenges and 6 building types</p>
          </div>
          <div className="step-card">
            <div className="step-num">2</div>
            <div className="step-icon">🖱️</div>
            <h3>Drag Materials</h3>
            <p>Choose walls, roof, and foundation - watch the building change live</p>
          </div>
          <div className="step-card">
            <div className="step-num">3</div>
            <div className="step-icon">🔧</div>
            <h3>Add Features</h3>
            <p>Insulation, solar panels, reinforcement struts and more</p>
          </div>
          <div className="step-card">
            <div className="step-num">4</div>
            <div className="step-icon">📊</div>
            <h3>See Impact Live</h3>
            <p>Score updates in real-time with each change</p>
          </div>
          <div className="step-card">
            <div className="step-num">5</div>
            <div className="step-icon">🧪</div>
            <h3>Test Your Building</h3>
            <p>See heat, earthquake, flood effects visually</p>
          </div>
        </div>
      </div>

      <div className="home-note">
        <p>This is an educational program, not a real engineering tool. Uses simplified logic and scores.</p>
      </div>
    </div>
  );
}