import Link from "next/link";

const Header = () => {
  return (
    <header className="bg-gray-800 p-4 text-white">
      <nav className="container mx-auto flex justify-between items-center">
        <div className="text-lg font-bold">
          <Link href="/" legacyBehavior>
            <a className="hover:text-gray-300">My App</a>
          </Link>
        </div>
        <ul className="flex space-x-4">
          <li>
            <Link href="/" legacyBehavior>
              <a className="hover:text-gray-300">Home</a>
            </Link>
          </li>
          <li>
            <Link href="/about" legacyBehavior>
              <a className="hover:text-gray-300">About</a>
            </Link>
          </li>
          <li>
            <Link href="/contact" legacyBehavior>
              <a className="hover:text-gray-300">Contact</a>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
