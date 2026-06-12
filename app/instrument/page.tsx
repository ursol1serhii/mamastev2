import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { addParticipantAction, addMeasurementAction } from "./actions";
import { ExportButton } from "./export-button";

async function MarathonManager() {
  const supabase = await createClient();

  // Перевірка авторизації
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Завантажуємо дані
  const { data: participants } = await supabase
    .from("participants")
    .select("*")
    .order("name");
  const { data: measurements } = await supabase
    .from("measurements")
    .select("*")
    .order("week_number");

  const uniqueWeeks = Array.from(
    new Set([0, 1, 2, ...(measurements?.map((m) => m.week_number) || [])]),
  ).sort((a, b) => a - b);

  const getMeasurementsForUser = (pId: number, week: number) => {
    return measurements?.find(
      (m) => m.participant_id === pId && m.week_number === week,
    );
  };

  const calculateProgress = (
    pId: number,
    currentWeek: number,
    currentWeight: number,
  ) => {
    if (currentWeek === 0) return null;
    const previousWeeks = uniqueWeeks.filter((w) => w < currentWeek).reverse();
    let previousWeight = null;
    for (const w of previousWeeks) {
      const m = getMeasurementsForUser(pId, w);
      if (m) {
        previousWeight = m.weight;
        break;
      }
    }
    if (!previousWeight || !currentWeight) return null;
    return ((currentWeight - previousWeight) / previousWeight) * 100;
  };

  const maxWeek = Math.max(1, ...uniqueWeeks.filter((w) => w > 0));

  // Формуємо масив результатів усіх учасниць для рейтингу на поточному тижні
  const participantsRating = (participants || [])
    .map((p) => {
      const m = getMeasurementsForUser(p.id, maxWeek);
      const progress = m ? calculateProgress(p.id, maxWeek, m.weight) : null;
      return {
        name: p.name,
        currentWeight: m ? m.weight : null,
        progress: progress,
      };
    })
    .sort((a, b) => {
      if (a.progress === null) return 1;
      if (b.progress === null) return -1;
      return a.progress - b.progress;
    });

  // Лідер тижня
  const leader =
    participantsRating[0] && participantsRating[0].progress !== null
      ? participantsRating[0]
      : null;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. КЕРУВАННЯ ДАНИМИ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Додати учасницю */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 sm:mb-4">
            1. Додати учасницю
          </h2>
          <form action={addParticipantAction} className="space-y-3">
            <input
              type="text"
              name="name"
              placeholder="Ім'я (наприклад, Ліля)"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 text-base sm:text-sm appearance-none"
              required
            />
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white py-3 rounded-xl font-medium text-sm transition-all"
            >
              Додати до бази
            </button>
          </form>
        </div>

        {/* Внести заміри */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 sm:mb-4">
            2. Внести або оновити замір
          </h2>
          <form
            action={addMeasurementAction}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <div className="relative">
              <select
                name="participant_id"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 text-base sm:text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Учасниця</option>
                {participants?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="number"
              name="week_number"
              min="0"
              placeholder="№ Тижня (0=Старт)"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <input
              type="number"
              step="0.1"
              name="weight"
              placeholder="Вага (кг)"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <input
              type="number"
              name="og"
              placeholder="ОГ (см)"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <input
              type="number"
              name="ot"
              placeholder="ОТ (см)"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <input
              type="number"
              name="ob"
              placeholder="ОС (см)"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />

            <button
              type="submit"
              className="sm:col-span-3 w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white py-3 rounded-xl font-medium text-sm transition-all mt-1"
            >
              Зберегти дані тижня
            </button>
          </form>
        </div>
      </div>

      {/* 2. ЗВІТ ДЛЯ ЧАТУ */}
      <div className="max-w-md mx-auto space-y-4">
        <div
          id="marathon-rating-card"
          className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl shadow-xl p-4 sm:p-6 text-white border border-indigo-500/20 space-y-5"
        >
          <div className="text-center space-y-1 border-b border-white/10 pb-4">
            <h2 className="text-lg sm:text-xl font-black tracking-wide uppercase bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              🏆 РЕЙТИНГ МАРАФОНУ
            </h2>
            <p className="text-xs text-indigo-300 font-semibold uppercase tracking-widest">
              ПІДСУМКИ: ТИЖДЕНЬ {maxWeek}
            </p>
          </div>

          {leader && (
            <div className="bg-white/5 border border-amber-500/30 rounded-2xl p-4 text-center space-y-1 relative overflow-hidden bg-gradient-to-r from-amber-500/10 to-transparent">
              <div className="absolute right-2 top-2 text-4xl opacity-20">
                👑
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Найкращий результат тижня
              </p>
              <div className="text-xl font-black text-white">{leader.name}</div>
              <div className="text-sm font-bold text-emerald-400">
                {leader.progress ? `${leader.progress.toFixed(2)}%` : "—"}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider px-1">
              Турнірна таблиця:
            </p>

            <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5">
              <div className="grid grid-cols-12 gap-2 p-3 bg-white/5 border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                <div className="col-span-2 text-center">№</div>
                <div className="col-span-4">Учасниця</div>
                <div className="col-span-3 text-right">Вага</div>
                <div className="col-span-3 text-right">Прогрес</div>
              </div>

              <div className="divide-y divide-white/5">
                {participantsRating.map((p, index) => (
                  <div
                    key={p.name}
                    className={`grid grid-cols-12 gap-2 p-3 items-center text-sm transition-all ${
                      index === 0 ? "bg-amber-500/5 font-medium" : ""
                    }`}
                  >
                    <div className="col-span-2 flex justify-center">
                      <span
                        className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
                          index === 0
                            ? "bg-amber-400 text-slate-950 shadow-sm"
                            : "bg-white/10 text-slate-300"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </div>

                    <div className="col-span-4 font-medium truncate text-slate-100">
                      {p.name}
                    </div>

                    <div className="col-span-3 text-right text-xs text-slate-300">
                      {p.currentWeight ? `${p.currentWeight} кг` : "—"}
                    </div>

                    <div className="col-span-3 text-right font-bold">
                      {p.progress !== null ? (
                        <span
                          className={
                            p.progress <= 0 ? "text-green-400" : "text-red-400"
                          }
                        >
                          {p.progress > 0 ? "+" : ""}
                          {p.progress.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">немає</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-500 pt-1 border-t border-white/5">
            Генерація звіту • Марафон Схуднення 2026
          </div>
        </div>

        <div className="text-center">
          <ExportButton
            targetId="marathon-rating-card"
            fileName={`rating-week-${maxWeek}`}
          />
        </div>
      </div>

      {/* 3. АДМІНСЬКА ТАБЛИЦЯ (Исправлено для полного экспорта на мобильных) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-800">
              Повна база замірів (Адмін-панель)
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Детальні антропометричні дані всіх етапів.
            </p>
          </div>
          <div className="self-start sm:self-center">
            <ExportButton
              targetId="marathon-table-report"
              fileName="marathon-full-table"
            />
          </div>
        </div>

        <div id="marathon-table-report" className="p-2 sm:p-4 bg-white">
          {/* Класс exportable-table-container теперь управляет поведением при рендере картинки */}
          <div className="exportable-table-container overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                  <th className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 font-bold text-gray-900 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    Учасниця
                  </th>
                  {uniqueWeeks.map((week) => (
                    <th
                      key={week}
                      className={`px-4 py-3 font-bold text-gray-900 ${
                        week === 0 ? "bg-blue-50/40" : "bg-emerald-50/20"
                      }`}
                    >
                      {week === 0 ? "Старт (Т0)" : `Тиз. ${week}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {participants?.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 sm:px-6 sm:py-4 font-semibold text-gray-900 bg-white sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      {p.name}
                    </td>
                    {uniqueWeeks.map((week) => {
                      const m = getMeasurementsForUser(p.id, week);
                      const progress = m
                        ? calculateProgress(p.id, week, m.weight)
                        : null;
                      return (
                        <td
                          key={week}
                          className={`px-4 py-3 ${
                            week === 0 ? "bg-blue-50/5" : "bg-emerald-50/5"
                          }`}
                        >
                          {m ? (
                            <div className="space-y-0.5">
                              <div className="font-medium text-gray-900">
                                {m.weight} кг
                              </div>
                              <div className="text-[10px] sm:text-[11px] text-gray-400 font-mono tracking-tight">
                                ОГ:{m.og} ОТ:{m.ot} ОС:{m.ob}
                              </div>
                              {progress !== null && (
                                <div
                                  className={`text-xs font-extrabold ${
                                    progress <= 0
                                      ? "text-green-600"
                                      : "text-red-500"
                                  }`}
                                >
                                  {progress > 0 ? "+" : ""}
                                  {progress.toFixed(2)}%
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InstrumentsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-4 sm:py-10 px-2 sm:px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 mb-6 sm:mb-8 px-2 sm:px-0">
          🏆 Панель Керування Марафоном
        </h1>
        <Suspense
          fallback={
            <div className="text-center py-10 text-sm text-gray-500">
              Завантаження структури марафону...
            </div>
          }
        >
          <MarathonManager />
        </Suspense>
      </div>
    </main>
  );
}
