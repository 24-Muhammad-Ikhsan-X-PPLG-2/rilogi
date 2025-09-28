"use client";
import { useState } from "react";
import LinkComponent from "./link-component";

const FiturNavbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  return (
    <div className="relative">
      <LinkComponent
        href="#fitur"
        onMouseEnter={() => {
          setShowDropdown(true);
        }}
        onMouseLeave={() => {
          setShowDropdown(false);
        }}
      >
        FITUR
      </LinkComponent>
      <div
        className={`absolute w-56 h-fit bg-white left-10 mt-1 shadow-xl rounded-tr-xl rounded-br-xl rounded-bl-xl p-3 ${
          showDropdown ? "opacity-100" : "opacity-0 pointer-events-none"
        } transition duration-200`}
      >
        <h1 className="font-semibold">Fitur</h1>
        <p className="text-sm mt-1">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempora,
          quis.
        </p>
      </div>
    </div>
  );
};

export default FiturNavbar;
