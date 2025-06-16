import { cn } from "@/lib/utils";
import { DashBoardShellProps } from "@/types";

const DashBoardShell = ({
  children,
  className,
  ...props
}: DashBoardShellProps) => {
  return (
    <div
      className={cn("grid items-center gap-4 md:gap-8 pt-2 md:pt-5", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default DashBoardShell;
