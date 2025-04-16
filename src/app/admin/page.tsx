import { AdminDashboard } from "@/components/admin/dashboard";
import { AdminHeader } from "@/components/admin/header";
import { getRifas, getParticipantsByRifaId } from "@/lib/supabase/client";

export default async function AdminPage() {
  const rifasData = await getRifas();
  const participantsData = await getParticipantsByRifaId(
    "0a25254a-3a5a-40fc-8bf8-0e4bce7303f4"
  );
  return (
    <>
      <AdminHeader />
      <AdminDashboard rifas={rifasData} participants={participantsData} />
    </>
  );
}
