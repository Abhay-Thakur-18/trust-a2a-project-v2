import {
  ClipboardList,
  CircleCheckBig,
  ShieldCheck,
  Wallet,
} from "lucide-react";

export const stats = [
  {
    title: "Total Tasks",
    value: "25",
    change: "+12%",
    icon: ClipboardList,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    title: "Paid Tasks",
    value: "18",
    change: "+8%",
    icon: CircleCheckBig,
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    title: "Trust Score",
    value: "96%",
    change: "+3%",
    icon: ShieldCheck,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    title: "Escrow Balance",
    value: "₹12,500",
    change: "+18%",
    icon: Wallet,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
];