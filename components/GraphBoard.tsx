"use client";

import type { PlayerRow } from "@/lib/supabaseClient";
import styles from "./GraphBoard.module.css";

export type GraphGroup = { key: string; name: string; members: PlayerRow[] };

// Hệ toạ độ ảo — SVG tự co giãn theo viewBox nên luôn đẹp ở mọi kích thước.
const W = 1100;
const H = 740;
const CX = W / 2;
const CY = H / 2;
const MAX_AVATARS = 6;

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function GraphBoard({
  tab,
  groups,
}: {
  tab: "class" | "faction";
  groups: GraphGroup[];
}) {
  // Lớp: luôn hiện đủ 12 node. Hội: chỉ hiện hội đã có người (tối đa 12 cho gọn).
  const shown =
    tab === "class"
      ? groups.slice(0, 12)
      : groups.filter((g) => g.members.length > 0).slice(0, 12);

  const n = shown.length;

  if (n === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.empty}>
          Chưa có hội nào điểm danh. Hãy là người mở hàng! 🏁
        </div>
      </div>
    );
  }

  const Rg = Math.min(240, 128 + n * 10);

  const lines: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    main?: boolean;
  }[] = [];
  const groupNodes: {
    x: number;
    y: number;
    bx: number;
    by: number;
    label: string;
    count: number;
    key: string;
  }[] = [];
  const avatars: {
    x: number;
    y: number;
    url: string | null;
    name: string;
    key: string;
  }[] = [];
  const mores: { x: number; y: number; count: number; key: string }[] = [];

  shown.forEach((g, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    const gx = CX + Rg * ux;
    const gy = CY + Rg * uy;
    lines.push({ x1: CX, y1: CY, x2: gx, y2: gy, main: true });
    groupNodes.push({
      x: gx,
      y: gy,
      // Badge nằm phía hướng vào tâm (ngược hướng toả avatar) cho khỏi bị che.
      bx: gx - 38 * ux,
      by: gy - 38 * uy,
      label: tab === "class" ? g.key : g.name,
      count: g.members.length,
      key: g.key,
    });

    const list = g.members.slice(0, MAX_AVATARS);
    const m = list.length;
    const rm = 54 + (m > 4 ? 6 : 0);
    // Toả avatar ra phía ngoài (xa tâm) thành hình nan quạt cho đỡ chồng.
    const spread = m <= 1 ? 0 : Math.min(2.4, (m - 1) * 0.55);
    list.forEach((p, j) => {
      const ma = m === 1 ? a : a - spread / 2 + (j * spread) / (m - 1);
      const ax = gx + rm * Math.cos(ma);
      const ay = gy + rm * Math.sin(ma);
      lines.push({ x1: gx, y1: gy, x2: ax, y2: ay });
      avatars.push({
        x: ax,
        y: ay,
        url: p.avatar_url,
        name: p.display_name,
        key: p.id,
      });
    });
    if (g.members.length > MAX_AVATARS) {
      const ax = gx + (rm + 38) * Math.cos(a);
      const ay = gy + (rm + 38) * Math.sin(a);
      lines.push({ x1: gx, y1: gy, x2: ax, y2: ay });
      mores.push({ x: ax, y: ay, count: g.members.length - MAX_AVATARS, key: g.key });
    }
  });

  const px = (v: number) => `${(v / W) * 100}%`;
  const py = (v: number) => `${(v / H) * 100}%`;

  return (
    <div className={styles.wrap}>
      <div className={styles.graph} style={{ aspectRatio: `${W} / ${H}` }}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {lines.map((l, idx) => (
            <line
              key={idx}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              className={l.main ? styles.lineMain : styles.line}
            />
          ))}

          {groupNodes.map((gn) => (
            <g key={gn.key}>
              <circle cx={gn.x} cy={gn.y} r={34} className={styles.groupCircle} />
              <text
                x={gn.x}
                y={gn.y}
                className={styles.groupLabel}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {gn.label.length > 9 ? gn.label.slice(0, 8) + "…" : gn.label}
              </text>
              <circle
                cx={gn.bx}
                cy={gn.by}
                r={15}
                className={styles.countBadge}
              />
              <text
                x={gn.bx}
                y={gn.by}
                className={styles.countText}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {gn.count}
              </text>
            </g>
          ))}

          {mores.map((mn) => (
            <g key={"more-" + mn.key}>
              <circle cx={mn.x} cy={mn.y} r={17} className={styles.moreCircle} />
              <text
                x={mn.x}
                y={mn.y}
                className={styles.moreText}
                textAnchor="middle"
                dominantBaseline="central"
              >
                +{mn.count}
              </text>
            </g>
          ))}

          <g>
            <circle cx={CX} cy={CY} r={66} className={styles.centerCircle} />
            <text
              x={CX}
              y={CY - 12}
              className={styles.centerTop}
              textAnchor="middle"
              dominantBaseline="central"
            >
              Cuộc hẹn
            </text>
            <text
              x={CX}
              y={CY + 16}
              className={styles.centerBig}
              textAnchor="middle"
              dominantBaseline="central"
            >
              20 NĂM
            </text>
          </g>
        </svg>

        {avatars.map((av) => (
          <span
            key={av.key}
            className={styles.avatarWrap}
            style={{ left: px(av.x), top: py(av.y) }}
            title={av.name}
          >
            {av.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={av.url}
                alt={av.name}
                className={styles.avatarImg}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className={styles.avatarFallback}>{initial(av.name)}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
