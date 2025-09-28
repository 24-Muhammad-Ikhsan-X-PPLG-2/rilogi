import Link from "next/link";
import { ComponentProps, FC, ReactNode } from "react";

type LinkComponentType = ComponentProps<"a"> & {
  children: ReactNode;
  href?: string;
};

const LinkComponent: FC<LinkComponentType> = ({
  children,
  href = "#",
  ...props
}) => {
  return (
    <Link
      href={href}
      className={`relative inline-block font-medium cursor-pointer transition-colors duration-200
    hover:text-primary
    after:absolute after:left-0 after:bottom-0 
    after:h-[2px] after:w-full after:origin-left after:scale-x-0
    after:bg-primary after:transition-transform after:duration-300
    hover:after:scale-x-100 ${props.className}`}
      {...props}
    >
      {children}
    </Link>
  );
};

export default LinkComponent;
