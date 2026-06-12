import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { addParticipantAction, addMeasurementAction } from "./actions";

async function MarathonManager() {
  const supabase = await createClient();

  // Проверка авторизации админа
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Загружаем участниц и их замеры
  const { data: participants } = await supabase
    .from("participants")
    .select("*")
    .order("name");
  const { data: measurements } = await supabase
    .from("measurements")
    .select("*")
    .order("week_number");

  // Группируем замеры по участницам для удобного вывода в таблицу
  const getMeasurementsForUser = (pId: number, week: number) => {
    return measurements?.find(
      (m) => m.participant_id === pId && m.week_number === week,
    );
  };

  // Вычисляем процент изменения веса (классический расчет)
  const calculateProgress = (startWeight: number, currentWeight: number) => {
    if (!startWeight || !currentWeight) return null;
    const diff = ((currentWeight - startWeight) / startWeight) * 100;
    return diff.toFixed(2) + "%";
  };

  return (
    <div className="space-y-8">
      {/* Блок 1: Добавление новой участницы */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          1. Добавить участницу в марафон
        </h2>
        <form action={addParticipantAction} className="flex gap-2">
          <input
            type="text"
            name="name"
            placeholder="Имя участницы (например, Лиля)"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Добавить
          </button>
        </form>
      </div>

      {/* Блок 2: Внесение недельных результатов */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          2. Внести замеры недели
        </h2>
        <form
          action={addMeasurementAction}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <select
            name="participant_id"
            className="w-full px-3 py-2 border rounded-lg text-gray-700"
            required
          >
            <option value="">Выберите участницу</option>
            {participants?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            name="week_number"
            className="w-full px-3 py-2 border rounded-lg text-gray-700"
            required
          >
            <option value="0">Взвешивание 1 (Старт)</option>
            <option value="1">Взвешивание 2 (Неделя 1)</option>
            <option value="2">Взвешивание 3 (Неделя 2)</option>
          </select>

          <input
            type="number"
            step="0.1"
            name="weight"
            placeholder="Вес (кг)"
            className="px-3 py-2 border rounded-lg text-gray-700"
            required
          />
          <input
            type="number"
            name="og"
            placeholder="ОГ (см)"
            className="px-3 py-2 border rounded-lg text-gray-700"
            required
          />
          <input
            type="number"
            name="ot"
            placeholder="ОТ (см)"
            className="px-3 py-2 border rounded-lg text-gray-700"
            required
          />
          <input
            type="number"
            name="ob"
            placeholder="ОБ (см)"
            className="px-3 py-2 border rounded-lg text-gray-700"
            required
          />

          <button
            type="submit"
            className="col-span-2 md:col-span-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
          >
            Сохранить замеры
          </button>
        </form>
      </div>

      {/* Блок 3: Итоговая Сводная Таблица */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Сводный отчет марафона
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b">
                <th className="px-6 py-3">Участник</th>
                <th className="px-4 py-3 bg-blue-50/50">Старт (Вес / ОТ)</th>
                <th className="px-4 py-3 bg-green-50/50">
                  Неделя 1 (Вес / Прогресс)
                </th>
                <th className="px-4 py-3 bg-purple-50/50">
                  Неделя 2 (Вес / Прогресс)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm text-gray-700">
              {participants?.map((p) => {
                const w0 = getMeasurementsForUser(p.id, 0);
                const w1 = getMeasurementsForUser(p.id, 1);
                const w2 = getMeasurementsForUser(p.id, 2);

                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {p.name}
                    </td>

                    {/* Старт */}
                    <td className="px-4 py-4 bg-blue-50/20">
                      {w0 ? `${w0.weight} кг (ОТ: ${w0.ot})` : "—"}
                    </td>

                    {/* Неделя 1 */}
                    <td className="px-4 py-4 bg-green-50/20">
                      {w1 ? (
                        <div>
                          <div>{w1.weight} кг</div>
                          <div className="text-xs font-bold text-green-600">
                            {w0 ? calculateProgress(w0.weight, w1.weight) : "—"}
                          </div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Неделя 2 */}
                    <td className="px-4 py-4 bg-purple-50/20">
                      {w2 ? (
                        <div>
                          <div>{w2.weight} кг</div>
                          <div className="text-xs font-bold text-purple-600">
                            {w0 ? calculateProgress(w0.weight, w2.weight) : "—"}
                          </div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
              {participants?.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    Участницы еще не добавлены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function InstrumentsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          🏆 Панель Управления Марафоном
        </h1>
        <Suspense
          fallback={
            <div className="text-center py-10 text-gray-500">
              Загрузка структуры марафона...
            </div>
          }
        >
          <MarathonManager />
        </Suspense>
      </div>
    </main>
  );
}
