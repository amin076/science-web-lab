import { NavLink } from "react-router-dom";

function Navbar({ open, onClose }) {
  const navLinkClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;

  return (
    <nav className={`nav ${open ? "open" : ""}`}>
      <NavLink to="/" className={navLinkClass} onClick={onClose}>Home</NavLink>
      <NavLink to="/about" className={navLinkClass} onClick={onClose}>About</NavLink>
      <NavLink to="/experiments" className={navLinkClass} onClick={onClose}>Experiments</NavLink>
      <NavLink to="/login" className={navLinkClass} onClick={onClose}>Login</NavLink>
      <NavLink to="/register" className={navLinkClass} onClick={onClose}>Register</NavLink>
    </nav>
  );
}

export default Navbar;
