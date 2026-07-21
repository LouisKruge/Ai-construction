import Sidebar from "@/components/Sidebar";
import CommandPalette from "@/components/CommandPalette";
import Assistant from "@/components/Assistant";
import TopBar from "@/components/TopBar";

export default function PlatformLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <CommandPalette />
      <Assistant />
      <div className="pl-60">
        <TopBar />
        <main className="mx-auto max-w-[1440px] px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
