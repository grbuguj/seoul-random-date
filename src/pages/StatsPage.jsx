import { useState, useEffect } from 'react';
import {
  collection, query, orderBy, limit,
  onSnapshot, where, Timestamp, getCountFromServer,
} from 'firebase/firestore';
import { db } from '../firebase';

const PASSWORD = '횃불';
const SESSION_KEY = 'seoul-stats-auth';
const PAGE_SIZE = 50;

function formatTime(ts) {
  if (!ts) return '-';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const mm = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(kst.getUTCDate()).padStart(2, '0');
  const hh = String(kst.getUTCHours()).padStart(2, '0');
  const mi = String(kst.getUTCMinutes()).padStart(2, '0');
  const ss = String(kst.getUTCSeconds()).padStart(2, '0');
  return `${mm}.${dd} ${hh}:${mi}:${ss}`;
}

function StatCard({ label, value, sub, color = '#e8578a' }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '18px 20px',
      border: '1.5px solid rgba(232,87,138,0.15)',
      boxShadow: '0 2px 12px rgba(232,87,138,0.07)',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', marginBottom: 6, letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{value ?? '-'}</div>
      {sub && <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function StatsPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);

  // 통계 데이터
  const [totalSpins, setTotalSpins] = useState(null);
  const [todaySpins, setTodaySpins] = useState(null);
  const [totalCheckins, setTotalCheckins] = useState(null);
  const [totalRankings, setTotalRankings] = useState(null);
  const [totalVisits, setTotalVisits] = useState(null);
  const [todayVisits, setTodayVisits] = useState(null);
  const [deviceStats, setDeviceStats] = useState({ mobile: 0, pc: 0, tablet: 0 });
  const [topStations, setTopStations] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [logPage, setLogPage] = useState(0);
  const [logHasMore, setLogHasMore] = useState(false);

  useEffect(() => {
    if (!authed || !db) return;

    // 오늘 시작 (KST 기준)
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstNow = new Date(now.getTime() + kstOffset);
    const kstToday = new Date(Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate()));
    const todayStart = new Date(kstToday.getTime() - kstOffset);
    const todayTs = Timestamp.fromDate(todayStart);

    // 총 방문자수
    const unsubVisitTotal = onSnapshot(
      query(collection(db, 'visits'), orderBy('timestamp', 'desc'), limit(1)),
      async () => {
        try {
          const snap = await getCountFromServer(collection(db, 'visits'));
          setTotalVisits(snap.data().count);
        } catch { setTotalVisits('?'); }
      }
    );

    // 오늘 방문자수 + 기기 비율
    const unsubVisitToday = onSnapshot(
      query(collection(db, 'visits'), where('timestamp', '>=', todayTs), orderBy('timestamp', 'desc'), limit(500)),
      async (snap) => {
        try {
          const countSnap = await getCountFromServer(
            query(collection(db, 'visits'), where('timestamp', '>=', todayTs))
          );
          setTodayVisits(countSnap.data().count);
        } catch { setTodayVisits('?'); }

        // 기기 비율 (오늘 기준)
        const devices = { mobile: 0, pc: 0, tablet: 0 };
        snap.docs.forEach(doc => {
          const d = doc.data().device || 'pc';
          if (devices[d] !== undefined) devices[d]++;
        });
        setDeviceStats({ ...devices });
      }
    );

    // 총 뽑기 수 (실시간)
    const unsubTotal = onSnapshot(
      query(collection(db, 'spins'), orderBy('timestamp', 'desc'), limit(1)),
      async () => {
        try {
          const snap = await getCountFromServer(collection(db, 'spins'));
          setTotalSpins(snap.data().count);
        } catch { setTotalSpins('?'); }
      }
    );

    // 오늘 뽑기
    const unsubToday = onSnapshot(
      query(collection(db, 'spins'), where('timestamp', '>=', todayTs), orderBy('timestamp', 'desc'), limit(1)),
      async () => {
        try {
          const snap = await getCountFromServer(
            query(collection(db, 'spins'), where('timestamp', '>=', todayTs))
          );
          setTodaySpins(snap.data().count);
        } catch { setTodaySpins('?'); }
      }
    );

    // 총 체크인
    const unsubCheckin = onSnapshot(
      query(collection(db, 'checkins'), orderBy('timestamp', 'desc'), limit(1)),
      async () => {
        try {
          const snap = await getCountFromServer(collection(db, 'checkins'));
          setTotalCheckins(snap.data().count);
        } catch { setTotalCheckins('?'); }
      }
    );

    // 총 랭킹 참여
    const unsubRanking = onSnapshot(
      query(collection(db, 'rankings'), orderBy('timestamp', 'desc'), limit(1)),
      async () => {
        try {
          const snap = await getCountFromServer(collection(db, 'rankings'));
          setTotalRankings(snap.data().count);
        } catch { setTotalRankings('?'); }
      }
    );

    // 역별 TOP 10 (최근 500개 기준)
    const unsubTop = onSnapshot(
      query(collection(db, 'spins'), orderBy('timestamp', 'desc'), limit(500)),
      (snap) => {
        const counts = {};
        snap.docs.forEach(doc => {
          const { station, lineKey } = doc.data();
          if (station) {
            if (!counts[station]) counts[station] = { count: 0, lineKey };
            counts[station].count++;
          }
        });
        const sorted = Object.entries(counts)
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 10);
        setTopStations(sorted);
      }
    );

    return () => {
      unsubVisitTotal(); unsubVisitToday();
      unsubTotal(); unsubToday(); unsubCheckin(); unsubRanking(); unsubTop();
    };
  }, [authed]);

  // 최근 로그 (페이지네이션)
  useEffect(() => {
    if (!authed || !db) return;
    const q = query(
      collection(db, 'spins'),
      orderBy('timestamp', 'desc'),
      limit(PAGE_SIZE * (logPage + 1) + 1)
    );
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const pageItems = all.slice(logPage * PAGE_SIZE, (logPage + 1) * PAGE_SIZE);
      setRecentLogs(pageItems);
      setLogHasMore(all.length > (logPage + 1) * PAGE_SIZE);
    });
    return () => unsub();
  }, [authed, logPage]);

  function handleLogin(e) {
    e.preventDefault();
    if (pw === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  }

  // 로그인 화면
  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #fff5f8, #fce4ec)',
      }}>
        <form onSubmit={handleLogin} style={{
          background: '#fff', borderRadius: 24, padding: '40px 36px',
          boxShadow: '0 8px 40px rgba(232,87,138,0.15)',
          border: '1.5px solid rgba(232,87,138,0.2)',
          minWidth: 300, textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#e8578a', marginBottom: 4 }}>서울 랜덤 데이트</div>
          <div style={{ fontSize: 13, color: '#aaa', marginBottom: 28 }}>Stats Dashboard</div>
          <input
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setPwError(false); }}
            placeholder="비밀번호"
            autoFocus
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 12,
              border: `1.5px solid ${pwError ? '#e8578a' : 'rgba(232,87,138,0.25)'}`,
              fontSize: 15, outline: 'none', boxSizing: 'border-box',
              marginBottom: 8, textAlign: 'center',
            }}
          />
          {pwError && <div style={{ fontSize: 12, color: '#e8578a', marginBottom: 8 }}>비밀번호가 틀렸어요</div>}
          <button type="submit" style={{
            width: '100%', padding: '12px 0', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #a855f7, #e8578a)',
            color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 4,
          }}>
            입장
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f4ff', padding: '0 0 60px' }}>
      {/* 헤더 */}
      <div style={{
        background: 'linear-gradient(135deg, #a855f7, #e8578a)',
        padding: '28px 24px 24px', color: '#fff',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, opacity: 0.8, marginBottom: 4 }}>
            SEOUL RANDOM DATE
          </div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>📊 Stats Dashboard</div>
          <a href="/" style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', marginTop: 4, display: 'inline-block' }}>
            ← 메인으로
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>

        {/* 방문자 카드 */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', letterSpacing: 1, marginBottom: 10 }}>방문자</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <StatCard label="총 방문자" value={totalVisits} sub="전체 기간" color="#6366f1" />
          <StatCard label="오늘 방문자" value={todayVisits} sub="KST 기준" color="#8b5cf6" />
        </div>

        {/* 기기 비율 */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '16px 20px',
          border: '1.5px solid rgba(99,102,241,0.15)',
          boxShadow: '0 2px 12px rgba(99,102,241,0.06)', marginBottom: 24,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', marginBottom: 12, letterSpacing: 1 }}>오늘 기기 비율</div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { key: 'mobile', label: '📱 모바일', color: '#e8578a' },
              { key: 'pc', label: '💻 PC', color: '#6366f1' },
              { key: 'tablet', label: '📟 태블릿', color: '#f59e0b' },
            ].map(({ key, label, color }) => {
              const total = deviceStats.mobile + deviceStats.pc + deviceStats.tablet;
              const pct = total > 0 ? Math.round((deviceStats[key] / total) * 100) : 0;
              return (
                <div key={key} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color }}>{pct}%</div>
                  <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>{label}</div>
                  <div style={{ fontSize: 10, color: '#ccc' }}>{deviceStats[key]}명</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 요약 카드 */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', letterSpacing: 1, marginBottom: 10 }}>뽑기 활동</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <StatCard label="총 뽑기 횟수" value={totalSpins} sub="전체 기간" />
          <StatCard label="오늘 뽑기" value={todaySpins} sub="KST 기준" color="#a855f7" />
          <StatCard label="체크인 후기" value={totalCheckins} color="#f59e0b" />
          <StatCard label="궁합 참여" value={totalRankings} color="#10b981" />
        </div>

        {/* 역별 TOP 10 */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '20px',
          border: '1.5px solid rgba(232,87,138,0.15)',
          boxShadow: '0 2px 12px rgba(232,87,138,0.07)', marginBottom: 24,
        }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#333', marginBottom: 16 }}>🏆 많이 뽑힌 역 TOP 10</div>
          {topStations.length === 0 ? (
            <div style={{ fontSize: 13, color: '#ccc', textAlign: 'center', padding: '20px 0' }}>데이터 없음</div>
          ) : topStations.map(([station, { count, lineKey }], i) => (
            <div key={station} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 0', borderBottom: i < topStations.length - 1 ? '1px solid #f5f5f5' : 'none',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c2f' : '#f0f0f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800,
                color: i < 3 ? '#fff' : '#999',
              }}>{i + 1}</div>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#333' }}>
                {station}역
                <span style={{ fontSize: 10, color: '#aaa', fontWeight: 500, marginLeft: 4 }}>{lineKey}호선</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#e8578a' }}>{count}회</div>
            </div>
          ))}
        </div>

        {/* 최근 방문 로그 */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '20px',
          border: '1.5px solid rgba(232,87,138,0.15)',
          boxShadow: '0 2px 12px rgba(232,87,138,0.07)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#333' }}>🕐 뽑기 로그</div>
            <div style={{ fontSize: 11, color: '#aaa' }}>
              {logPage * PAGE_SIZE + 1}–{logPage * PAGE_SIZE + recentLogs.length}번째
            </div>
          </div>

          {/* 테이블 헤더 */}
          <div style={{
            display: 'grid', gridTemplateColumns: '110px 1fr 60px',
            fontSize: 10, fontWeight: 700, color: '#bbb', padding: '0 4px 8px',
            borderBottom: '1px solid #f5f5f5', marginBottom: 4,
          }}>
            <span>시간 (KST)</span>
            <span>닉네임</span>
            <span style={{ textAlign: 'right' }}>역 / 호선</span>
          </div>

          {recentLogs.length === 0 ? (
            <div style={{ fontSize: 13, color: '#ccc', textAlign: 'center', padding: '20px 0' }}>데이터 없음</div>
          ) : recentLogs.map((log) => (
            <div key={log.id} style={{
              display: 'grid', gridTemplateColumns: '110px 1fr 60px',
              fontSize: 12, padding: '7px 4px',
              borderBottom: '1px solid #fafafa', alignItems: 'center',
            }}>
              <span style={{ color: '#999', fontVariantNumeric: 'tabular-nums' }}>{formatTime(log.timestamp)}</span>
              <span style={{ color: '#555', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {log.nickname || '익명'}
              </span>
              <span style={{ textAlign: 'right', color: '#e8578a', fontWeight: 700, fontSize: 11 }}>
                {log.station}<br />
                <span style={{ color: '#bbb', fontWeight: 500 }}>{log.lineKey}호선</span>
              </span>
            </div>
          ))}

          {/* 페이지네이션 */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
            <button
              onClick={() => setLogPage(p => Math.max(0, p - 1))}
              disabled={logPage === 0}
              style={{
                padding: '6px 16px', borderRadius: 8, border: 'none', cursor: logPage === 0 ? 'not-allowed' : 'pointer',
                background: logPage === 0 ? '#f5f5f5' : '#f0e8ff',
                color: logPage === 0 ? '#ccc' : '#a855f7', fontWeight: 700, fontSize: 13,
              }}
            >← 이전</button>
            <span style={{ fontSize: 12, color: '#aaa' }}>Page {logPage + 1}</span>
            <button
              onClick={() => setLogPage(p => p + 1)}
              disabled={!logHasMore}
              style={{
                padding: '6px 16px', borderRadius: 8, border: 'none', cursor: !logHasMore ? 'not-allowed' : 'pointer',
                background: !logHasMore ? '#f5f5f5' : '#f0e8ff',
                color: !logHasMore ? '#ccc' : '#a855f7', fontWeight: 700, fontSize: 13,
              }}
            >다음 →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
