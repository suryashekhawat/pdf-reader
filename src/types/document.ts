export interface PdfDocument {
  id: string;
  name: string;
  uri: string;
  fileName: string;
  size?: number;
  addedAt: string;
  lastOpenedAt: string;
  currentPage: number;
  totalPages: number;
  isFavourite: boolean;
  bookmarkedPages: number[];
}
