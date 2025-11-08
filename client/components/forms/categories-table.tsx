"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";

interface Category {
  categoria: string;
  monto: number;
  id?: string; // Unique ID for stable keys
}

interface CategoriesTableProps {
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
  categoriaOptions: string[];
  formatNumberPretty: (n: number) => string;
  parseNumber: (s: string) => number;
}

export function CategoriesTable({
  categories,
  onCategoriesChange,
  categoriaOptions,
  formatNumberPretty,
  parseNumber,
}: CategoriesTableProps) {
  const handleAddCategory = () => {
    console.log("📝 [CategoriesTable] Antes de agregar:", categories);
    const newId = `cat-${Date.now()}-${Math.random()}`;
    const newCategories = [...categories, { categoria: "", monto: 0, id: newId }];
    console.log("📝 [CategoriesTable] Después de agregar:", newCategories);
    onCategoriesChange(newCategories);
  };

  const handleRemoveCategory = (index: number) => {
    const newCategories = categories.filter((_, i) => i !== index);
    onCategoriesChange(newCategories);
  };

  const handleCategoryChange = (index: number, newCategoria: string) => {
    console.log(`✏️ [CategoriesTable] Cambiando categoría en índice ${index} a:`, newCategoria);
    const updated = [...categories];
    updated[index] = { ...updated[index], categoria: newCategoria };
    console.log("✏️ [CategoriesTable] Array actualizado:", updated);
    onCategoriesChange(updated);
  };

  const handleMontoChange = (index: number, newMonto: string) => {
    console.log(`💰 [CategoriesTable] Cambiando monto en índice ${index} a:`, newMonto);
    const parsed = parseNumber(newMonto);
    const updated = [...categories];
    updated[index] = { ...updated[index], monto: parsed };
    console.log("💰 [CategoriesTable] Array actualizado:", updated);
    onCategoriesChange(updated);
  };

  const totalMonto = categories.reduce((acc, cat) => acc + (cat.monto || 0), 0);

  console.log("🎨 [CategoriesTable] Renderizando tabla con categorías:", JSON.stringify(categories));

  return (
    <div className="space-y-3">
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-1/2">
                  Categoría
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 w-1/4">
                  Monto (S/)
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-1/4">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {categories && categories.length > 0 ? (
                categories.map((category, index) => (
                  <tr
                    key={category.id || `cat-${index}`}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Select
                        value={category.categoria || ""}
                        onValueChange={(value) =>
                          handleCategoryChange(index, value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione categoría..." />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriaOptions.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={
                          category.monto > 0
                            ? formatNumberPretty(category.monto)
                            : ""
                        }
                        onChange={(e) =>
                          handleMontoChange(index, e.target.value)
                        }
                        className="w-full text-right"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCategory(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-gray-500">
                    No hay categorías. Agrega una para comenzar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total row */}
        <div className="bg-blue-50 border-t px-4 py-3 flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">Total:</span>
          <span className="text-lg font-bold text-blue-600">
            S/ {formatNumberPretty(totalMonto)}
          </span>
        </div>
      </div>

      {/* Add button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAddCategory();
        }}
        className="w-full gap-2"
      >
        <Plus className="h-4 w-4" />
        Agregar categoría
      </Button>
    </div>
  );
}
