"use client";

import { useState } from "react";
import { DataTable, type TableData } from "../../../components/data-table";
import { Settings, Edit, Lock } from "lucide-react";
import Image from "next/image";

const ROLES = ["Administrador", "Editor", "Visualizador", "Moderador"];

const INITIAL_TABLE_DATA: TableData[] = [
  {
    id: "1",
    col1: "documento-fiscal-2024.pdf",
    col2: "PDF",
    col3: "15/01/2024",
    col4: "2.4 MB",
    col5: "Juan Pérez",
    col6: "Completado",
    isActive: true,
  },
  {
    id: "2",
    col1: "inventario-enero.xlsx",
    col2: "Excel",
    col3: "14/01/2024",
    col4: "1.8 MB",
    col5: "María García",
    col6: "En revisión",
    isActive: true,
  },
  {
    id: "3",
    col1: "reporte-mensual.docx",
    col2: "Word",
    col3: "13/01/2024",
    col4: "856 KB",
    col5: "Carlos López",
    col6: "Pendiente",
    isActive: false,
  },
  {
    id: "4",
    col1: "presentacion-q1.pptx",
    col2: "PowerPoint",
    col3: "12/01/2024",
    col4: "5.2 MB",
    col5: "Ana Martínez",
    col6: "Completado",
    isActive: true,
  },
  {
    id: "5",
    col1: "base-datos-clientes.csv",
    col2: "CSV",
    col3: "11/01/2024",
    col4: "3.1 MB",
    col5: "Roberto Sánchez",
    col6: "Archivado",
    isActive: false,
  },
];

export default function DashboardPage() {
  const [tableData, setTableData] = useState<TableData[]>(INITIAL_TABLE_DATA);
  const [userRole, setUserRole] = useState(ROLES[0]);

  const handleEdit = (id: string) => {
    const item = tableData.find((row) => row.id === id);
    alert(`Editando: ${item?.col1}`);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este archivo?")) {
      setTableData(tableData.filter((row) => row.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setTableData(
      tableData.map((row) =>
        row.id === id ? { ...row, isActive: !row.isActive } : row
      )
    );
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Perfil usuario */}
          <section className="bg-white rounded-xl border border-neutral-200 p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-neutral-300 mb-4 overflow-hidden">
              <Image
                width={300}
                height={300}
                src="/placeholder-user.png"
                alt="Usuario"
                className="w-full h-full object-cover"
              />
            </div>

            <h2 className="text-lg font-semibold text-neutral-900">
              Nombre de Usuario
            </h2>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="text-sm text-neutral-500 mb-6 bg-transparent border-none cursor-pointer hover:text-neutral-700 transition-colors"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <div className="flex gap-4">
              <button
                onClick={() => alert("Configuración")}
                className="w-12 h-12 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
                aria-label="Configuración"
              >
                <Settings className="w-5 h-5 text-neutral-600" />
              </button>
              <button
                onClick={() => alert("Editar perfil")}
                className="w-12 h-12 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
                aria-label="Editar"
              >
                <Edit className="w-5 h-5 text-neutral-600" />
              </button>
              <button
                onClick={() => alert("Seguridad")}
                className="w-12 h-12 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
                aria-label="Seguridad"
              >
                <Lock className="w-5 h-5 text-neutral-600" />
              </button>
            </div>
          </section>

          {/* Acciones rápidas */}
          <section className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-base font-semibold text-neutral-900 mb-4">
              Acciones rápidas
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Alta de bienes",
                "Buscar bienes",
                "Baja bien",
                "Comprometer bien",
              ].map((action) => (
                <button
                  key={action}
                  onClick={() => alert(`Acción: ${action}`)}
                  className="flex items-center gap-4 rounded-lg border border-neutral-200 p-4 hover:bg-neutral-100 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-md bg-neutral-200 flex items-center justify-center text-xl shrink-0">
                    📌
                  </div>
                  <span className="text-sm font-medium text-neutral-800">
                    {action}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Tabla */}
        <section className="bg-white rounded-xl border border-neutral-200 p-4 md:p-6">
          <h3 className="text-base font-semibold text-neutral-900 mb-4">
            Archivos subidos recientemente
          </h3>

          <DataTable
            data={tableData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </section>
      </div>
    </div>
  );
}
