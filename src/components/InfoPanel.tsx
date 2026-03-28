import { useMuseum } from '../stores/useMuseum'
import { paintings } from '../data/paintings'

export default function InfoPanel() {
  const activePainting = useMuseum((s) => s.activePainting)
  const showInfoPanel = useMuseum((s) => s.showInfoPanel)
  const setActivePainting = useMuseum((s) => s.setActivePainting)
  const favoritePaintings = useMuseum((s) => s.favoritePaintings)
  const toggleFavoritePainting = useMuseum((s) => s.toggleFavoritePainting)

  if (!activePainting || !showInfoPanel) return null

  const painting = paintings.find((p) => p.id === activePainting)
  if (!painting) return null

  const isFavorite = favoritePaintings.has(painting.id)

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 32,
        left: 32,
        maxWidth: 420,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: 24,
        borderRadius: 8,
        border: '1px solid rgba(255, 255, 255, 0.12)',
        color: '#fff',
        fontFamily: 'Georgia, serif',
        zIndex: 100,
        boxSizing: 'border-box',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            lineHeight: 1.3,
            color: '#f5e6c8',
            flex: 1,
          }}
        >
          {painting.title}
        </h2>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {/* Favorite button */}
          <button
            onClick={() => toggleFavoritePainting(painting.id)}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            style={{
              background: 'none',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 4,
              color: isFavorite ? '#e8b44b' : 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
              padding: '4px 8px',
              transition: 'color 0.2s, border-color 0.2s',
            }}
          >
            {isFavorite ? '♥' : '♡'}
          </button>

          {/* Close button */}
          <button
            onClick={() => setActivePainting(null)}
            title="Close"
            style={{
              background: 'none',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 4,
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 700,
              lineHeight: 1,
              padding: '4px 9px',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Artist + year */}
      <p
        style={{
          margin: '8px 0 0',
          fontSize: 13,
          color: 'rgba(255, 255, 255, 0.6)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {painting.artist} &mdash; {painting.year}
      </p>

      {/* Medium */}
      <p
        style={{
          margin: '4px 0 0',
          fontSize: 12,
          color: 'rgba(255, 255, 255, 0.45)',
          fontStyle: 'italic',
        }}
      >
        {painting.medium}
      </p>

      {/* Divider */}
      <div
        style={{
          margin: '14px 0',
          height: 1,
          background: 'rgba(255, 255, 255, 0.12)',
        }}
      />

      {/* Description */}
      <p
        style={{
          margin: 0,
          fontSize: 14,
          lineHeight: 1.65,
          color: 'rgba(255, 255, 255, 0.85)',
        }}
      >
        {painting.description}
      </p>

      {/* Analysis */}
      <p
        style={{
          margin: '14px 0 0',
          fontSize: 13,
          lineHeight: 1.6,
          color: 'rgba(245, 210, 140, 0.9)',
          fontStyle: 'italic',
          borderLeft: '3px solid rgba(245, 210, 140, 0.4)',
          paddingLeft: 12,
        }}
      >
        {painting.analysis}
      </p>
    </div>
  )
}
