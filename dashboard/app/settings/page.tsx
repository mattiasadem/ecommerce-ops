import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { YourStoreCard } from "@/components/your-store-card";
import { content } from "@/lib/content";
import { CronHealthCard } from "@/components/cron-health-card";
import { WorkspaceResetCard } from "@/components/workspace-reset-card";
import { WorkspaceBackupCard } from "@/components/workspace-backup-card";

export const dynamic = "force-static";

export const metadata = {
  title: "Settings — Ecommerce Ops",
  description: "Configure your store inputs, view cron health, reset workspace.",
};

export default function SettingsPage() {
  const { generatedAt, counts } = content;
  const lastUpdate = new Date(generatedAt);

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>Settings</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Workspace settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your store inputs, check cron health, and reset the workspace.
        </p>
      </header>

      {/* Your store inputs */}
      <section>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Your store</CardTitle>
                <CardDescription className="text-xs">
                  The numbers every ROI calculator and personalized projection reads from.
                  Stored in your browser only.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px]">localStorage</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <YourStoreCard />
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Cron health */}
      <section>
        <CronHealthCard
          lastUpdate={lastUpdate}
          playbooksCount={counts.playbooks}
          researchCount={counts.researchDocs}
          assetsCount={counts.assets}
        />
      </section>

      <Separator />

      {/* Portable workspace backup */}
      <section>
        <WorkspaceBackupCard />
      </section>

      <Separator />

      {/* Reset workspace */}
      <section>
        <WorkspaceResetCard />
      </section>

      <Separator />

      {/* About */}
      <section className="text-xs text-muted-foreground space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground">
          About
        </h2>
        <p>
          <strong className="text-foreground">Ecommerce Ops</strong> is a static
          Next.js 15 app rendered from{" "}
          <code className="rounded bg-muted px-1">/data/workspace/ecommerce-ops</code>{" "}
          and deployed to Vercel. The cron runs every 6 hours and adds one bounded
          feature per tick.
        </p>
        <p>
          All your-store data lives in your browser&apos;s localStorage. Resetting
          the workspace clears it.
        </p>
      </section>
    </div>
  );
}