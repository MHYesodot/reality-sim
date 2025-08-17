import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { leaderboard } from './api';

type Row = { user: string; xp: number; level?: number };

export default function LeaderboardScreen() {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
       const res = await leaderboard.list();
       // Support both shapes: {items:[{userId/xp/...}]} or consistent demo
       const rows = (res.items || []).map((r:any)=> ({
         user: r.user || r.userId || 'unknown',
         xp: r.xp ?? 0,
         level: r.level ?? 1
       }));
       setItems(rows);
    } catch(e:any) {
       Alert.alert('Error', e.message || 'Failed to load leaderboard');
    } finally {
       setLoading(false);
    }
  };

  useEffect(()=>{ load(); }, []);

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Leaderboard</Text>
      <FlatList
        data={items}
        keyExtractor={(r,i)=> (r.user||'u') + String(i)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({item, index}) => (
          <View style={styles.row}>
            <Text style={styles.rank}>{index+1}</Text>
            <View style={{flex:1}}>
              <Text style={styles.user}>{item.user}</Text>
              <Text style={styles.meta}>Level {item.level ?? 1}</Text>
            </View>
            <Text style={styles.xp}>{item.xp} XP</Text>
          </View>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No entries yet.</Text> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 12, backgroundColor: '#0c1118', flex:1 },
  h1: { color:'#e5e7eb', fontSize:16, fontWeight:'600', marginBottom:8 },
  row: { flexDirection:'row', alignItems:'center', backgroundColor:'#111827', padding:10, borderRadius:8, marginBottom:8, borderWidth:1, borderColor:'#1f2937' },
  rank: { width:24, color:'#93c5fd', fontWeight:'800' },
  user: { color:'#e5e7eb', fontSize:14, fontWeight:'600' },
  meta: { color:'#9ca3af', fontSize:12 },
  xp: { color:'#fbbf24', fontWeight:'700' },
  empty: { color:'#6b7280', textAlign:'center', marginTop:20 }
});
