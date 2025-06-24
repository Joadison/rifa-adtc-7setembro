"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Share2, Ticket } from "lucide-react";
import type { Rifa } from "@/lib/supabase/types";

interface ConfirmationDetailsProps {
  rifa: Rifa;
  luckyNumber: string;
}

export function ConfirmationDetails({
  rifa,
  luckyNumber,
}: ConfirmationDetailsProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Minha participação na rifa ${rifa.title}`,
          text: `Estou participando da rifa ${rifa.title} com o número da sorte ${luckyNumber}. Participe você também!`,
          url: window.location.origin,
        });
      } catch (error) {
        console.error("Erro ao compartilhar:", error);
      }
    } else {
      alert("Compartilhamento não suportado neste navegador");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card className="border-2 border-primary/30 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-primary">
            Participação Confirmada!
          </CardTitle>
          <CardDescription>
            Sua participação foi registrada com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-4 bg-muted rounded-md">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Ticket className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Rifa</h3>
            </div>
            <p>{rifa.title}</p>
          </div>

          {/* <div className="p-4 bg-muted rounded-md">
            <h3 className="font-medium mb-1">Data do Sorteio</h3>
            <p>{new Date(rifa.end_date).toLocaleDateString("pt-BR")}</p>
          </div> */}

          <div className="text-sm text-muted-foreground mt-4">
            <p>Enviamos um email com os detalhes da sua participação.</p>
            <p>Você também receberá notificações sobre o sorteio.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Compartilhar
          </Button>
          <Button
            variant="outline"
            asChild
            className="w-full border-primary text-primary hover:bg-primary/10"
          >
            <Link href="/">Voltar para a página inicial</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
