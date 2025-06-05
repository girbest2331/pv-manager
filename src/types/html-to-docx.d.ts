declare module 'html-to-docx' {
  interface DocxOptions {
    title?: string;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    header?: number | string;
    footer?: number | string;
    pageOrientation?: 'portrait' | 'landscape';
    font?: string;
    fontSize?: number;
    pageNumbers?: boolean;
    pageBreakBefore?: string;
    tableOfContent?: boolean;
    styles?: {
      paragraphStyles?: Record<string, any>;
    };
    styleMap?: string[];
    cssStyle?: string;
    [key: string]: any;
  }

  function HTMLtoDOCX(html: string, options?: DocxOptions): Promise<Buffer>;
  export = HTMLtoDOCX;
}
