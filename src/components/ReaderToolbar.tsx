import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ReaderToolbarProps {
  onBack: () => void;
  onShare: () => void;
}

export function ReaderToolbar({ onBack, onShare }: ReaderToolbarProps) {
  return (
    <View style={styles.toolbar}>
      <Pressable onPress={onBack}>
        <Text style={styles.linkText}>Back</Text>
      </Pressable>
      <Pressable onPress={onShare}>
        <Text style={styles.linkText}>Share</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  linkText: {
    color: '#2563eb',
    fontWeight: '600',
  },
});
