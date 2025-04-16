import { getRifas } from "@/lib/supabase/client"
import { NextResponse } from "next/server"

const rifas = await getRifas()

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const id = params.id
    const rifa = rifas.find((r) => r.id === id)

    if (!rifa) {
        return NextResponse.json({ error: "Rifa não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ rifa })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id
        const rifaIndex = rifas.findIndex((r) => r.id === id)

        if (rifaIndex === -1) {
            return NextResponse.json({ error: "Rifa não encontrada" }, { status: 404 })
        }

        const data = await request.json()

        // Atualizar rifa
        rifas[rifaIndex] = {
            ...rifas[rifaIndex],
            ...data,
            updatedAt: new Date().toISOString(),
        }

        return NextResponse.json({
            success: true,
            rifa: rifas[rifaIndex],
        })
    } catch (error) {
        return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const id = params.id
    const rifaIndex = rifas.findIndex((r) => r.id === id)

    if (rifaIndex === -1) {
        return NextResponse.json({ error: "Rifa não encontrada" }, { status: 404 })
    }

    // Em um ambiente real, poderíamos marcar como excluída em vez de remover
    const deletedRifa = rifas.splice(rifaIndex, 1)[0]

    return NextResponse.json({
        success: true,
        rifa: deletedRifa,
    })
}
