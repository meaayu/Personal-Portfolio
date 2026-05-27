export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="pt-20 pb-12 px-6 md:px-10 max-w-[1100px] mx-auto relative mt-20 border-t-2 border-dashed border-pencil-light/30 gpu">
      <div className="flex flex-col gap-3 items-center text-center">
        {/* Brand / Copy */}
        <span className="font-marker text-3xl text-ink leading-tight transition-all duration-200 hover:text-accent drop-shadow-sm select-none">
          Aayu<span className="text-accent">.</span>
        </span>
        <p className="font-caveat text-[1.2rem] text-ink-faint">Bridging the gap between art and code.</p>
        <p className="font-hand text-[0.85rem] text-ink/60 tracking-wider mt-2">
          © {currentYear} Aayu. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
