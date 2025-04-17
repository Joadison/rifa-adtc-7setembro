import { Label } from "@radix-ui/react-label";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Participant } from "@/lib/supabase/client";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nome Completo</Label>
          <Input
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center space-x-2">
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
            {formData.payment_status === "confirmed"
              ? "Confirmado"
              : "Pendente"}
          </Label>
        </div>
        {formData.payment_status === "confirmed" && (
          <span className="text-xs text-muted-foreground">
            Status: confirmed
          </span>
        )}
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
