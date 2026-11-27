import { LivingStrategyHome } from "@/components/LivingStrategyHome";
import { PageViewTracker } from "@/components/PageViewTracker";
import { CAREER_MILESTONES, STRATEGY_BRANCHES } from "@/data/soniaData";

const INITIAL_BRANCHES = STRATEGY_BRANCHES.map((b) => ({
  ...b,
  published: true,
  updatedAt: "",
}));

const INITIAL_MILESTONES = CAREER_MILESTONES.map((m, i) => ({
  ...m,
  published: true,
  sortOrder: i,
  updatedAt: "",
}));

export default function Home() {
  return (
    <>
      <PageViewTracker />
      <LivingStrategyHome
        initialBranches={INITIAL_BRANCHES}
        initialMilestones={INITIAL_MILESTONES}
        privacyNotice="Anonymous session telemetry helps improve the Living Strategy Tree. No personal visitor profiles are tracked without your consent."
      />
    </>
  );
}
