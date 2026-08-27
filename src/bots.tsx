import { Action, ActionPanel, Icon, List, openExtensionPreferences, useNavigation } from "@raycast/api";
import { useMemo, useState } from "react";
import { useBots } from "./hooks/use-bots";
import { filterBotsForList } from "./lib/match-bot";
import { openGrokBot } from "./lib/open-app";
import { Bot, statusLabel } from "./lib/types";
import { AskForm } from "./views/ask-form";
import { GatewayEmptyView, HiddenBotsEmptyView, SearchEmptyView } from "./views/gateway-empty";

function BotListItem({ bot, bots, onRefresh }: { bot: Bot; bots: Bot[]; onRefresh: () => void }) {
  const { push } = useNavigation();
  const accessory = statusLabel(bot.status);
  const subtitle = bot.title || bot.description || bot.lastPreview || undefined;

  return (
    <List.Item
      id={bot.id}
      title={bot.name}
      subtitle={subtitle}
      icon={bot.avatarDataUrl ?? Icon.Person}
      accessories={accessory ? [{ text: accessory }] : []}
      actions={
        <ActionPanel>
          <Action
            title="Ask Bot"
            icon={Icon.Message}
            onAction={() => {
              push(<AskForm bots={bots} initialBotId={bot.id} />);
            }}
          />
          <Action title="Open Grok Bot" icon={Icon.AppWindow} onAction={openGrokBot} />
          <ActionPanel.Section>
            <Action.CopyToClipboard title="Copy Name" content={bot.name} />
            <Action.CopyToClipboard title="Copy ID" content={bot.id} />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={onRefresh} />
            <Action title="Open Preferences" icon={Icon.Gear} onAction={openExtensionPreferences} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

export default function BotsCommand() {
  const { bots, error, isLoading, revalidate } = useBots();
  const [searchText, setSearchText] = useState("");
  const query = searchText.trim();
  const { groups, individuals, hidden } = useMemo(() => filterBotsForList(bots, query), [bots, query]);
  const listedCount = individuals.length + groups.length + hidden.length;
  const showGatewayEmpty = !isLoading && listedCount === 0 && (error !== null || bots.length === 0);
  const showSearchEmpty = !isLoading && listedCount === 0 && query.length > 0 && bots.length > 0;
  const showHiddenEmpty = !isLoading && listedCount === 0 && query.length === 0 && bots.length > 0;

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search bots"
      onSearchTextChange={setSearchText}
      actions={
        <ActionPanel>
          <Action title="Open Grok Bot" icon={Icon.AppWindow} onAction={openGrokBot} />
          <Action title="Open Preferences" icon={Icon.Gear} onAction={openExtensionPreferences} />
          <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={revalidate} />
        </ActionPanel>
      }
    >
      {showGatewayEmpty ? <GatewayEmptyView error={error} onRetry={revalidate} /> : null}
      {showSearchEmpty ? <SearchEmptyView /> : null}
      {showHiddenEmpty ? <HiddenBotsEmptyView /> : null}

      {individuals.length > 0 ? (
        <List.Section title="Bots">
          {individuals.map((bot) => (
            <BotListItem key={bot.id} bot={bot} bots={bots} onRefresh={revalidate} />
          ))}
        </List.Section>
      ) : null}

      {groups.length > 0 ? (
        <List.Section title="Groups">
          {groups.map((bot) => (
            <BotListItem key={bot.id} bot={bot} bots={bots} onRefresh={revalidate} />
          ))}
        </List.Section>
      ) : null}

      {hidden.length > 0 ? (
        <List.Section title="Hidden">
          {hidden.map((bot) => (
            <BotListItem key={bot.id} bot={bot} bots={bots} onRefresh={revalidate} />
          ))}
        </List.Section>
      ) : null}
    </List>
  );
}
