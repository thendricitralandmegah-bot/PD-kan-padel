'use client';

import { useState } from 'react';

export default function Home() {
  const [tournamentName, setTournamentName] = useState('PD-KAN PADEL MATCH');
  const [targetPoints, setTargetPoints] = useState(21);
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [activeRound, setActiveRound] = useState(1);
  const [matches, setMatches] = useState<any[]>([]);

  // 1. Tambah Pemain
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    setPlayers([...players, newPlayerName.trim()]);
    setNewPlayerName('');
  };

  // 2. Padam Pemain
  const handleRemovePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  // 3. Generate Perlawanan Americano
  const generateMatches = () => {
    if (players.length < 4) {
      alert('Sila tambah sekurang-kurangnya 4 orang pemain!');
      return;
    }

    const n = Math.min(players.length, 8); // Maksimum 2 gelanggang (8 pemain)
    const pool = players.slice(0, n);
    const rotated = [...pool];

    const offset = (activeRound - 1) % (n - 1);
    if (offset > 0) {
      const fixed = rotated[0];
      const rest = rotated.slice(1);
      for (let i = 0; i < offset; i++) {
        rest.unshift(rest.pop()!);
      }
      rotated.length = 0;
      rotated.push(fixed, ...rest);
    }

    const newMatches = [];
    const matchesCount = Math.floor(n / 4);

    for (let m = 0; m < matchesCount; m++) {
      newMatches.push({
        id: `match-${activeRound}-${m + 1}`,
        court: m + 1,
        teamA: [rotated[m], rotated[n - 1 - m]],
        teamB: [rotated[m + 1], rotated[n - 2 - m]],
        scoreA: 0,
        scoreB: 0,
      });
    }

    setMatches(newMatches);
  };

  // 4. Kemaskini Skor
  const handleScoreChange = (matchId: string, valA: number) => {
    const scoreA = Math.max(0, Math.min(targetPoints, valA));
    const scoreB = targetPoints - scoreA;

    setMatches(
      matches.map((m) =>
        m.id === matchId ? { ...m, scoreA, scoreB } : m
      )
    );
  };

  // 5. Kedudukan (Standings)
  const calculateStandings = () => {
    const stats: { [key: string]: { name: string; points: number; games: number } } = {};
    players.forEach((p) => (stats[p] = { name: p, points: 0, games: 0 }));

    matches.forEach((m) => {
      if (m.scoreA > 0 || m.scoreB > 0) {
        m.teamA.forEach((p: string) => {
          if (stats[p]) {
            stats[p].points += m.scoreA;
            stats[p].games += 1;
          }
        });
        m.teamB.forEach((p: string) => {
          if (stats[p]) {
            stats[p].points += m.scoreB;
            stats[p].games += 1;
          }
        });
      }
    });

    return Object.values(stats).sort((a, b) => b.points - a.points);
  };

  const standings = calculateStandings();

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>🎾 {tournamentName}</h1>
          <p style={styles.subtitle}>Engine Perlawanan Padel Americano</p>
        </div>
        <div style={styles.badge}>{targetPoints} Mata / Perlawanan</div>
      </header>

      {/* UTAMA */}
      <div style={styles.grid}>
        {/* PANEL KIRI: ROSTER */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>👥 Senarai Pemain ({players.length})</h2>
          
          <form onSubmit={handleAddPlayer} style={styles.form}>
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Nama Pemain..."
              style={styles.input}
            />
            <button type="submit" style={styles.btnPrimary}>+ Tambah</button>
          </form>

          <div style={styles.playerList}>
            {players.length === 0 ? (
              <p style={styles.emptyText}>Belum ada pemain. Tambah di atas!</p>
            ) : (
              players.map((p, i) => (
                <div key={i} style={styles.playerItem}>
                  <span><strong>#{i + 1}</strong> {p}</span>
                  <button onClick={() => handleRemovePlayer(i)} style={styles.btnDelete}>✕</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PANEL KANAN: PERLAWANAN & SKOR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* CONTROL BAR */}
          <div style={{ ...styles.card, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>Ronde Aktif: </span>
              <strong style={{ fontSize: '18px', color: '#10b981' }}>Ronde {activeRound}</strong>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setActiveRound(Math.max(1, activeRound - 1))}
                style={styles.btnSecondary}
              >
                ◀ Ronde Sebelum
              </button>
              <button onClick={generateMatches} style={styles.btnAccent}>
                ▶ Generate Match
              </button>
              <button 
                onClick={() => setActiveRound(activeRound + 1)}
                style={styles.btnSecondary}
              >
                Ronde Seterusnya ▶
              </button>
            </div>
          </div>

          {/* LIST MATCH */}
          {matches.length === 0 ? (
            <div style={{ ...styles.card, textAlign: 'center', padding: '40px', color: '#64748b' }}>
              Klik <strong>"Generate Match"</strong> untuk mula susun perlawanan.
            </div>
          ) : (
            matches.map((m) => (
              <div key={m.id} style={styles.matchCard}>
                <div style={styles.matchHeader}>
                  <span style={styles.courtBadge}>Gelanggang {m.court}</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Target: {targetPoints} Pts</span>
                </div>

                <div style={styles.scoreGrid}>
                  {/* TEAM A */}
                  <div style={styles.teamBox}>
                    <div style={styles.teamNames}>{m.teamA.join(' & ')}</div>
                    <input
                      type="number"
                      value={m.scoreA}
                      onChange={(e) => handleScoreChange(m.id, Number(e.target.value))}
                      style={styles.scoreInput}
                    />
                  </div>

                  <div style={{ alignSelf: 'center', fontWeight: 'bold', color: '#64748b', fontSize: '20px' }}>VS</div>

                  {/* TEAM B */}
                  <div style={styles.teamBox}>
                    <div style={styles.teamNames}>{m.teamB.join(' & ')}</div>
                    <div style={styles.scoreDisplay}>{m.scoreB}</div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* CARTA KEDUDUKAN (LEADERBOARD) */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🏆 Live Leaderboard</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {standings.map((p, idx) => (
                <div key={p.name} style={styles.rankItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      fontWeight: 'bold', 
                      width: '24px', 
                      color: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : '#64748b' 
                    }}>
                      #{idx + 1}
                    </span>
                    <span style={{ fontWeight: '600' }}>{p.name}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#10b981', fontSize: '16px' }}>{p.points} Pts</strong>
                    <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px' }}>({p.games} perlawanan)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// GAYA CSS (STYLING) DEDIKASI
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '24px',
  },
  header: {
    maxWidth: '1000px',
    margin: '0 auto 24px auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #1e293b',
    paddingBottom: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#34d399',
    margin: 0,
  },
  subtitle: {
    fontSize: '12px',
    color: '#94a3b8',
    margin: '4px 0 0 0',
  },
  badge: {
    backgroundColor: '#064e3b',
    color: '#34d399',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    border: '1px solid #047857',
  },
  grid: {
    maxWidth: '1000px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '20px',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '16px',
    color: '#f1f5f9',
  },
  form: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '10px 12px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
  },
  btnPrimary: {
    backgroundColor: '#10b981',
    color: '#0f172a',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  btnSecondary: {
    backgroundColor: '#334155',
    color: '#f8fafc',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnAccent: {
    backgroundColor: '#10b981',
    color: '#0f172a',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  playerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  playerItem: {
    backgroundColor: '#0f172a',
    padding: '10px 12px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    border: '1px solid #334155',
  },
  btnDelete: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: '12px',
    color: '#64748b',
    fontStyle: 'italic',
  },
  matchCard: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '16px',
    border: '1px solid #334155',
  },
  matchHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  courtBadge: {
    backgroundColor: '#064e3b',
    color: '#34d399',
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '2px 8px',
    borderRadius: '6px',
  },
  scoreGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    gap: '12px',
  },
  teamBox: {
    backgroundColor: '#0f172a',
    padding: '12px',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid #334155',
  },
  teamNames: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: '8px',
  },
  scoreInput: {
    width: '100%',
    textAlign: 'center',
    fontSize: '28px',
    fontWeight: '900',
    color: '#34d399',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
  },
  scoreDisplay: {
    fontSize: '28px',
    fontWeight: '900',
    color: '#94a3b8',
    marginTop: '4px',
  },
  rankItem: {
    backgroundColor: '#0f172a',
    padding: '12px 16px',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    border: '1px solid #1e293b',
  },
};
