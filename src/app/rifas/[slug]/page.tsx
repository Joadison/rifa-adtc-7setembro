"use client";

import { notFound} from "next/navigation";
import { useEffect, useState } from "react";
import { RifaDetails } from "@/components/rifa-details";
import { getRifaById, getSoldNumbersByRifaId } from "@/lib/supabase/client";
import { Rifa } from "@/lib/supabase/types";

export default function RifaPage({ params }: { params: { slug: string } }) {
  const rifaId = params.slug;
  const [rifa, setRifa] = useState<Rifa | null>(null);
  const [soldNumbers, setSoldNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const rifaData = await getRifaById(rifaId);
      if (!rifaData) {
        notFound();
      }

      const sold = await getSoldNumbersByRifaId(rifaId);

      setRifa(rifaData);
      setSoldNumbers(sold);
      setLoading(false);
    }

    fetchData();
  }, [rifaId]);

  if (loading) return <p></p>;

  return (
    rifa && <RifaDetails rifa={rifa} soldNumbers={soldNumbers} />
  );
}
