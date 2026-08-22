import { UI } from "../../constants/ui";
import type { SessionDto } from "../../features/auth";
import type { PetState } from "../../types";
import { PrimaryButton } from "../shared/primary-button";
import { HomeCompanionChatPanel } from "./home-companion-chat-panel";

interface CompanionChatScreenProps {
  pet: PetState;
  session: SessionDto;
  onBack: () => void;
}

/** Full-page fallback; preferred path is the home right-panel chat. */
export function CompanionChatScreen({ pet, session, onBack }: CompanionChatScreenProps) {
  return (
    <main className="yume-shell yume-home yume-home--lookup mx-auto flex min-h-screen max-w-3xl flex-col p-4">
      <header className="mb-3 flex items-center justify-between">
        <PrimaryButton variant="text" onClick={onBack}>
          {UI.backHome}
        </PrimaryButton>
        <h1 className="text-lg font-bold text-[color:#fff8eb]">{UI.companionChatTitle}</h1>
        <span className="w-16" />
      </header>
      <div className="yume-home__study yume-home__study--chat min-h-0 flex-1">
        <HomeCompanionChatPanel pet={pet} session={session} />
      </div>
    </main>
  );
}
