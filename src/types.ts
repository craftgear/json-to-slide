export type Slide = {
  title: string;
  description: string;
  backgroundColor?: string;
  content?: {
    type: 'text' | 'image';
    text?: string;
    src?: string;
    x: number | string;
    y: number | string;
    width?: number;
    height?: number;
    opacity?: number;
    anchor?: 'left' | 'center' | 'right';
    fontSize?: number;
    color?: string;
    fontFamily?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
  }[];

}
