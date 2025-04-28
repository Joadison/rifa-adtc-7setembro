"use client";

import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getParticipantCPF } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useState, FormEvent } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Participant, ParticipantNumber } from "@/lib/supabase/types";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function SearchCPF() {
  const { toast } = useToast();
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [participantData, setParticipantData] = useState<Participant[] | null>(
    null
  );
  const [participantNumbers, setParticipantNumbers] = useState<
    ParticipantNumber[]
  >([]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Limpa estados anteriores
      setParticipantData(null);
      setParticipantNumbers([]);

      const result = await getParticipantCPF(cpf);

      if (!result) {
        toast({
          title: "Nenhum participante encontrado com este CPF",
          variant: "destructive",
        });
        return;
      }

      setParticipantData(result);
      const allNumbers = result.flatMap(
        (participant) => participant.participant_numbers || []
      );
      setParticipantNumbers(allNumbers);

      console.log(result, allNumbers);

      if (allNumbers.length > 0) {
        toast({
          title: `${allNumbers.length} números encontrados`,
          variant: "default",
        });
      } else {
        toast({
          title: "Participante encontrado, mas sem números associados",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Ocorreu um erro ao buscar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            Veja seus Números
          </CardTitle>
          <CardDescription>Entre com seu CPF</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                type="text"
                placeholder='Informe o CPF "000.000.000-00"'
                required
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                "Buscar Números"
              )}
            </Button>
          </form>

          {participantData && (
            <div className="mt-6 space-y-6">
              {participantData.map((participant) => (
                <div key={participant.id} className="border-t pt-4 space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-medium">Dados do Participante</h3>
                    <p className="text-sm">Nome: {participant.full_name}</p>
                    <p className="text-sm">CPF: {participant.cpf}</p>
                    <p className="text-sm">
                      Criado:{" "}
                      {new Date(participant.created_at).toLocaleString(
                        "pt-BR",
                        {
                          dateStyle: "short",
                          timeStyle: "short",
                        }
                      )}
                    </p>
                    <Badge
                      variant="outline"
                      className={
                        participant.payment_status === "confirmed"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }
                    >
                      {participant.payment_status === "confirmed"
                        ? "Confirmado - Pago"
                        : "Pendente - Não pago!"}
                    </Badge>
                  </div>

                  {participant.participant_numbers &&
                    participant.participant_numbers.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-medium">Números Adquiridos</h3>
                        <div className="flex flex-wrap gap-2">
                          {participant.participant_numbers.map(
                            (participantNumber) => (
                              <div
                                key={participantNumber.id}
                                className="px-3 py-1 bg-primary/10 rounded-md text-primary font-medium"
                              >
                                {participantNumber.number}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
          <Link
            href="/"
            className="flex items-center justify-center text-primary mb-6 hover:text-primary/80 transition-colors p-2 m-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a página inicial
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
