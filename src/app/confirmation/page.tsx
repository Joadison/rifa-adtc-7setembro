import { notFound } from "next/navigation";
import { ConfirmationDetails } from "@/components/confirmation-details";
import { getRifaById } from "@/lib/supabase/client";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: { rifaId: string; luckyNumber: string };
}) {
  const { rifaId, luckyNumber } = searchParams;

  if (!rifaId || !luckyNumber) {
    notFound();
  }

  const rifa = await getRifaById(rifaId);

  if (!rifa) {
    notFound();
  }

  return <ConfirmationDetails rifa={rifa} luckyNumber={luckyNumber} />;
}
