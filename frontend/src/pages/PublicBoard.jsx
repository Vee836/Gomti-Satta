import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';
import { Trophy, Clock, Search, CalendarDays, TableProperties } from 'lucide-react';
import { Link } from 'react-router-dom';

const PublicBoard = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/api/results/public');
        setResults(data);
      } catch (error) {
        console.error('Failed to fetch public results');
      }
      setLoading(false);
    };
    fetchData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Process data for "Today and Tomorrow" Schedule Table
  const scheduleData = useMemo(() => {
    const gameMap = new Map();

    results.forEach(res => {
      if (!gameMap.has(res.title)) {
        gameMap.set(res.title, { title: res.title, today: null, tomorrow: null });
      }

      const game = gameMap.get(res.title);
      const dateToCheck = res.scheduledDate ? parseISO(res.scheduledDate) : parseISO(res.updatedAt);

      if (isToday(dateToCheck)) {
        game.today = res;
      } else if (isTomorrow(dateToCheck)) {
        game.tomorrow = res;
      }
    });

    return Array.from(gameMap.values());
  }, [results]);

  // Process data for Monthly Chart
  const monthlyChartData = useMemo(() => {
    const executedResults = results.filter(r => r.status === 'executed');

    // Get unique game titles for columns
    const titles = [...new Set(executedResults.map(r => r.title))];

    // Create a 31-day array
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const chart = Array.from({ length: daysInMonth }, (_, i) => {
      const dayData = { day: i + 1 };
      titles.forEach(t => dayData[t] = '-');
      return dayData;
    });

    executedResults.forEach(res => {
      const date = parseISO(res.updatedAt);
      if (date.getMonth() === selectedMonth && date.getFullYear() === selectedYear) {
        const dayIdx = date.getDate() - 1;
        const val = typeof res.data === 'string' ? res.data : (res.data.number || res.data.value || 'XX');
        chart[dayIdx][res.title] = val;
      }
    });

    return { titles, chart };
  }, [results, selectedMonth, selectedYear]);

  const liveResults = results.filter(r => r.status === 'executed').slice(0, 4); // top 4 executed

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-amber-500 selection:text-white pb-20">
      <Helmet>
        <title>Live Satta Results | Ultra Fast</title>
        <meta name="description" content="View the latest live Satta results today." />
      </Helmet>

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-amber-400 to-orange-500 p-2 rounded-xl shadow-lg shadow-orange-500/20">
              <Trophy size={24} className="text-slate-950" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
                Gomti Satta King
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Fastest Live Results</p>
            </div>
          </div>
          <Link to="/login" className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700">
            Admin Login
          </Link>
        </div>
      </header>

      {/* Hero Marquee */}
      <div className="bg-amber-500 text-slate-950 py-2 border-b border-amber-600 overflow-hidden shadow-lg">
        <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] flex gap-8 font-black uppercase text-sm">
          <span>🔥 SUPER FAST LIVE SATTA RESULTS 🔥</span>
          <span>💎 UPDATED EVERY MINUTE 💎</span>
          <span>🔥 PLAY RESPONSIBLY 🔥</span>
          <span>💎 #1 TRUSTED SATTA PLATFORM 💎</span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 mt-8 space-y-16">

        {/* Live Results Section */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-2">Live <span className="text-amber-500">Results</span></h2>
            <p className="text-slate-400 font-medium">Automatic updates • Refreshing every 30 seconds</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {liveResults.length === 0 ? (
                <div className="col-span-full py-20 text-center text-slate-500 bg-slate-900 rounded-3xl border border-slate-800">
                  <Search size={48} className="mx-auto mb-4 opacity-20" />
                  No results found for today.
                </div>
              ) : (
                liveResults.map((result, idx) => (
                  <div
                    key={result._id}
                    className={`
                      group relative bg-slate-900 rounded-3xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10
                      ${idx === 0 ? 'border-amber-500/50 shadow-lg shadow-amber-500/10 md:col-span-2' : 'border-slate-800'}
                    `}
                  >
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl bg-gradient-to-br ${idx === 0 ? 'from-amber-500/5 to-orange-600/5' : 'from-slate-800/50 to-transparent'} pointer-events-none`}></div>

                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center sm:items-start gap-6 text-center sm:text-left">
                      <div>
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                          {idx === 0 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500 text-white animate-pulse">
                              Live Updated
                            </span>
                          )}
                          <h3 className="text-2xl font-black tracking-wide text-white uppercase">{result.title}</h3>
                        </div>
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-slate-400 text-sm font-medium">
                          <Clock size={14} className={idx === 0 ? 'text-amber-500' : ''} />
                          {format(new Date(result.updatedAt), "hh:mm a • dd MMM yyyy")}
                        </div>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:px-8 shadow-inner flex flex-col items-center justify-center min-w-[140px] relative overflow-hidden group-hover:border-amber-500/30 transition-colors">
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:4px_4px]"></div>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1 z-10">Result</span>
                        <span className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 z-10 drop-shadow-lg">
                          {typeof result.data === 'string' ? result.data : result.data.number || result.data.value || JSON.stringify(result.data)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        {/* Excel-type Schedule Table (Today & Tomorrow) */}
        <section className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <CalendarDays className="text-blue-500" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white">Today & Tomorrow Schedule</h2>
              <p className="text-slate-400 text-sm">Upcoming and recent game timings</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-slate-300 text-xs uppercase tracking-widest">
                  <th className="p-4 font-black border-b border-r border-slate-700">Game Name</th>
                  <th className="p-4 font-black border-b border-r border-slate-700 text-center">Today's Result</th>
                  <th className="p-4 font-black border-b border-slate-700 text-center text-amber-500">Tomorrow's Schedule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {scheduleData.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-slate-500">No scheduled games available.</td>
                  </tr>
                ) : (
                  scheduleData.map((game, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-4 font-bold text-white border-r border-slate-800 uppercase tracking-wide bg-slate-900/30">
                        {game.title}
                      </td>
                      <td className="p-4 border-r border-slate-800 text-center">
                        {game.today ? (
                          game.today.status === 'executed' ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="text-2xl font-black text-white">
                                {typeof game.today.data === 'string' ? game.today.data : game.today.data.number || game.today.data.value || 'Done'}
                              </span>
                              <span className="text-[10px] text-slate-500">{format(new Date(game.today.updatedAt), "hh:mm a")}</span>
                            </div>
                          ) : (
                            <span className="text-sm font-medium text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg">
                              Pending ({format(new Date(game.today.scheduledDate), "hh:mm a")})
                            </span>
                          )
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {game.tomorrow ? (
                          <span className="text-sm font-medium text-blue-400 bg-blue-400/10 px-3 py-1 rounded-lg flex items-center justify-center gap-2 w-fit mx-auto">
                            <Clock size={14} />
                            {format(new Date(game.tomorrow.scheduledDate || game.tomorrow.updatedAt), "hh:mm a")}
                          </span>
                        ) : (
                          <span className="text-slate-600">Not Scheduled</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Monthly Record Chart (Day / Month Filter) */}
        <section className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <TableProperties className="text-purple-500" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-white">Monthly Record Chart</h2>
                <p className="text-slate-400 text-sm">Filter data by month and year</p>
              </div>
            </div>

            <div className="flex gap-2">
              <select
                className="bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none font-medium"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>

              <select
                className="bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none font-medium"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 custom-scrollbar">
            <table className="w-full text-center border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-800 text-slate-300 text-xs uppercase tracking-widest">
                  <th className="p-3 font-black border-b border-r border-slate-700 sticky left-0 bg-slate-800 z-10 w-20">Date</th>
                  {monthlyChartData.titles.length === 0 && <th className="p-3 font-black border-b border-slate-700">Games</th>}
                  {monthlyChartData.titles.map((title, idx) => (
                    <th key={idx} className="p-3 font-black border-b border-r border-slate-700 bg-slate-800">{title}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {monthlyChartData.chart.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-2 font-bold text-slate-400 border-r border-slate-800 sticky left-0 bg-slate-950 z-10">
                      {row.day.toString().padStart(2, '0')}
                    </td>
                    {monthlyChartData.titles.length === 0 && <td className="p-2 text-slate-600">-</td>}
                    {monthlyChartData.titles.map((title, i) => (
                      <td key={i} className={`p-2 border-r border-slate-800 font-medium ${row[title] !== '-' ? 'text-white font-bold' : 'text-slate-600'}`}>
                        {row[title]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      <footer className="mt-20 border-t border-slate-800/50 border-r-0 border-l-0 text-center py-8 text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Satta Results Platform. All Rights Reserved.</p>
        <p className="mt-1 text-xs">For entertainment purposes only.</p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
};

export default PublicBoard;
