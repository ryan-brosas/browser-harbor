import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { getStatus, statusSchema } from "./status.ts";

export default function browserHarbor(pi: ExtensionAPI): void {
  pi.registerTool(
    defineTool({
      name: "browser_harbor_status",
      label: "Browser Harbor status",
      description:
        "Report Browser Harbor's implementation status. Does not connect to or inspect a browser. Browser operations are not implemented yet.",
      parameters: Type.Object({}, { additionalProperties: false }),
      outputSchema: statusSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      async execute(_toolCallId, _params, signal) {
        signal?.throwIfAborted();
        const status = getStatus();
        return {
          content: [{ type: "text", text: JSON.stringify(status) }],
          details: status,
          structuredContent: status,
        };
      },
    }),
  );

  pi.registerCommand("browser-harbor", {
    description:
      "Show Browser Harbor implementation status (no browser connection)",
    handler: async () => {
      const status = getStatus();
      pi.sendMessage({
        customType: "browser-harbor-status",
        content: JSON.stringify(status),
        details: status,
        display: true,
      });
    },
  });
}
