import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { PdfDocument } from '../types/document';

export async function pickAndCopyPdf(): Promise<PdfDocument | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: false,
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  const asset = result.assets[0];
  const fileName = asset.name ?? 'document.pdf';
  const destinationDirectory = FileSystem.Paths.document.uri;
  const destUri = `${destinationDirectory}${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  await FileSystem.copyAsync({ from: asset.uri, to: destUri });

  return {
    id: `${Date.now()}`,
    name: fileName,
    uri: destUri,
    fileName,
    size: asset.size,
    addedAt: new Date().toISOString(),
    lastOpenedAt: new Date().toISOString(),
    currentPage: 1,
    totalPages: 0,
    isFavourite: false,
    bookmarkedPages: [],
  };
}
