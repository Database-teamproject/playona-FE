import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SOCIAL_PROVIDERS,
  type SocialProvider,
} from "@/lib/auth";

type SocialLoginButtonProps = {
  provider: SocialProvider;
  onClick: () => void;
  className?: string;
};

const SocialLoginButton = ({
  provider,
  onClick,
  className,
}: SocialLoginButtonProps) => {
  const config = SOCIAL_PROVIDERS[provider];

  return (
    <Button
      type="button"
      onClick={onClick}
      className={className}
      style={{
        backgroundColor: config.accentColor,
        color: config.textColor,
        boxShadow:
          provider === "kakao"
            ? "0 10px 30px -14px hsl(var(--kakao) / 0.9)"
            : undefined,
      }}
    >
      <MessageCircle className="w-4 h-4 fill-current" />
      {config.loginLabel}
    </Button>
  );
};

export default SocialLoginButton;
