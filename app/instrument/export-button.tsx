"use client";

import html2canvas from "html2canvas";
import { useState } from "react";

export function ExportButton({
  targetId,
  fileName = "marathon-report",
}: {
  targetId: string;
  fileName?: string;
}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    const element = document.getElementById(targetId);
    if (!element) {
      alert("Елемент для експорту не знайдено!");
      return;
    }

    try {
      setIsExporting(true);

      // Рендерим скриншот с опциями принудительного развертывания
      const canvas = await html2canvas(element, {
        scale: 2, // Высокое качество (HD)
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 1200, // Эмулируем ширину экрана ПК для рендера всей таблицы
        onclone: (clonedDoc) => {
          // Находим контейнер таблицы внутри клонированного документа
          const tableContainer = clonedDoc.querySelector(
            ".exportable-table-container",
          );
          if (tableContainer) {
            // Убираем мобильный скролл и заставляем его растянуться на максимум
            tableContainer.classList.remove("overflow-x-auto");
            tableContainer.classList.add("overflow-visible");
          }

          const targetElement = clonedDoc.getElementById(targetId);
          if (targetElement) {
            targetElement.style.width = "auto";
            targetElement.style.maxWidth = "none";
          }
        },
      });

      // Скачивание PNG
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `${fileName}-${new Date().toISOString().split("T")[0]}.png`;
      link.click();
    } catch (error) {
      console.error("Помилка генерації картинки:", error);
      alert("Не вдалося згенерувати звіт");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition shadow-sm disabled:opacity-50 active:scale-[0.98]"
    >
      <span>🖼️</span>
      {isExporting ? "Генерується..." : "Зберегти як картинку"}
    </button>
  );
}
