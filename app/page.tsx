import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white text-gray-800">
      {/* Навігаційна панель (Шапка) */}
      <nav className="w-full flex justify-center border-b border-gray-200/80 bg-white/80 backdrop-blur sticky top-0 z-50 h-16">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-bold text-lg text-emerald-600 tracking-wide">
            <Link href={"/"}>🏆 Марафон Схуднення</Link>
          </div>

          <div className="flex items-center gap-4">
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense
                fallback={
                  <div className="text-gray-400 text-xs">Завантаження...</div>
                }
              >
                <AuthButton />
              </Suspense>
            )}
          </div>
        </div>
      </nav>

      {/* Головний блок (Hero Section) */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
          ⚡ Новий сезон відкрито
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 via-emerald-800 to-emerald-600 bg-clip-text text-transparent leading-tight">
          Керуйте прогресом <br />
          вашого тіла
        </h1>

        <p className="text-base sm:text-xl text-gray-500 max-w-2xl leading-relaxed">
          Повний контроль антропометричних змін учасниць: відстеження ваги,
          об'ємів грудей, талії та стегон з автоматичним розрахунком щотижневої
          динаміки.
        </p>

        {/* Головна кнопка переходу до інструменту */}
        <div className="pt-4">
          <Link
            href="/instrument"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Перейти до таблиці результатів →
          </Link>
        </div>
      </section>

      {/* Інформаційні картки переваг марафону */}
      <section className="bg-gray-50/50 border-t border-gray-100 py-16 w-full">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl text-amber-600 font-bold">
              📊
            </div>
            <h3 className="font-bold text-gray-900">Точний облік замірів</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Фіксація ключових антропометричних даних: Вага, Обхват Грудей
              (ОГ), Обхват Талії (ОТ) та Обхват Стегон (ОБ).
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl text-emerald-600 font-bold">
              📈
            </div>
            <h3 className="font-bold text-gray-900">Автоматичний прогрес</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Система автоматично розраховує відносне розходження маси тіла у
              відсотках порівняно з попередніми етапами.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl text-blue-600 font-bold">
              👑
            </div>
            <h3 className="font-bold text-gray-900">
              Чесний розрахунок підсумків
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Переможці визначаються за максимальним відсотком зниження маси
              тіла, що забезпечує рівні умови за будь-якої комплекції.
            </p>
          </div>
        </div>
      </section>

      {/* Підвал сайту */}
      <footer className="w-full flex items-center justify-center border-t border-gray-100 mx-auto text-center text-xs text-gray-400 gap-8 py-12 px-6">
        <p>© 2026 Панель Адміністратора Марафону Схуднення.</p>
        <ThemeSwitcher />
      </footer>
    </main>
  );
}
