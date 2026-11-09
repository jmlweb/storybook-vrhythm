const FEATURES = [
  {
    glyph: 'Δ',
    title: 'Measured, not eyeballed',
    text: 'The audit measures every box edge against the grid and reports the exact pixel delta of each one that misses.',
  },
  {
    glyph: '↧',
    title: 'Failures that name the fix',
    text: 'Each failure says which edge is off, by how much and which way to move it. No screenshot needed.',
  },
  {
    glyph: '{ }',
    title: 'Built for coding agents',
    text: 'Ships with llms.txt and an Agent Skill. Error codes are stable. Runs through Vitest or the Storybook MCP server.',
  },
  {
    glyph: '≡',
    title: 'Same result everywhere',
    text: 'The grid starts at the story root, so centered, padded and fullscreen layouts agree at any viewport height.',
  },
  {
    glyph: '4·8',
    title: 'Presets included',
    text: 'Pixel grids from 4px to 32px, plus Material, Tailwind, Bootstrap and Carbon aliases. Column grids too.',
  },
  {
    glyph: '0',
    title: 'Zero dependencies',
    text: 'The overlay is one CSS linear-gradient that ignores pointer events. Works with React, Vue, Angular, Svelte and plain HTML.',
  },
] as const;

export const Features = () => (
  <section className="section" id="features">
    <div className="section__head">
      <p className="kicker">Why</p>
      <h2 className="section__title">Numbers an agent can act on</h2>
      <p className="section__lead">
        Coding agents cannot judge a screenshot of a grid. They can read a delta
        and move an edge.
      </p>
    </div>

    <ul className="features">
      {FEATURES.map(({ glyph, title, text }) => (
        <li key={title} className="feature">
          <span className="feature__glyph" aria-hidden="true">
            {glyph}
          </span>
          <h3 className="feature__title">{title}</h3>
          <p className="feature__text">{text}</p>
        </li>
      ))}
    </ul>
  </section>
);
