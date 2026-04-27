import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import ProfileMenu from "@/components/ProfileMenu";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-glass border-b border-border">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center" aria-label="Playona 홈">
          <img src={logo} alt="Playona" height={36} className="block h-9 w-auto" />
        </Link>
        <ProfileMenu />
      </div>
    </header>
  );
};

export default Header;
