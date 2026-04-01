export interface StyleProps {
  /** CSS color for the horizontal guide lines. Default: `'rgb(204, 204, 204)'` */
  color?: string;
  /** Baseline grid height (e.g. `'8px'`, `'1rem'`). Default: `'16px'` */
  lineHeight?: string | number;
  /** Thickness of each horizontal guide line. Default: `'1px'` */
  lineWidth?: string | number;
  /** Vertical offset from the top of the container. Default: `0` */
  offset?: string | number;
  /** Overlay opacity (0–1). Default: `1` */
  opacity?: number;
  /** Stack order of the overlay. Default: `9999` */
  zIndex?: number;
  /** When set, centers the overlay horizontally with this max width. */
  maxWidth?: string | number;
  /** Repeating column width for a vertical column grid (e.g. `'80px'`). */
  columnWidth?: string | number;
  /** CSS color for vertical column lines. Falls back to `color` when omitted. */
  columnColor?: string;
  /** Gutter width between columns. Requires `columnWidth` to be set. */
  gutterWidth?: string | number;
}

export interface ConfigProps {
  /** When `true`, hides the overlay for this story regardless of the toolbar toggle. */
  hide?: boolean;
  /**
   * Name of a built-in preset to apply. Story-level params override preset values.
   * Available: `'4px'`, `'8px'`, `'16px'`, `'24px'`, `'material'`, `'tailwind'`, `'bootstrap'`
   */
  preset?: string;
  /** CSS selector for the overlay's parent element. Defaults to `body`. */
  container?: string;
}

export interface StyleObj {
  [key: string]: string | number;
}
