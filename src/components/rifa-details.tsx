"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Info, Calendar, Tag, Users } from "lucide-react";
import { ParticipationForm } from "@/components/participation-form";
import { NumberSelector } from "@/components/number-selector";
import type { Rifa } from "@/lib/supabase/types";

interface RifaDetailsProps {
  rifa: Rifa;
  soldNumbers: number[];
}

export function RifaDetails({ rifa, soldNumbers }: RifaDetailsProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("info");

  const handleNumberSelect = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== number));
    } else {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/"
        className="flex items-center text-primary mb-6 hover:text-primary/80 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para a página inicial
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-3xl font-bold text-primary">{rifa.title}</h1>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                {rifa.status === "active"
                  ? "Ativa"
                  : rifa.status === "completed"
                  ? "Concluída"
                  : "Cancelada"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Calendar className="h-4 w-4 text-secondary" />
              <span>
                Sorteio: {new Date(rifa.end_date).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm mb-1">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-primary mr-1" />
                  <span>Progresso da venda</span>
                </div>
                <span className="font-medium">
                  {rifa.sold_numbers} de {rifa.total_numbers} números
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{
                    width: `${(rifa.sold_numbers / rifa.total_numbers) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="flex items-center">
              <Tag className="h-4 w-4 text-secondary mr-2" />
              <p className="text-lg font-medium">
                Valor por número:{" "}
                <span className="text-primary">R$ {rifa.price.toFixed(2)}</span>
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger
                value="info"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Informações
              </TabsTrigger>
              <TabsTrigger
                value="numbers"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Escolher Números
              </TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="mt-4">
              <Card className="border-2 border-primary/20">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex gap-2 items-start">
                      <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium mb-1 text-primary">
                          Descrição do Prêmio
                        </h3>
                        <p className="text-muted-foreground">
                          {rifa.description.split("\n").map((line, index) => (
                            <React.Fragment key={index}>
                              {line} <br />
                            </React.Fragment>
                          ))}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 items-start">
                      <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium mb-1 text-primary">
                          Regras da Rifa
                        </h3>
                        <ul className="text-muted-foreground list-disc pl-5 space-y-1">
                          <li>
                            O sorteio será realizado pela no site
                            sorteador.com.br
                          </li>
                          <li>
                            O resultado será divulgado ao vivo nas redes
                            sociais. Acesse nossa página no{" "}
                            <Link
                              href={
                                "https://www.instagram.com/adtc.7setembro1/"
                              }
                              className="text-primary"
                            >
                              Instagram
                            </Link>{" "}
                            para acompanhar.
                          </li>
                          <li>O prêmio será entregue no mesmo dia</li>
                          <li>
                            O pagamento deve ser realizado em até 24 horas após
                            a reserva dos números
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="numbers" className="mt-4">
              <Card className="border-2 border-primary/20">
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-4 text-primary">
                    Selecione seus números da sorte
                  </h3>
                  <NumberSelector
                    totalNumbers={rifa.total_numbers}
                    soldNumbers={soldNumbers}
                    selectedNumbers={selectedNumbers}
                    onNumberSelect={handleNumberSelect}
                  />

                  <div className="mt-4 p-4 bg-primary/5 rounded-md border border-primary/20">
                    <div className="flex justify-between mb-2">
                      <span>Números selecionados:</span>
                      <span className="font-medium">
                        {selectedNumbers.length}
                      </span>
                    </div>
                    <div className="flex justify-between mb-4">
                      <span>Valor total:</span>
                      <span className="font-medium text-primary">
                        R$ {(selectedNumbers.length * rifa.price).toFixed(2)}
                      </span>
                    </div>
                    <Button
                      className="w-full"
                      disabled={selectedNumbers.length === 0}
                      onClick={() => setActiveTab("form")}
                    >
                      Continuar para o cadastro
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="form" className="mt-4">
              <Card className="border-2 border-primary/20">
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-4 text-primary">
                    Preencha seus dados para participar
                  </h3>
                  <ParticipationForm
                    selectedNumbers={selectedNumbers}
                    totalValue={selectedNumbers.length * rifa.price}
                    rifaId={rifa.id}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="sticky top-4 border-2 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4 text-primary">
                Resumo da sua participação
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rifa:</span>
                  <span className="font-medium">{rifa.title}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Números selecionados:
                  </span>
                  <span className="font-medium">{selectedNumbers.length}</span>
                </div>

                {selectedNumbers.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Seus números:</span>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedNumbers
                        .sort((a, b) => a - b)
                        .map((number) => (
                          <Badge
                            key={number}
                            variant="outline"
                            className="bg-primary/10 border-primary/30"
                          >
                            {number.toString().padStart(4, "0")}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between text-lg font-medium">
                    <span>Valor total:</span>
                    <span className="text-primary">
                      R$ {(selectedNumbers.length * rifa.price).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  disabled={selectedNumbers.length === 0}
                  onClick={() => setActiveTab("form")}
                >
                  {activeTab === "form"
                    ? "Preencher formulário"
                    : "Continuar para o cadastro"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
