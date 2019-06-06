export interface StyleProps {
  color?: string;
  lineHeight?: string | number;
  offset?: string | number;
}

export interface ConfigProps {
  hide?: boolean;
}

export interface StyleObj {
  [key: string]: string | number;
}
