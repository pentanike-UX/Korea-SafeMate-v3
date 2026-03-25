import { createBlankRoutePost } from "@/lib/guardian-route-post-template";
import { GuardianRoutePostEditor } from "@/components/guardian/guardian-route-post-editor";

export default function GuardianNewRoutePostPage() {
  const initial = createBlankRoutePost({ user_id: "g1", display_name: "Minseo K." });
  return <GuardianRoutePostEditor mode="create" initialPost={initial} />;
}
