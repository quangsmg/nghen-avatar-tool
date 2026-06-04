"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SiteHeader } from "./SiteHeader";
import styles from "./CountdownStudio.module.css";

/** Danh sách câu quote cảm động nạp sẵn. */
const PRESET_QUOTES = [
  "Hội khóa không phải để xem ai thành công hơn ai, mà để xem ai nhớ về nhau nhiều hơn.",
  "20 năm trước chúng ta có chung một đích đến. 20 năm sau, chúng ta có chung một nẻo về.",
  "Chúng ta của năm 18 tuổi bận rộn đi tìm tương lai. Chúng ta của tuổi gần 40 lại bận rộn tìm về quá khứ.",
  "Dù bạn là ai sau 20 năm bôn ba, nơi đây vẫn luôn có một chỗ ngồi viết sẵn tên bạn.",
  "Thời gian có thể mang ta đi xa, nhưng kỷ niệm sẽ kéo ta trở lại.",
  "20 năm, mang bao nhiêu danh xưng ngoài xã hội, chỉ muốn về đây làm cậu học trò nhỏ năm nào.",
  "Thành công lớn nhất của tuổi trưởng thành là sau 20 năm, ngoảnh lại vẫn thấy bạn cũ đứng chờ.",
  "Chúng ta không quay ngược được thời gian, nhưng có thể cùng nhau thắp lại ngọn lửa thanh xuân năm ấy.",
  "Thanh xuân của tôi nằm lại ở góc sân trường Nghèn, trong nụ cười của các bạn năm đó.",
  "Có những người, dù 20 năm không gặp, chỉ cần nhìn ánh mắt là thấy lại cả một thời niên thiếu.",
  "Nắng năm 2006 không còn nữa, nhưng nụ cười năm ấy thì vẫn vẹn nguyên ở đây. Hẹn gặp bạn!",
  "Gặp lại nhau để biết chúng ta đã từng có một thanh xuân rực rỡ đến thế.",
  "Bạn còn nhớ góc ban công đầy nắng, chiếc bàn gỗ khắc tên và những bài kiểm tra chuyền tay?",
  "Hoa phượng vĩ vẫn đỏ rực góc sân trường Nghèn, như thể chờ chúng ta suốt hai mươi năm qua.",
  "Tiếng trống trường năm ấy đã ngắt, nhưng thanh âm của tình bạn thì còn vang vọng mãi.",
  "Lưu bút năm xưa đã sờn gáy, nhưng lời hứa 'không quên nhau' thì hôm nay chúng ta đi thực hiện.",
  "Hóa ra, khoảng cách 20 năm cũng chỉ dài bằng một cái chớp mắt của tuổi trẻ.",
  "Gửi lại giảng đường, gửi lại thanh xuân. 20 năm rồi, mình về thắp lại những ngày nắng cũ thôi!",
  "Thanh xuân giống như một cơn mưa rào, dù từng bị cảm lạnh, ta vẫn muốn được đắm mình trong đó một lần nữa.",
  "Cổng trường Nghèn năm ấy đã chứng kiến chúng ta rời đi, giờ đang đợi chúng ta trở về.",
  "Dành cho cậu bạn năm ấy tớ từng thích thầm: 20 năm rồi, cậu có về Nghèn không?",
  "Trốn sếp, trốn việc, trốn lo toan... ngày 18/07 này mình trốn về làm học sinh đi các bạn ơi!",
  "Hẹn gặp lại những gương mặt đã cùng tớ ăn vụng trong lớp, chịu phạt hành lang năm mười bảy tuổi.",
  "Đổi ảnh để nhận diện nhau trước nhé, kẻo hôm đó gặp lại cứ ngơ ngác hỏi 'ai đây' thì dỗi đấy!",
  "20 năm rồi, không biết cái đứa ngày xưa hay cho mình chép bài giờ mập ốm ra sao?",
  "Đừng lo mình già hay thay đổi, vì trong mắt lũ bạn thân, bạn vẫn là đứa ngố tàu của năm 2006 thôi.",
  "Lệnh triệu tập khẩn cấp: Ai là thành viên khóa 2003-2006 THPT Nghèn, xin mời điểm danh!",
  "Thanh xuân này sẽ bớt đi một phần rực rỡ nếu ngày hôm đó thiếu mất nụ cười của bạn.",
  "Nghe nói có cái hẹn 20 năm, tớ chuẩn bị sẵn bộ quần áo đẹp nhất để về gặp lại mối tình đầu rồi đây!",
  "Đi thật xa để trở về. 18/07/2026, hẹn gặp lại tất cả các mảnh ghép của tôi!",
] as const;

