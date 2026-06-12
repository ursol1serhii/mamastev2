"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addParticipantAction(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  if (!name) return;

  await supabase.from("participants").insert({ name });
  revalidatePath("/instrument");
}

export async function addMeasurementAction(formData: FormData) {
  const supabase = await createClient();

  const participantId = formData.get("participant_id");
  const weekNumber = parseInt(formData.get("week_number") as string);
  const weight = parseFloat(formData.get("weight") as string);
  const og = parseInt(formData.get("og") as string);
  const ot = parseInt(formData.get("ot") as string);
  const oj = parseInt(formData.get("oj") as string); // <-- Читаем ОЖ из формы
  const ob = parseInt(formData.get("ob") as string);

  // Добавили проверку isNaN(oj), чтобы экшен не падал, если поле пустое
  if (!participantId || isNaN(weekNumber) || isNaN(weight) || isNaN(oj)) return;

  // Supabase сделает upsert (обновит, если уже есть замер на этой неделе, или создаст новый)
  await supabase.from("measurements").upsert(
    {
      participant_id: BigInt(participantId.toString()),
      week_number: weekNumber,
      weight,
      og,
      ot,
      oj, // <-- Передаем ОЖ в Supabase
      ob,
    },
    { onConflict: "participant_id,week_number" },
  );

  revalidatePath("/instrument");
}
