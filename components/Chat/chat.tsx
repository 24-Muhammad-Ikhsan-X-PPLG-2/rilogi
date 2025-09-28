"use client";
import { useChat } from "@/providers/chat-provider";
import { useTheme } from "@/providers/theme-provider";
import { createClient } from "@/utils/supabase/client";
import { MessageType } from "@/utils/types/message";
import {
  Bars3Icon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import TextareaAutoSize from "react-textarea-autosize";

type ChatProps = {};

const Chat: FC<ChatProps> = () => {
  const chatRef = useRef<HTMLDivElement>(null);
  const { chatWith } = useChat();
  const { theme } = useTheme();
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  return (
    <div
      className={`w-full h-[95vh] max-h-[95vh] rounded-xl ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      } backdrop-blur-lg p-5 flex flex-col relative`}
    >
      {chatWith.trim() === "" ? (
        <div className="w-full h-full flex flex-col text-white justify-center items-center">
          <ChatBubbleLeftRightIcon className="w-20" />
          <p className="font-semibold text-xl mt-1">Mulai obrolan...</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="w-full sticky top-0 shadow-xl bg-secondary p-3 rounded-xl flex justify-between items-center z-10">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary flex justify-center items-center text-white font-semibold">
                a
              </div>
              <div>
                <p className="text-base font-semibold">orang</p>
              </div>
            </div>
            <Bars3Icon className="w-8" />
          </div>

          {/* Chat messages */}
          <div
            className="flex-1 overflow-auto mt-3 flex flex-col gap-3 pr-2"
            ref={chatRef}
          >
            {/* Incoming */}
            <div className="bg-secondary w-fit max-w-xs px-4 py-2 rounded-2xl rounded-tl-none">
              <p className="text-sm">oi</p>
            </div>

            {/* Outgoing */}
            <div className="bg-primary ml-auto w-fit max-w-xs px-4 py-2 rounded-2xl rounded-tr-none">
              <p className="text-sm text-secondary">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
              </p>
            </div>

            {/* Tambah pesan lainnya */}
            <div className="bg-secondary w-fit max-w-xs px-4 py-2 rounded-2xl rounded-tl-none">
              <p className="text-sm">better</p>
            </div>
            <div className="bg-secondary w-fit max-w-xs px-4 py-2 rounded-2xl rounded-tl-none">
              <p className="text-sm">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste,
                voluptatem maxime eaque delectus officiis aspernatur corporis
                voluptas suscipit ratione repellendus nesciunt quidem,
                voluptates quam praesentium tempore nulla. Ullam enim vel
                voluptatibus temporibus odio, veritatis soluta cum, molestias
                nemo earum, laudantium libero minima autem. Omnis quo porro
                incidunt ex ad temporibus nobis quia officia mollitia alias
                blanditiis unde, sit, dolorum quae facere! Eum culpa itaque
                consequatur illo iste ea dignissimos illum accusantium.
                Molestiae, earum itaque! Assumenda magnam commodi, autem maiores
                deleniti ipsum cum labore ex mollitia distinctio, quibusdam
                incidunt sit sequi? Enim consequatur voluptate optio dicta.
                Odit, ad! Rerum expedita consectetur animi voluptatum dolor id
                illum molestiae velit at beatae nesciunt nobis deserunt pariatur
                repellat dicta aliquid amet vel veritatis quis necessitatibus
                eos, doloremque officia! Eligendi perspiciatis illo rerum
                doloremque voluptas quidem suscipit laudantium ut, culpa vitae
                veniam repellendus, adipisci officia aspernatur dignissimos
                cumque, alias atque error cum id repudiandae ratione fugit.
                Reiciendis maiores repudiandae reprehenderit, quod rem ullam
                natus, ea ab, harum nulla repellat iure atque inventore tempore
                eius in earum nostrum debitis qui. Expedita sit maxime quo enim
                fugit, reiciendis facilis accusantium earum eos? Cumque
                voluptates fugiat ducimus dicta odio perspiciatis laudantium
                corporis, rem ipsum praesentium iusto possimus libero nisi?
                Dolorum sit, recusandae nesciunt ad mollitia hic voluptatum qui,
                quae deserunt eligendi iste praesentium ducimus molestias enim,
                soluta aperiam. Nulla quae, sit nisi facilis impedit, laborum
                nobis quia illum quas odit, dolore iure voluptate necessitatibus
                eveniet temporibus! Culpa nulla neque, sapiente amet quo
                pariatur suscipit ex? Dignissimos eum sequi ipsa doloribus
                tempore laboriosam mollitia fugit sint itaque sunt
                exercitationem excepturi id, esse voluptates quibusdam
                repudiandae ex iure nesciunt optio nemo, nobis natus? Quisquam
                aspernatur non id excepturi unde temporibus, molestias eveniet
                nisi at, fugit quas vitae nesciunt reiciendis repudiandae
                dignissimos doloribus officia. Optio reprehenderit maiores
                velit. Maiores sapiente dolor impedit eaque atque sequi ab alias
                officiis commodi eos est, excepturi, delectus aspernatur in
                accusamus veniam laudantium repellendus exercitationem!
                Necessitatibus suscipit vel laboriosam. Ipsa corrupti eaque
                asperiores. Labore obcaecati adipisci praesentium provident
                consequatur sit corrupti neque dolorum fuga beatae repudiandae
                nisi natus delectus aliquid possimus, perferendis expedita
                accusantium dolores pariatur minima. Eius voluptate eum pariatur
                at. Quam dolorum illo officiis ut est dolor excepturi,
                consequatur eos voluptatum minima asperiores laboriosam laborum
                nobis enim provident inventore accusantium totam ipsa facilis
                quod. Vel soluta pariatur impedit molestias aspernatur. Quisquam
                esse voluptatibus voluptatum aut recusandae quibusdam iusto
                quidem at quos maxime minus sint, praesentium optio dolore nemo
                tenetur deserunt totam porro officia quia. A ut id vitae ipsum,
                consectetur repellendus molestiae eveniet repellat. Repellat,
                aliquam? Omnis illo sed a consequatur dolore dignissimos aliquam
                rem officiis ab nulla facere esse, magnam, error, nihil modi
                vitae nemo cupiditate consequuntur. Aliquid suscipit minima
                neque unde, facere ipsum velit tempore explicabo sed quia alias
                dicta delectus, quis cupiditate id ipsa? Perferendis cumque
                praesentium neque enim doloribus reiciendis officia architecto
                non, totam fugit dolorum porro cum nihil ipsam amet, labore
                doloremque! Quo voluptatum velit temporibus, totam in odit quam
                veritatis doloremque consectetur mollitia tempora autem
                doloribus nostrum ab.
              </p>
            </div>
            <div className="bg-primary ml-auto w-fit max-w-xs px-4 py-2 rounded-2xl rounded-tr-none">
              <p className="text-sm text-secondary">Y</p>
            </div>
            <div className="p-2"></div>
          </div>
          {/* Chat input: sticky di bawah */}
          <div className="w-[90%] bg-secondary shadow-xl h-fit max-h-32 overflow-y-visible p-5 flex items-end gap-4 rounded-2xl mx-auto mt-1">
            <TextareaAutoSize
              minRows={1}
              className="outline-none w-full resize-none bg-transparent max-h-24"
              placeholder="Tulis pesan..."
            />
            <button>
              <PaperAirplaneIcon className="w-6 text-primary" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
