import { Link } from "react-router-dom";

function Brand({ onClick }) {
  return (
    <Link to="/" className="brand" onClick={onClick}>
      <img src="/favicon-64-blue.png" alt="logo" width="24" height="24" />
      <span>Virtual Physics Lab</span>
    </Link>
  );
}

export default Brand;
