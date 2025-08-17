import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { api } from './api';
import { AuthContext } from './AuthContext';

type Vec2 = {x:number;y:number};
type Quest = { _id:string; title:string; description:string; targetTiles:Vec2[]; deadline:string; rewardXp:number; status:'active'|'completed'|'expired' };

export default function QuestsPanel({ onOpen }: { onOpen: (q:any)=>void }) {
  const [items, setItems] = useState<Quest[]>([]);
  const { tokens } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.quests.list(tokens?.access);
      setItems(data.items || []);
    } catch (e:any) {
      Alert.alert('Error', e.message || 'Failed to load quests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens?.access]);

  const accept = async (id:string) => {
    try { await api.quests.accept(id, tokens?.access); Alert.alert('Quest accepted'); }
    catch(e:any){ Alert.alert('Error', e.message); }
  };
  const complete = async (id:string) => {
    try { const res = await api.quests.complete(id, tokens?.access); Alert.alert(`Completed! +${res.rewardXp} XP`); load(); }
    catch(e:any){ Alert.alert('Error', e.message); }
  };

  const renderItem = ({item:q}:{item:Quest}) => (
    <View style={styles.card}>
      <Text style={styles.title}>{q.title}</Text>
      <Text style={styles.desc}>{q.description}</Text>
      <Text style={styles.meta}>Targets: {q.targetTiles.map(t=>`(${t.x},${t.y})`).join(' ')}</Text>
      <Text style={styles.meta}>Reward: {q.rewardXp} XP</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={()=>accept(q._id)}><Text style={styles.btnTxt}>Accept</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.primary]} onPress={()=>complete(q._id)}><Text style={styles.btnTxt}>Complete</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.secondary]} onPress={()=>onOpen(q)}><Text style={styles.btnTxt}>Open</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.h1}>Quests</Text>
        <TouchableOpacity onPress={load} disabled={loading}>
          <Text style={styles.link}>{loading ? '...' : 'Refresh'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        keyExtractor={(q)=>q._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.desc}>No quests yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 12, backgroundColor: '#0c1118', flex:1 },
  header: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  h1: { color:'#e5e7eb', fontSize:16, fontWeight:'600' },
  link: { color:'#60a5fa' },
  card: { backgroundColor:'#111827', borderRadius:8, padding:12, marginBottom:10, borderWidth:1, borderColor:'#1f2937' },
  title: { color:'#e5e7eb', fontSize:15, fontWeight:'600', marginBottom:4 },
  desc: { color:'#9ca3af', fontSize:13, marginBottom:6 },
  meta: { color:'#6b7280', fontSize:12 },
  row: { flexDirection:'row', gap:8, marginTop:8, flexWrap:'wrap' },
  btn: { paddingVertical:6, paddingHorizontal:10, backgroundColor:'#374151', borderRadius:6 },
  primary: { backgroundColor:'#2563eb' },
  secondary: { backgroundColor:'#4b5563' },
  btnTxt: { color:'#e5e7eb', fontWeight:'600' }
});
