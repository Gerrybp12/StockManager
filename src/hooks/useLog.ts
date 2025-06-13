"use client";
import { supabase } from "@/lib/supabaseClient";
import { productService } from "@/services/supabaseService";
import { Log } from "@/types/log";
import { useEffect, useState } from "react";

export const useLog = (autoFetch: boolean = true) => {
  const [loading, setLoading] = useState(autoFetch);
  const [logs, setLogs] = useState<Log[]>([]);
  const [error, setError] = useState<string | null>(null);

  const newLog = async (action: string, description: string) => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from("log")
        .insert({
          action: action,
          description: description,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create log: ${error.message}`);
      }

      // Add the new log to the existing logs state only if we have fetched logs
      if (data && logs.length > 0) {
        setLogs((prev) => [data, ...prev]);
      }

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create log";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.fetchLogs();
      setLogs(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch logs";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshLogs = () => {
    fetchLogs();
  };

  // Only auto-fetch logs if autoFetch is true
  useEffect(() => {
    if (autoFetch) {
      fetchLogs();
    } else {
      setLoading(false);
    }
  }, [autoFetch]);

  return {
    // Data
    logs,

    // Loading states
    loading,
    error,

    // Actions
    newLog,
    fetchLogs,
    refreshLogs,
  };
};
