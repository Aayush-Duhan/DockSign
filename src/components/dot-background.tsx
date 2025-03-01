export function DotBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px), radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
          backgroundSize: '24px 24px, 36px 36px',
          backgroundPosition: '0 0, 12px 12px',
          backgroundColor: 'black',
        }}
      />
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent" />
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(circle at 20% 35%, rgba(37, 99, 235, 0.1) 0%, transparent 45%),
              radial-gradient(circle at 75% 65%, rgba(168, 85, 247, 0.1) 0%, transparent 45%),
              radial-gradient(circle at 85% 25%, rgba(236, 72, 153, 0.1) 0%, transparent 35%)
            `
          }}
        />
      </div>
    </div>
  )
} 