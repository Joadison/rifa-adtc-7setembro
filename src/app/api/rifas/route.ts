import { NextResponse } from "next/server"
import { getRifas } from "@/lib/supabase/client"

export async function GET() {
    try {
        const rifas = await getRifas()
        return NextResponse.json({ rifas })
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar rifas" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json()

        // Validar dados
        if (!data.title || !data.price || !data.totalNumbers || !data.endDate) {
            return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
        }

        // Gerar ID único baseado no título
        const id = data.title
            .toLowerCase()
            .replace(/[^\w\s]/gi, "")
            .replace(/\s+/g, "-")

        // Criar nova rifa
        const newRifa = {
            id,
            ...data,
            soldNumbers: 0,
            status: "active",
            createdAt: new Date().toISOString(),
        }

        // Em um ambiente real, salvaríamos no banco de dados
        // rifas.push(newRifa) // This line is commented out because the GET method now fetches from Supabase

        return NextResponse.json({
            success: true,
            rifa: newRifa,
        })
    } catch (error) {
        console.error("Erro ao processar solicitação:", error)
        return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
    }
}
