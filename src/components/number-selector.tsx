"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface NumberSelectorProps {
  totalNumbers: number;
  soldNumbers: number[];
  selectedNumbers: number[];
  onNumberSelect: (number: number) => void;
}

export function NumberSelector({
  totalNumbers,
  soldNumbers,
  selectedNumbers,
  onNumberSelect,
}: NumberSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const numbersPerPage = 200;

  // Criar array com todos os números
  const allNumbers = Array.from({ length: totalNumbers }, (_, i) => i + 1);

  // Filtrar números com base na pesquisa
  const filteredNumbers = searchTerm
    ? allNumbers.filter((num) => num.toString().includes(searchTerm))
    : allNumbers;

  // Paginação
  const totalPages = Math.ceil(filteredNumbers.length / numbersPerPage);
  const startIndex = (currentPage - 1) * numbersPerPage;
  const displayedNumbers = filteredNumbers.slice(
    startIndex,
    startIndex + numbersPerPage
  );

  return (
    <div>
      <div className="flex mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar número específico..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-4">
        {displayedNumbers.map((number) => {
          const isSold = soldNumbers.includes(number);
          const isSelected = selectedNumbers.includes(number);

          return (
            <Button
              key={number}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={`h-10 rifa-number ${
                isSold
                  ? "rifa-number-sold"
                  : isSelected
                  ? "rifa-number-selected"
                  : "rifa-number-available"
              }`}
              disabled={isSold}
              onClick={() => !isSold && onNumberSelect(number)}
            >
              {number.toString().padStart(4, "0")}
            </Button>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>

          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-primary"></div>
          <span>Selecionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm border-2 border-primary/30"></div>
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-rifa-sold"></div>
          <span>Vendido</span>
        </div>
      </div>
    </div>
  );
}
