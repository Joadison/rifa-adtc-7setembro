"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ColumnDef, Table } from "@tanstack/react-table";
import { BarChart3, Download, Home, Pencil, Trash2, Users } from "lucide-react";
import { type Rifa, type Participant } from "@/lib/supabase/types";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { ParticipantForm } from "./participantForm";
import {
  deletParticipant,
  updateParticipantSimple,
} from "@/lib/supabase/server";
import { FileDownload } from "../file-download";
import { AdminHeader } from "./header";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "../DataTable";

interface AdminDashboardProps {
  rifas: Rifa[];
  participants: Participant[];
}

export function AdminDashboard({ rifas, participants }: AdminDashboardProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [paymentFilter, setPaymentFilter] = useState<
    { id: string; value: string | undefined } | undefined
  >(undefined);
  const [filteredRifas] = useState<Rifa[]>(rifas);
  const [filteredParticipants] = useState<Participant[]>(participants);
  const [editingParticipant, setEditingParticipant] =
    useState<Participant | null>(null);
  const [delet, setDelet] = useState<string | null>(null);

  const handleEditParticipant = (participant: Participant) => {
    setEditingParticipant(participant);
  };

  const handleSelectParticipant = (participantId: string) => {
    setDelet(participantId);
  };

  const handleDeleteParticipant = async () => {
    if (!delet) return;
    try {
      await deletParticipant(delet);
      toast({
        title: "Deletando",
        description: `Deletado Participante com sucesso.`,
      });
      setDelet(null);
    } catch (error) {
      console.error("Erro ao deletar participante:", error);
      toast({
        variant: "destructive",
        title: "Erro Deletar",
        description: `Deletado Participante com sucesso.`,
      });
    }
  };

  const handleUpdateParticipant = async (updatedData: Participant) => {
    try {
      await updateParticipantSimple(updatedData.id, updatedData);
      toast({
        title: "Atualizando",
        description: `Atulizado Participante com sucesso.`,
      });
      setEditingParticipant(null);
    } catch (error) {
      console.error("Erro ao atualizar participante:", error);
      toast({
        variant: "destructive",
        title: "Erro Atulizar",
        description: `Eror na atualização, veja o LOG.`,
      });
    }
  };

  const totalParticipants = filteredParticipants.length;
  const activeRifas = filteredRifas.filter(
    (rifa) => rifa.status === "active"
  ).length;

  const totalSoldNumbers = filteredRifas.reduce(
    (acc, rifa) => acc + rifa.sold_numbers,
    0
  );

  const totalRevenue = filteredRifas.reduce(
    (acc, rifa) => acc + rifa.sold_numbers * rifa.price,
    0
  );

  const columnsPart: ColumnDef<Participant>[] = [
    {
      accessorKey: "full_name",
      header: "Nome",
      enableGlobalFilter: true,
    },
    {
      accessorKey: "phone",
      header: "Contato",
      enableGlobalFilter: true,
      cell({ row }) {
        const Phone = row.original.phone;
        const quantidade = row.original.participant_numbers?.length || 0;
        const rifa = filteredRifas.find((r) =>
          row.original.participant_numbers?.some((pn) => pn.rifa_id === r.id)
        );
        const total = quantidade * (rifa?.price || 0);
        const message = `Paz do Senhor!%0ANotei que foi realizada a compra de ${quantidade} ponto${
          quantidade > 1 ? "s" : ""
        }, no valor total de R$${total.toFixed(
          2
        )}.%0APor gentileza, poderia enviar o comprovante de pagamento quando possível?%0A%0AFico à disposição. Deus abençoe!`;
        return (
          <div className="flex flex-col">
            <span> {Phone}</span>
            <Link
              href={`https://wa.me/55${Phone}?text=${message}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 underline"
            >
              Enviar mensagem no WhatsApp
            </Link>
          </div>
        );
      },
    },
    {
      accessorKey: "payment_method",
      header: "Comprovante",
      enableSorting: false,
      cell({ row }) {
        const comp = row.original.proof_of_payment_url;
        return comp ? <FileDownload url={comp} /> : "Sem Comprovante";
      },
    },
    {
      accessorKey: "participant_numbers",
      header: "Pontos",
      enableSorting: false,
      cell({ row }) {
        const part = row.original.participant_numbers
          ?.map((pn) => pn.number)
          .join(", ");
        return (
          <div className=" max-w-[200px] overflow-x-auto whitespace-nowrap">
            {part}
          </div>
        );
      },
    },
    {
      accessorKey: "payment_status",
      header: "Tipo",
      enableSorting: false,
      cell({ row }) {
        const pay = row.original.payment_status;
        const met = row.original.payment_method;
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                pay === "confirmed"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-yellow-50 text-yellow-700 border-yellow-200"
              }
            >
              {pay === "confirmed" ? "Confirmado" : "Pendente"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {met === "pix" ? "PIX" : "Dinheiro"}
            </span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        if (value === undefined || value === null) return true;
        return row.getValue(id) === value;
      },
    },
    {
      accessorKey: "created_at",
      header: "Data de Criação",
      cell({ row }) {
        const create = new Date(row.original.created_at).toLocaleDateString(
          "pt-BR"
        );
        return create;
      },
    },
    {
      accessorKey: "lucky_number",
      header: "Valor",
      enableSorting: false,
      cell({ row }) {
        const quantidade = row.original.participant_numbers?.length || 0;
        const rifa = filteredRifas.find((r) =>
          row.original.participant_numbers?.some((pn) => pn.rifa_id === r.id)
        );
        const total = quantidade * (rifa?.price || 0);
        return (
          <div>
            <strong>R$ {total.toFixed(2)}</strong>
          </div>
        );
      },
    },
    {
      accessorKey: "id",
      header: "Ação",
      enableSorting: false,
      cell({ row }) {
        return (
          <div className="flex gap-2">
            <Button
              size="icon"
              onClick={() => handleEditParticipant(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleSelectParticipant(row.original.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const columnsD: ColumnDef<Participant>[] = [
    {
      accessorKey: "full_name",
      header: "Participante",
      enableSorting: false,
    },
    {
      accessorKey: "created_at",
      header: "Data de Criação",
      enableSorting: false,
      cell({ row }) {
        const create = new Date(row.original.created_at).toLocaleDateString(
          "pt-BR"
        );
        return create;
      },
    },
    {
      accessorKey: "payment_status",
      header: "Pagamento",
      enableSorting: false,
      cell({ row }) {
        const pay = row.original.payment_status;
        return (
          <Badge
            variant="outline"
            className={
              pay === "confirmed"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-yellow-50 text-yellow-700 border-yellow-200"
            }
          >
            {pay === "confirmed" ? "Confirmado" : "Pendente"}
          </Badge>
        );
      },
    },
  ];

  const columnsRifas: ColumnDef<Rifa>[] = [
    {
      accessorKey: "title",
      header: "Rifa",
      enableSorting: false,
    },
    {
      accessorKey: "sold_numbers",
      header: "Vendidos",
      enableSorting: false,
      cell({ row }) {
        return row.original.sold_numbers;
      },
    },
    {
      accessorKey: "end_date",
      header: "Data Sorteio",
      enableSorting: false,
      cell({ row }) {
        return new Date(row.original.end_date).toLocaleDateString("pt-BR");
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: false,
      cell({ row }) {
        return (
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full"
              style={{
                width: `${
                  (row.original.sold_numbers / row.original.total_numbers) * 100
                }%`,
              }}
            ></div>
          </div>
        );
      },
    },
  ];

  const handleExportToCSV = () => {
    // Cabeçalhos do CSV com caracteres corretos
    const headers = [
      "Nome",
      "Telefone",
      "Método de Pagamento",
      "Status de Pagamento",
      "Pontos",
      "Valor Total (R$)",
      "Data de Criação",
    ];

    // Mapear os dados para linhas do CSV
    const rows = participants.map((participant) => {
      const quantidade = participant.participant_numbers?.length || 0;
      const rifa = filteredRifas.find((r) =>
        participant.participant_numbers?.some((pn) => pn.rifa_id === r.id)
      );
      const total = quantidade * (rifa?.price || 0);
      const pontos = participant.participant_numbers
        ?.map((pn) => pn.number)
        .join(", ");

      return [
        `"${participant.full_name?.replace(/"/g, '""')}"`, // Escapa aspas
        participant.phone,
        participant.payment_method === "pix" ? "PIX" : "Dinheiro",
        participant.payment_status === "confirmed" ? "Confirmado" : "Pendente",
        `"${pontos?.replace(/"/g, '""')}"`, // Escapa aspas
        total.toFixed(2).replace(".", ","), // Formato brasileiro
        new Date(participant.created_at).toLocaleDateString("pt-BR"),
      ];
    });

    // Combinar cabeçalhos e linhas com BOM para UTF-8
    const csvContent =
      "\uFEFF" +
      [
        // BOM para garantir UTF-8
        headers.join(";"), // Usar ponto-e-vírgula como delimitador (mais comum no Brasil)
        ...rows.map((row) => row.join(";")),
      ].join("\r\n"); // \r\n para compatibilidade com Windows

    // Criar blob e disparar download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "participantes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <AdminHeader />
      <div className="flex-1 flex ">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-64 bg-card border-r p-2">
          <div className="font-bold text-xl mb-4 px-2 pt-2 text-primary">
            Rifas Dashboard
          </div>
          <nav className="space-y-1">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("dashboard")}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === "participants" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("participants")}
            >
              <Users className="mr-2 h-4 w-4" />
              Participantes
            </Button>
          </nav>
          <div className="mt-auto">
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Voltar ao Site
              </Link>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Mobile Tabs */}
          <div className="md:hidden mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="participants">Participantes</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Rifa Selector */}
          {/* <div className="mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select
                  value={selectedRifaId}
                  onValueChange={setSelectedRifaId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecionar Rifa" />
                  </SelectTrigger>
                  <SelectContent className=" bg-white">
                    <SelectItem value="all">Todas as Rifas</SelectItem>
                    {rifas.map((rifa) => (
                      <SelectItem key={rifa.id} value={rifa.id}>
                        {rifa.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div> */}

          {/* Desktop Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="dashboard">
              <h1 className="text-3xl font-bold mb-6 text-primary">
                Dashboard
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total de Participantes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {totalParticipants}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Números Vendidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {totalSoldNumbers}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Receita Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      R$ {totalRevenue.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Rifas Ativas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {activeRifas}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Últimas Participações</CardTitle>
                    <CardDescription>
                      Participações mais recentes no sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable columns={columnsD} data={participants} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Rifas Ativas</CardTitle>
                    <CardDescription>
                      Status das rifas em andamento
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable columns={columnsRifas} data={rifas} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* <TabsContent value="rifas">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-primary">Rifas</h1>
              <Button>Nova Rifa</Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Data Sorteio</TableHead>
                      <TableHead>Números</TableHead>
                      <TableHead>Progresso</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRifas.map((rifa) => (
                      <TableRow key={rifa.id}>
                        <TableCell className="font-medium">
                          {rifa.title}
                        </TableCell>
                        <TableCell>
                          {new Date(rifa.end_date).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          {rifa.sold_numbers} / {rifa.total_numbers}
                        </TableCell>
                        <TableCell>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${
                                  (rifa.sold_numbers / rifa.total_numbers) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              rifa.status === "active"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }
                          >
                            {rifa.status === "active" ? "Ativa" : "Concluída"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent> */}

            <TabsContent value="participants">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-primary">
                  Participantes
                </h1>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExportToCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                  <Button
                    variant="link"
                    onClick={() => {
                      if (paymentFilter?.value === "pending") {
                        setPaymentFilter(undefined);
                      } else {
                        setPaymentFilter({
                          id: "payment_status",
                          value: "pending",
                        });
                      }
                    }}
                  >
                    {paymentFilter?.value === "pending"
                      ? "Mostrar Todos"
                      : "Sem Confirmação"}
                  </Button>
                </div>
              </div>

              <DataTable
                columns={columnsPart}
                data={participants}
                initialFilter={paymentFilter}
              />
            </TabsContent>
          </Tabs>
        </div>

        {editingParticipant && (
          <AlertDialog
            open={!!editingParticipant}
            onOpenChange={() => setEditingParticipant(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Editar Participante</AlertDialogTitle>
              </AlertDialogHeader>
              <ParticipantForm
                initialData={editingParticipant}
                onSubmit={handleUpdateParticipant}
                onCancel={() => setEditingParticipant(null)}
              />
            </AlertDialogContent>
          </AlertDialog>
        )}

        {delet && (
          <AlertDialog open={!!delet} onOpenChange={() => setDelet(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Deseja realmente deletar o participante?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não poderá ser desfeita. Tem certeza que deseja
                  continuar?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setDelet(null)}>
                  Não
                </Button>
                <Button variant="destructive" onClick={handleDeleteParticipant}>
                  Sim
                </Button>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
