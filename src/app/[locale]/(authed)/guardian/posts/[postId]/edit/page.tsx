import { notFound } from "next/navigation";
import { mockContentPosts } from "@/data/mock";
import { GuardianRoutePostEditor } from "@/components/guardian/guardian-route-post-editor";
import { postHasRouteJourney } from "@/lib/content-post-route";

const MOCK_GUARDIAN_ID = "g1";

type Props = { params: Promise<{ postId: string }> };

export default async function GuardianEditRoutePostPage({ params }: Props) {
  const { postId } = await params;
  const post = mockContentPosts.find((p) => p.id === postId);
  if (!post || post.author_user_id !== MOCK_GUARDIAN_ID || !postHasRouteJourney(post)) {
    notFound();
  }
  return <GuardianRoutePostEditor mode="edit" initialPost={post} />;
}
