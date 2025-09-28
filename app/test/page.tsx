"use client";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect } from "react";

const Test = () => {
  const supabase = createClient();
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log(user);
    })();
  }, []);
  return <div>Test</div>;
};

export default Test;
