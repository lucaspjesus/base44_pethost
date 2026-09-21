import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import Explorar from "@/pages/Explorar";
import PainelHost from "@/pages/host/PainelHost";
import Dashboard from "@/pages/admin/Dashboard";

export default function Home() {
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser).catch(() => setUser(null)); }, []);
  if (!user) return <div className="py-20 text-center text-muted-foreground">Carregando...</div>;
  if (user.role === "anfitriao") return <PainelHost />;
  if (user.role === "admin") return <Dashboard />;
  return <Explorar />;
}