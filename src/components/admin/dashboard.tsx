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
//import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart3, Home, Pencil, Trash2, Users } from "lucide-react";
/* import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; */
import { type Rifa, type Participant } from "@/lib/supabase/types";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { ParticipantForm } from "./participantForm";
import {
  deletParticipant,
  updateParticipantSimple,
} from "@/lib/supabase/server";
import { FileDownload } from "../file-download";

interface AdminDashboardProps {
  rifas: Rifa[];
  participants: Participant[];
}

export function AdminDashboard({ rifas, participants }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  //const [searchTerm, setSearchTerm] = useState("");
  //const [selectedRifaId, setSelectedRifaId] = useState<string>("all");
  const [filteredRifas, setFilteredRifas] = useState<Rifa[]>(rifas);
  const [filteredParticipants, setFilteredParticipants] =
    useState<Participant[]>(participants);

  const [editingParticipant, setEditingParticipant] =
    useState<Participant | null>(null);

  const handleEditParticipant = (participant: Participant) => {
    setEditingParticipant(participant);
  };

  const handleDelete = async (participant: Participant) => {
    console.log(participant);
    const delet = await deletParticipant(participant.id);
    console.log(delet);
  };

  const handleUpdateParticipant = async (updatedData: Participant) => {
    try {
      await updateParticipantSimple(updatedData.id, updatedData);
      setEditingParticipant(null);
    } catch (error) {
      console.error("Erro ao atualizar participante:", error);
    }
  };

  // Filtrar rifas e participantes quando o ID da rifa selecionada mudar
  /*  useEffect(() => {
    if (selectedRifaId === "all") {
      setFilteredRifas(rifas);
      setFilteredParticipants(
        participants.filter(
          (participant) =>
            participant.full_name
              .toLowerCase()  
              .includes(searchTerm.toLowerCase()) ||
            participant.email
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            participant.phone.includes(searchTerm)
        )
      );
    } else {
      setFilteredRifas(rifas.filter((rifa) => rifa.id === selectedRifaId));
      setFilteredParticipants(
        participants.filter((participant) => {
          const matchesSearch =
            participant.full_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            participant.email
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            participant.phone.includes(searchTerm);

          // Aqui precisaríamos verificar se o participante está relacionado à rifa selecionada
          // Como não temos essa relação direta no tipo Participant, estamos assumindo que todos os participantes
          // filtrados pelo termo de busca são válidos quando uma rifa específica é selecionada
          return matchesSearch;
        })
      );
    }
  }, [selectedRifaId, searchTerm, rifas, participants]); */

  // Calcular estatísticas
  const totalParticipants = filteredParticipants.length;
  const activeRifas = filteredRifas.filter(
    (rifa) => rifa.status === "active"
  ).length;

  // Calcular total de números vendidos e receita
  const totalSoldNumbers = filteredRifas.reduce(
    (acc, rifa) => acc + rifa.sold_numbers,
    0
  );
  const totalRevenue = filteredRifas.reduce(
    (acc, rifa) => acc + rifa.sold_numbers * rifa.price,
    0
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-card border-r p-4">
        <div className="font-bold text-xl mb-8 px-4 pt-4 text-primary">
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
          {/* <Button
            variant={activeTab === "rifas" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("rifas")}
          >
            <Ticket className="mr-2 h-4 w-4" />
            Rifas
          </Button> */}
          <Button
            variant={activeTab === "participants" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("participants")}
          >
            <Users className="mr-2 h-4 w-4" />
            Participantes
          </Button>
          {/* <Button
            variant={activeTab === "winners" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("winners")}
          >
            <Trophy className="mr-2 h-4 w-4" />
            Ganhadores
          </Button> */}
        </nav>
        <div className="mt-auto pt-4">
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
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="rifas">Rifas</TabsTrigger>
              <TabsTrigger value="participants">Participantes</TabsTrigger>
              <TabsTrigger value="winners">Ganhadores</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Rifa Selector */}
        {/* <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedRifaId} onValueChange={setSelectedRifaId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar Rifa" />
                </SelectTrigger>
                <SelectContent>
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
            <h1 className="text-3xl font-bold mb-6 text-primary">Dashboard</h1>

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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Participante</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredParticipants.slice(0, 5).map((participant) => (
                        <TableRow key={participant.id}>
                          <TableCell className="font-medium">
                            {participant.full_name}
                          </TableCell>
                          <TableCell>{participant.email}</TableCell>
                          <TableCell>
                            {new Date(
                              participant.created_at
                            ).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                participant.payment_status === "confirmed"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-yellow-50 text-yellow-700 border-yellow-200"
                              }
                            >
                              {participant.payment_status === "confirmed"
                                ? "Confirmado"
                                : "Pendente"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rifa</TableHead>
                        <TableHead>Vendidos</TableHead>
                        <TableHead>Data Sorteio</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRifas
                        .filter((rifa) => rifa.status === "active")
                        .map((rifa) => (
                          <TableRow key={rifa.id}>
                            <TableCell className="font-medium">
                              {rifa.title}
                            </TableCell>
                            <TableCell>
                              {rifa.sold_numbers} / {rifa.total_numbers}
                            </TableCell>
                            <TableCell>
                              {new Date(rifa.end_date).toLocaleDateString(
                                "pt-BR"
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{
                                    width: `${
                                      (rifa.sold_numbers / rifa.total_numbers) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
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
            {/* <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-primary">Participantes</h1>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </div> */}

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Comprovante</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParticipants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell className="font-medium">
                          {participant.full_name}
                        </TableCell>
                        <TableCell>
                          <div>{participant.email}</div>
                          <div className="text-muted-foreground text-sm">
                            <Link
                              href={`https://wa.me/55${participant.phone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 underline"
                            >
                              {participant.phone}
                            </Link>
                          </div>
                        </TableCell>
                        {/* <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-primary/10 border-primary/30"
                          >
                            {participant.lucky_number}
                          </Badge>
                        </TableCell> */}
                        <TableCell>
                          {participant.proof_of_payment_url ? (
                            <FileDownload
                              url={participant.proof_of_payment_url}
                            />
                          ) : (
                            "Sem Comprovante"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                participant.payment_status === "confirmed"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-yellow-50 text-yellow-700 border-yellow-200"
                              }
                            >
                              {participant.payment_status === "confirmed"
                                ? "Confirmado"
                                : "Pendente"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {participant.payment_method === "pix"
                                ? "PIX"
                                : "Dinheiro"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(participant.created_at).toLocaleDateString(
                            "pt-BR"
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          {/* <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewParticipant(participant)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button> */}
                          <Button
                            size="icon"
                            onClick={() => handleEditParticipant(participant)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(participant)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/*  <TabsContent value="winners">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-primary">Ganhadores</h1>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Últimos Sorteios</CardTitle>
                <CardDescription>
                  Resultados dos sorteios realizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rifa</TableHead>
                      <TableHead>Data Sorteio</TableHead>
                      <TableHead>Ganhador</TableHead>
                      <TableHead>Número Sorteado</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRifas.filter((rifa) => rifa.status === "completed")
                      .length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-4 text-muted-foreground"
                        >
                          Nenhum sorteio realizado até o momento
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRifas
                        .filter((rifa) => rifa.status === "completed")
                        .map((rifa) => (
                          <TableRow key={rifa.id}>
                            <TableCell className="font-medium">
                              {rifa.title}
                            </TableCell>
                            <TableCell>
                              {new Date(rifa.end_date).toLocaleDateString(
                                "pt-BR"
                              )}
                            </TableCell>
                            <TableCell>Nome do Ganhador</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="bg-primary/10"
                              >
                                0131
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200"
                              >
                                Entregue
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximos Sorteios</CardTitle>
                <CardDescription>Sorteios programados</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rifa</TableHead>
                      <TableHead>Data Sorteio</TableHead>
                      <TableHead>Números Vendidos</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRifas
                      .filter((rifa) => rifa.status === "active")
                      .map((rifa) => (
                        <TableRow key={rifa.id}>
                          <TableCell className="font-medium">
                            {rifa.title}
                          </TableCell>
                          <TableCell>
                            {new Date(rifa.end_date).toLocaleDateString(
                              "pt-BR"
                            )}
                          </TableCell>
                          <TableCell>
                            {rifa.sold_numbers} / {rifa.total_numbers}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              Ativa
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
    </div>
  );
}
