"use client";
import { Libertinus_Serif } from "next/font/google";
import Link from "next/link";
import React, {
  ComponentProps,
  FC,
  ReactNode,
  useEffect,
  useState,
} from "react";
import LinkComponent from "./Navbar/link-component";
import TentangNavbar from "./Navbar/tentang-navbar";
import FiturNavbar from "./Navbar/fitur-navbar";
import DaftarNavbar from "./Navbar/daftar-navbar";
import MasukNavbar from "./Navbar/masuk-navbar";

const libertinusSans = Libertinus_Serif({
  variable: "--font-libertinus-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const Navbar = () => {
  const [showNavbar, setShowNavbar] = useState(true);
  const [showBgNavbar, setShowBgNavbar] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY == 0) {
        setShowBgNavbar(false);
      } else {
        setShowBgNavbar(true);
      }

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentScrollY > lastScrollY && currentScrollY > 80) {
            setShowNavbar(false);
          } else if (currentScrollY < lastScrollY) {
            setShowNavbar(true);
          }
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);
  return (
    <nav
      className={`fixed top-0 w-full ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      } ${
        showBgNavbar ? "bg-secondary/40" : "bg-transparent"
      } transition-all duration-300 ease-in-out backrop-filter backdrop-blur-lg z-[99] `}
    >
      <div className="h-14 flex items-center justify-between px-14">
        <div className="flex gap-4 text-base items-center">
          <TentangNavbar />
          <FiturNavbar />
        </div>
        <h1
          className={`${libertinusSans.className} ${libertinusSans.variable} font-bold text-4xl text-primary`}
        >
          Rilogi
        </h1>
        <div className="flex gap-4 items-center text-base">
          <DaftarNavbar />
          <MasukNavbar />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
