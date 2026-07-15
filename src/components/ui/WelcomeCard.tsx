import React from "react";

type WelcomeCardProps = {
  title: string;
  subtitle: string;
  greeting: string;
};

export function WelcomeCard({ title, subtitle, greeting }: WelcomeCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-[28px] px-7 py-8 shadow-lg sm:px-8"
      style={{
        background: "linear-gradient(125deg, #7c6cf0 0%, #5b4bdb 48%, #6c5ce7 100%)",
      }}
    >
      <div className="relative z-10 max-w-xl">
        <p className="mb-1 text-[14px] font-medium text-white/70">{greeting}</p>
        <h1 className="mb-2 text-[26px] font-bold tracking-tight text-white sm:text-[28px]">
          {title}
        </h1>
        <p className="max-w-md text-[14px] font-medium leading-relaxed text-white/65">
          {subtitle}
        </p>
      </div>
      <div className="absolute -right-10 -top-10 size-44 rounded-full bg-white/[0.07]" />
      <div className="absolute -bottom-12 right-16 size-36 rounded-full bg-white/[0.06]" />
      <div className="absolute right-28 top-6 size-14 rounded-full bg-[#ff6b81]/25" />
      <div className="absolute bottom-4 left-[40%] size-16 rounded-full bg-[#feca57]/15" />
    </div>
  );
}
