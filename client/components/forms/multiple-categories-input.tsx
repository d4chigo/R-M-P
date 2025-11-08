"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface Category {
  categoria: string;
  monto: number;
}

interface MultipleCategoriesInputProps {
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
  categoriaOptions: string[];
  formatNumberPretty: (n: number) => string;
  parseNumber: (s: string) => number;
}

export function MultipleCategoriesInput({
  categories,
  onCategoriesChange,
  categoriaOptions,
  formatNumberPretty,
  parseNumber,
}: MultipleCategoriesInputProps) {
  const [tempCategoria, setTempCategoria] = useState("");
  const [tempMonto, setTempMonto] = useState("");

  const handleAddCategory = () => {
    if (!tempCategoria || !tempMonto) {
      return;
    }

    const monto = parseNumber(tempMonto);
    if (monto <= 0) {
      return;
    }

    // Evitar duplicados
    if (categories.some(c => c.categoria === tempCategoria)) {
      return;
    }

    const newCategories = [
      ...categories,
      {
        categoria: tempCategoria,
        monto,
      },
    ];

    onCategoriesChange(newCategories);
    setTempCategoria("");
    setTempMonto("");
  };

  const handleRemoveCategory = (index: number) => {
    const newCategories = categories.filter((_, i) => i !== index);
    onCategoriesChange(newCategories);
  };

  const totalMonto = categories.reduce((acc, cat) => acc + cat.monto, 0);

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
      <h3 className="font-semibold text-sm">Agregar Categorías Múltiples</h3>

      {/* Inputs para nueva categoría */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div>
          <label className="text-xs font-medium text-gray-600">
            Categoría
          </label>
          <Select value={tempCategoria} onValueChange={setTempCategoria}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {categoriaOptions.map((cat) => (
                <SelectItem
                  key={cat}
                  value={cat}
                  disabled={categories.some(c => c.categoria === cat)}
                >
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Monto</label>
          <div className="relative mt-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 select-none text-sm">
              S/
            </span>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              className="pl-10"
              value={tempMonto}
              onChange={(e) => {
                const raw = e.target.value;
                const cleaned = raw.replace(/[^0-9,\.]/g, "");
                setTempMonto(cleaned);
              }}
              onBlur={() => {
                if (tempMonto) {
                  const num = parseNumber(tempMonto);
                  setTempMonto(formatNumberPretty(num));
                }
              }}
              onFocus={(e) => e.currentTarget.select()}
            />
          </div>
        </div>

        <div className="flex items-end">
          <Button
            type="button"
            size="sm"
            onClick={handleAddCategory}
            disabled={!tempCategoria || !tempMonto}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar
          </Button>
        </div>
      </div>

      {/* Tabla de categorías agregadas */}
      {categories.length > 0 && (
        <div className="border-t pt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="text-left p-2">Categoría</th>
                <th className="text-right p-2">Monto</th>
                <th className="text-center p-2 w-10">Acción</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-2">{cat.categoria}</td>
                  <td className="p-2 text-right font-medium">
                    S/ {formatNumberPretty(cat.monto)}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="font-bold bg-gray-100">
                <td className="p-2">Total</td>
                <td className="p-2 text-right">S/ {formatNumberPretty(totalMonto)}</td>
                <td className="p-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
