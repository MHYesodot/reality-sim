import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Account</Text>
      <Text style={{color:'#93c5fd', marginBottom:8}}>Privacy: see docs/privacy_policy_template.md</Text>
      <Text style={{color:'#9ca3af'}}>
        {'If you see this fallback screen, reload the app. The full Settings screen will be available.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex:1, backgroundColor:'#0c1118', padding:16 },
  h1: { color:'#e5e7eb', fontSize:18, fontWeight:'700', marginBottom:8 }
});

