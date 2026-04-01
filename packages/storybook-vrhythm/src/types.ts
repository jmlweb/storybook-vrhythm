export interface StyleProps {
  color?: string;
  lineHeight?: string | number;
  offset?: string | number;
  opacity?: number;
  zIndex?: number;
  columnWidth?: string | number;
  columnColor?: string;
}

export interface ConfigProps {
  hide?: boolean;
  preset?: string;
  container?: string;
}

export interface StyleObj {
  [key: string]: string | number;
}
