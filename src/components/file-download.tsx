"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Eye, Loader2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getFileForDownload } from "@/lib/supabase/server";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface FileDownloadProps {
  url: string;
  fileName?: string;
  showPreview?: boolean;
}

export function FileDownload({
  url,
  fileName,
  showPreview = true,
}: FileDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const defaultFileName = fileName || url.split("/").pop() || "download";

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      const result = await getFileForDownload(url);

      if (!result.success || !result.url) {
        throw new Error(result.error || "Erro ao obter URL para download");
      }
      const response = await fetch(result.url);
      if (!response.ok) {
        throw new Error(`Erro ao baixar arquivo: ${response.statusText}`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = defaultFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast({
        title: "Download concluído",
        description: `O arquivo ${defaultFileName} foi baixado com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = async () => {
    try {
      const result = await getFileForDownload(url);

      if (!result.success || !result.url) {
        throw new Error(result.error || "Erro ao obter URL para download");
      }

      // Buscar o arquivo como um Blob
      const response = await fetch(result.url);
      if (!response.ok) {
        throw new Error("Erro ao buscar o arquivo para visualização.");
      }

      const blob = await response.blob();
      const base64 = await convertBlobToBase64(blob);

      // Definir a URL base64 como o conteúdo do PDF
      setFilePreviewUrl(base64);
    } catch (error) {
      console.error("Erro ao carregar visualização:", error);
      toast({
        title: "Erro na visualização",
        description: "Não foi possível carregar o arquivo para visualização.",
        variant: "destructive",
      });
    }
  };

  // Função para converter o Blob em Base64
  const convertBlobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <AlertDialog
        open={filePreviewUrl !== null}
        onOpenChange={() => setFilePreviewUrl(null)}
      >
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handlePreview}
            disabled={isDownloading}
            title="Visualizar arquivo"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
        <AlertDialogCancel><X/></AlertDialogCancel>
          <div className="w-full">
            {filePreviewUrl ? (
              <object
                data={filePreviewUrl}
                type="application/pdf"
                width="100%"
                height="600"
              >
                <p>
                  Seu navegador não suporta PDF embutido.{" "}
                  <a href={filePreviewUrl}>
                    Clique aqui para visualizar o arquivo PDF.
                  </a>
                </p>
              </object>
            ) : (
              <p>Carregando...</p>
            )}
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={handleDownload}
        disabled={isDownloading}
        title="Baixar comprovante"
      >
        {isDownloading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span className="sr-only">Baixar</span>
      </Button>
    </div>
  );
}
