"use client";
import React from "react";

const KontakLoading = () => {
  return (
    <div className={`p-2 w-full h-fit rounded-xl animate-pulse`}>
      <div className="p-2 flex items-center w-full h-fit rounded-xl justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gray-600 w-10 h-10 rounded-full"></div>
          <div className="flex flex-col gap-1">
            <div className="bg-gray-600 w-14 h-3 rounded-full "></div>
            <div className="bg-gray-600 w-24 h-3 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KontakLoading;
