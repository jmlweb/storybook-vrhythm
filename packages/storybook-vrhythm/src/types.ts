import type { AuditOptions } from './audit';
import type { PresetName } from './presets';

export interface StyleProps {
  /** CSS color for the horizontal guide lines. Default: `'rgb(204, 204, 204)'` */
  color?: string;
  /** Baseline grid height (e.g. `'8px'`, `'1rem'`). Default: `'16px'` */
  lineHeight?: string | number;
  /** Thickness of each horizontal guide line. Default: `'1px'` */
  lineWidth?: string | number;
  /** Vertical offset from the anchor. Default: `0` */
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
   * Available: `'4px'`, `'8px'`, `'12px'`, `'16px'`, `'24px'`, `'32px'`, `'material'`, `'tailwind'`, `'bootstrap'`, `'carbon'`.
   * The last four are aliases of `'4px'`, `'4px'`, `'24px'` and `'8px'`.
   */
  preset?: PresetName | (string & {});
  /**
   * Where the first grid line starts: `'story'` (the story root), `'page'` (the
   * top of the document), or a CSS selector, resolved after the story renders.
   * Docs pages always use `'page'`. Default: `'story'`
   */
  anchor?: 'story' | 'page' | (string & {});
  /** @deprecated Use `anchor`, which takes the same selector. */
  container?: string;
  /**
   * Audits every story after it renders and after `play`. `'error'` fails the
   * story, `'todo'` only warns. Default: `'off'`
   */
  audit?: 'error' | 'todo' | 'off';
  /** Options for the automatic audit. `lineHeight` defaults to the story's grid. */
  auditOptions?: AuditOptions;
}

export type VRhythmParams = StyleProps & ConfigProps;

export interface StyleObj {
  [key: string]: string | number;
}
