// components/Target.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Target({ label, hit }) {
  // Log the props to see when they change
  useEffect(() => {
    console.log('Target Component Rendered');
    console.log('Label:', label);
    console.log('Hit:', hit);
  }, [label, hit]);

  return (
    <View style={[styles.target, { backgroundColor: hit ? 'green' : 'red' }]}>
      <Text style={styles.targetText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  target: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  targetText: {
    fontSize: 20,
    color: 'white',
  },
});
