import { AmbientParticles } from "@/components/AmbientParticles";
import { AnimatedRoots } from "@/components/AnimatedRoots";
import { CareerBranches } from "@/components/CareerBranches";
import { ConnectionEnding } from "@/components/ConnectionEnding";
import { ExpertiseLeaves } from "@/components/ExpertiseLeaves";
import { IdentityTrunk } from "@/components/IdentityTrunk";
import { IntroScene } from "@/components/IntroScene";
import { PhilosophyScene } from "@/components/PhilosophyScene";
import { ScrollProgress } from "@/components/ScrollProgress";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AmbientParticles />
      <ScrollProgress />

      <main className="relative z-10">
        <IntroScene />
        <AnimatedRoots />
        <IdentityTrunk />
        <CareerBranches />
        <ExpertiseLeaves />
        <PhilosophyScene />
      </main>

      <ConnectionEnding />
    </div>
  );
}
