export type Rifa = {
    id: string
    title: string
    description: string
    price: number
    total_numbers: number
    sold_numbers: number
    image_url: string
    end_date: string
    status: "active" | "completed" | "cancelled"
    created_at: string
}

export type Participant = {
    id: string
    full_name: string
    cpf: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zip_code: string
    payment_method: "pix" | "cash"
    payment_status: "pending" | "confirmed"
    proof_of_payment_url?: string 
    lucky_number: string
    created_at: string
    updated_at?: string
}

export type ParticipantNumber = {
    id: string
    participant_id: string
    rifa_id: string
    number: number
    created_at: string
}