import { notFound } from "next/navigation";
import { RifaDetails } from "@/components/rifa-details";
import { getRifaById, getSoldNumbersByRifaId } from "@/lib/supabase/client";

export default async function RifaPage({
  params,
}: {
  params: { slug: string };
}) {
  const rifaId = params.slug;
  const rifa = await getRifaById(rifaId);

  if (!rifa) {
    notFound();
  }

  const soldNumbers = await getSoldNumbersByRifaId(rifaId);

  return <RifaDetails rifa={rifa} soldNumbers={soldNumbers} />;
}
