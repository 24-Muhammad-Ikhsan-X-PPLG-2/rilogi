"use client";
import { colorApp } from "@/constants/color";
import Lottie from "lottie-react";
import { Libertinus_Serif } from "next/font/google";
import Link from "next/link";
import React, { FC, PropsWithChildren, ReactNode } from "react";
import chatAnimation from "@/assets/chat_animation_v2.json";

const libertinusSans = Libertinus_Serif({
  variable: "--font-libertinus-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const LandingPage = () => {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-[#F5F2ED] via-[#EADAC8] to-[#D4A373] flex`}
    >
      <nav className="fixed top-0 w-full">
        <div className="h-14 flex items-center justify-between px-14">
          <div className="flex gap-4 text-base items-center">
            <LinkComponent>TENTANG</LinkComponent>
            <LinkComponent>FITUR</LinkComponent>
          </div>
          <h1
            className={`${libertinusSans.className} ${libertinusSans.variable} font-bold text-4xl text-primary`}
          >
            Rilogi
          </h1>
          <div className="flex gap-4 items-center text-base">
            <LinkComponent href="/daftar">DAFTAR</LinkComponent>
            <LinkComponent href="/masuk">MASUK</LinkComponent>
          </div>
        </div>
      </nav>
      <div className="px-4 flex gap-36 mx-auto items-center">
        <div className="w-fit space-y-6">
          <h2
            className={`${libertinusSans.className} ${libertinusSans.variable} text-primary font-semibold text-5xl leading-tight`}
          >
            Obrolan Biasa, Jadi Luar Biasa.
          </h2>

          <div className="flex items-center gap-4">
            <div className="w-2 h-30 bg-primary"></div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-600 max-w-xs font-medium leading-relaxed">
                &quot;Rilogi adalah ruang chat sederhana dan hangat untuk
                terhubung dengan teman, keluarga, atau komunitas.&quot;
              </p>
              <p className="text-sm text-gray-600 max-w-xs font-medium">
                ~ Rilogi {new Date().getFullYear()}
              </p>
            </div>
          </div>

          <Link href="/masuk">
            <button className="bg-primary px-10 py-2 text-secondary font-semibold rounded cursor-pointer hover:bg-primary/90 active:scale-95 transition duration-200">
              Mulai Ngobrol
            </button>
          </Link>
        </div>

        <div className="w-fit">
          <Lottie
            animationData={chatAnimation}
            loop={true}
            style={{ width: 450 }}
          />
        </div>
      </div>
    </div>
  );
};

type LinkComponentType = {
  children: ReactNode;
  href?: string;
};

const LinkComponent: FC<LinkComponentType> = ({ children, href = "#" }) => {
  return (
    <Link
      href={href}
      className="relative inline-block font-medium cursor-pointer transition-colors duration-200
    hover:text-primary
    after:absolute after:left-0 after:bottom-0 
    after:h-[2px] after:w-full after:origin-left after:scale-x-0
    after:bg-primary after:transition-transform after:duration-300
    hover:after:scale-x-100"
    >
      {children}
    </Link>
  );
};

export default LandingPage;
