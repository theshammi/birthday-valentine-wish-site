import { getConfig, getWishes, getMemories } from "./actions";
import CelebrationPage from "../components/CelebrationPage";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [config, wishes, memories] = await Promise.all([
    getConfig(),
    getWishes(),
    getMemories()
  ]);

  return (
    <CelebrationPage
      config={config}
      initialWishes={wishes}
      initialMemories={memories}
    />
  );
}
