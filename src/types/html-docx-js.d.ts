declare module 'html-docx-js' {
  /**
   * Convertit du HTML en document DOCX
   * @param html Contenu HTML à convertir
   * @param options Options additionnelles pour la conversion
   * @returns Buffer contenant le document DOCX généré
   */
  export function convert(html: string, options?: any): Buffer;

  /**
   * Interface par défaut
   */
  const htmlToDocx: {
    convert: typeof convert;
  };

  export default htmlToDocx;
}
