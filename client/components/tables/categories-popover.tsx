"use client";

import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Category {
  id?: number;
  categoria: string;
  monto: number;
  orden?: number;
}

interface CategoriesPopoverProps {
  categories: Category[];
  mainCategory?: string;
  mainMonto?: number;
  formatCurrency?: (amount: number) => string;
}

export function CategoriesPopover({
  categories,
  mainCategory,
  mainMonto,
  formatCurrency = (amount: number) => `S/ ${amount.toFixed(2)}`,
}: CategoriesPopoverProps) {
  // Si no hay múltiples categorías o está vacío, mostrar categoría simple
  if (!categories || categories.length === 0) {
    return <span className="font-medium">{mainCategory || "-"}</span>;
  }

  // Si hay una sola categoría, mostrar normalmente
  if (categories.length === 1) {
    return (
      <div>
        <div className="font-medium">{categories[0].categoria}</div>
        <div className="text-sm text-gray-600">
          {formatCurrency(categories[0].monto)}
        </div>
      </div>
    );
  }

  // Si hay múltiples categorías, mostrar "Multiple" con popover
  const total = categories.reduce((acc, cat) => acc + cat.monto, 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="cursor-pointer hover:bg-gray-100 p-2 rounded">
          <Badge variant="secondary" className="mb-1">
            Múltiple ({categories.length})
          </Badge>
          <div className="text-sm font-medium text-gray-700">
            Total: {formatCurrency(total)}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="space-y-3 p-4">
          <h4 className="font-semibold text-sm">Categorías del Registro</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Categoría</th>
                <th className="text-right p-2 font-medium">Monto</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-2">{cat.categoria}</td>
                  <td className="p-2 text-right font-medium">
                    {formatCurrency(cat.monto)}
                  </td>
                </tr>
              ))}
              <tr className="font-bold bg-gray-50">
                <td className="p-2">Total</td>
                <td className="p-2 text-right">{formatCurrency(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </PopoverContent>
    </Popover>
  );
}
