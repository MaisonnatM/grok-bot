import { Action, ActionPanel, Form, Icon, Toast, showToast, useNavigation } from "@raycast/api";
import { useForm, FormValidation } from "@raycast/utils";
import { useState } from "react";
import { sendPrompt } from "../lib/gateway";
import { setLastBotId } from "../lib/last-bot";
import { openGrokBot } from "../lib/open-app";
import { AgentId, Bot, gatewayErrorMessage, parseAgentId } from "../lib/types";

type AskFormValues = {
  botId: string;
  message: string;
};

type AskFormProps = {
  bots: Bot[];
  initialBotId?: AgentId;
  initialMessage?: string;
  onSuccess?: () => void;
};

export function AskForm({ bots, initialBotId, initialMessage = "", onSuccess }: AskFormProps) {
  const { pop } = useNavigation();
  const [submitting, setSubmitting] = useState(false);

  const { handleSubmit, itemProps } = useForm<AskFormValues>({
    onSubmit: async (values) => {
      setSubmitting(true);
      const agentIdResult = parseAgentId(values.botId);
      if (!agentIdResult.ok) {
        setSubmitting(false);
        await showToast({
          style: Toast.Style.Failure,
          title: "Send failed",
          message: agentIdResult.error,
        });
        return;
      }

      const bot = bots.find((entry) => entry.id === agentIdResult.value);
      const result = await sendPrompt({
        agentId: agentIdResult.value,
        prompt: values.message.trim(),
      });
      setSubmitting(false);

      if (!result.ok) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Send failed",
          message: gatewayErrorMessage(result.error),
        });
        return;
      }

      await setLastBotId(agentIdResult.value);
      await showToast({
        style: Toast.Style.Success,
        title: `Sent to ${bot?.name ?? "bot"}`,
        primaryAction: {
          title: "Open Grok Bot",
          onAction: () => {
            void openGrokBot();
          },
        },
      });

      if (onSuccess) {
        onSuccess();
      } else {
        pop();
      }
    },
    validation: {
      botId: FormValidation.Required,
      message: FormValidation.Required,
    },
    initialValues: {
      botId: initialBotId ?? bots[0]?.id ?? "",
      message: initialMessage,
    },
  });

  return (
    <Form
      isLoading={submitting}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Send" onSubmit={handleSubmit} />
          <Action title="Open Grok Bot" icon={Icon.AppWindow} onAction={openGrokBot} />
        </ActionPanel>
      }
    >
      <Form.Dropdown title="Bot" {...itemProps.botId}>
        {bots.map((bot) => (
          <Form.Dropdown.Item key={bot.id} value={bot.id} title={bot.name} />
        ))}
      </Form.Dropdown>
      <Form.TextArea title="Task" placeholder="What should the bot do?" {...itemProps.message} />
    </Form>
  );
}
