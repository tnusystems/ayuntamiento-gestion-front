export type BienesInmueblesFormValues = {
  operation: string;
  dateFilter: string;
  registroNumero: string;
  registroVolumen: string;
  registroSeccion: string;
  registroFecha: string;
  escriturasNumero: string;
  escriturasNotaria: string;
  escriturasFecha: string;
  boletinNumero: string;
  boletinVolumen: string;
  boletinFecha: string;
  convenioNumero: string;
  convenioVolumen: string;
  convenioFecha: string;
  nombre: string;
  antecedente: string;
};

export type BienesInmueblesTableRow = BienesInmueblesFormValues & {
  id: string;
  clave: string;
  descripcion: string;
  ubicacion: string;
  estado: "Activo" | "Inactivo";
  fecha: string;
  responsable: string;
};
