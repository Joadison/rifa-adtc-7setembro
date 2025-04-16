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
import { Badge } from "@/components/ui/badge";
import { Ticket, Users, Award, ArrowRight, Trophy } from "lucide-react";
import { getRifas } from "@/lib/supabase/client";

export default async function Home() {
  const rifas = await getRifas();
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8 mb-10">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-background to-primary rounded-3xl" />
          <div className="absolute top-10 right-10 w-24 h-24 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/40 rounded-full blur-xl transform scale-150" />
              <div className="relative bg-gradient-to-br from-primary/80 to-primary p-4 rounded-full shadow-lg">
                <Trophy className="h-14 w-14 text-primary-foreground" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text">
            Contribua com Amor
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Participe de nossas rifas online de forma rápida e segura. Escolha
            seus números da sorte e concorra a prêmio incrível!
          </p>
        </div>
      </header>

      <section className="mb-16" id="como-funciona">
        <h2 className="text-3xl font-bold text-center mb-8">Como Funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-110">
              <Ticket className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-125" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Escolha sua Rifa</h3>
            <p className="text-muted-foreground">
              Navegue pelas rifas disponíveis e escolha a que mais lhe
              interessa.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-110">
              <Users className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-125" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Preencha seus Dados</h3>
            <p className="text-muted-foreground">
              Informe seus dados pessoais e escolha seus números da sorte.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-110">
              <Award className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-125" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Concorra aos Prêmios</h3>
            <p className="text-muted-foreground">
              Após a confirmação do pagamento, você já está concorrendo aos
              prêmios.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1">
        {rifas.slice(0, 3).map((rifa) => (
          <Card key={rifa.id} className="border-2 border-primary/20 rifa-card">
            <div className="absolute top-2 right-2">
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
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-primary" />
                Rifa{" "}
                {rifa.title.length > 20
                  ? rifa.title.substring(0, 20) + "..."
                  : rifa.title}
              </CardTitle>
              <CardDescription>
                Sorteio em {new Date(rifa.end_date).toLocaleDateString("pt-BR")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full max-w-[100rem] h-[500px] bg-muted rounded-md flex items-center justify-center mb-4 overflow-hidden mx-auto">
                <video
                  src="/igreja.MOV"
                  className="max-h-full max-w-full transition-transform hover:scale-105"
                  autoPlay
                  muted={false}
                  loop
                  playsInline
                />
              </div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">{rifa.title}</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Valor por número:{" "}
                  <span className="text-primary font-medium">
                    R$ {rifa.price.toFixed(2)}
                  </span>
                </p>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{
                      width: `${
                        (rifa.sold_numbers / rifa.total_numbers) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {rifa.sold_numbers} de {rifa.total_numbers} números vendidos
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/rifas/${rifa.id}`}>
                  Participar <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>
    </div>
  );
}
