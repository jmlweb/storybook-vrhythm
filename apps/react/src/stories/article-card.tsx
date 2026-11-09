// Every height is a multiple of 8px, so the card sits on an 8px grid. The
// off-grid heading is 38px tall per line, so each line it wraps to pushes
// everything below it 2px further off the grid.
export const ArticleCard = ({ isOffGrid = false }: { isOffGrid?: boolean }) => (
  <article
    style={{
      boxSizing: 'border-box',
      width: 400,
      padding: '24px 32px',
      background: '#fff',
      borderRadius: 16,
      boxShadow:
        '0 1px 2px rgba(76, 29, 149, 0.12), 0 16px 40px rgba(124, 58, 237, 0.2)',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
      color: '#1a1033',
    }}
  >
    <div
      style={{
        height: 96,
        borderRadius: 8,
        background:
          'radial-gradient(120px 80px at 80% 20%, rgba(255, 255, 255, 0.5), transparent 70%), linear-gradient(120deg, #7c3aed, #ec4899 55%, #fbbf24)',
      }}
    />
    <p
      style={{
        margin: '16px 0 0',
        fontSize: 12,
        lineHeight: '16px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#7c3aed',
        fontWeight: 700,
      }}
    >
      Typography
    </p>
    <h2
      data-testid="heading"
      style={{
        margin: '8px 0 0',
        fontSize: 28,
        lineHeight: isOffGrid ? '38px' : '40px',
        fontWeight: 700,
      }}
    >
      Keep text on the beat
    </h2>
    <p
      style={{
        margin: '8px 0 0',
        fontSize: 16,
        lineHeight: '24px',
        color: '#4a4168',
      }}
    >
      A baseline grid gives every block a shared rhythm. Headings, paragraphs
      and buttons all land on the same 8px lines.
    </p>
    <button
      type="button"
      style={{
        display: 'block',
        boxSizing: 'border-box',
        height: 40,
        margin: '24px 0 0',
        padding: '0 20px',
        border: 0,
        borderRadius: 8,
        background: 'linear-gradient(100deg, #7c3aed, #db2777)',
        color: '#fff',
        fontSize: 15,
        fontWeight: 600,
        lineHeight: '40px',
      }}
    >
      Read more
    </button>
  </article>
);
