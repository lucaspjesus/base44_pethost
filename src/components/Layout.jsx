import { useEffect, useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { PawPrint, Compass, Calendar, Heart, User, Home as HomeIcon, ClipboardList, ShieldCheck, Megaphone } from "lucide-react";

const navByRole = {
  tutor: [
    { to: "/", label: "Explorar", icon: Compass },
    { to: "/reservas", label: "Reservas", icon: Calendar },
    { to: "/saude", label: "Saúde", icon: Heart },
    { to: "/perfil", label: "Perfil", icon: User },
  ],
  anfitriao: [
    { to: "/", label: "Painel", icon: HomeIcon },
    { to: "/host/reservas", label: "Reservas", icon: ClipboardList },
    { to: "/anuncio", label: "Anúncio", icon: Megaphone },
    { to: "/perfil", label: "Perfil", icon: User },
  ],
  admin: [
    { to: "/", label: "Dashboard", icon: ShieldCheck },
    { to: "/anfitrioes", label: "Anfitriões", icon: ClipboardList },
    { to: "/admin/reservas", label: "Reservas", icon: Calendar },
    { to: "/perfil", label: "Perfil", icon: User },
  ],
};

export default function Layout() {
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser).catch(() => setUser(null)); }, []);
  const role = user?.role || "tutor";
  const items = navByRole[role] || navByRole.tutor;
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-2">
          <div className="flex items-center gap-2 font-heading font-bold text-primary">
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground grid place-items-center"><PawPrint className="w-5 h-5" /></div>
            <span className="text-lg">PetNest</span>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 pt-4 pb-28 md:pb-10">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden glass border-t border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-4">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}