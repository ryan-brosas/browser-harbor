import { type Static, Type } from "typebox";

export const statusSchema = Type.Object(
  {
    project: Type.Literal("browser-harbor"),
    host: Type.Literal("pi"),
    phase: Type.Literal("bootstrap"),
    browser: Type.Literal("not-implemented"),
    availableTools: Type.Array(Type.Literal("browser_harbor_status"), {
      minItems: 1,
      maxItems: 1,
    }),
  },
  { additionalProperties: false },
);

export type HarborStatus = Static<typeof statusSchema>;

export function getStatus(): HarborStatus {
  return {
    project: "browser-harbor",
    host: "pi",
    phase: "bootstrap",
    browser: "not-implemented",
    availableTools: ["browser_harbor_status"],
  };
}
