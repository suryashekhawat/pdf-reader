import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PdfDocument } from '../types/document';

interface DocumentCardProps {
  document: PdfDocument;
  onPress: (document: PdfDocument) => void;
  onRemove: (documentId: string) => void;
}

export function DocumentCard({ document, onPress, onRemove }: DocumentCardProps) {
  return (
    <Pressable style={styles.card} onPress={() => onPress(document)}>
      <View style={styles.content}>
        <Text style={styles.title}>{document.name}</Text>
        <Text style={styles.subtitle}>Page {document.currentPage}</Text>
      </View>
      <Pressable onPress={() => onRemove(document.id)} style={styles.removeButton}>
        <Text style={styles.removeText}>Remove</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  removeButton: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeText: {
    color: '#dc2626',
    fontWeight: '600',
  },
});
