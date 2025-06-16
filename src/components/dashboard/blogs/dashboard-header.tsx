import { DashBoardHeaderProps } from "@/types";

const DashboardHeader = ({ heading, text, children }: DashBoardHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 px-2">
      <div className="grid gap-1">
        <h1 className="font-extrabold text-2xl md:text-3xl lg:text-4xl">
          {heading}
        </h1>
        {text && (
          <p className="text-base md:text-lg text-muted-foreground">{text}</p>
        )}
      </div>
      {children}
    </div>
  );
};

export default DashboardHeader;
