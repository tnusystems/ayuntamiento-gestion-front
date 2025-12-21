"use client";

import { Edit, Trash2, Power } from "lucide-react";

export interface TableData {
  id: string;
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  col5: string;
  col6: string;
  isActive: boolean;
}

interface DataTableProps {
  data: TableData[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export function DataTable({
  data,
  onEdit,
  onDelete,
  onToggleStatus,
}: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-neutral-200 text-neutral-600">
            <th className="px-3 py-2 text-left font-medium">Archivo</th>
            <th className="px-3 py-2 text-left font-medium">Tipo</th>
            <th className="px-3 py-2 text-left font-medium">Fecha</th>
            <th className="px-3 py-2 text-left font-medium">Tamaño</th>
            <th className="px-3 py-2 text-left font-medium">Usuario</th>
            <th className="px-3 py-2 text-left font-medium">Estado</th>
            <th className="px-3 py-2 text-left font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              className="border-b border-neutral-100 hover:bg-neutral-50"
            >
              <td className="px-3 py-3 text-neutral-700">{row.col1}</td>
              <td className="px-3 py-3 text-neutral-700">{row.col2}</td>
              <td className="px-3 py-3 text-neutral-700">{row.col3}</td>
              <td className="px-3 py-3 text-neutral-700">{row.col4}</td>
              <td className="px-3 py-3 text-neutral-700">{row.col5}</td>
              <td className="px-3 py-3">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    row.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {row.isActive ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(row.id)}
                    className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(row.id)}
                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onToggleStatus(row.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      row.isActive
                        ? "bg-orange-50 hover:bg-orange-100 text-orange-600"
                        : "bg-green-50 hover:bg-green-100 text-green-600"
                    }`}
                    title={row.isActive ? "Desactivar" : "Activar"}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
