"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getClientsByOrganization } from "@/db/queries/clients";
import { requireOrganizationId } from "@/lib/supabase/auth-helpers";
import type { Client } from "@/db/schema/clients";

interface ClientSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  organizationId?: string;
}

export function ClientSelect({ value, onValueChange, organizationId }: ClientSelectProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadClients() {
      try {
        // For client components, we'll need to pass orgId from server or use a different approach
        // For now, this is a placeholder - we'll need to fetch clients via server action
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading clients:", error);
        setIsLoading(false);
      }
    }
    loadClients();
  }, [organizationId]);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={isLoading}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? "Loading..." : "Select client"} />
      </SelectTrigger>
      <SelectContent>
        {clients.map((client) => (
          <SelectItem key={client.id} value={client.id}>
            {client.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

