"use client";
import { formSchemeAddContact } from "@/utils/schema";
import { UserIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import React, {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import { AddContactAction } from "./action-add-contact";
import { toast } from "react-toastify";
import { useTheme } from "@/providers/theme-provider";
import { useSafeAsyncEffect } from "@/utils/lib";
import { createClient } from "@/utils/supabase/client";

type FormAddContact = z.infer<typeof formSchemeAddContact>;
type AddContactProps = {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  defaultRiloId?: string;
};

const AddContact: FC<AddContactProps> = ({
  setShow,
  show,
  defaultRiloId = "",
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<FormAddContact>({
    resolver: zodResolver(formSchemeAddContact),
    defaultValues: {
      nama_kontak: "",
      rilo_id: "",
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const addContactRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        addContactRef.current &&
        !addContactRef.current.contains(e.target as Node)
      ) {
        setShow(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const tambahKontak: SubmitHandler<FormAddContact> = async ({
    rilo_id,
    nama_kontak,
  }) => {
    setIsLoading(true);
    const supabase = createClient();
    const { error: ErrorSupabase, data: DataSupabase } = await supabase
      .from("profiles")
      .select("*")
      .like("rilo_id", `%${rilo_id}%`);
    if (ErrorSupabase || DataSupabase.length === 0) {
      setIsLoading(false);
      setError("rilo_id", {
        type: "manual",
        message: "Rilo ID tidak ditemukan.",
      });
      return;
    }
    const formData = new FormData();
    formData.set("rilo_id", rilo_id);
    formData.set("nama_kontak", nama_kontak);
    const res = await AddContactAction(formData);
    setIsLoading(false);
    if (res.error) {
      toast.error(res.message);
      return;
    }
    toast.success(res.message);
    reset();
    setShow(false);
  };
  useEffect(() => {
    if (!show) {
      reset();
    }
  }, [show]);
  return (
    <div
      className={`fixed w-full h-full bg-black/10 backdrop-filter backdrop-blur-lg z-[1000] flex justify-center items-center ${
        show ? "scale-100" : "scale-0 pointer-events-none"
      } transition-all duration-300 ease-in-out`}
    >
      <div
        className={`${
          theme == "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
        } w-[500px] p-5 h-fit rounded-xl shadow-xl relative`}
        ref={addContactRef}
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Kontak Baru</h1>
          <XMarkIcon
            className="w-8 cursor-pointer"
            onClick={() => setShow(false)}
          />
        </div>
        <div className="bg-primary flex justify-center items-center w-32 h-32 rounded-full mt-3 mx-auto">
          <UserIcon className="w-20 text-white" />
        </div>
        <form
          onSubmit={handleSubmit(tambahKontak)}
          className="mt-3 flex flex-col gap-3"
        >
          {defaultRiloId.trim() !== "" ? (
            <div>
              <label
                htmlFor="rilo_id"
                className={`font-semibold text-base pl-1 ${
                  errors.rilo_id ? "text-red-600" : ""
                }`}
              >
                Rilo id
              </label>
              <input
                type="number"
                className={`w-full outline-none border px-4 rounded py-2 ${
                  errors.rilo_id ? "border-red-600" : "border-primary"
                }`}
                placeholder="...."
                value={defaultRiloId}
                readOnly
                {...register("rilo_id")}
              />
              {errors.rilo_id && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.rilo_id?.message}
                </p>
              )}
            </div>
          ) : (
            <div>
              <label
                htmlFor="rilo_id"
                className={`font-semibold text-base pl-1 ${
                  errors.rilo_id ? "text-red-600" : ""
                }`}
              >
                Rilo id
              </label>
              <input
                type="number"
                className={`w-full outline-none border px-4 rounded py-2 ${
                  errors.rilo_id ? "border-red-600" : "border-primary"
                }`}
                placeholder="...."
                {...register("rilo_id")}
              />
              {errors.rilo_id && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.rilo_id?.message}
                </p>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="nama_kontak"
              className={`font-semibold text-base pl-1 ${
                errors.nama_kontak ? "text-red-600" : ""
              }`}
            >
              Nama Kontak
            </label>
            <input
              type="text"
              className={`w-full outline-none border px-4 rounded py-2 ${
                errors.nama_kontak ? "border-red-600" : "border-primary"
              }`}
              placeholder="...."
              {...register("nama_kontak")}
            />
            {errors.nama_kontak && (
              <p className="text-red-600 text-sm mt-1">
                {errors.nama_kontak?.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="bg-gray-600 text-white px-4 font-semibold text-sm py-2 rounded-lg hover:bg-600/95 cursor-pointer transition duration-200 active:scale-90 disabled:bg-gray-600"
              type="button"
              onClick={() => {
                reset();
                setShow(false);
              }}
            >
              Cancel
            </button>
            <button
              className="bg-primary text-white px-4 font-semibold text-sm py-2 rounded-lg hover:bg-primary/95 cursor-pointer transition duration-200 active:scale-90 disabled:bg-gray-600"
              type="submit"
              disabled={isLoading}
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContact;
