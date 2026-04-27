import { Link } from "react-router-dom";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type HistoryItem = {
  shortCode: string;
  title: string;
  artist: string;
  convertedAt: string;
};

const MOCK_HISTORY: HistoryItem[] = [
  { shortCode: "ab9k3p", title: "Dynamite", artist: "BTS", convertedAt: "2026-04-26" },
  { shortCode: "ab2x71", title: "Spring Day", artist: "BTS", convertedAt: "2026-04-25" },
  { shortCode: "ab8yfa", title: "Antifragile", artist: "LE SSERAFIM", convertedAt: "2026-04-22" },
  { shortCode: "abq04m", title: "Drama", artist: "aespa", convertedAt: "2026-04-19" },
];

const HistoryPage = () => {
  const handleCopy = (shortCode: string) => {
    navigator.clipboard.writeText(`https://playona.io/t/${shortCode}`);
    toast.success("링크가 복사되었습니다!");
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
          히스토리
        </h1>
        <p className="text-muted-foreground mb-8">
          최근에 변환한 링크 목록입니다.
        </p>

        {MOCK_HISTORY.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">
              아직 변환한 링크가 없어요.
            </p>
          </div>
        ) : (
          <ul className="space-y-3 animate-slide-up">
            {MOCK_HISTORY.map((item) => (
              <li
                key={item.shortCode}
                className="rounded-xl bg-card border border-border p-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {item.title}{" "}
                    <span className="text-muted-foreground font-normal">
                      · {item.artist}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                    playona.io/t/{item.shortCode}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {item.convertedAt}
                </span>
                <button
                  onClick={() => handleCopy(item.shortCode)}
                  aria-label="링크 복사"
                  className="w-9 h-9 rounded-lg bg-secondary hover:bg-secondary/70 text-secondary-foreground flex items-center justify-center transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <Link
                  to={`/result/${item.shortCode}`}
                  aria-label="자세히 보기"
                  className="w-9 h-9 rounded-lg bg-secondary hover:bg-secondary/70 text-secondary-foreground flex items-center justify-center transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
