import { createClient } from "@supabase/supabase-js"
import { Participant, Rifa } from "./types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getRifas() {
  const { data, error } = await supabase.from("rifas").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching rifas:", error)
    return []
  }

  return data as Rifa[]
}

export async function getRifaById(id: string) {
  const { data, error } = await supabase.from("rifas").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching rifa with id ${id}:`, error)
    return null
  }

  return data as Rifa
}

export async function getSoldNumbersByRifaId(rifaId: string) {
  const { data, error } = await supabase.from("participant_numbers").select("number").eq("rifa_id", rifaId)

  if (error) {
    console.error(`Error fetching sold numbers for rifa ${rifaId}:`, error)
    return []
  }

  return data.map((item) => item.number)
}

export async function createParticipant(participantData: Omit<Participant, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase.from("participants").insert([participantData]).select()

    if (error) {
      console.error("Erro do Supabase ao criar participante:", error)
      throw error
    }

    if (!data || data.length === 0) {
      console.error("Nenhum dado retornado ao criar participante")
      throw new Error("Falha ao criar participante")
    }
    return data[0] as Participant
  } catch (error) {
    console.error("Exceção ao criar participante:", error)
    throw error
  }
}

export async function saveParticipantNumbers(participantId: string, rifaId: string, numbers: number[]) {
  try {
    const numbersToInsert = numbers.map((number) => ({
      participant_id: participantId,
      rifa_id: rifaId,
      number,
    }))

    const { data, error } = await supabase.from("participant_numbers").insert(numbersToInsert).select()

    if (error) {
      console.error("Erro ao salvar números do participante:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Exceção ao salvar números do participante:", error)
    throw error
  }
}

export async function updateRifaSoldNumbers(rifaId: string, soldCount: number) {
  const { data, error } = await supabase.from("rifas").update({ sold_numbers: soldCount }).eq("id", rifaId).select()

  if (error) {
    console.error(`Error updating sold numbers for rifa ${rifaId}:`, error)
    throw error
  }

  return data[0] as Rifa
}

export async function uploadPaymentProof(file: File, participantId: string) {
  const fileExt = file.name.split(".").pop()
  const fileName = `${participantId}-${Date.now()}.${fileExt}`
  const filePath = `payment_proofs/${fileName}`

  const { data, error } = await supabase.storage.from("rifas").upload(filePath, file)

  if (error) {
    console.error("Error uploading payment proof:", error)
    throw error
  }

  const { data: urlData } = supabase.storage.from("rifas").getPublicUrl(filePath)

  return urlData.publicUrl
}

export async function getParticipantsByRifaId(rifaId: string) {
  const { data, error } = await supabase
    .from("participants")
    .select(`
      *,
      participant_numbers!inner(*)
    `)
    .eq("participant_numbers.rifa_id", rifaId)

  if (error) {
    console.error(`Error fetching participants for rifa ${rifaId}:`, error)
    return []
  }

  return data as Participant[]
}

export async function getParticipantNumbers(participantId: string) {
  const { data, error } = await supabase
    .from("participant_numbers")
    .select("number")
    .eq("participant_id", participantId)

  if (error) {
    console.error(`Error fetching numbers for participant ${participantId}:`, error)
    return []
  }

  return data.map((item) => item.number)
}