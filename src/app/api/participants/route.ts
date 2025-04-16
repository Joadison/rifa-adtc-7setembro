import { NextResponse } from "next/server"
import {
  createParticipant,
  saveParticipantNumbers,
  updateRifaSoldNumbers,
  getSoldNumbersByRifaId,
} from "@/lib/supabase/client"
import { getRandomNumber } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    if (!data.fullName || !data.cpf || !data.email || !data.phone || !data.rifaId || !data.selectedNumbers) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }
    const luckyNumber = getRandomNumber(100000, 999999).toString()

    try {
      const participantData = {
        full_name: data.fullName,
        cpf: data.cpf,
        email: data.email,
        phone: data.phone,
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        zip_code: data.zipCode || "",
        payment_method: data.paymentMethod as "pix" | "cash",
        payment_status: "pending" as const,
        proof_of_payment_url: data.proofOfPaymentUrl || null,
        lucky_number: luckyNumber,
      }
      const newParticipant = await createParticipant(participantData)
      await saveParticipantNumbers(newParticipant.id, data.rifaId, data.selectedNumbers)
      const soldNumbers = await getSoldNumbersByRifaId(data.rifaId)
      await updateRifaSoldNumbers(data.rifaId, soldNumbers.length)
      return NextResponse.json({
        success: true,
        participant: newParticipant,
        luckyNumber,
      })
    } catch (supabaseError) {
      return NextResponse.json(
        {
          error: "Erro ao processar solicitação no banco de dados",
          details: supabaseError,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: "API de participantes funcionando!" })
}
