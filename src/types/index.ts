export type CategoriaCarta = 'Común' | 'Raro' | 'Épico' | 'Legendario';
export type TipoMision = 'Fácil' | 'Media' | 'Difícil' | 'Extrema';

export interface Perfil {
  id: number;
  nombre: string;
  email: string | null;
  contrasena: string | null;
  f_nac: string | null;
  creado_en: string;
}

export interface Carta {
  id: number;
  nombre_carta: string | null;
  categoria: CategoriaCarta;
  borde: string | null;
  imagen: string | null;
  centro: string | null;
  normal_map: string | null;
  texto: string | null;
  propietario: number | null;
  creada_en: string;
}

export interface Mision {
  id: number;
  tipo: TipoMision;
  nombre: string;
  descripcion: string | null;
  recompensa: CategoriaCarta;
}

export interface ProgresoUsuario {
  id: number;
  perfil_id: number;
  mision_id: number;
  completado: boolean;
  fecha: string;
}
