"use client";

import { FC, ReactNode, useState } from "react";
import Image from "next/image";
import { History, LogOut } from "lucide-react";
import { useAuth } from "@/features/auth/hook/use-auth";
import { PopupLayout } from "../PopupLayout";
import { MalangEE } from "../MalangEE";
import { Button } from "../Button";
import Link from "next/link";

interface GlassCardProps {
  children: ReactNode;
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
  footer?: ReactNode;
  className?: string;
  showHeader?: boolean; // header 표시 여부 (기본값 true)
}

export const GlassCard: FC<GlassCardProps> = ({
  children,
  headerLeft,
  headerRight,
  footer,
  className = "",
  showHeader = false,
}) => {


  const defaultHeaderLeft = (
    <div className="scenario-logo">
      <Link href={"/dashboard"} className="inline-block">
        <Image src="/images/logo.png" alt="MalangEE Logo" width={100} height={30} />
      </Link>
    </div>
  );

  const defaultHeaderRight = (
    <div className="flex hidden items-center gap-4">

    </div>
  );

  return (
    <>
      <main className={`main-container glass-card w-full backdrop-blur-md ${className}`}>
        {/* Header */}
        {showHeader && (
          <header className="glass-card-header">
            {headerLeft || defaultHeaderLeft}
            <div className="flex-1" />
            <div className="flex items-center gap-4">{headerRight || defaultHeaderRight}</div>
          </header>
        )}

        {/* Content */}
        <section className="glass-card-content">{children}</section>

        {/* Footer */}
        {footer && <footer className="glass-card-footer">{footer}</footer>}
      </main>

    </>
  );
};
