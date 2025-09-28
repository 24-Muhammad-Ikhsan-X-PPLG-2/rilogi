import LandingPage from "@/components/landing-page";
import { createClient } from "@/utils/supabase/server";
import ChatClient from "./chat/client";
import { getUserProfile } from "@/utils/supabase/lib";

const Home = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return <LandingPage />;
  }
  const profile = await getUserProfile(user);
  return <ChatClient profile={profile!} />;
};

export default Home;
