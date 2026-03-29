import { isUrl } from "@/utils/matchHelpers";

interface TeamLogoProps {
  logo?: string;
  name: string;
  className?: string;
  fallbackClassName?: string;
}

export function TeamLogo({ logo, name, className = "h-10 w-10", fallbackClassName = "" }: TeamLogoProps) {
  if (isUrl(logo)) {
    return (
      <img
        src={logo}
        alt={name}
        className={`${className} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${className} flex items-center justify-center rounded-full ${fallbackClassName}`}>
      {logo || "🏏"}
    </div>
  );
}
