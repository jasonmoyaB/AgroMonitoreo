export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      fincas: {
        Row: {
          activa: boolean
          actualizado_en: string
          creado_en: string
          id: string
          nombre: string
        }
        Insert: {
          activa?: boolean
          actualizado_en?: string
          creado_en?: string
          id: string
          nombre: string
        }
        Update: {
          activa?: boolean
          actualizado_en?: string
          creado_en?: string
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      labores: {
        Row: {
          activo: boolean
          actualizado_en: string
          codigo: string
          color: string
          creado_en: string
          icono: string
          id: string
          nombre: string
          orden: number
          paso_cantidad: number
          tiene_cantidad: boolean
          unidad_medida: string | null
        }
        Insert: {
          activo?: boolean
          actualizado_en?: string
          codigo: string
          color: string
          creado_en?: string
          icono: string
          id: string
          nombre: string
          orden: number
          paso_cantidad: number
          tiene_cantidad?: boolean
          unidad_medida?: string | null
        }
        Update: {
          activo?: boolean
          actualizado_en?: string
          codigo?: string
          color?: string
          creado_en?: string
          icono?: string
          id?: string
          nombre?: string
          orden?: number
          paso_cantidad?: number
          tiene_cantidad?: boolean
          unidad_medida?: string | null
        }
        Relationships: []
      }
      registros_trabajo: {
        Row: {
          cantidad: number | null
          creado_en: string
          fecha: string
          finca_id: string
          horas: number
          id: string
          registrado_por: string
          tipo_labor_id: string
          trabajador_id: string
        }
        Insert: {
          cantidad?: number | null
          creado_en?: string
          fecha: string
          finca_id: string
          horas: number
          id?: string
          registrado_por?: string
          tipo_labor_id: string
          trabajador_id: string
        }
        Update: {
          cantidad?: number | null
          creado_en?: string
          fecha?: string
          finca_id?: string
          horas?: number
          id?: string
          registrado_por?: string
          tipo_labor_id?: string
          trabajador_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registros_trabajo_finca_id_fkey"
            columns: ["finca_id"]
            isOneToOne: false
            referencedRelation: "fincas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registros_trabajo_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registros_trabajo_tipo_labor_id_fkey"
            columns: ["tipo_labor_id"]
            isOneToOne: false
            referencedRelation: "labores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registros_trabajo_trabajador_id_fkey"
            columns: ["trabajador_id"]
            isOneToOne: false
            referencedRelation: "trabajadores"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          creado_en: string
          id: string
          nombre: string
        }
        Insert: {
          creado_en?: string
          id?: string
          nombre: string
        }
        Update: {
          creado_en?: string
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      trabajadores: {
        Row: {
          activo: boolean
          actualizado_en: string
          creado_en: string
          finca_id: string
          foto_url: string | null
          id: string
          nombre_completo: string
        }
        Insert: {
          activo?: boolean
          actualizado_en?: string
          creado_en?: string
          finca_id: string
          foto_url?: string | null
          id?: string
          nombre_completo: string
        }
        Update: {
          activo?: boolean
          actualizado_en?: string
          creado_en?: string
          finca_id?: string
          foto_url?: string | null
          id?: string
          nombre_completo?: string
        }
        Relationships: [
          {
            foreignKeyName: "trabajadores_finca_id_fkey"
            columns: ["finca_id"]
            isOneToOne: false
            referencedRelation: "fincas"
            referencedColumns: ["id"]
          },
        ]
      }
      usuario: {
        Row: {
          activo: boolean
          actualizado_en: string
          auth_user_id: string
          creado_en: string
          email: string
          finca_id: string
          id: string
          rol_id: string
        }
        Insert: {
          activo?: boolean
          actualizado_en?: string
          auth_user_id: string
          creado_en?: string
          email: string
          finca_id?: string
          id?: string
          rol_id: string
        }
        Update: {
          activo?: boolean
          actualizado_en?: string
          auth_user_id?: string
          creado_en?: string
          email?: string
          finca_id?: string
          id?: string
          rol_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_finca_id_fkey"
            columns: ["finca_id"]
            isOneToOne: false
            referencedRelation: "fincas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_rol_id_fkey"
            columns: ["rol_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      usuario_actual_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

