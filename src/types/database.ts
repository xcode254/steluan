// src/types/database.ts
// Type definitions matching 001_initial_schema.sql
// Regenerate from live schema: npm run db:types

export type UserRole         = 'admin' | 'agent' | 'viewer'
export type PropertyStatus   = 'active' | 'sold' | 'rented' | 'archived'
export type PropertyType     = 'For Sale' | 'For Rent'
export type PropertyCategory = 'house' | 'apartment' | 'land' | 'commercial'
export type PropertyTag      = 'Featured' | 'New' | 'Hot'
export type ViewingStatus    = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface Profile {
  id:         string
  full_name:  string
  avatar_url: string | null
  phone:      string | null
  role:       UserRole
  created_at: string
  updated_at: string
}

export interface Property {
  id:            string
  agent_id:      string
  name:          string
  description:   string | null
  price:         number
  currency:      string
  type:          PropertyType
  category:      PropertyCategory
  tag:           PropertyTag
  status:        PropertyStatus
  beds:          number
  baths:         number
  sqm:           number
  location:      string
  latitude:      number | null
  longitude:     number | null
  amenities:     string[]
  primary_image: string | null
  search_vector: string | null
  created_at:    string
  updated_at:    string
  // Joined via select
  agent?:  Profile
  images?: PropertyImage[]
}

export interface PropertyImage {
  id:           string
  property_id:  string
  url:          string
  storage_path: string
  is_primary:   boolean
  sort_order:   number
  uploaded_by:  string
  created_at:   string
}

export interface ViewingRequest {
  id:            string
  property_id:   string
  requester_id:  string | null
  contact_name:  string
  contact_email: string
  contact_phone: string | null
  preferred_at:  string | null
  message:       string | null
  status:        ViewingStatus
  agent_notes:   string | null
  created_at:    string
  updated_at:    string
  property?:     Property
}

export interface AuditLog {
  id:         number
  actor_id:   string | null
  action:     string
  table_name: string
  record_id:  string
  old_data:   Record<string, unknown> | null
  new_data:   Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

// Typed DB wrapper used by createClient<Database>()
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row:    Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      properties: {
        Row:    Property
        Insert: Omit<Property, 'id' | 'search_vector' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Property, 'id' | 'search_vector' | 'created_at'>>
      }
      property_images: {
        Row:    PropertyImage
        Insert: Omit<PropertyImage, 'id' | 'created_at'>
        Update: Partial<Omit<PropertyImage, 'id' | 'created_at'>>
      }
      viewing_requests: {
        Row:    ViewingRequest
        Insert: Omit<ViewingRequest, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ViewingRequest, 'id' | 'created_at'>>
      }
      audit_log: {
        Row:    AuditLog
        Insert: never   // insert-only via trigger
        Update: never   // immutable
      }
    }
    Functions: {
      search_properties: {
        Args: {
          query?:         string
          prop_type?:     string
          prop_category?: string
          min_price?:     number
          max_price?:     number
          min_beds?:      number
          location_q?:    string
          lim?:           number
          offs?:          number
        }
        Returns: Property[]
      }
      current_user_role: {
        Args:    Record<string, never>
        Returns: UserRole
      }
    }
    // Present as an empty placeholder — no database views defined.
    Views: {
      [_ in never]: never
    }
    // Maps our actual Postgres enums (migration 001/005). Recent
    // @supabase/supabase-js versions expect Views/Enums/CompositeTypes
    // to be present on the Database type — even as empty placeholders
    // — for its generic Row-type resolution to work at all. Omitting
    // them (as this file previously did) can silently collapse Row
    // types to `never` throughout the app, which is a much harder bug
    // to trace back to "a few missing type keys" than this comment
    // makes it sound.
    Enums: {
      user_role:         UserRole
      property_status:   PropertyStatus
      property_type:     PropertyType
      property_category: PropertyCategory
      property_tag:      PropertyTag
      viewing_status:    ViewingStatus
    }
    // Present as an empty placeholder — no composite types defined.
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
