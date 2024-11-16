export type TipoVistoria = "ENDOGENA" | "EXOGENA" | "FUNCIONAL";
export type CategoriaVistoria = "ALTA" | "MEDIA" | "BAIXA";

interface TipoVistoriaResponse {
  descricao: string;
  enum: TipoVistoria;
}

interface CategoriaVistoriaResponse {
  descricao: string;
  enum: CategoriaVistoria;
  prioridade: number;
}

export interface AnomaliaResponseDTO {
  id: number;
  nome: string;
}

export interface VistoriaRequestDTO {
  areaVistoriaInterna_id: number;
  dataHora: string;
  contemAnomalia: boolean;
  anomalia_id: number | null;
  tipo: TipoVistoria;
  categoria: CategoriaVistoria;
  observacao: string;
}

export interface VistoriaResponseDTO {
  id: number;
  areaVistoriaInterna_id: number;
  dataHora: string;
  contemAnomalia: boolean;
  anomalia: AnomaliaResponseDTO | null;
  tipo: TipoVistoriaResponse;
  categoria: CategoriaVistoriaResponse;
  observacao: string;
  fotos: string[];
}