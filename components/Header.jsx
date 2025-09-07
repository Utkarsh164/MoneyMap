import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox } from "lucide-react";
import { checkUser } from "@/lib/checkUser";
import { DM_Serif_Display } from "next/font/google";

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
});

const Header = async () => {
  await checkUser();
  return (
    <div className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b">
      <nav className="flex items-center justify-between p-4 container max-w-full mx-auto">
        <Link href={"/"}>
          <span className={`text-4xl gradient-title ${dmSerif.className}`}>
            MoneyMap
          </span>
        </Link>
        <div className="">
          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button variant={"outline"}>Login</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="flex justify-between items-center gap-4">
              <Link href={"/dashboard"}>
                <Button
                  className="text-gray-600 hover:text-blue-600 items-center flex gap-2"
                  variant={"outline"}
                >
                  <LayoutDashboard size={18} />
                  <span className="hidden md:inline">DashBoard</span>
                </Button>
              </Link>
              <Link href={"/transaction/create"}>
                <Button className=" items-center flex gap-2">
                  <PenBox size={18} />
                  <span className="hidden md:inline">Add Transaction</span>
                </Button>
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              />
            </div>
          </SignedIn>
        </div>
      </nav>
    </div>
  );
};

export default Header;
