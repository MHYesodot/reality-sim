import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { io, Socket } from 'socket.io-client';
import { ensureAccess } from './authStore';
import { ENV } from './env';

type EventRow = { type:string; tiles:{x:number;y:number}[]; severity:number; reason?:string; at:string };

export default function EventsScreen({ onFocus }: { onFocus?: (tiles:{x:number;y:number}[])=>void }) {
  const [items, setItems] = useState<EventRow[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket|null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const t = await ensureAccess();
      const s2 = io(ENV.WS_URL, { transports: ['websocket'], auth: t ? { token: t } : undefined, reconnection: true });
      socketRef.current = s2;
      s2.on('connect', ()=> mounted && setConnected(true));
      s2.on('disconnect', ()=> mounted && setConnected(false));
      s2.on('connect_error', async (err:any) => {
        if (String(err?.message||'').toLowerCase().includes('unauthorized')) {
          const nt = await ensureAccess(0);
          if (nt) { try { s2.auth = { token: nt }; s2.connect(); } catch {} }
        }
      });
      s2.on('world:event', (msg:any) => { if (mounted && msg?.data) setItems(prev => [msg.data, ...prev].slice(0, 50)); });
    })();
    return () => { try { socketRef.current?.disconnect(); } catch {} };
  }, []);

  const renderItem = ({item}:{item:EventRow}) => (
    <View style={styles.card}>
      <View style={styles.rowHead}>
        <Text style={styles.title}>{item.type.replace('_',' ').toUpperCase()}</Text>
        <Text style={[styles.badge, {backgroundColor: sevColor(item.severity)}]}>S{item.severity}</Text>
      </View>
      <Text style={styles.meta}>Tiles: {item.tiles.map(t=>`(${t.x},${t.y})`).join(' ')}</Text>
      {item.reason ? <Text style={styles.meta}>Reason: {item.reason}</Text> : null}
      <Text style={styles.time} onPress={()=> onFocus && onFocus(item.tiles)}>{new Date(item.at).toLocaleTimeString()}</Text>
    </View>
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.h1}>Events</Text>
        <View style={[styles.dot, { backgroundColor: connected ? '#10b981' : '#ef4444' }]} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(_,i)=> String(i)}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Waiting for live events…</Text>}
      />
    </View>
  );
}

function sevColor(s:number) {
  return s>=5 ? '#dc2626' : s>=3 ? '#f59e0b' : '#16a34a';
}

const styles = StyleSheet.create({
  wrap: { flex:1, backgroundColor:'#0c1118', padding:12 },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:8 },
  h1: { color:'#e5e7eb', fontSize:16, fontWeight:'600' },
  dot: { width:10, height:10, borderRadius:5 },
  card: { backgroundColor:'#111827', borderRadius:8, padding:12, borderWidth:1, borderColor:'#1f2937', marginBottom:8 },
  rowHead: { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  title: { color:'#e5e7eb', fontWeight:'700' },
  badge: { color:'#0b1220', fontWeight:'800', paddingHorizontal:8, paddingVertical:2, borderRadius:6, overflow:'hidden' },
  meta: { color:'#9ca3af', marginTop:4 },
  time: { color:'#6b7280', marginTop:6, fontSize:12, textAlign:'right' },
  empty: { color:'#6b7280', textAlign:'center', marginTop:20 }
});
