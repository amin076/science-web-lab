function HamburgerMenu({ open, onToggle }) {
  return (
    <button
      className={`hamburger ${open ? "active" : ""}`}
      aria-label="Toggle menu"
      onClick={onToggle}
    >
      ☰
    </button>
  );
}

export default HamburgerMenu;

