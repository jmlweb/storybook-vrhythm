export interface StyleProps {
  color?: string;
  lineHeight?: string | number;
  lineWidth?: string | number;
  offset?: string | number;
  opacity?: number;
  zIndex?: number;
  maxWidth?: string | number;
  columnWidth?: string | number;
  columnColor?: string;
  gutterWidth?: string | number;
}

export interface ConfigProps {
  hide?: boolean;
  preset?: string;
  container?: string;
}

export interface StyleObj {
  [key: string]: string | number;
}
