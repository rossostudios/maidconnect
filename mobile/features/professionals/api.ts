import { supabase } from "@/lib/supabase";

import { mapProfessionalRecord } from "./transformers";
import type { ProfessionalProfile, ProfessionalRecord } from "./types";

export type FetchProfessionalsParams = {
  latitude?: number;
  longitude?: number;
  limit?: number;
};

export async function fetchProfessionals({
  latitude,
  longitude,
  limit,
}: FetchProfessionalsParams = {}): Promise<ProfessionalProfile[]> {
  const { data, error } = await supabase.rpc("list_active_professionals", {
    p_customer_lat: latitude ?? null,
    p_customer_lon: longitude ?? null,
  });

  if (error) {
    throw error;
  }

  const records = Array.isArray(data) ? (data as ProfessionalRecord[]) : [];

  const mapped = records
    .map(mapProfessionalRecord)
    .filter((value): value is ProfessionalProfile => Boolean(value));

  return typeof limit === "number" ? mapped.slice(0, limit) : mapped;
}

export async function fetchProfessionalDetails(profileId: string): Promise<ProfessionalProfile> {
  const { data, error } = await supabase.rpc("list_active_professionals", {
    p_customer_lat: null,
    p_customer_lon: null,
  });

  if (error) {
    throw error;
  }

  const records = Array.isArray(data) ? (data as ProfessionalRecord[]) : [];
  const professional = records.find((record) => record.profile_id === profileId);

  if (!professional) {
    throw new Error("Professional not found");
  }

  const mapped = mapProfessionalRecord(professional);

  if (!mapped) {
    throw new Error("Failed to map professional data");
  }

  return mapped;
}
