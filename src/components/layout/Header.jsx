import { useState } from "react";
import Brand from "./Brand";
import Navbar from "./Navbar";
import HamburgerMenu from "./HamburgerMenu";

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-inner">
        <Brand onClick={() => setOpen(false)} />
        <HamburgerMenu open={open} onToggle={() => setOpen((v) => !v)} />
        <Navbar open={open} onClose={() => setOpen(false)} />
      </div>
    </header>
  );
}

export default Header;
