import React, { memo, useMemo } from 'react';
import { Platform, View, StyleSheet, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

type Delta = { x: number; y: number; traffic?: number };
type Vec2 = { x: number; y: number };

type Props = {
  deltas: ReadonlyArray<Delta>;
  highlights?: ReadonlyArray<Vec2>;
  style?: ViewStyle;
  /** פיקסלים לתא אחד */
  cellSize?: number;      // default: 6
  /** צעד הרשת (ריווח התאים) */
  step?: number;          // default: 7
  /** צבע בסיס לתנועה */
  baseColor?: string;     // default: rgba(0,200,255,ALPHA)
  /** רקע */
  background?: string;    // default: #0b0f14
  /** צבע היילייט */
  highlightColor?: string; // default: rgba(255,80,80,0.95)
};

function buildHtml(
  points: Array<{ x: number; y: number; v: number }>,
  hi: Array<{ x: number; y: number }>,
  opts: Required<Pick<Props, 'cellSize' | 'step' | 'baseColor' | 'background' | 'highlightColor'>>
) {
  const { cellSize: S, step: W, baseColor, background, highlightColor } = opts;
  // שים לב: אין תלות חיצונית; הכל self-contained
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  :root { --bg:${background}; --hl:${highlightColor}; --cell:${S}px; --step:${W}px; }
  html,body,#c{margin:0;height:100%;background:var(--bg);overflow:hidden}
  .cell{position:absolute;width:var(--cell);height:var(--cell)}
  .hl{position:absolute;box-sizing:border-box;border:2px solid var(--hl);background:transparent;width:var(--cell);height:var(--cell)}
  .cross{position:absolute;width:var(--cell);height:var(--cell);border:2px solid #fff;opacity:.7}
</style>
</head>
<body>
<div id="c"></div>
<script>
  const C=document.getElementById('c');
  const W=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--step'));
  const S=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell'));
  const points=${JSON.stringify(points)};
  const hi=${JSON.stringify(hi)};
  const baseColor='${baseColor}';

  function rgbaFromBase(alpha){
    // baseColor כמו 'rgba(0,200,255,ALPHA)' – נחליף את ALPHA בזמן ריצה
    return baseColor.replace('ALPHA', String(alpha));
  }

  C.innerHTML='';
  for(const p of points){
    const e=document.createElement('div');
    e.className='cell';
    e.style.left=(p.x*W)+'px';
    e.style.top=(p.y*W)+'px';
    const alpha=Math.min(1, (p.v||0)/100);
    e.style.background=rgbaFromBase(alpha);
    C.appendChild(e);
  }

  for(const h of hi){
    const b=document.createElement('div');
    b.className='hl';
    b.style.left=(h.x*W)+'px';
    b.style.top=(h.y*W)+'px';
    b.style.width=S+'px';
    b.style.height=S+'px';
    C.appendChild(b);

    const c=document.createElement('div');
    c.className='cross';
    c.style.left=(h.x*W)+'px';
    c.style.top=(h.y*W)+'px';
    C.appendChild(c);
  }
</script>
</body>
</html>`;
}

function MapViewImpl({
  deltas,
  highlights = [],
  style,
  cellSize = 6,
  step = 7,
  baseColor = 'rgba(0,200,255,ALPHA)',
  background = '#0b0f14',
  highlightColor = 'rgba(255,80,80,0.95)',
}: Props) {

  const data = useMemo(() => {
    const points = deltas.map(d => ({ x: d.x, y: d.y, v: Math.round((d.traffic ?? 0) * 100) }));
    const hi = highlights.map(h => ({ x: h.x, y: h.y }));
    return { points, hi };
  }, [deltas, highlights]);

  const html = useMemo(
    () =>
      buildHtml(data.points, data.hi, {
        cellSize,
        step,
        baseColor,
        background,
        highlightColor,
      }),
    [data, cellSize, step, baseColor, background, highlightColor]
  );

  // Web: אין תמיכה ב-react-native-webview → iframe עם srcDoc
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.wrap, style]}>
        <iframe
          srcDoc={html}
          sandbox="allow-scripts"     // לא צריך network/frame-ים חיצוניים
          style={{ width: '100%', height: '100%', border: '0' }}
          title="RealitySim Map"
        />
      </View>
    );
  }

  // Native: WebView רגיל
  return (
    <View style={[styles.wrap, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html, baseUrl: '' }}
        javaScriptEnabled
        incognito
        allowsInlineMediaPlayback
        setSupportMultipleWindows={false}
        mixedContentMode="never"
        automaticallyAdjustContentInsets={false}
      />
    </View>
  );
}

export default memo(MapViewImpl);

const styles = StyleSheet.create({
  wrap: { flex: 1, borderTopWidth: 1, borderColor: '#1f2937' },
});
