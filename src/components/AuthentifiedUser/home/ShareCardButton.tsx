import { Link } from "react-router-dom";

const ShareCardButton = () => {
  return (
    <Link
      to="/share-card"
      className="px-2 py-1 text-white bg-blue-500 rounded-sm"
    >
      Partager
    </Link>
  );
};

export default ShareCardButton;
