"use client";

import type { PlayerRow } from "@/lib/supabaseClient";
import styles from "./RaceTrack.module.css";

export type RaceGroup = { key: string; name: string; members: PlayerRow[] };

// Cột cao nhất chỉ chạm ~70% chiều cao đường đua -> luôn còn 1 khoảng tới đích.
const PEAK = 70;

function shortLabel(tab: "class" | "faction", g: RaceGroup): string {
  if (tab === "class") return g.key; // hiện đầy đủ: 12/1, 12/2…
  return g.name.length > 7 ? g.name.slice(0, 6) + "…" : g.name;
}

export function RaceTrack({
  tab,
  groups,
  myKey,
}: {
  tab: "class" | "faction";
  groups: RaceGroup[];
  myKey: string | null;
}) {
  const shown =
    tab === "class"
      ? groups.slice(0, 12)
      : groups.filter((g) => g.members.length > 0).slice(0, 12);

  const maxCount = shown.reduce((m, g) => Math.max(m, g.members.length), 0);

  return (
    <div className={styles.track}>
      <div className={styles.finish} aria-hidden />
      <span className={styles.finishLabel}>🏁 VẠCH ĐÍCH</span>

      {shown.length === 0 ? (
        <div className={styles.empty}>Chưa có tay đua nào. Vào đua ngay! 🏁</div>
      ) : (
        <div className={styles.lanes}>
          {shown.map((g, i) => {
            const n = g.members.length;
            const pct = maxCount === 0 ? 0 : (n / maxCount) * PEAK;
            const h = n > 0 ? Math.max(pct, 6) : 0;
            const rankCls =
              i === 0
                ? styles.gold
                : i === 1
                  ? styles.silver
                  : i === 2
                    ? styles.bronze
                    : "";
            const mine = g.key === myKey;
            return (
              <div className={styles.lane} key={g.key}>
                <div className={styles.laneTrack}>
                  <div
                    className={`${styles.bar} ${rankCls}${mine ? ` ${styles.barMine}` : ""}`}
                    style={{ height: `${h}%` }}
                  >
                    <span className={styles.car}>
                      {n > 0 && <span className={styles.carCount}>{n}</span>}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className={styles.carIcon}
                        src="/files/car.png"
                        alt="xe đua"
                        decoding="async"
                      />
                    </span>
                  </div>
                </div>
                <div
                  className={`${styles.laneLabel}${mine ? ` ${styles.laneLabelMine}` : ""}`}
                  title={g.name}
                >
                  {shortLabel(tab, g)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
