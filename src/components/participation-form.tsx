"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Upload } from "lucide-react";
import { geradorPix, getRandomNumber, validateCPF } from "@/lib/utils";
import {
  createParticipant,
  getSoldNumbersByRifaId,
  saveParticipantNumbers,
  supabase,
  updateRifaSoldNumbers,
} from "@/lib/supabase/client";
import { QRCodeSVG } from "qrcode.react";

interface ParticipationFormProps {
  selectedNumbers: number[];
  totalValue: number;
  rifaId: string;
}

const formSchema = z.object({
  fullName: z.string().min(5, "Nome completo deve ter pelo menos 5 caracteres"),
  cpf: z.string().refine(validateCPF, "CPF inválido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  address: z.string().min(10, "Endereço deve ter pelo menos 10 caracteres"),
  city: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres"),
  state: z.string().length(2, "Estado deve ter 2 caracteres"),
  zipCode: z.string().min(8, "CEP inválido"),
  paymentMethod: z.enum(["pix", "cash"]),
  proofOfPayment: z.any().optional(),
});

export function ParticipationForm({
  selectedNumbers,
  totalValue,
  rifaId,
}: ParticipationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);

  const payloadPix = geradorPix(totalValue);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      cpf: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      paymentMethod: "pix",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (selectedNumbers.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      let proofOfPaymentUrl = null;
      if (proofFile && values.paymentMethod === "pix") {
        try {
          const fileExt = proofFile.name.split(".").pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const filePath = `payment_proofs/${fileName}-${values.cpf}`;
          const { data, error } = await supabase.storage
            .from("rifas")
            .upload(filePath, proofFile);

          if (error) {
            console.error("Erro ao fazer upload do arquivo:", error);
            throw new Error(
              `Erro ao fazer upload do arquivo: ${error.message}`
            );
          }

          // Obter URL pública do arquivo
          const { data: urlData } = supabase.storage
            .from("rifas")
            .getPublicUrl(filePath);
          proofOfPaymentUrl = urlData.publicUrl;
        } catch (uploadError) {
          console.error("Erro no upload:", uploadError);
        }
      }

      const luckyNumber = getRandomNumber(100000, 999999).toString();
      const participantData = {
        full_name: values.fullName,
        cpf: values.cpf.replace(/[^\d]/g, ""),
        email: values.email,
        phone: values.phone.replace(/[^\d]/g, ""),
        address: values.address,
        city: values.city,
        state: values.state,
        zip_code: values.zipCode.replace(/[^\d]/g, ""),
        payment_method: values.paymentMethod,
        payment_status: "pending" as const,
        proof_of_payment_url: proofOfPaymentUrl || "",
        lucky_number: luckyNumber,
      };

      try {
        const newParticipant = await createParticipant(participantData);
        await saveParticipantNumbers(
          newParticipant.id,
          rifaId,
          selectedNumbers
        );
        const soldNumbers = await getSoldNumbersByRifaId(rifaId);
        await updateRifaSoldNumbers(rifaId, soldNumbers.length);
        if (!newParticipant) {
          throw new Error("Erro ao processar solicitação");
        }
        router.push(
          `/confirmation?rifaId=${rifaId}&luckyNumber=${newParticipant.lucky_number}`
        );
      } catch (fetchError) {
        console.error("Erro na requisição:", fetchError);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(payloadPix);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium text-primary">Dados Pessoais</h3>

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Digite seu nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite seu CPF (apenas números)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Digite seu email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone / WhatsApp</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu telefone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-primary">Endereço</h3>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço Completo</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Digite seu endereço completo"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Cidade" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <Input placeholder="UF" maxLength={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <Input placeholder="CEP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-primary">Pagamento</h3>
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-md border border-primary/20">
              <h4 className="font-medium mb-2 text-primary">Dados para PIX</h4>
              <p className="text-sm mb-2">
                Faça o pagamento via PIX para a chave abaixo:
              </p>
              <div className="flex justify-left my-4">
                <QRCodeSVG value={payloadPix} size={200} className="boder border-2"/>
              </div>
              <div
                className="p-2 bg-background rounded border mb-2"
                onClick={handleCopy}
                title="Clique para copiar"
              >
                <p className="font-mono text-sm select-all">{payloadPix}</p>
              </div>
              {copied && (
                <span className="text-xs text-green-500">Copiado PIX!</span>
              )}
              <p className="text-sm mb-2">
                Valor:{" "}
                <span className="font-medium text-primary">
                  R$ {totalValue.toFixed(2)}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Após realizar o pagamento, envie o comprovante abaixo.
              </p>
            </div>

            <div>
              <Label htmlFor="proofOfPayment">Comprovante de Pagamento</Label>
              <div className="mt-1">
                <Label
                  htmlFor="proofOfPayment"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-primary/5 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-primary" />
                    <p className="mb-1 text-sm text-muted-foreground">
                      <span className="font-medium">Clique para enviar</span> ou
                      arraste e solte
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG ou PDF (máx. 10MB)
                    </p>
                  </div>
                  <Input
                    id="proofOfPayment"
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                  />
                </Label>
              </div>
              {proofFile && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Arquivo selecionado: {proofFile.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || selectedNumbers.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Confirmar Participação"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
