import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Copy,
  Link2,
  LoaderCircle,
  MoreVertical,
  MousePointerClick,
  Music,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import LoginButton from "@/components/LoginButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import {
  ApiError,
  buildShareUrl,
  linkApi,
  type LinkResponse,
} from "@/lib/api";

const HistoryPage = () => {
  const { isAuthenticated, isReady } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<LinkResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingShortCode, setDeletingShortCode] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!isReady || !isAuthenticated) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    (async () => {
      try {
        const list = await linkApi.my();
        if (!cancelled) setItems(list ?? []);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "히스토리를 불러오지 못했습니다.",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isReady, isAuthenticated]);

  const handleCopy = async (link: LinkResponse) => {
    const url = link.shareUrl || buildShareUrl(link.shortCode);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("링크가 복사되었습니다!");
    } catch {
      toast.error("클립보드 복사에 실패했습니다.");
    }
  };

  const handleDelete = async (shortCode: string) => {
    try {
      await linkApi.delete(shortCode);
      setItems((prev) => prev.filter((item) => item.shortCode !== shortCode));
      toast.success("링크가 삭제되었습니다.");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "삭제에 실패했습니다.",
      );
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
        <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-lg mx-auto rounded-3xl border border-border bg-card/80 backdrop-blur-sm p-8 shadow-card">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            히스토리
          </h1>
          <p className="text-muted-foreground mb-8">
            히스토리를 보려면 먼저 로그인이 필요합니다.
          </p>
          <LoginButton className="w-full rounded-xl h-12 text-sm font-semibold" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
          히스토리
        </h1>
        <p className="text-muted-foreground mb-8">
          최근에 변환한 링크 목록입니다.
        </p>

        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <LoaderCircle className="w-6 h-6 animate-spin text-primary mx-auto" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">
              아직 변환한 링크가 없어요.
            </p>
          </div>
        ) : (
          <ul className="space-y-3 animate-slide-up">
            {items.map((item) => {
              const display =
                (item.shareUrl || buildShareUrl(item.shortCode)).replace(
                  /^https?:\/\//,
                  "",
                );
              const go = () => navigate(`/result/${item.shortCode}`);
              return (
                <li
                  key={item.shortCode}
                  role="link"
                  tabIndex={0}
                  onClick={go}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      go();
                    }
                  }}
                  className="flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-card/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {/* 앨범 커버 썸네일 */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Music className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {item.trackTitle ?? "제목 미상"}{" "}
                      <span className="font-normal text-muted-foreground">
                        · {item.trackArtist ?? "아티스트 미상"}
                      </span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                      <Link2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate font-mono">{display}</span>
                    </p>
                  </div>

                  {typeof item.clickCount === "number" && (
                    <div className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
                      <MousePointerClick className="h-3.5 w-3.5" />
                      클릭 {item.clickCount.toLocaleString()}회
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(item);
                    }}
                    aria-label="링크 복사"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/70"
                  >
                    <Copy className="h-4 w-4" />
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        aria-label="더보기"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/70"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingShortCode(item.shortCode);
                        }}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              );
            })}
          </ul>
        )}

        {/* 삭제 확인 — 모든 행이 공유하는 단일 다이얼로그 */}
        <AlertDialog
          open={deletingShortCode !== null}
          onOpenChange={(open) => {
            if (!open) setDeletingShortCode(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>이 링크를 삭제할까요?</AlertDialogTitle>
              <AlertDialogDescription>
                삭제하면 받은 사람도 더 이상 이 공유 링크를 열 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deletingShortCode) handleDelete(deletingShortCode);
                  setDeletingShortCode(null);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default HistoryPage;