/** Ngày diễn ra sự kiện: 08:00 sáng 18/07/2026 (Thứ Bảy). */
const EVENT_DATE = new Date(2026, 6, 18, 8, 0, 0, 0);

const BRAND_MAIN = "CUỘC HẸN 20 NĂM";
const BRAND_SUB = "Hội khóa 2003 – 2006 · THPT Nghèn";
const EVENT_LINE = "08:00 · Thứ Bảy 18.07.2026";
const HASHTAG = "#CuocHen20Nam  #HoiKhoa0306  #THPTNghen";

const RATIOS = {
  square: { w: 1080, h: 1080, label: "Vuông 1:1" },
  portrait: { w: 1080, h: 1350, label: "Dọc 4:5" },
} as const;
type RatioId = keyof typeof RATIOS;

const FONT_SANS = '"Be Vietnam Pro", system-ui, sans-serif';
const FONT_SERIF = '"Playfair Display", Georgia, serif';

const MIN_Z = 1;
const MAX_Z = 5;
const DOWNLOAD_FILENAME = "dem-nguoc-cuoc-hen-20-nam-thpt-nghen.png";

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

type Countdown = { passed: boolean; days: number };

function computeCountdown(now: Date): Countdown {
  const diff = EVENT_DATE.getTime() - now.getTime();
  if (diff <= 0) return { passed: true, days: 0 };
  const days = Math.ceil(diff / 86_400_000);
  return { passed: false, days };
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function CountdownStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const userRef = useRef<HTMLImageElement | null>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [ratio, setRatio] = useState<RatioId>("portrait");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [customText, setCustomText] = useState("");
  const [fontsReady, setFontsReady] = useState(false);
  const [logoReady, setLogoReady] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const countdown = useMemo(() => computeCountdown(now), [now]);

  const activeQuote = customText.trim()
    ? customText.trim()
    : PRESET_QUOTES[quoteIndex];

  const dragRef = useRef({
    active: false,
    startClientX: 0,
    startClientY: 0,
    startPan: { x: 0, y: 0 },
  });
  const pinchRef = useRef<{ startDist: number; startZoom: number } | null>(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  // Cập nhật số ngày còn lại theo thời gian thực (mỗi phút).
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Nạp font (đảm bảo canvas vẽ đúng chữ đẹp).
  useEffect(() => {
    let cancelled = false;
    const fonts = [
      `700 100px "Be Vietnam Pro"`,
      `800 100px "Be Vietnam Pro"`,
      `600 100px "Be Vietnam Pro"`,
      `italic 500 100px "Playfair Display"`,
      `italic 600 100px "Playfair Display"`,
    ];
    const done = () => {
      if (!cancelled) setFontsReady(true);
    };
    if (typeof document !== "undefined" && "fonts" in document) {
      Promise.all(fonts.map((f) => document.fonts.load(f)))
        .then(() => document.fonts.ready)
        .then(done)
        .catch(done);
    } else {
      done();
    }
    return () => {
      cancelled = true;
    };
  }, []);

  // Nạp logo trường.
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      logoRef.current = img;
      setLogoReady(true);
    };
    img.onerror = () => setLogoReady(false);
    img.src = "/files/logo.png";
  }, []);

  const dims = RATIOS[ratio];

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = dims.w;
    const h = dims.h;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.clearRect(0, 0, w, h);

    // 1) Nền: ảnh người dùng (cover + pan/zoom + filter vintage) hoặc nền kem.
    const user = userRef.current;
    if (user?.complete && user.naturalWidth > 0) {
      const iw = user.naturalWidth;
      const ih = user.naturalHeight;
      const cover = Math.max(w / iw, h / ih);
      const scale = cover * zoom;
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = w / 2 + pan.x - dw / 2;
      const dy = h / 2 + pan.y - dh / 2;
      ctx.save();
      ctx.filter =
        "grayscale(0.35) sepia(0.22) saturate(1.05) contrast(1.04) brightness(1.02)";
      ctx.drawImage(user, dx, dy, dw, dh);
      ctx.restore();
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#f4ead7");
      g.addColorStop(1, "#e7d9bf");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    // 2) Lớp phủ ấm + tối nhẹ để chữ trắng nổi bật.
    const warm = ctx.createLinearGradient(0, 0, w, h);
    warm.addColorStop(0, "rgba(196,120,40,0.10)");
    warm.addColorStop(1, "rgba(120,60,20,0.12)");
    ctx.fillStyle = warm;
    ctx.fillRect(0, 0, w, h);

    const topG = ctx.createLinearGradient(0, 0, 0, h * 0.26);
    topG.addColorStop(0, "rgba(28,40,26,0.62)");
    topG.addColorStop(1, "rgba(28,40,26,0)");
    ctx.fillStyle = topG;
    ctx.fillRect(0, 0, w, h * 0.26);

    const botG = ctx.createLinearGradient(0, h * 0.42, 0, h);
    botG.addColorStop(0, "rgba(18,26,16,0)");
    botG.addColorStop(0.55, "rgba(18,26,16,0.55)");
    botG.addColorStop(1, "rgba(14,22,12,0.88)");
    ctx.fillStyle = botG;
    ctx.fillRect(0, h * 0.42, w, h * 0.58);

    // 3) Khung nhận diện thương hiệu (viền mảnh bo góc).
    const inset = 30;
    const fr = 26;
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 3;
    roundRect(ctx, inset, inset, w - inset * 2, h - inset * 2, fr);
    ctx.stroke();
    ctx.restore();

    ctx.textAlign = "center";
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 2;

    // 4) Thương hiệu trên đỉnh (logo + tên hội khóa).
    let brandY = 56;
    const logo = logoRef.current;
    if (logo?.complete && logo.naturalWidth > 0) {
      const ls = 92;
      ctx.shadowBlur = 0;
      ctx.drawImage(logo, w / 2 - ls / 2, brandY, ls, ls);
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = 12;
      brandY += ls + 16;
    } else {
      brandY += 12;
    }
    ctx.fillStyle = "#fdf6e8";
    ctx.font = `700 32px ${FONT_SANS}`;
    ctx.letterSpacing = "4px";
    ctx.textBaseline = "top";
    ctx.fillText(BRAND_MAIN, w / 2, brandY);
    ctx.letterSpacing = "1px";
    ctx.font = `600 22px ${FONT_SANS}`;
    ctx.fillStyle = "rgba(255,247,230,0.92)";
    ctx.fillText(BRAND_SUB, w / 2, brandY + 44);
    ctx.letterSpacing = "0px";

    // 5) Khối nội dung phía dưới: đếm ngược + quote + ngày + hashtag.
    const bottomPad = Math.round(h * 0.055);

    // Đo quote trước để căn khối.
    ctx.font = `italic 500 40px ${FONT_SERIF}`;
    const quoteMax = w - inset * 2 - 80;
    const quoteLines = wrapText(ctx, `“${activeQuote}”`, quoteMax);
    const quoteLineH = 54;

    // Cấu trúc các phần (top→down) cho khối dưới.
    const labelH = 38;
    const numberH = countdown.passed ? 96 : 168;
    const gapSmall = 6;
    const gapMed = 30;
    const dateH = 30;
    const hashH = 26;

    const heroLabelTop = countdown.passed ? "CÙNG NHAU" : "CHỈ CÒN";
    const heroNumber = countdown.passed ? "" : String(countdown.days);
    const heroLabelBottom = countdown.passed
      ? "VỀ NGHÈN NHÉ!"
      : "NGÀY ĐỂ GẶP LẠI NHAU";
    const passedNumberText = "HẸN GẶP LẠI";

    const blockHeight =
      labelH +
      gapSmall +
      numberH +
      gapSmall +
      labelH +
      gapMed +
      quoteLines.length * quoteLineH +
      gapMed +
      dateH +
      10 +
      hashH;

    let y = h - bottomPad - blockHeight;
    // Không để khối dâng quá cao (giữ ở nửa dưới).
    y = Math.max(y, h * 0.44);

    // -- Đếm ngược (hero)
    ctx.fillStyle = "#ffe9b8";
    ctx.font = `600 32px ${FONT_SANS}`;
    ctx.letterSpacing = "5px";
    ctx.fillText(heroLabelTop, w / 2, y);
    ctx.letterSpacing = "0px";
    y += labelH + gapSmall;

    if (countdown.passed) {
      ctx.fillStyle = "#fff7e6";
      ctx.font = `800 88px ${FONT_SANS}`;
      ctx.fillText(passedNumberText, w / 2, y);
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.font = `800 168px ${FONT_SANS}`;
      ctx.fillText(heroNumber, w / 2, y - 8);
    }
    y += numberH + gapSmall;

    ctx.fillStyle = "#ffe9b8";
    ctx.font = `600 32px ${FONT_SANS}`;
    ctx.letterSpacing = "3px";
    ctx.fillText(heroLabelBottom, w / 2, y);
    ctx.letterSpacing = "0px";
    y += labelH + gapMed;

    // -- Đường trang trí ngắn
    drawDivider(ctx, w / 2, y - gapMed / 2);

    // -- Quote (serif nghiêng, mềm mại)
    ctx.fillStyle = "#fdf6e8";
    ctx.font = `italic 500 40px ${FONT_SERIF}`;
    for (const line of quoteLines) {
      ctx.fillText(line, w / 2, y);
      y += quoteLineH;
    }
    y += gapMed - (quoteLineH - 40);

    // -- Ngày sự kiện
    ctx.fillStyle = "rgba(255,247,230,0.95)";
    ctx.font = `600 26px ${FONT_SANS}`;
    ctx.letterSpacing = "1px";
    ctx.fillText(EVENT_LINE, w / 2, y);
    ctx.letterSpacing = "0px";
    y += dateH + 10;

    // -- Hashtag
    ctx.fillStyle = "rgba(255,233,184,0.9)";
    ctx.font = `600 22px ${FONT_SANS}`;
    ctx.letterSpacing = "0.5px";
    ctx.fillText(HASHTAG, w / 2, y);
    ctx.letterSpacing = "0px";

    ctx.restore();
  }, [
    dims.w,
    dims.h,
    zoom,
    pan.x,
    pan.y,
    hasPhoto,
    activeQuote,
    countdown.passed,
    countdown.days,
  ]);

  useEffect(() => {
    if (!fontsReady) return;
    draw();
  }, [draw, fontsReady, logoReady]);

  // ---- Tương tác kéo / zoom ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const factor = 1 + clamp(-ev.deltaY * 0.0012, -0.25, 0.25);
      setZoom((z) => clamp(z * factor, MIN_Z, MAX_Z));
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const tm = (ev: TouchEvent) => {
      if (ev.touches.length === 2) ev.preventDefault();
    };
    el.addEventListener("touchmove", tm, { passive: false });
    return () => el.removeEventListener("touchmove", tm);
  }, []);

  const canvasScale = () => {
    const canvas = canvasRef.current;
    if (!canvas) return 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0) return 1;
    return dims.w / rect.width;
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      userRef.current = img;
      setHasPhoto(true);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!hasPhoto) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startPan: { ...pan },
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.active) return;
    const sc = canvasScale();
    setPan({
      x: dragRef.current.startPan.x + (e.clientX - dragRef.current.startClientX) * sc,
      y: dragRef.current.startPan.y + (e.clientY - dragRef.current.startClientY) * sc,
    });
  };

  const endDrag = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragRef.current.active = false;
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      if (dist > 1) pinchRef.current = { startDist: dist, startZoom: zoomRef.current };
      dragRef.current.active = false;
    }
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const ratioPinch = dist / pinchRef.current.startDist;
      setZoom(clamp(pinchRef.current.startZoom * ratioPinch, MIN_Z, MAX_Z));
    }
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) pinchRef.current = null;
  };

  const resetTransform = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const clearPhoto = () => {
    userRef.current = null;
    setHasPhoto(false);
    resetTransform();
  };

  const nextQuote = () => {
    setCustomText("");
    setQuoteIndex((i) => (i + 1) % PRESET_QUOTES.length);
  };

  const prevQuote = () => {
    setCustomText("");
    setQuoteIndex((i) => (i - 1 + PRESET_QUOTES.length) % PRESET_QUOTES.length);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    draw();
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = DOWNLOAD_FILENAME;
        anchor.rel = "noopener";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        window.setTimeout(() => URL.revokeObjectURL(url), 45_000);
      },
      "image/png",
      1,
    );
  };

  const countdownText = countdown.passed
    ? "Cuộc hẹn 20 năm đã diễn ra — hẹn gặp lại!"
    : `Chỉ còn ${countdown.days} ngày để gặp lại nhau`;

  return (
    <div className={styles.page}>
      <SiteHeader
        active="countdown"
        title="Tạo ảnh đếm ngược hội khóa"
        subtitle={<>THPT Nghèn — Khóa 2003-2006 · {countdownText}</>}
      />

      <div className={styles.layout}>
        <div className={styles.card}>
          <div
            ref={wrapRef}
            className={styles.canvasWrap}
            style={{ aspectRatio: `${dims.w} / ${dims.h}` }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <canvas
              ref={canvasRef}
              className={styles.canvas}
              width={dims.w}
              height={dims.h}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            />
            {!hasPhoto && (
              <div className={styles.placeholder}>
                <span>Tải ảnh thanh xuân của bạn lên để bắt đầu ✨</span>
              </div>
            )}
          </div>

          <div className={styles.row}>
            <label className={styles.fileLabel}>
              <input type="file" accept="image/*" onChange={onFileChange} />
              Tải ảnh thanh xuân
            </label>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={resetTransform}
              disabled={!hasPhoto}
            >
              Đặt lại vị trí
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnDanger}`}
              onClick={clearPhoto}
              disabled={!hasPhoto}
            >
              Xóa ảnh
            </button>
          </div>

          <p className={styles.hint}>
            Kéo để căn ảnh, cuộn chuột hoặc dùng thanh trượt để zoom. Trên điện
            thoại: chụm hai ngón để phóng to / thu nhỏ.
          </p>

          <div className={styles.zoomLabel}>Zoom: {Math.round(zoom * 100)}%</div>
          <div className={styles.row}>
            <input
              className={styles.slider}
              type="range"
              min={MIN_Z}
              max={MAX_Z}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              disabled={!hasPhoto}
              aria-label="Điều chỉnh mức zoom"
            />
          </div>
        </div>

        <div className={styles.controls}>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>1 · Chọn tỷ lệ ảnh</h2>
            <div className={styles.ratioPicker} role="group" aria-label="Chọn tỷ lệ">
              {(Object.keys(RATIOS) as RatioId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`${styles.ratioBtn}${ratio === id ? ` ${styles.ratioActive}` : ""}`}
                  onClick={() => {
                    setRatio(id);
                    setPan({ x: 0, y: 0 });
                  }}
                  aria-pressed={ratio === id}
                >
                  {RATIOS[id].label}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>2 · Chọn câu quote</h2>
            <div className={styles.quoteBox}>
              <p className={styles.quotePreview}>“{PRESET_QUOTES[quoteIndex]}”</p>
              <div className={styles.quoteMeta}>
                Câu {quoteIndex + 1}/{PRESET_QUOTES.length}
                {customText.trim() ? " · đang dùng nội dung tự viết" : ""}
              </div>
            </div>
            <div className={styles.row}>
              <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={prevQuote}>
                ‹ Câu trước
              </button>
              <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={nextQuote}>
                Đổi câu khác ›
              </button>
            </div>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>3 · Hoặc tự viết nội dung</h2>
            <textarea
              className={styles.textarea}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Tự viết kỷ niệm, biệt danh nhóm bạn thân… (để trống sẽ dùng câu quote bên trên)"
              rows={3}
              maxLength={180}
            />
            {customText.trim() && (
              <button
                type="button"
                className={`${styles.btn} ${styles.btnGhost} ${styles.btnFull}`}
                onClick={() => setCustomText("")}
              >
                Dùng lại câu có sẵn
              </button>
            )}
          </section>

          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`}
            onClick={download}
            disabled={!hasPhoto || !fontsReady}
          >
            Tải ảnh đếm ngược
          </button>

          <p className={styles.share}>
            💡 Đăng ảnh lên Facebook/Zalo kèm hashtag{" "}
            <strong>#CuocHen20Nam #HoiKhoa0306 #THPTNghen</strong> để lan tỏa tới
            các bạn cùng khóa nhé!
          </p>
          <p className={styles.warn}>
            Lưu ý: nên mở link trong trình duyệt (Safari, Chrome…) để tải được
            ảnh về máy.
          </p>
        </div>
      </div>
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawDivider(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  ctx.strokeStyle = "rgba(255,233,184,0.7)";
  ctx.fillStyle = "rgba(255,233,184,0.85)";
  ctx.lineWidth = 2;
  const half = 70;
  const gap = 14;
  ctx.beginPath();
  ctx.moveTo(cx - half, cy);
  ctx.lineTo(cx - gap, cy);
  ctx.moveTo(cx + gap, cy);
  ctx.lineTo(cx + half, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
