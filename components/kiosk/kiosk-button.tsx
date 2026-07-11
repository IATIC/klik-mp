import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";

/** Touch-first default button for kiosk actions. */
export function KioskButton(props: ComponentProps<typeof Button>) {
  return <Button size="kiosk" {...props} />;
}
