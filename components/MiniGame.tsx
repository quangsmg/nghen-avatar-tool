"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { SiteHeader } from "./SiteHeader";
import {
  isSupabaseConfigured,
  supabase,
  type ClassRow,
  type FactionRow,
  type PlayerRow,
} from "@/lib/supabaseClient";
import styles from "./MiniGame.module.css";

type Tab = "class" | "faction";
type FlowStep = null | "profile" | "faction" | "checkin";
const INTENT_KEY = "mg_checkin_intent";
const REF_KEY = "mg_ref_faction";

function metaName(user: User | null): string {
  const m = user?.user_metadata ?? {};
  return (m.full_name || m.name || m.user_name || "").toString();
}
function metaAvatar(user: User | null): string | null {
  const m = user?.user_metadata ?? {};
  return (m.avatar_url || m.picture || null) as string | null;
}

function Avatar({
  url,
  name,
  size = 32,
}: {
  url: string | null;
  name: string;
  size?: number;
}) {
  const style = { width: size, height: size } as const;
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={styles.avatar}
        style={style}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
      />
    );
  }
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span className={styles.avatarFallback} style={style} aria-hidden>
      {initial}
    </span>
  );
}

export function MiniGame() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [myPlayer, setMyPlayer] = useState<PlayerRow | null>(null);

  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [factions, setFactions] = useState<FactionRow[]>([]);
  const [players, setPlayers] = useState<PlayerRow[]>([]);

  const [tab, setTab] = useState<Tab>("class");
  const [flowStep, setFlowStep] = useState<FlowStep>(null);

  const [formName, setFormName] = useState("");
  const [formClass, setFormClass] = useState<string | null>(null);
  const [formFaction, setFormFaction] = useState<string | null>(null);
  const [newFaction, setNewFaction] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const [declinePrompt, setDeclinePrompt] = useState(false);

  const toastTimer = useRef<number | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  // Giữ bản mới nhất của danh sách hội để các callback (closure) đọc không bị cũ.
  const factionsRef = useRef<FactionRow[]>([]);
  useEffect(() => {
    factionsRef.current = factions;
  }, [factions]);

  // Đọc hội được giới thiệu qua link (?hoi=...) và nhớ lại qua phiên đăng nhập.
  useEffect(() => {
    const hoi = new URLSearchParams(window.location.search).get("hoi");
    if (hoi) {
      sessionStorage.setItem(REF_KEY, hoi);
      // Dọn query cho URL gọn, nhưng vẫn giữ ref trong sessionStorage.
      const clean = window.location.pathname + window.location.hash;
      window.history.replaceState(null, "", clean);
    }
  }, []);

  const fetchBoard = useCallback(async () => {
    if (!supabase) return;
    const [c, f, p] = await Promise.all([
      supabase.from("classes").select("*").order("sort_order"),
      supabase.from("factions").select("*"),
      supabase
        .from("players")
        .select("id, display_name, class_id, faction_id, avatar_url, created_at")
        .order("created_at", { ascending: false }),
    ]);
    if (c.data) setClasses(c.data as ClassRow[]);
    if (f.data) setFactions(f.data as FactionRow[]);
    if (p.data) setPlayers(p.data as PlayerRow[]);
  }, []);

  const loadMyPlayer = useCallback(async (uid: string) => {
    if (!supabase) return null;
    const { data } = await supabase
      .from("players")
      .select("id, display_name, class_id, faction_id, avatar_url, created_at")
      .eq("id", uid)
      .maybeSingle();
    setMyPlayer((data as PlayerRow) ?? null);
    return (data as PlayerRow) ?? null;
  }, []);

  // Khởi tạo: nạp bảng xếp hạng + theo dõi phiên đăng nhập.
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    fetchBoard();

    // onAuthStateChange phát INITIAL_SESSION sau khi đã đọc token từ URL,
    // nên xử lý phiên + mở form điểm danh ở đây cho chắc chắn.
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          const mine = await loadMyPlayer(u.id);
          // Vừa đăng nhập từ nút CTA mà chưa điểm danh -> mở form.
          if (!mine && sessionStorage.getItem(INTENT_KEY)) {
            sessionStorage.removeItem(INTENT_KEY);
            openProfile(u, null);
          }
        } else {
          setMyPlayer(null);
        }
        setLoading(false);
      },
    );

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchBoard, loadMyPlayer]);

  // Làm mới bảng xếp hạng định kỳ cho cảm giác "đang đua".
  useEffect(() => {
    if (!supabase) return;
    const id = window.setInterval(fetchBoard, 15_000);
    return () => window.clearInterval(id);
  }, [fetchBoard]);

  function openProfile(u: User | null, mine: PlayerRow | null) {
    // Người mới đến từ link giới thiệu -> tự chọn sẵn hội của người rủ
    // (chỉ khi hội đó có thật trong danh sách).
    const refHoi = sessionStorage.getItem(REF_KEY);
    const validRef =
      refHoi && factionsRef.current.some((f) => f.id === refHoi)
        ? refHoi
        : null;
    setFormName(mine?.display_name || metaName(u) || "");
    setFormClass(mine?.class_id ?? null);
    setFormFaction(mine?.faction_id ?? validRef);
    setNewFaction("");
    setFlowStep("profile");
  }

  // ---- Bảng xếp hạng (tính phía client) ----
  const classBoard = useMemo(() => {
    const by = new Map<string, PlayerRow[]>();
    for (const p of players) {
      if (!p.class_id) continue;
      const arr = by.get(p.class_id) ?? [];
      arr.push(p);
      by.set(p.class_id, arr);
    }
    return classes
      .map((c) => ({ key: c.id, name: c.label, members: by.get(c.id) ?? [] }))
      .sort(
        (a, b) =>
          b.members.length - a.members.length ||
          a.name.localeCompare(b.name, "vi"),
      );
  }, [players, classes]);

  const factionBoard = useMemo(() => {
    const by = new Map<string, PlayerRow[]>();
    for (const p of players) {
      if (!p.faction_id) continue;
      const arr = by.get(p.faction_id) ?? [];
      arr.push(p);
      by.set(p.faction_id, arr);
    }
    return factions
      .map((f) => ({ key: f.id, name: f.name, members: by.get(f.id) ?? [] }))
      .sort(
        (a, b) =>
          b.members.length - a.members.length ||
          a.name.localeCompare(b.name, "vi"),
      );
  }, [players, factions]);

  // Mỗi khi rời bước "điểm danh" thì ẩn lời năn nỉ đi cho lần sau.
  useEffect(() => {
    if (flowStep !== "checkin") setDeclinePrompt(false);
  }, [flowStep]);

  const recent = useMemo(() => players.slice(0, 14), [players]);
  const board = tab === "class" ? classBoard : factionBoard;
  const myClassId = myPlayer?.class_id ?? null;
  const myFactionId = myPlayer?.faction_id ?? null;
  const myHighlightKey = tab === "class" ? myClassId : myFactionId;

  // ---- Hành động ----
  const startCheckIn = async () => {
    if (!isSupabaseConfigured || !supabase) {
      showToast("Mini game đang được cấu hình, bạn quay lại sau ít phút nhé!");
      return;
    }
    if (user && myPlayer) {
      openProfile(user, myPlayer); // đã điểm danh -> cho sửa
      return;
    }
    if (user) {
      openProfile(user, null);
      return;
    }
    // Chưa đăng nhập -> đăng nhập Facebook rồi quay lại.
    sessionStorage.setItem(INTENT_KEY, "1");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: window.location.origin,
        // Xin thêm public_profile để chắc chắn có tên + ảnh đại diện.
        // Lưu ý: Supabase mặc định luôn kèm scope "email" (không gỡ được từ
        // client); bật "Allow users without an email" trong Supabase để vẫn
        // đăng nhập được khi người dùng không chia sẻ email.
        scopes: "public_profile",
      },
    });
    if (error) showToast("Không mở được đăng nhập Facebook: " + error.message);
  };

  async function ensureFactionId(): Promise<string | null> {
    if (formFaction) return formFaction;
    const name = newFaction.trim();
    if (!name || !supabase) return null;
    const insert = await supabase
      .from("factions")
      .insert({ name })
      .select("id")
      .single();
    if (!insert.error && insert.data) return insert.data.id as string;
    // Trùng tên -> lấy hội đã có (không phân biệt hoa thường).
    const existing = await supabase
      .from("factions")
      .select("id")
      .ilike("name", name)
      .limit(1)
      .maybeSingle();
    return (existing.data?.id as string) ?? null;
  }

  const submitCheckIn = async () => {
    if (!supabase || !user || submitting) return;
    setSubmitting(true);
    try {
      const factionId = await ensureFactionId();
      const payload = {
        id: user.id,
        display_name: formName.trim() || metaName(user) || "Cựu học sinh",
        class_id: formClass,
        faction_id: factionId,
        avatar_url: metaAvatar(user),
      };
      const { data, error } = await supabase
        .from("players")
        .upsert(payload)
        .select("id, display_name, class_id, faction_id, avatar_url, created_at")
        .single();
      if (error) {
        showToast("Điểm danh chưa được: " + error.message);
        return;
      }
      setMyPlayer(data as PlayerRow);
      setFlowStep(null);
      setJustCheckedIn(true);
      setTab(factionId ? "faction" : "class");
      await fetchBoard();
    } finally {
      setSubmitting(false);
    }
  };

  const share = async () => {
    // Ưu tiên kèm mã hội của mình để bạn bè bấm vào là vào thẳng hội.
    const hoi = myPlayer?.faction_id;
    const url = hoi
      ? `${window.location.origin}/?hoi=${encodeURIComponent(hoi)}`
      : window.location.origin;
    const text =
      'Tớ vừa điểm danh "Cuộc hẹn 20 năm" THPT Nghèn khóa 2003-2006! ' +
      "Vào đua top sĩ số cùng hội mình nào 👉";
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      showToast("Đã copy link rồi, đi gửi cho bạn bè nhé! 💚");
    } catch {
      // Một số trình duyệt chặn clipboard -> vẫn cho người dùng thấy link.
      showToast("Copy link này gửi bạn bè nhé: " + url);
    }
  };

  const deleteMyData = async () => {
    if (!supabase || !user) return;
    if (
      !window.confirm(
        "Xóa toàn bộ dữ liệu điểm danh của bạn? Lớp/hội của bạn sẽ bị trừ 1 quân số và bạn sẽ được đăng xuất.",
      )
    )
      return;
    const { error } = await supabase.from("players").delete().eq("id", user.id);
    if (error) {
      showToast("Xóa chưa được: " + error.message);
      return;
    }
    setMyPlayer(null);
    setJustCheckedIn(false);
    await supabase.auth.signOut();
    setUser(null);
    await fetchBoard();
    showToast("Đã xóa dữ liệu của bạn. Hẹn gặp lại!");
  };

  // Chọn "không tham gia": nếu đã điểm danh trước đó thì gỡ khỏi danh sách
  // (lưu đúng trạng thái không tham gia), còn người mới thì chỉ đóng lại.
  const declineParticipation = async () => {
    setDeclinePrompt(false);
    setFlowStep(null);
    if (supabase && user && myPlayer) {
      const { error } = await supabase
        .from("players")
        .delete()
        .eq("id", user.id);
      if (error) {
        showToast("Cập nhật chưa được: " + error.message);
        return;
      }
      setMyPlayer(null);
      setJustCheckedIn(false);
      await fetchBoard();
    }
    showToast("Đã ghi nhận em chưa tham gia. Khi nào đổi ý cứ quay lại nhé ❤️");
  };

  return (
    <div className={styles.page}>
      <div className={styles.bg} aria-hidden />
      <SiteHeader
        active="minigame"
        title="Đua Top Sĩ Số"
        subtitle="Mi sẽ về tham dự hội khóa cùng choa chứ?"
      />

      {!isSupabaseConfigured && (
        <div className={styles.configNote}>
          ⚙️ Mini game cần cấu hình Supabase (biến môi trường + đăng nhập
          Facebook). Phần giao diện vẫn xem được, chức năng điểm danh sẽ hoạt
          động sau khi cấu hình xong.
        </div>
      )}

      {(justCheckedIn || (myPlayer && !flowStep)) && (
        <div className={styles.celebrate}>
          <div className={styles.celebrateMain}>
            🎉 <strong>{myPlayer?.display_name}</strong> đã điểm danh!
          </div>
          <div className={styles.celebrateSub}>
            {myPlayer?.class_id ? `Lớp ${myPlayer.class_id}` : "Bạn"}
            {myFactionId
              ? ` & ${
                  factions.find((f) => f.id === myFactionId)?.name ?? "hội của bạn"
                }`
              : ""}{" "}
            vừa được +1 quân số. Rủ thêm đồng bọn để giật top nhé!
          </div>
          <div className={styles.celebrateActions}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={share}>
              Khoe & rủ hội bạn
            </button>
            <button
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={() => myPlayer && openProfile(user, myPlayer)}
            >
              Sửa thông tin
            </button>
          </div>
        </div>
      )}

      <div className={styles.board}>
        <div className={styles.boardHead}>
          <h2 className={styles.boardTitle}>Bảng xếp hạng điểm danh</h2>
          <div className={styles.tabs} role="tablist">
            <button
              role="tab"
              aria-selected={tab === "class"}
              className={`${styles.tab}${tab === "class" ? ` ${styles.tabActive}` : ""}`}
              onClick={() => setTab("class")}
            >
              Đua theo Lớp
            </button>
            <button
              role="tab"
              aria-selected={tab === "faction"}
              className={`${styles.tab}${tab === "faction" ? ` ${styles.tabActive}` : ""}`}
              onClick={() => setTab("faction")}
            >
              Đua theo Hội
            </button>
          </div>
        </div>

        {recent.length > 0 && (
          <div className={styles.recent}>
            <span className={styles.recentLabel}>Vừa điểm danh</span>
            <div className={styles.recentAvatars}>
              {recent.map((p) => (
                <Avatar key={p.id} url={p.avatar_url} name={p.display_name} size={30} />
              ))}
            </div>
          </div>
        )}

        <ul className={styles.rankList}>
          {loading && <li className={styles.empty}>Đang tải bảng xếp hạng…</li>}
          {!loading && board.length === 0 && (
            <li className={styles.empty}>
              Chưa có ai trong bảng này. Hãy là người mở hàng! 🏁
            </li>
          )}
          {board.map((row, i) => {
            const isMine = row.key === myHighlightKey;
            return (
              <li
                key={row.key}
                className={`${styles.rankRow}${isMine ? ` ${styles.rankMine}` : ""}`}
              >
                <span className={`${styles.rank} ${rankClass(i, styles)}`}>
                  {i + 1}
                </span>
                <div className={styles.rankBody}>
                  <div className={styles.rankName}>
                    {row.name}
                    {isMine && <span className={styles.youTag}>bạn ở đây</span>}
                  </div>
                  <div className={styles.miniAvatars}>
                    {row.members.slice(0, 6).map((p) => (
                      <Avatar
                        key={p.id}
                        url={p.avatar_url}
                        name={p.display_name}
                        size={26}
                      />
                    ))}
                    {row.members.length > 6 && (
                      <span className={styles.moreCount}>
                        +{row.members.length - 6}
                      </span>
                    )}
                  </div>
                </div>
                <span className={styles.count}>{row.members.length}</span>
              </li>
            );
          })}
        </ul>

        {myPlayer && !flowStep ? (
          <div className={styles.ctaDone}>✅ Bạn đã điểm danh. Cảm ơn bạn!</div>
        ) : (
          <button
            className={`${styles.btn} ${styles.cta}`}
            onClick={startCheckIn}
            disabled={loading}
          >
            {user && !myPlayer
              ? "TIẾP TỤC ĐIỂM DANH →"
              : "ĐUA TOP ĐIỂM DANH NGAY!"}
          </button>
        )}
        <p className={styles.ctaHint}>
          Đăng nhập Facebook 1 chạm để lấy tên &amp; ảnh đại diện, chống tài khoản
          ảo cày điểm cho lớp.
        </p>
      </div>

      {/* ===== Luồng điểm danh (overlay) ===== */}
      {flowStep && (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <div className={styles.sheet}>
            <button
              className={styles.sheetClose}
              onClick={() => setFlowStep(null)}
              aria-label="Đóng"
            >
              ✕
            </button>

            {flowStep === "profile" && (
              <div className={styles.step}>
                <div className={styles.stepBadge}>Bước 1/3</div>
                <h3 className={styles.stepTitle}>
                  Điểm danh nào. Em tên gì? Học lớp nào?
                </h3>
                <div className={styles.meRow}>
                  <Avatar url={metaAvatar(user)} name={formName} size={48} />
                  <input
                    className={styles.input}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Tên / biệt danh thời đi học"
                    maxLength={40}
                  />
                </div>
                <div className={styles.fieldLabel}>Chọn lớp của em</div>
                <div className={styles.classGrid}>
                  {classes.length === 0 && (
                    <span className={styles.empty}>Danh sách lớp đang tải…</span>
                  )}
                  {classes.map((c) => (
                    <button
                      key={c.id}
                      className={`${styles.chip}${formClass === c.id ? ` ${styles.chipActive}` : ""}`}
                      onClick={() => setFormClass(c.id)}
                    >
                      {c.id}
                    </button>
                  ))}
                </div>
                <button
                  className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`}
                  disabled={!formName.trim() || !formClass}
                  onClick={() => setFlowStep("faction")}
                >
                  Tiếp tục →
                </button>
              </div>
            )}

            {flowStep === "faction" && (
              <div className={styles.step}>
                <div className={styles.stepBadge}>Bước 2/3</div>
                <h3 className={styles.stepTitle}>Em thuộc team nào không?</h3>
                <p className={styles.stepDesc}>
                  Chọn một hội đang có, hoặc tự lập hội mới cực độc lạ.
                </p>
                <div className={styles.factionList}>
                  {factionBoard.map((f) => (
                    <button
                      key={f.key}
                      className={`${styles.factionItem}${formFaction === f.key && !newFaction.trim() ? ` ${styles.factionActive}` : ""}`}
                      onClick={() => {
                        setFormFaction(f.key);
                        setNewFaction("");
                      }}
                    >
                      <span className={styles.factionName}>{f.name}</span>
                      <span className={styles.factionCount}>{f.members.length}</span>
                    </button>
                  ))}
                </div>
                <div className={styles.fieldLabel}>… hoặc lập hội mới</div>
                <input
                  className={styles.input}
                  value={newFaction}
                  onChange={(e) => {
                    setNewFaction(e.target.value);
                    if (e.target.value.trim()) setFormFaction(null);
                  }}
                  placeholder="VD: Hội bàn cuối huyền thoại"
                  maxLength={48}
                />
                <div className={styles.stepActions}>
                  <button
                    className={`${styles.btn} ${styles.btnGhost}`}
                    onClick={() => {
                      setFormFaction(null);
                      setNewFaction("");
                      setFlowStep("checkin");
                    }}
                  >
                    Bỏ qua
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={() => setFlowStep("checkin")}
                  >
                    Tiếp tục →
                  </button>
                </div>
              </div>
            )}

            {flowStep === "checkin" && (
              <div className={styles.step}>
                <div className={styles.stepBadge}>Bước 3/3</div>
                <h3 className={styles.stepTitle}>
                  Điểm danh: Em <strong>{formName.trim() || "ấy"}</strong> có dám
                  tham gia hội khóa không?
                </h3>
                <p className={styles.stepDesc}>
                  Bấm “Em có mặt!” để cộng 1 điểm cho{" "}
                  <strong>{formClass ? `lớp ${formClass}` : "lớp của em"}</strong>
                  {newFaction.trim()
                    ? ` & hội "${newFaction.trim()}"`
                    : formFaction
                      ? ` & ${factionBoard.find((f) => f.key === formFaction)?.name ?? "hội của em"}`
                      : ""}
                  .
                </p>
                <button
                  className={`${styles.btn} ${styles.btnPresent}`}
                  onClick={submitCheckIn}
                  disabled={submitting}
                >
                  {submitting ? "Đang điểm danh…" : "EM CÓ MẶT! 🙋"}
                </button>
                {!declinePrompt ? (
                  <button
                    className={styles.declineBtn}
                    onClick={() => setDeclinePrompt(true)}
                    disabled={submitting}
                  >
                    Em không dám…
                  </button>
                ) : (
                  <div className={styles.declineBox}>
                    <p className={styles.declineNag}>
                      Thanh xuân chỉ có một lần thôi mà… 🥺 Cả hội đang ngóng em
                      về, nỡ lòng nào lỗi hẹn?
                    </p>
                    <button
                      className={`${styles.btn} ${styles.btnPresent}`}
                      onClick={() => setDeclinePrompt(false)}
                      disabled={submitting}
                    >
                      Thôi được, em tham gia! 🙋
                    </button>
                    <button
                      className={styles.declineBtn}
                      onClick={declineParticipation}
                      disabled={submitting}
                    >
                      Đành lỗi hẹn, em không tham gia được
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {myPlayer && (
        <div className={styles.dataFooter}>
          <button className={styles.dataDeleteLink} onClick={deleteMyData}>
            Xóa dữ liệu của tôi
          </button>
        </div>
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}

function rankClass(i: number, styles: Record<string, string>): string {
  if (i === 0) return styles.rankGold;
  if (i === 1) return styles.rankSilver;
  if (i === 2) return styles.rankBronze;
  return "";
}
