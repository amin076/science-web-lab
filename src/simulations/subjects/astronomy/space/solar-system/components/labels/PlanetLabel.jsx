// src/components/features/entireSolar/PlanetLabel.jsx
import React, { useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function PlanetLabel({ name, radius, color = "white" }) {
  const [opacity, setOpacity] = useState(1);
  const [isVisible, setIsVisible] = useState(true);

  useFrame(({ camera, scene }) => {
    // پیدا کردن موقعیت این لیبل در جهان
    // (چون لیبل فرزند سیاره است، موقعیتش نسبی است، اما ما فاصله واقعی تا دوربین را می‌خواهیم)
    // اینجا یک منطق ساده پیاده می‌کنیم:

    // محاسبه فاصله دوربین تا مرکز صحنه (خورشید) به عنوان معیار تقریبی زوم
    const distToCenter = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));

    // 1. اگر خیلی دور شدیم (مثل اسکرین‌شاتی که فرستادی)، متن‌ها را محو کن
    // این عدد 800 را می‌توانی بر اساس حس خودت تغییر دهی
    if (distToCenter > 1000) {
      if (isVisible) setIsVisible(false);
    } else {
      if (!isVisible) setIsVisible(true);
    }

    // 2. مدیریت شفافیت (Fade effect)
    // وقتی زوم می‌کنیم، نرم محو شود
    const targetOpacity = distToCenter > 800 ? 0 : 1;
    // (Lerp ساده برای تغییر نرم)
    setOpacity((prev) => prev + (targetOpacity - prev) * 0.1);
  });

  if (!isVisible && opacity < 0.05) return null;

  return (
    <Html
      position={[0, radius + radius * 0.5 + 2, 0]} // کمی بالاتر از سیاره
      center // دیو را دقیقاً وسط‌چین می‌کند
      style={{
        pointerEvents: "none", // تاثیری روی کلیک کردن نگذارد
        transition: "opacity 0.2s",
        opacity: opacity,
      }}
      zIndexRange={[100, 0]} // مدیریت لایه‌ها
    >
      <div
        style={{
          color: color,
          fontSize: "12px",
          fontFamily: "Arial, sans-serif",
          fontWeight: "bold",
          textShadow: "0px 0px 4px rgba(0,0,0,0.8)", // سایه مشکی برای خوانایی روی ستاره‌ها
          whiteSpace: "nowrap",
          padding: "2px 6px",
          background: "rgba(0, 0, 0, 0.4)", // پس‌زمینه شیشه‌ای تیره
          borderRadius: "4px",
          backdropFilter: "blur(2px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {name}
      </div>
    </Html>
  );
}
