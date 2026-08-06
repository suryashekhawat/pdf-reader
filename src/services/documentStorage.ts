import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { PdfDocument } from '../types/document';

const LIBRARY_KEY = 'pdf-library-v1';

export async function loadLibrary(): Promise<PdfDocument[]> {
  try {
    const raw = await AsyncStorage.getItem(LIBRARY_KEY);
    return raw ? (JSON.parse(raw) as PdfDocument[]) : [];
  } catch (error) {
    console.warn('Failed to load library', error);
    return [];
  }
}

export async function saveLibrary(documents: PdfDocument[]): Promise<void> {
  await AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(documents));
}

export async function addDocument(document: PdfDocument): Promise<void> {
  const documents = await loadLibrary();
  const next = [document, ...documents.filter((item) => item.id !== document.id)];
  await saveLibrary(next);
}

export async function updateDocument(document: PdfDocument): Promise<void> {
  const documents = await loadLibrary();
  const next = documents.map((item) => (item.id === document.id ? document : item));
  await saveLibrary(next);
}

export async function removeDocument(documentId: string): Promise<void> {
  const documents = await loadLibrary();
  const target = documents.find((item) => item.id === documentId);
  if (target) {
    await FileSystem.deleteAsync(target.uri, { idempotent: true });
  }
  const next = documents.filter((item) => item.id !== documentId);
  await saveLibrary(next);
}
