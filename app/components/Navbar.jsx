"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "History" },
  { href: "/profile", label: "Profile" },
];

export default function Navbar({ user, logout }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
      <Link href="/" className="text-xl font-bold text-indigo-400">InterviewAI</Link>
      <div className="flex items-center gap-4">
        {links
          .filter((link) => link.href !== pathname)
          .map((link) => (
            <Link key={link.href} href={link.href} className="text-gray-400 hover:text-white text-sm transition">
              {link.label}
            </Link>
          ))}
        <span className="text-gray-400 text-sm">{user?.name}</span>
        <button
          onClick={logout}
          className="px-4 py-2 border border-gray-700 hover:border-red-500 hover:text-red-400 text-gray-300 rounded-lg transition text-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}