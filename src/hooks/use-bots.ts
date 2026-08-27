import { useCachedPromise } from "@raycast/utils";
import { listAgents } from "../lib/gateway";
import { Bot, GatewayError } from "../lib/types";

export function useBots(): {
  bots: Bot[];
  error: GatewayError | null;
  isLoading: boolean;
  revalidate: () => void;
} {
  const { data, isLoading, revalidate } = useCachedPromise(listAgents, [], {
    keepPreviousData: true,
  });

  if (data && !data.ok) {
    return { bots: [], error: data.error, isLoading, revalidate };
  }

  return {
    bots: data?.ok ? data.value : [],
    error: null,
    isLoading,
    revalidate,
  };
}
