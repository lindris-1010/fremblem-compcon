import { Home, Cpu, BookOpenText, PackagePlus, Smile, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { to: "/", icon: <Home size={20} />, label: "Home" },
    { to: "/managecharacters", icon: <Users size={20} />, label: "Characters" },
    { to: "/managenpcs", icon: <Smile size={20} />, label: "NPCs" },
    { to: "/compendium", icon: <BookOpenText size={20} />, label: "Compendium" },
    { to: "/contentpacks", icon: <PackagePlus size={20} />, label: "Content Packs" },
  ];

  const toggleSidebar = () => setCollapsed(!collapsed);

  console.log("Sidebar rendering!");

  return (
    <aside
      className={`h-screen bg-gray-700 text-white transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      } shadow-lg`}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && <h2 className="text-xl font-bold">Fremblem 4e</h2>}
        <button
          onClick={toggleSidebar}
          className="text-gray-400 hover:text-white focus:outline-none"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex flex-col gap-2 px-2">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 p-3 rounded-md transition-colors ${
                isActive
                  ? "bg-gray-700 text-white font-semibold"
                  : "text-gray-300 hover:bg-gray-700"
              }`
            }
          >
            {icon}
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}