export default function EighthAscentLogo({ size = 40, style = {} }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: size * 0.22,
      background: '#070c15',
      boxShadow: `0 0 0 1px rgba(30,110,170,0.5), 0 0 ${size*0.2}px rgba(0,130,220,0.18), 0 ${size*0.08}px ${size*0.28}px rgba(0,0,0,0.95)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: size * 0.04,
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
      ...style
    }}>
      {/* inner light source */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        height: '70%',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at 50% 30%, rgba(28,155,220,0.18) 0%, rgba(10,100,180,0.10) 35%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 1,
      }}/>
      {/* inner border ring */}
      <div style={{
        position: 'absolute',
        inset: size * 0.035,
        borderRadius: size * 0.185,
        border: '0.5px solid rgba(50,160,220,0.14)',
        pointerEvents: 'none',
        zIndex: 2,
      }}/>
      {/* floor vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        background: 'radial-gradient(ellipse at 50% 110%, rgba(0,0,0,0.55) 0%, transparent 65%)',
        pointerEvents: 'none',
        zIndex: 2,
      }}/>
      {/* symbol + wordmark */}
      <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.04 }}>
        <svg width={size * 0.58} height={size * 0.63} viewBox="0 0 72 80" fill="none">
          <defs>
            <linearGradient id="ea-grad" x1="10" y1="0" x2="62" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8cf0ff"/>
              <stop offset="30%" stopColor="#28c4fc"/>
              <stop offset="100%" stopColor="#0055a0"/>
            </linearGradient>
            <filter id="ea-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <g filter="url(#ea-glow)">
            <path d="M10 72 L36 8" stroke="url(#ea-grad)" strokeWidth="6" strokeLinecap="round" fill="none"/>
            <path d="M62 72 L36 8" stroke="url(#ea-grad)" strokeWidth="6" strokeLinecap="round" fill="none"/>
            <path d="M36 8 L46 24 L36 34 L26 24 Z" stroke="url(#ea-grad)" strokeWidth="4.5" strokeLinejoin="round" fill="none"/>
            <path d="M26 24 Q10 44 26 58 Q36 66 46 58 Q62 44 46 24" stroke="url(#ea-grad)" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
          </g>
        </svg>
        {size >= 60 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: size * 0.038, letterSpacing: '0.38em', color: '#4f8eaa', fontWeight: 400 }}>THE</span>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: size * 0.05, letterSpacing: '0.28em', color: '#b8deed', fontWeight: 600, textShadow: '0 0 12px rgba(80,200,240,0.3)' }}>8TH ASCENT</span>
          </div>
        )}
      </div>
    </div>
  );
}
