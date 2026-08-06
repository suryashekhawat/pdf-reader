import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Pdf from 'react-native-pdf';
import { pickAndCopyPdf } from './src/services/documentPicker';
import { addDocument, loadLibrary, removeDocument, updateDocument } from './src/services/documentStorage';
import { DocumentCard } from './src/components/DocumentCard';
import { EmptyLibrary } from './src/components/EmptyLibrary';
import { PdfDocument } from './src/types/document';

export default function App() {
  const [documents, setDocuments] = useState<PdfDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<PdfDocument | null>(null);
  const [pageInput, setPageInput] = useState('1');
  const [pageCount, setPageCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function bootstrap() {
      const stored = await loadLibrary();
      setDocuments(stored);
      if (stored[0]) {
        setSelectedDocument(stored[0]);
        setPageNumber(stored[0].currentPage || 1);
      }
      setLoading(false);
    }

    bootstrap();
  }, []);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return documents;
    return documents.filter((document) => document.name.toLowerCase().includes(query));
  }, [documents, search]);

  const handleImport = async () => {
    const imported = await pickAndCopyPdf();
    if (!imported) return;

    await addDocument(imported);
    const updated = [imported, ...documents.filter((item) => item.id !== imported.id)];
    setDocuments(updated);
    setSelectedDocument(imported);
    setPageNumber(imported.currentPage || 1);
    setPageInput(String(imported.currentPage || 1));
  };

  const handleOpenDocument = (document: PdfDocument) => {
    setSelectedDocument(document);
    setPageNumber(document.currentPage || 1);
    setPageInput(String(document.currentPage || 1));
  };

  const persistProgress = async (document: PdfDocument, nextPage: number) => {
    const updated: PdfDocument = { ...document, currentPage: nextPage, lastOpenedAt: new Date().toISOString() };
    await updateDocument(updated);
    setDocuments((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    setSelectedDocument(updated);
  };

  const handlePageChange = async (page: number) => {
    if (!selectedDocument) return;
    const nextPage = Math.max(1, Math.min(page, pageCount || page));
    setPageNumber(nextPage);
    setPageInput(String(nextPage));
    await persistProgress(selectedDocument, nextPage);
  };

  const handleRemove = async (documentId: string) => {
    Alert.alert('Remove PDF', 'Delete this PDF from the app library?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await removeDocument(documentId);
        const updated = documents.filter((item) => item.id !== documentId);
        setDocuments(updated);
        if (selectedDocument?.id === documentId) {
          setSelectedDocument(updated[0] ?? null);
          setPageNumber(updated[0]?.currentPage || 1);
          setPageInput(String(updated[0]?.currentPage || 1));
        }
      } },
    ]);
  };

  const handleShare = async () => {
    if (!selectedDocument) return;
    await Share.share({ message: `Open ${selectedDocument.name}`, url: selectedDocument.uri });
  };

  const handleJumpToPage = async () => {
    if (!selectedDocument) return;
    const parsed = Number(pageInput);
    if (!Number.isFinite(parsed) || parsed < 1) {
      Alert.alert('Invalid page', 'Enter a page number greater than zero.');
      return;
    }
    await handlePageChange(parsed);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading your library…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      {!selectedDocument ? (
        <View style={styles.container}>
          <Text style={styles.header}>PDF Reader</Text>
          <TextInput
            placeholder="Search PDFs"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          <Pressable style={styles.primaryButton} onPress={handleImport}>
            <Text style={styles.primaryButtonText}>Import PDF</Text>
          </Pressable>
          {filteredDocuments.length === 0 ? <EmptyLibrary /> : (
            <ScrollView style={styles.list}>
              {filteredDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onPress={handleOpenDocument}
                  onRemove={handleRemove}
                />
              ))}
            </ScrollView>
          )}
        </View>
      ) : (
        <View style={styles.readerContainer}>
          <View style={styles.readerHeader}>
            <Text style={styles.readerTitle}>{selectedDocument.name}</Text>
            <Pressable onPress={() => setSelectedDocument(null)}>
              <Text style={styles.linkText}>Library</Text>
            </Pressable>
          </View>

          <Pdf
            source={{ uri: selectedDocument.uri }}
            style={styles.pdf}
            onPageChanged={(page) => {
              setPageNumber(page);
              setPageInput(String(page));
            }}
            onLoadComplete={(numberOfPages) => {
              const nextPage = Math.min(pageNumber, numberOfPages || 1);
              setPageCount(numberOfPages || 0);
              setPageNumber(nextPage);
              setPageInput(String(nextPage));
              persistProgress(selectedDocument, nextPage);
            }}
            onError={() => {
              Alert.alert('PDF error', 'Unable to load this PDF.');
            }}
            page={pageNumber}
          />

          <View style={styles.controls}>
            <Pressable style={styles.controlButton} onPress={() => handlePageChange(pageNumber - 1)}>
              <Text style={styles.controlButtonText}>Prev</Text>
            </Pressable>
            <View style={styles.pageGroup}>
              <TextInput
                style={styles.pageInput}
                value={pageInput}
                keyboardType="number-pad"
                onChangeText={setPageInput}
              />
              <Pressable style={styles.controlButton} onPress={handleJumpToPage}>
                <Text style={styles.controlButtonText}>Go</Text>
              </Pressable>
            </View>
            <Pressable style={styles.controlButton} onPress={() => handlePageChange(pageNumber + 1)}>
              <Text style={styles.controlButtonText}>Next</Text>
            </Pressable>
          </View>

          <View style={styles.footerBar}>
            <Text style={styles.footerText}>Page {pageNumber} / {pageCount || '…'}</Text>
            <Pressable onPress={handleShare}>
              <Text style={styles.linkText}>Share</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadingText: { marginTop: 12, color: '#334155' },
  container: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
  header: { fontSize: 28, fontWeight: '800', marginBottom: 16 },
  searchInput: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, marginBottom: 12, backgroundColor: '#fff' },
  primaryButton: { backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  list: { flex: 1 },
  readerContainer: { flex: 1, backgroundColor: '#fff' },
  readerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  readerTitle: { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
  linkText: { color: '#2563eb', fontWeight: '600' },
  pdf: { flex: 1, backgroundColor: '#f8fafc' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  controlButton: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#e2e8f0', borderRadius: 8 },
  controlButtonText: { fontWeight: '600', color: '#111827' },
  pageGroup: { flexDirection: 'row', alignItems: 'center' },
  pageInput: { width: 56, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 8, marginRight: 8, textAlign: 'center' },
  footerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16 },
  footerText: { color: '#475569', fontWeight: '600' },
});
