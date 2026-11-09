// Every height in `.card` is a multiple of 8px. Only the heading's line height
// is adjustable, so it alone decides whether the card sits on the grid.
export const DemoCard = ({
  headingLineHeight,
}: {
  headingLineHeight: number;
}) => (
  <article className="card">
    <div className="cover" />
    <p className="eyebrow">Typography</p>
    <h3
      data-testid="heading"
      className="title"
      style={{ lineHeight: `${headingLineHeight}px` }}
    >
      Keep text on the beat
    </h3>
    <p className="body">
      A baseline grid gives every block a shared rhythm. Headings, paragraphs
      and buttons all land on the same lines.
    </p>
    <button type="button" className="cta">
      Read more
    </button>
  </article>
);
