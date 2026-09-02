'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Trophy, Users, Plus, Check, RefreshCw, Play } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [tournamentName, setTournamentName] = useState('PD-Kan Padel Match');
  const [courtsCount, setCourtsCount] = useState(2);
  const [targetPoints, setTargetPoints] = useState(21);
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  
  const [activeRound, setActiveRound] = useState(1);
  const [matches, setMatches] = useState<any[]>([]);
  const [scores, setScores] = useState<{ [key: string]: { scoreA: number; scoreB: number } }>({});

  // 1. Tambah Pemain ke Roster
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    setPlayers([...players, newPlayerName.trim()]);
    setNewPlayerName('');
  };

  // 2. Generator Match Format Americano (Rotasi Murni Seimbang)
  const generateAmericanoMatches = () => {
    if (players.length < 4) {
      alert('Minimal 4 pemain diperlukan untuk membuat match!');
      return;
    }

    const n = Math.min(players.length, courtsCount * 4);
    const activePool = players.slice(0, n);
    const rotated = [...activePool];

    // Rotasi posisi berdasarkan nomor ronde
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
    const matchesPerRound = Math.floor(n / 4);

    for (let m = 0; m < matchesPerRound; m++) {
      const p1 = rotated[m];
      const p2 = rotated[n - 1 - m];
      const p3 = rotated[m + 1];
      const p4 = rotated[n - 2 - m];

      const matchId = `match-${activeRound}-${m + 1}`;
      newMatches.push({
        id: matchId,
        court: m + 1,
        teamA: [p1, p2],
        teamB: [p3, p4],
        scoreA: scores[matchId]?.scoreA || 0,
        scoreB: scores[matchId]?.scoreB || 0,
      });
    }

    setMatches(newMatches);
  };

  // 3. Simpan Skor
  const handleScoreChange = (matchId: string, scoreA: number, scoreB: number) => {
    const validA = Math.max(0, Math.min(targetPoints, scoreA));
    const validB = targetPoints - validA; // Auto calculate sisa poin

    setScores((prev) => ({
      ...prev,
      [matchId]: { scoreA: validA, scoreB: validB },
    }));

    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, scoreA: validA, scoreB: validB } : m))
    );
  };

  // 4. Kalkulasi Live Leaderboard
  const calculateStandings = () => {
    const stats: { [key: string]: { name: string; points: number; games: number } } = {};

    players.forEach((p) => {
      stats[p] = { name: p, points: 0, games: 0 };
    });

    Object.values(matches).forEach((m) => {
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
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8 font-sans">
      <header className="max-w-4xl mx-auto mb-6 flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-emerald-400 tracking-tight">{tournamentName}</h1>
          <p className="text-xs text-slate-400">Americano Padel Match Engine</p>
        </div>
        <div className="text-right">
          <span className="bg-emerald-950 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-800">
            {targetPoints} Points / Game
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PANEL KIRI: Roster Pemain */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" /> Roster Pemain ({players.length})
          </h2>

          <form onSubmit={handleAddPlayer} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Nama Pemain"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-2 rounded-xl transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {players.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Belum ada pemain. Tambahkan pemain di atas.</p>
            ) : (
              players.map((p, idx) => (
                <div key={idx} className="bg-slate-950 px-3 py-2 rounded-xl text-xs font-medium border border-slate-800/60 flex justify-between">
                  <span>{p}</span>
                  <span className="text-slate-500">#P{idx + 1}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* PANEL TENGAH: Match & Input Skor */}
        <section className="md:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Ronde {activeRound}</span>
            </div>
            <button
              onClick={generateAmericanoMatches}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Generate Matches
            </button>
          </div>

          {matches.length === 0 ? (
            <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-500">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Klik "Generate Matches" untuk memunculkan jadwal ronde ini.</p>
            </div>
          ) : (
            matches.map((m) => (
              <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-900 px-2.5 py-0.5 rounded-full">
                    Court {m.court}
                  </span>
                  <span className="text-xs text-slate-400">Total: {targetPoints} Pts</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  {/* Team A */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <p className="text-xs font-semibold text-slate-300 truncate">{m.teamA.join(' & ')}</p>
                    <input
                      type="number"
                      value={m.scoreA}
                      onChange={(e) => handleScoreChange(m.id, Number(e.target.value), m.scoreB)}
                      className="w-full text-center text-3xl font-black text-emerald-400 bg-transparent outline-none mt-1"
                    />
                  </div>

                  {/* Team B */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <p className="text-xs font-semibold text-slate-300 truncate">{m.teamB.join(' & ')}</p>
                    <div className="text-3xl font-black text-slate-400 mt-1">{m.scoreB}</div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* LEADERBOARD */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mt-6">
            <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" /> Live Standings
            </h2>

            <div className="space-y-2">
              {standings.map((p, idx) => (
                <div key={p.name} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800/40">
                  <div className="flex items-center gap-3">
                    <span className={`w-5 text-center font-bold text-xs ${idx < 3 ? 'text-amber-400' : 'text-slate-500'}`}>
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-200 text-xs">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-emerald-400 text-xs">{p.points} Pts</span>
                    <span className="text-[10px] text-slate-500 block">{p.games} match played</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
