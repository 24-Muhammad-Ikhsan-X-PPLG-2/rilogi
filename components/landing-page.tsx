"use client";
import { Libertinus_Serif } from "next/font/google";
import Navbar from "./navbar";
import Link from "next/link";
import Lottie from "lottie-react";
import { motion } from "motion/react";
import chatAnimation from "@/assets/chat_animation_v2.json";
import Image from "next/image";

const libertinusSans = Libertinus_Serif({
  variable: "--font-libertinus-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const LandingPage = () => {
  return (
    <>
      <div
        className={`min-h-screen bg-gradient-to-br from-[#F5F2ED] via-[#EADAC8] to-[#D4A373] flex`}
      >
        <Navbar />
        <div className="md:px-14 flex md:flex-row flex-col justify-center md:gap-36 mx-auto items-center">
          <div className="mb-5 block md:hidden">
            <Image
              width={300}
              height={300}
              alt="Chat Hp Image"
              src="/svg/chat_hp.svg"
              className="w-64"
            />
          </div>
          <div className="w-fit md:space-y-6">
            <h2
              className={`${libertinusSans.className} ${libertinusSans.variable} text-primary font-semibold md:text-5xl text-4xl leading-tight`}
            >
              Obrolan Biasa, Jadi Luar Biasa.
            </h2>

            <div className="flex items-center gap-4 mb-3">
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

            <Link href="/masuk" className="">
              <button className="bg-primary px-10 py-2 text-secondary font-semibold rounded cursor-pointer hover:bg-primary/90 active:scale-95 transition duration-200">
                Mulai Ngobrol
              </button>
            </Link>
          </div>

          <div className="w-fit md:block hidden">
            <Lottie
              animationData={chatAnimation}
              loop={true}
              style={{ width: 450 }}
            />
          </div>
        </div>
      </div>
      <div
        className="min-h-screen from-[#D4A373] to-[#F5F2ED] flex justify-center items-center via-[#EADAC8] bg-gradient-to-bl"
        id="tentang"
      >
        <div className="flex md:flex-row flex-col justify-center items-center md:gap-24 gap-4">
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="hidden md:block"
          >
            <h1
              className={`${libertinusSans.className} ${libertinusSans.variable} text-4xl text-primary font-semibold`}
            >
              Tentang Kami
            </h1>
            <p className="max-w-xs mt-3 text-sm leading-relaxed font-medium">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. At alias
              quasi illum veritatis illo incidunt tenetur ab. Repudiandae,
              provident corporis voluptatem accusantium modi ipsa sint quae
              quaerat, dolores commodi voluptas?
            </p>
          </motion.div>
          <div>
            <Image
              src="/svg/chat_interface.svg"
              width={300}
              height={300}
              className="md:w-96 w-64"
              alt="Image chat interface"
            />
          </div>
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="block md:hidden"
          >
            <h1
              className={`${libertinusSans.className} ${libertinusSans.variable} text-4xl text-primary font-semibold`}
            >
              Tentang Kami
            </h1>
            <p className="max-w-xs mt-3 text-sm leading-relaxed font-medium">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. At alias
              quasi illum veritatis illo incidunt tenetur ab. Repudiandae,
              provident corporis voluptatem accusantium modi ipsa sint quae
              quaerat, dolores commodi voluptas?
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};
export default LandingPage;
