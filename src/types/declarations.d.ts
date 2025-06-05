// Déclaration pour les modules sans types
declare module 'docx' {
  export class Document {
    constructor(options: any);
    addSection(options: any): void;
  }

  export class Packer {
    static toBuffer(doc: Document): Promise<Buffer>;
  }

  export class Paragraph {
    constructor(options: any);
  }

  export class TextRun {
    constructor(options: any);
  }

  export enum HeadingLevel {
    HEADING_1 = 'Heading1',
    HEADING_2 = 'Heading2',
    HEADING_3 = 'Heading3',
    HEADING_4 = 'Heading4',
    HEADING_5 = 'Heading5',
    HEADING_6 = 'Heading6',
  }

  export enum AlignmentType {
    LEFT = 'left',
    CENTER = 'center',
    RIGHT = 'right',
    JUSTIFIED = 'justified',
  }

  export class Table {
    constructor(options: any);
  }

  export class TableRow {
    constructor(options: any);
  }

  export class TableCell {
    constructor(options: any);
  }

  export enum WidthType {
    AUTO = 'auto',
    PERCENTAGE = 'percentage',
    DXA = 'dxa',
  }

  export enum BorderStyle {
    SINGLE = 'single',
    DOUBLE = 'double',
    DOTTED = 'dotted',
    DASHED = 'dashed',
    NONE = 'none',
  }
}

declare module 'pdf-lib' {
  export class PDFDocument {
    static create(): Promise<PDFDocument>;
    addPage(size: [number, number]): PDFPage;
    embedFont(font: string): Promise<PDFFont>;
    save(): Promise<Uint8Array>;
  }

  export class PDFPage {
    getSize(): { width: number; height: number };
    drawText(text: string, options: any): void;
  }

  export class PDFFont {}

  export enum StandardFonts {
    Helvetica = 'Helvetica',
    HelveticaBold = 'Helvetica-Bold',
    TimesRoman = 'Times-Roman',
    TimesRomanBold = 'Times-Bold',
    Courier = 'Courier',
    CourierBold = 'Courier-Bold',
  }
}

// Déclaration pour les modules Chakra UI manquants
declare module '@chakra-ui/react' {
  export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
    variant?: string;
  }

  export const Table: React.FC<TableProps>;
  export const Thead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>>;
  export const Tbody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>>;
  export const Tr: React.FC<React.HTMLAttributes<HTMLTableRowElement>>;
  export const Th: React.FC<React.ThHTMLAttributes<HTMLTableHeaderCellElement> & { isNumeric?: boolean }>;
  export const Td: React.FC<React.TdHTMLAttributes<HTMLTableDataCellElement> & { isNumeric?: boolean }>;

  export interface AlertDialogProps {
    isOpen: boolean;
    leastDestructiveRef: React.RefObject<HTMLElement>;
    onClose: () => void;
    children: React.ReactNode;
  }

  export const AlertDialog: React.FC<AlertDialogProps>;
  export const AlertDialogOverlay: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const AlertDialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const AlertDialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const AlertDialogBody: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const AlertDialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>>;

  export interface UseToastOptions {
    title?: string;
    description?: string;
    status?: 'info' | 'warning' | 'success' | 'error';
    duration?: number;
    isClosable?: boolean;
    position?: 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left';
  }

  export interface UseToastReturn {
    (options: UseToastOptions): string;
    close: (id: string) => void;
    closeAll: () => void;
    update: (id: string, options: UseToastOptions) => void;
    isActive: (id: string) => boolean;
  }

  export function useToast(): UseToastReturn;

  export interface InputLeftElementProps {
    children: React.ReactElement;
    pointerEvents?: string;
  }

  export const InputLeftElement: React.FC<InputLeftElementProps>;

  export interface UseDisclosureReturn {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    onToggle: () => void;
  }

  export function useDisclosure(): UseDisclosureReturn;

  export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    'aria-label': string;
    icon: React.ReactElement;
    size?: string;
    colorScheme?: string;
    variant?: string;
    isLoading?: boolean;
    isDisabled?: boolean;
  }

  export const IconButton: React.FC<IconButtonProps>;

  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    leftIcon?: React.ReactElement;
    rightIcon?: React.ReactElement;
    colorScheme?: string;
    variant?: string;
    size?: string;
    isLoading?: boolean;
    isDisabled?: boolean;
  }

  export const Button: React.FC<ButtonProps>;

  export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    placeholder?: string;
    variant?: string;
    size?: string;
    isDisabled?: boolean;
  }

  export const Select: React.FC<SelectProps>;
}
