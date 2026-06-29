import type { Metadata } from "next";
import { Invitation, IMG } from "../Invitation";
import { GUESTS } from "../guests";

type Params = Promise<{ code: string }>;

const DESC =
  "Trân trọng kính mời Thầy/Cô tới dự ngày hội ngộ Cuộc hẹn 20 năm — Hội khóa 2003-2006 THPT Nghèn.";

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { code } = await params;
  const name = GUESTS[code];
  const title = name
    ? `Thư mời ${name} — Cuộc hẹn 20 năm THPT Nghèn`
    : "Thư mời — Cuộc hẹn 20 năm THPT Nghèn";
  return {
    title,
    description: DESC,
    openGraph: { title, description: DESC, images: [IMG] },
  };
}

export default async function ThiepByCode({ params }: { params: Params }) {
  const { code } = await params;
  const name = GUESTS[code] ?? "";
  return <Invitation name={name} />;
}
