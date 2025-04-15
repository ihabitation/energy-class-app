export {};

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          client_name: string;
          address: {
            street: string;
            city: string;
            postal_code: string;
            country: string;
          };
          created_at: string;
          updated_at: string;
          status: 'draft' | 'in_progress' | 'completed';
          metadata: {
            building_type: string;
            construction_year?: number;
            total_area?: number;
            floors?: number;
            last_renovation?: string;
          };
          user_id: string;
        };
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      assessments: {
        Row: {
          id: string;
          project_id: string;
          category_id: string;
          sub_category_id: string;
          selected_class: string;
          selected_option: string;
          notes: string | null;
          last_updated: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['assessments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['assessments']['Insert']>;
      };
      technical_solutions: {
        Row: {
          id: string;
          project_id: string;
          category_id: string;
          sub_category_id: string;
          selected_class: string;
          solution_type: 'prescription' | 'recommendation' | 'requirement';
          title: string;
          description: string;
          technical_details: {
            equipment_type?: string;
            specifications?: string[];
            installation_requirements?: string[];
            maintenance_requirements?: string[];
            standards?: string[];
          };
          implementation: {
            priority: 'high' | 'medium' | 'low';
            estimated_duration: number;
            complexity: 'simple' | 'moderate' | 'complex';
            required_skills?: string[];
            prerequisites?: string[];
          };
          economic_impact: {
            investment_cost: number;
            annual_savings: number;
            maintenance_cost: number;
            lifespan: number;
            roi_period: number;
            payback_period: number;
          };
          environmental_impact: {
            co2_reduction: number;
            energy_savings: number;
            water_savings?: number;
          };
          status: 'proposed' | 'approved' | 'rejected' | 'implemented';
          created_at: string;
          updated_at: string;
          created_by: string;
          approved_by?: string;
          approval_date?: string;
        };
        Insert: Omit<Database['public']['Tables']['technical_solutions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['technical_solutions']['Insert']>;
      };
      project_media: {
        Row: {
          id: string;
          project_id: string;
          category_id: string | null;
          sub_category_id: string | null;
          type: 'image' | 'document' | 'report';
          url: string;
          filename: string;
          size: number;
          metadata: {
            mime_type: string;
            description?: string;
            tags?: string[];
          };
          uploaded_by: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['project_media']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['project_media']['Insert']>;
      };
      comments: {
        Row: {
          id: string;
          project_id: string;
          category_id: string | null;
          sub_category_id: string | null;
          content: string;
          author_id: string;
          created_at: string;
          updated_at: string;
          parent_id: string | null;
        };
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['comments']['Insert']>;
      };
      project_shares: {
        Row: {
          id: string;
          project_id: string;
          shared_with: string;
          share_type: 'user' | 'organization';
          permission: 'read' | 'write' | 'admin';
          created_by: string;
          created_at: string;
          expires_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['project_shares']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['project_shares']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'assessment_update' | 'comment' | 'share' | 'mention';
          content: {
            title: string;
            message: string;
            link?: string;
          };
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      global_results: {
        Row: {
          id: string;
          project_id: string;
          final_class: 'A' | 'B' | 'C' | 'D' | 'NA';
          enabled_categories: string[];
          disabled_categories: string[];
          last_updated: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['global_results']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['global_results']['Insert']>;
      };
    };
  };
};
