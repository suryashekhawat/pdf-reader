import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function EmptyLibrary() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>No PDFs yet</Text>
      <Text style={styles.subtitle}>Import your first PDF to start reading offline.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
