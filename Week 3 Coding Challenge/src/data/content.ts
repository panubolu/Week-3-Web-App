import "server-only";

import raw from "../../content/opportunities.json";
import { contentSchema } from "@/domain/opportunities";

// Checked when the server starts. The tests also check it before every build.
export const content = contentSchema.parse(raw);
