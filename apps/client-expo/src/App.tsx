import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, FlatList, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { io, Socket } from 'socket.io-client';
import { ENV } from './env';
import MapView from './MapView';
import { AuthProvider, AuthContext } from './AuthContext';
import LoginScreen from './LoginScreen';
import QuestsPanel from './QuestsPanel';
import LeaderboardScreen from './LeaderboardScreen';
import QuestModal from './QuestModal';
import EventsScreen from './EventsScreen';
import SettingsScreen from './SettingsScreen';
import AboutScreen from './AboutScreen';
import { logout } from './authStore';
import { api } from './api';

// Simple types used locally
type Delta = { x:number; y:number; economy?:number; traffic?:number; pollution?:number };
type Tab = 'map'|'quests'|'events'|'leaderboard'|'settings'|'about';
function AppInner() {
  const [connected, setConnected] = useState(false);
  const [deltas, setDeltas] = useState<Delta[]>([]);
  const [tab, setTab] = useState<Tab>('map');
  const [focusedTiles, setFocusedTiles] = useState<{x:number;y:number}[]>([]);
  const [questSelected, setQuestSelected] = useState<any>(null);
  const [questOpen, setQuestOpen] = useState(false);
  const [focusTimer, setFocusTimer] = useState<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let mounted = true;

    // Deep link handling
    Linking.getInitialURL().then(handleUrl).catch(()=>{});
    const sub = Linking.addEventListener('url', (e)=> handleUrl(e.url));

    // Basic socket connection (unauthenticated for now)
    const s = io(ENV.WS_URL, { transports: ['websocket'] });
    socketRef.current = s;
    s.on('connect', () => mounted && setConnected(true));
    s.on('disconnect', () => mounted && setConnected(false));
    s.on('world:delta', (msg:any) => { if (mounted && msg?.data?.deltas) setDeltas(msg.data.deltas); });
    s.emit('join', { room: 'cityA:sector-0' });

    return () => {
      mounted = false;
      try { (sub as any)?.remove?.(); } catch {}
      try { s.disconnect(); } catch {}
      if (focusTimer) clearTimeout(focusTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearFocus() { setFocusedTiles([]); if (focusTimer) clearTimeout(focusTimer); setFocusTimer(null); }

  const { tokens } = React.useContext(AuthContext);

  async function handleUrl(url?: string | null) {
    if (!url) return;
    try {
      const u = new URL(url);
      if (u.protocol.startsWith('realitysim') && u.host === 'quest' && u.pathname.length > 1) {
        const id = u.pathname.slice(1);
        try {
          const { quest } = await api.quests.get(id, tokens?.access);
          setQuestSelected(quest);
          setQuestOpen(true);
          setTab('quests');
        } catch {}
      }
    } catch {}
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>RealitySim — Live Grid</Text>
        <View style={[styles.status, { backgroundColor: connected ? '#11a36a' : '#b91c1c' }]} />
        <Text onPress={async()=>{ try{ await logout(); }catch{} }} style={styles.logout}>Logout</Text>
        <Text onPress={clearFocus} style={styles.clear}>{focusedTiles.length ? 'Clear Focus' : ''}</Text>
      </View>

      <View style={styles.tabs}>
        <TabButton active={tab==='map'} onPress={()=>setTab('map')} label="Map" />
        <TabButton active={tab==='quests'} onPress={()=>setTab('quests')} label="Quests" />
        <TabButton active={tab==='events'} onPress={()=>setTab('events')} label="Events" />
        <TabButton active={tab==='leaderboard'} onPress={()=>setTab('leaderboard')} label="Leaderboard" />
        <TabButton active={tab==='settings'} onPress={()=>setTab('settings')} label="Settings" />
        <TabButton active={tab==='about'} onPress={()=>setTab('about')} label="About" />
      </View>

      {tab==='map' && (<MapView deltas={deltas} highlights={focusedTiles} />)}
      {tab==='quests' && (<QuestsPanel onOpen={(q)=>{ setQuestSelected(q); setQuestOpen(true); }} />)}
      {tab==='events' && (<EventsScreen onFocus={(tiles)=>{ setFocusedTiles(tiles); setTab('map'); if (focusTimer) clearTimeout(focusTimer); const t=setTimeout(()=>setFocusedTiles([]), 8000); setFocusTimer(t as any); }} />)}
      {tab==='leaderboard' && (<LeaderboardScreen />)}
      {tab==='settings' && (<SettingsScreen />)}
      {tab==='about' && (<AboutScreen />)}

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Recent Deltas</Text>
        <FlatList
          data={deltas.slice(0, 12)}
          keyExtractor={(_, i) => String(i)}
          renderItem={({item}) => (
            <Text style={styles.row}>{`(${item.x},${item.y}) traffic ${item.traffic?.toFixed(2) ?? '-'}`}</Text>
          )}
        />
      </View>
      <StatusBar style="light" />
      <QuestModal
        quest={questSelected}
        visible={questOpen}
        onClose={()=>setQuestOpen(false)}
        onFocus={(tiles)=>{ setQuestOpen(false); setFocusedTiles(tiles); setTab('map'); if (focusTimer) clearTimeout(focusTimer); const t=setTimeout(()=>setFocusedTiles([]), 8000); setFocusTimer(t as any); }}
        onAccept={async()=>{ try{ await api.quests.accept(questSelected._id, tokens?.access); }catch{} }}
        onComplete={async()=>{ try{ await api.quests.complete(questSelected._id, tokens?.access); }catch{} }}
      />
    </SafeAreaView>
  );
}

function TabButton({ active, onPress, label }:{ active:boolean; onPress:()=>void; label:string }) {
  return (
    <Text onPress={onPress} style={{ color: active ? '#fff' : '#9ca3af', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: active ? '#1f2937' : 'transparent', borderRadius: 6 }}>
      {label}
    </Text>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

function AuthGate() {
  const { tokens, ready } = React.useContext(AuthContext);
  if (!ready) return null;
  if (!tokens?.access) return <LoginScreen />;
  return <AppInner />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E1116' },
  header: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: '#e5e7eb', fontSize: 18, fontWeight: '600' },
  status: { width: 10, height: 10, borderRadius: 5 },
  logout: { color:'#fca5a5', fontWeight:'700', marginLeft: 12 },
  tabs: { flexDirection:'row', gap:8, paddingHorizontal:12, paddingBottom:8 },
  panel: { padding: 12, backgroundColor: '#111827' },
  clear: { color:'#fca5a5', fontWeight:'700' },
  panelTitle: { color: '#d1d5db', marginBottom: 8 },
  row: { color: '#9ca3af', fontSize: 12 }
});
