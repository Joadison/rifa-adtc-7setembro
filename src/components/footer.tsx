"use client";
import { useState } from "react";
import { Clock, Heart, Lock, Mail, MapPin, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

export function Footer() {
  const [isTerms, setIsTerms] = useState(true);
  const [open, setOpen] = useState(false);

  const handleOpen = (type: "termos" | "privacidade") => {
    setIsTerms(type === "termos");
    setOpen(true);
    console.log(type);
  };
  return (
    <footer className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 text-white mt-10 rounded-xl">
      {/* Security Banner */}
      <div className="bg-green-600 py-3 rounded-t-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <Shield className="h-4 w-4" />
            <span>🔒 Site 100% Seguro e Protegido</span>
            <Lock className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Church Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-6 w-6 text-yellow-300" />
              <h3 className="text-xl font-bold">Nossa Igreja</h3>
            </div>
            <h4 className="text-lg font-semibold text-yellow-200">
              Assembleia de Deus
              <br />
              Templo Central 7 de Setembro
            </h4>
            <p className="text-blue-100 leading-relaxed">
              A AD Templo Central - 7 de Setembro é uma comunidade de fé
              comprometida em compartilhar o amor de Cristo através do
              acolhimento, do serviço e da proclamação da Palavra de Deus. Somos
              uma igreja que valoriza a família, a comunhão e o crescimento
              espiritual.
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Contato</h3>
            <div className="space-y-3">
              {/*  <div className="flex items-center gap-3 text-blue-100">
                  <Phone className="h-4 w-4" />
                  <span>(XX) XXXX-XXXX</span>
                </div> */}
              <div className="flex items-center gap-3 text-blue-100">
                <Mail className="h-4 w-4" />
                <span>adtemplocentral7setembro1@gmail.com</span>
              </div>
              <div className="flex items-start gap-3 text-blue-100">
                <Clock className="h-4 w-4 mt-1" />
                <div className="text-sm">
                  <p className="font-bold">Horários de Culto:</p>
                  <p>Domingo: 18h às 20hs</p>
                  <p>Quinta: 19h às 21hs</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-blue-100">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span className="text-sm">
                  R. Santa Rita, 857
                  <br />
                  Fortaleza, CE - 60540-272
                </span>
              </div>
            </div>
          </div>

          {/* Security & Trust */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Segurança & Confiança</h3>
            <div className="space-y-3">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-green-300" />
                  <span className="font-medium text-green-200">
                    Pagamentos Seguros
                  </span>
                </div>
                <p className="text-sm text-blue-100">
                  Todas as transações são protegidas
                </p>
              </div>

              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-5 w-5 text-yellow-300" />
                  <span className="font-medium text-yellow-200">
                    Transparência Total
                  </span>
                </div>
                <p className="text-sm text-blue-100">
                  Todos os recursos arrecadados são destinados às obras da
                  igreja
                </p>
              </div>

              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-5 w-5 text-blue-300" />
                  <span className="font-medium text-blue-200">
                    Dados Protegidos
                  </span>
                </div>
                <p className="text-sm text-blue-100">
                  Suas informações pessoais são mantidas em total sigilo
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-blue-100 text-sm">
                © {new Date().getFullYear()} Assembleia de Deus Templo Central -
                7 de Setembro
              </p>
              <p className="text-blue-200 text-xs mt-1">
                Todos os direitos reservados | Desenvolvido com ❤️ para nossa
                comunidade
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-blue-100">
              <Button
                variant="link"
                onClick={() => handleOpen("termos")}
                className="text-black hover:text-white transition-colors"
              >
                Termos de Uso
              </Button>
              <span>|</span>
              <Button
                variant="link"
                onClick={() => handleOpen("privacidade")}
                className="text-black hover:text-white transition-colors"
              >
                Política de Privacidade
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isTerms ? "Termos de Uso" : "Política de Privacidade"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            {isTerms ? (
              <>
                <p>
                  <strong>Última atualização:</strong> 04 de junho de 2025
                </p>
                <p>
                  <strong>1. Finalidade do Site:</strong> Este site tem como
                  objetivo divulgar e permitir a participação em rifas
                  organizadas pela Igreja Assembleia de Deus Templo Central – 7
                  de Setembro.
                </p>
                <p>
                  <strong>2. Participação:</strong> A compra de rifas é
                  voluntária. Ao participar, você concorda com os valores
                  definidos e com as regras de sorteio descritas na página.
                </p>
                <p>
                  <strong>3. Limitação de Responsabilidade:</strong> A
                  organização se reserva o direito de alterar datas ou condições
                  das rifas, avisando com antecedência.
                </p>
                <p>
                  <strong>4. Uso Indevido:</strong> É proibido utilizar este
                  site para fins ilegais ou que desrespeitem a igreja, os
                  organizadores ou outros usuários.
                </p>
                <p>
                  <strong>5. Contato:</strong> Em caso de dúvidas, entre em
                  contato pelo Instagram{" "}
                  <a
                    href="https://instagram.com/adtc7setembro"
                    className="underline"
                  >
                    [@adtc7setembro]
                  </a>
                  .
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong>Última atualização:</strong> 04 de junho de 2025
                </p>
                <p>
                  <strong>1. Coleta de Dados:</strong> Coletamos apenas os dados
                  necessários para registrar sua participação na rifa, como nome
                  e comprovante.
                </p>
                <p>
                  <strong>2. Uso dos Dados:</strong> Utilizamos apenas para
                  identificação do participante e entrega do prêmio.
                </p>
                <p>
                  <strong>3. Compartilhamento:</strong> Não compartilhamos dados
                  com terceiros, exceto por exigência legal.
                </p>
                <p>
                  <strong>4. Segurança:</strong> Este site utiliza ambiente
                  seguro e criptografia para proteger seus dados.
                </p>
                <p>
                  <strong>5. Direitos:</strong> Você pode solicitar exclusão ou
                  correção de dados entrando em contato com a organização.
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
