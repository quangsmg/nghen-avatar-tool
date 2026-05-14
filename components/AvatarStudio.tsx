"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./AvatarStudio.module.css";

/** Kích thước xuất (vuông, chuẩn avatar Facebook) */
const CANVAS = 1080;
/**
 * Bán kính vùng tròn hiển thị ảnh (theo px trên canvas 1080).
 * Có thể tinh chỉnh nếu khung PNG lệch so với ảnh mẫu.
 */
const CIRCLE_R = 392;
const BACKDROP = "#eef1ec";
const MIN_Z = 0.35;
const MAX_Z = 5.5;

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

export function AvatarStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLImageElement | null>(null);
  const userRef = useRef<HTMLImageElement | null>(null);

  const [frameReady, setFrameReady] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const dragRef = useRef({
    active: false,
    startClientX: 0,
    startClientY: 0,
    startPan: { x: 0, y: 0 },
  });

  const pinchRef = useRef<{
    startDist: number;
    startZoom: number;
  } | null>(null);
  const zoomRef = useRef(zoom);
  const wrapRef = useRef<HTMLDivElement>(null);

  zoomRef.current = zoom;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    if (!canvas || !frame?.complete) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = CANVAS;
    const h = CANVAS;
    const cx = w / 2;
    const cy = h / 2;
    const r = CIRCLE_R;

    ctx.clearRect(0, 0, w, h);

    const user = userRef.current;
    if (user?.complete && user.naturalWidth > 0) {
      const iw = user.naturalWidth;
      const ih = user.naturalHeight;
      const S = 2 * r;
      const cover = Math.max(S / iw, S / ih);
      const scale = cover * zoom;
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = cx + pan.x - dw / 2;
      const dy = cy + pan.y - dh / 2;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = BACKDROP;
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(user, dx, dy, dw, dh);
      ctx.restore();
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = BACKDROP;
      ctx.fill();
      ctx.restore();
    }

    ctx.drawImage(frame, 0, 0, w, h);
  }, [zoom, pan.x, pan.y, hasPhoto]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      frameRef.current = img;
      setFrameReady(true);
    };
    img.onerror = () => {
      console.error("Không tải được khung ảnh /avaframe.png");
    };
    img.src = "/avaframe.png";
  }, []);

  useEffect(() => {
    if (!frameReady) return;
    draw();
  }, [frameReady, draw]);

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

  const canvasScale = () => {
    const canvas = canvasRef.current;
    if (!canvas) return 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0) return 1;
    return CANVAS / rect.width;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
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
      x:
        dragRef.current.startPan.x +
        (e.clientX - dragRef.current.startClientX) * sc,
      y:
        dragRef.current.startPan.y +
        (e.clientY - dragRef.current.startClientY) * sc,
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
      if (dist > 1) {
        pinchRef.current = { startDist: dist, startZoom: zoomRef.current };
      }
      dragRef.current.active = false;
    }
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const ratio = dist / pinchRef.current.startDist;
      setZoom(
        clamp(pinchRef.current.startZoom * ratio, MIN_Z, MAX_Z),
      );
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

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasPhoto) return;
    draw();
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "avatar-cuoc-hen-20-nam-thpt-nghen.png";
        a.click();
        URL.revokeObjectURL(a.href);
      },
      "image/png",
      1,
    );
  };

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div className={styles.badge}>Cuộc hẹn 20 năm</div>
        <h1 className={styles.title}>Tạo avatar Facebook</h1>
        <p className={styles.subtitle}>THPT Nghèn — Khóa 2003-2006</p>
      </header>

      <div className={styles.card}>
        <div
          ref={wrapRef}
          className={styles.canvasWrap}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            width={CANVAS}
            height={CANVAS}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
        </div>

        <p className={styles.hint}>
          Kéo để căn chỉnh ảnh. Cuộn chuột hoặc dùng thanh trượt để zoom.
          Trên điện thoại: chụm hai ngón để phóng to / thu nhỏ.
        </p>

        <div className={styles.row}>
          <label className={styles.fileLabel}>
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
            />
            Chọn ảnh
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

        <div className={styles.zoomLabel}>
          Zoom: {Math.round(zoom * 100)}%
        </div>
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

        <div className={styles.row}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={download}
            disabled={!hasPhoto || !frameReady}
          >
            Tải ảnh về máy
          </button>
        </div>
      </div>

      <p className={styles.footer}>
        Ảnh vuông {CANVAS}×{CANVAS}px, phù hợp làm ảnh đại diện Facebook.
      </p>
    </div>
  );
}
