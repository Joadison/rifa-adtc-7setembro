import { Label } from "@radix-ui/react-label";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Participant } from "@/lib/supabase/types";
import { Upload } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface ParticipantFormProps {
  initialData: Participant;
  onSubmit: (data: Participant) => void;
  onCancel: () => void;
}

export function ParticipantForm({
  initialData,
  onSubmit,
  onCancel,
}: ParticipantFormProps) {
  const [formData, setFormData] = useState<Participant>(initialData);

  const setField = (name: keyof Participant, value: string | undefined) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      try {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `payment_proofs/${fileName}-${initialData.cpf}`;

        const { data, error } = await supabase.storage
          .from("rifas")
          .upload(filePath, selectedFile);

        if (error) {
          console.error("Erro ao fazer upload do arquivo:", error);
          throw new Error(`Erro ao fazer upload: ${error.message}`);
        }

        const { data: urlData } = supabase.storage
          .from("rifas")
          .getPublicUrl(filePath);

        const proofOfPaymentUrl = urlData.publicUrl;

        setField("proof_of_payment_url", proofOfPaymentUrl);
      } catch (uploadError) {
        console.error("Erro no upload:", uploadError);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 p-4 rounded-xl bg-white shadow-md">
      <div className="grid gap-2">
        <Label htmlFor="full_name">Nome Completo</Label>
        <Input
          id="full_name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center gap-3">
        <Checkbox
          id="payment_status"
          checked={formData.payment_status === "confirmed"}
          onCheckedChange={(checked) => {
            setFormData({
              ...formData,
              payment_status: checked ? "confirmed" : "pending",
            });
          }}
        />
        <Label htmlFor="payment_status">
          {formData.payment_status === "confirmed" ? "Confirmado" : "Pendente"}
        </Label>
        {formData.payment_status === "confirmed" && (
          <span className="text-sm text-muted-foreground">
            Status: confirmed
          </span>
        )}
      </div>

      <div className="grid gap-2">
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
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}
