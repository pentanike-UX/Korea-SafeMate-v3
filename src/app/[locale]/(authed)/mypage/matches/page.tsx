import { MypageMatchesView } from "@/components/mypage/mypage-matches-view";
import { resolveMypageSessionRole } from "@/lib/mypage-account.server";

export default async function MypageMatchesPage() {
  const { appRole } = await resolveMypageSessionRole();
  return <MypageMatchesView appRole={appRole} />;
}
