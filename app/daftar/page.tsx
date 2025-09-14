"use client";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import Lottie from "lottie-react";
import { Libertinus_Serif } from "next/font/google";
import Link from "next/link";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import zxcvbn from "zxcvbn";
import registerAnimation from "@/assets/register_animation.json";

const libertinusSans = Libertinus_Serif({
  variable: "--font-libertinus-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const formScheme = z.object({
  email: z.email("Email tidak boleh kosong!"),
  username: z
    .string()
    .nonempty("Username tidak boleh kosong!")
    .min(6, "Username minimal 6 karakter!"),
  password: z
    .string()
    .nonempty("Password tidak boleh kosong!")
    .min(8, "Password minimal 8 karakter!")
    .regex(/[A-Za-z]/, "Password harus mengandung huruf")
    .regex(/\d/, "Password harus mengandung angka")
    .regex(/[^A-Za-z0-9]/, "Password harus mengandung simbol"),
});

type FormDaftarType = z.infer<typeof formScheme>;

const Daftar = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormDaftarType>({
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
    resolver: zodResolver(formScheme),
  });
  const [showPassword, setShowPassword] = useState(false);
  const password = watch("password");
  const strongthPassword = zxcvbn(password);
  const handleDaftar: SubmitHandler<FormDaftarType> = ({
    email,
    password,
    username,
  }) => {
    alert(
      email + " " + password + " " + username + " " + strongthPassword.score
    );
  };
  return (
    <div className="min-h-screen flex gap-10 justify-center items-center bg-gradient-to-br from-[#F5F2ED] via-[#f0e6dc] to-[#8B5E3C]">
      <div>
        <Lottie animationData={registerAnimation} loop style={{ width: 400 }} />
      </div>
      <div className="bg-secondary rounded-2xl w-1/2 h-fit shadow-xl border border-slate-200 p-5">
        <h1
          className={`${libertinusSans.variable} ${libertinusSans.className} text-primary text-4xl text-center font-bold`}
        >
          Daftar
        </h1>
        <form
          onSubmit={handleSubmit(handleDaftar)}
          className="mt-20 flex flex-col gap-3 justify-center items-center mb-20"
        >
          <div className="w-1/2">
            <input
              type="email"
              className={`outline-none border rounded px-4 w-full py-2 placeholder:text-gray-400 ${
                errors.email ? "border-red-600" : "border-primary"
              }`}
              placeholder="Email..."
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="w-1/2">
            <input
              type="string"
              className={`outline-none border rounded px-4 w-full py-2 placeholder:text-gray-400 ${
                errors.username ? "border-red-600" : "border-primary"
              }`}
              placeholder="Username..."
              {...register("username")}
            />
            {errors.username && (
              <p className="text-sm text-red-600 mt-1">
                {errors.username.message}
              </p>
            )}
          </div>
          <div className="w-1/2">
            <div
              className={`w-full px-4 py-2 border ${
                errors.password ? "border-red-600" : "border-primary"
              } rounded flex gap-2`}
            >
              <input
                type={showPassword ? "text" : "password"}
                className="outline-none placeholder:text-gray-400 w-full"
                placeholder="Password..."
                {...register("password")}
              />
              <div
                className="cursor-pointer w-fit"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeIcon className="w-6" />
                ) : (
                  <EyeSlashIcon className="w-6" />
                )}
              </div>
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="w-1/2">
            <button
              className="bg-primary px-4 py-2 w-full text-white rounded font-semibold cursor-pointer hover:bg-primary/95 active:scale-95 transition duration-200"
              type="submit"
            >
              Daftar
            </button>
            <Link
              href="/masuk"
              className="relative inline-block font-medium cursor-pointer transition-colors duration-200
    text-gray-500
    after:absolute after:left-0 after:bottom-0 
    after:h-[2px] after:w-full after:origin-left after:scale-x-0
    after:bg-gray-500 after:transition-transform after:duration-300
    hover:after:scale-x-100 text-sm"
            >
              Punya akun? Masuk
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Daftar;
