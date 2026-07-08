import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// 사이트에 실제 존재하는 라우트 목록. 페이지 추가 시 여기에 경로를 더하세요.
const ROUTES = [
  "/",
  "/consulting/startup",
  "/consulting/outsourcing",
  "/consulting/community",
  "/consulting/diagnosis/kim-jaegang",
  "/consulting/diagnosis/kim-seungho",
  "/consulting/diagnosis/park-jungmin",
  "/consulting/diagnosis/hwang-bongnam",
  "/edu/fc-class",
  "/edu/startup-class",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: route === "/" ? 1 : 0.8,
  }));
}
