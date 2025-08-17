import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

type Vec2 = {x:number;y:number};
type Quest = { _id:string; title:string; description:string; targetTiles:Vec2[]; rewardXp:number; deadline:string; steps?:string[]; estimatedMinutes?:number };

export default function QuestModal({ quest, visible, onClose, onFocus, onAccept, onComplete }:
  { quest: Quest|null; visible: boolean; onClose:()=>void; onFocus:(tiles:Vec2[])=>void; onAccept:()=>void; onComplete:()=>void }) {
  if (!quest) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{quest.title}</Text>
          <Text style={styles.desc}>{quest.description}</Text>
          <Text style={styles.meta}>Reward: {quest.rewardXp} XP • ETA: {quest.estimatedMinutes ?? 15} min</Text>
          <Text style={styles.meta}>Deadline: {new Date(quest.deadline).toLocaleTimeString()}</Text>
          {quest.steps && quest.steps.length ? (
            <View style={{marginTop:8}}>
              <Text style={styles.h2}>Steps</Text>
              <ScrollView style={{maxHeight:160}}>
                {quest.steps.map((s, i)=>(<Text key={i} style={styles.step}>• {s}</Text>))}
              </ScrollView>
            </View>
          ) : null}
          <View style={styles.row}>
            <TouchableOpacity style={[styles.btn, styles.secondary]} onPress={()=> onFocus(quest.targetTiles)}>
              <Text style={styles.btnTxt}>Focus on Map</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={onAccept}>
              <Text style={styles.btnTxt}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.primary]} onPress={onComplete}>
              <Text style={styles.btnTxt}>Complete</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.close}><Text style={styles.closeTxt}>Close</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end' },
  sheet: { backgroundColor:'#0c1118', padding:16, borderTopLeftRadius:16, borderTopRightRadius:16, borderWidth:1, borderColor:'#1f2937' },
  title: { color:'#e5e7eb', fontSize:18, fontWeight:'700' },
  desc: { color:'#9ca3af', marginTop:6 },
  meta: { color:'#6b7280', marginTop:4, fontSize:12 },
  h2: { color:'#d1d5db', fontWeight:'700', marginBottom:6 },
  step: { color:'#9ca3af', marginBottom:4 },
  row: { flexDirection:'row', gap:8, marginTop:12, flexWrap:'wrap' },
  btn: { backgroundColor:'#2563eb', paddingVertical:10, paddingHorizontal:14, borderRadius:8 },
  btnTxt: { color:'#fff', fontWeight:'700' },
  primary: { backgroundColor:'#1d4ed8' },
  secondary: { backgroundColor:'#374151' },
  close: { alignSelf:'center', marginTop:10 },
  closeTxt: { color:'#93c5fd' }
});
