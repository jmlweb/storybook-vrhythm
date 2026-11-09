// Every height is a multiple of 8px, so the card sits on an 8px grid. The
// off-grid heading is 38px tall, which pushes everything below it 2px off.
export const ArticleCard = ({ isOffGrid = false }: { isOffGrid?: boolean }) => (
  <article
    style={{
      boxSizing: 'border-box',
      width: 400,
      padding: '24px 32px',
      background: '#fff',
      borderRadius: 12,
      boxShadow:
        '0 1px 2px rgba(15, 23, 42, 0.08), 0 8px 24px rgba(15, 23, 42, 0.08)',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
      color: '#0f172a',
    }}
  >
    <p
      style={{
        margin: 0,
        fontSize: 12,
        lineHeight: '16px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#6366f1',
        fontWeight: 600,
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
        color: '#334155',
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
        background: '#4f46e5',
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
