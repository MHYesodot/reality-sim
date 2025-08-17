import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from './AuthContext';

export default function LoginScreen() {
  const { login, register } = useContext(AuthContext);
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demopass');
  const [displayName, setDisplayName] = useState('Demo');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password, displayName);
    } catch (e:any) {
      Alert.alert('Auth error', e.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>{mode === 'login' ? 'Login' : 'Register'}</Text>
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#6b7280" autoCapitalize='none' value={email} onChangeText={setEmail} />
      {mode==='register' && (
        <TextInput style={styles.input} placeholder="Display name" placeholderTextColor="#6b7280" value={displayName} onChangeText={setDisplayName} />
      )}
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#6b7280" secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity style={styles.btn} onPress={onSubmit} disabled={loading}>
        <Text style={styles.btnTxt}>{loading ? '...' : (mode==='login' ? 'Login' : 'Create Account')}</Text>
      </TouchableOpacity>
      <Text style={styles.link} onPress={()=> setMode(mode==='login'?'register':'login')}>
        {mode==='login' ? 'No account? Register' : 'Have an account? Login'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex:1, alignItems:'center', justifyContent:'center', backgroundColor:'#0c1118', padding:16 },
  h1: { color:'#e5e7eb', fontSize:20, fontWeight:'700', marginBottom:16 },
  input: { width:'85%', backgroundColor:'#111827', color:'#e5e7eb', padding:12, borderRadius:8, marginBottom:10, borderWidth:1, borderColor:'#1f2937' },
  btn: { backgroundColor:'#2563eb', paddingHorizontal:16, paddingVertical:10, borderRadius:8, marginTop:4 },
  btnTxt: { color:'#e5e7eb', fontWeight:'700' },
  link: { color:'#60a5fa', marginTop:12 }
});
