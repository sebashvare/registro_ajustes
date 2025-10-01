export interface AjusteFormData {
  id_cuenta: string;
  id_acuerdo_servicio: string;
  id_cargo_facturable: string;
  fecha_ajuste: string;
  asesor_que_ajusto: string;
  valor_ajustado: number;
  obs_adicional?: string;
  justificacion: string;
}

export interface AjusteRegistro extends AjusteFormData {
  id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ValidationRule {
  required?: boolean;
  type?: 'number' | 'email' | 'date';
  min?: number;
  max?: number;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface FormErrors {
  [key: string]: string;
}

export interface DataTableConfig {
  searchable?: boolean;
  sortable?: boolean;
  exportable?: boolean;
  pagination?: {
    enabled: boolean;
    pageSize: number;
    pageSizes: number[];
  };
}