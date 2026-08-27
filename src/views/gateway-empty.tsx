import { Action, ActionPanel, Icon, List, openExtensionPreferences } from "@raycast/api";
import { openGrokBot } from "../lib/open-app";
import { GatewayError, gatewayErrorMessage } from "../lib/types";

type EmptyActions = "prefs" | "retry";

type EmptyCopy = {
  title: string;
  description: string;
  actions: EmptyActions;
};

function emptyCopy(error: GatewayError | null): EmptyCopy {
  if (!error) {
    return {
      title: "No bots found",
      description: "Your teammates will show up here once the gateway can see them.",
      actions: "retry",
    };
  }

  switch (error.kind) {
    case "not-configured":
      return {
        title: "Can't reach your bots",
        description: "Open Grok Bot to keep working, or set the gateway URL and token in preferences.",
        actions: "prefs",
      };
    case "unauthorized":
      return {
        title: "Gateway token rejected",
        description: "Check the Gateway Token in extension preferences.",
        actions: "prefs",
      };
    case "unreachable":
      return {
        title: "Can't reach your bots",
        description: error.cause,
        actions: "retry",
      };
    case "rejected":
    case "invalid-response":
      return {
        title: "Couldn't load bots",
        description: gatewayErrorMessage(error),
        actions: "retry",
      };
    default: {
      const _exhaustive: never = error;
      return _exhaustive;
    }
  }
}

function EmptyActionsPanel({ kind, onRetry }: { kind: EmptyActions; onRetry: () => void }) {
  if (kind === "prefs") {
    return (
      <ActionPanel>
        <Action title="Open Grok Bot" icon={Icon.AppWindow} onAction={openGrokBot} />
        <Action title="Open Preferences" icon={Icon.Gear} onAction={openExtensionPreferences} />
      </ActionPanel>
    );
  }

  return (
    <ActionPanel>
      <Action title="Open Grok Bot" icon={Icon.AppWindow} onAction={openGrokBot} />
      <Action title="Retry" icon={Icon.ArrowClockwise} onAction={onRetry} />
    </ActionPanel>
  );
}

export function GatewayEmptyView({ error, onRetry }: { error: GatewayError | null; onRetry: () => void }) {
  const copy = emptyCopy(error);
  return (
    <List.EmptyView
      title={copy.title}
      description={copy.description}
      actions={<EmptyActionsPanel kind={copy.actions} onRetry={onRetry} />}
    />
  );
}

export function SearchEmptyView() {
  return (
    <List.EmptyView
      title="No matching bots"
      description="Try another name, or clear the search."
      actions={
        <ActionPanel>
          <Action title="Open Grok Bot" icon={Icon.AppWindow} onAction={openGrokBot} />
        </ActionPanel>
      }
    />
  );
}

export function HiddenBotsEmptyView() {
  return (
    <List.EmptyView
      title="Hidden bots"
      description="Search by name to find teammates hidden from the sidebar."
      actions={
        <ActionPanel>
          <Action title="Open Grok Bot" icon={Icon.AppWindow} onAction={openGrokBot} />
        </ActionPanel>
      }
    />
  );
}
