"use server";

import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"

// Cliente Supabase com service_role para operações administrativas
// IMPORTANTE: Isso só funciona no servidor
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Função para login de administrador
export async function adminLogin(email: string, password: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Tentar fazer login com as credenciais fornecidas
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Erro de autenticação:", error.message)
      return { success: false, error: "Credenciais inválidas" }
    }

    if (!data.user) {
      return { success: false, error: "Usuário não encontrado" }
    }

    // Verificar se o usuário é um administrador
    const { data: adminData, error: adminError } = await supabase
      .from("admin_users")
      .select("is_admin")
      .eq("user_id", data.user.id)
      .single()

    if (adminError || !adminData?.is_admin) {
      // Fazer logout se não for admin
      await supabase.auth.signOut()
      return { success: false, error: "Acesso não autorizado" }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Erro ao fazer login:", error)
    return { success: false, error: "Erro ao processar login" }
  }
}

// Função para logout
export async function adminLogout() {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    await supabase.auth.signOut()
    return { success: true }
  } catch (error) {
    console.error("Erro ao fazer logout:", error)
    return { success: false, error: "Erro ao processar logout" }
  }
}

// Função para criar o usuário administrador (executar apenas uma vez)
export async function createAdminUser(email: string, password: string) {
  try {
    // Verificar se já existe um admin
    const { count } = await supabaseAdmin.from("admin_users").select("*", { count: "exact", head: true })

    if (count && count > 0) {
      return { success: false, error: "Já existe um administrador cadastrado" }
    }

    // Criar usuário no Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (userError) {
      throw new Error(`Erro ao criar usuário: ${userError.message}`)
    }

    // Registrar como admin na tabela admin_users
    const { error: adminError } = await supabaseAdmin
      .from("admin_users")
      .insert([{ user_id: userData.user.id, is_admin: true }])

    if (adminError) {
      throw new Error(`Erro ao registrar admin: ${adminError.message}`)
    }

    return { success: true }
  } catch (error: any) {
    console.error("Erro ao criar admin:", error)
    return { success: false, error: error.message }
  }
}

// Função para update o usuário administrador
export async function updateParticipantSimple(
  participantId: string,
  updates: {
    full_name?: string
    email?: string
    phone?: string
    payment_status?: string
  },
) {
  try {
    const { data, error } = await supabaseAdmin.rpc("update_participant", {
      p_id: participantId,
      p_full_name: updates.full_name,
      p_email: updates.email,
      p_phone: updates.phone,
      p_payment_status: updates.payment_status,
    })
    if (error) {
      console.error("[Server Action Simple] Erro ao atualizar participante:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("[Server Action Simple] Exceção ao atualizar participante:", error)
    return { success: false, error: error.message }
  }
}

export async function getFileForDownload(fileUrl: string) {
  try {
    const storageBaseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`

    if (!fileUrl.includes(storageBaseUrl)) {
      return { success: true, url: fileUrl }
    }

    const filePath = fileUrl.replace(storageBaseUrl, "")
    const [bucket, ...pathParts] = filePath.split("/")
    const path = pathParts.join("/")

    console.log("Bucket:", bucket)
    console.log("Path:", path)

    // Gerar um URL de download assinado que funciona mesmo com RLS
    const { data, error } = await supabaseAdmin.storage.from('rifas').createSignedUrl(path, 60) // URL válida por 60 segundos
    console.log(data)
    if (error) {
      console.error("Erro ao criar URL assinada:", error)
      return { success: false, error: error.message }
    }

    return { success: true, url: data.signedUrl }
  } catch (error: any) {
    console.error("Erro ao processar URL para download:", error)
    return { success: false, error: error.message }
  }
}