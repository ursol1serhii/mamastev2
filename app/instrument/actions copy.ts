"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// 1. Добавить новую участницу
export async function addParticipantAction(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  if (!name) return;

  await supabase.from("participants").insert({ name });
  revalidatePath("/instrument");
}

// 2. Добавить замер для недели
export async function addMeasurementAction(formData: FormData) {
  const supabase = await createClient();

  const participantId = bigintParser(formData.get("participant_id"));
  const weekNumber = parseInt(formData.get("week_number") as string);
  const weight = parseFloat(formData.get("weight") as string);
  const og = parseInt(formData.get("og") as string);
  const ot = parseInt(formData.get("ot") as string);
  const ob = parseInt(formData.get("ob") as string);

  if (!participantId || isNaN(weekNumber) || isNaN(weight)) return;

  await supabase.from("measurements").insert({
    participant_id: participantId,
    week_number: weekNumber,
    weight,
    og,
    ot,
    ob,
  });

  revalidatePath("/instrument");
}

function bigintParser(val: any) {
  return val ? BigInt(val.toString()) : null;
}
