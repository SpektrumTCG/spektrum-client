import Image from "next/image";

export default function SlideBackground({ variant }: { variant: 1 | 2 | 3 | 4 }) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <Image
        src={`/ui/v2-ui/Landing Page - Var ${variant}.svg`}
        alt=""
        fill
        className="object-cover opacity-100"
        priority
      />
    </div>
  );
}
