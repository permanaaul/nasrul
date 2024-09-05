import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-800 p-4 text-white text-center">
      <p>&copy; {new Date().getFullYear()} My App. All rights reserved.</p>
      <nav className="mt-2">
        <ul className="flex justify-center space-x-4">
          <li>
            <Link href="/" legacyBehavior>
              <a className="hover:text-gray-400">Home</a>
            </Link>
          </li>
          <li>
            <Link href="/about" legacyBehavior>
              <a className="hover:text-gray-400">About</a>
            </Link>
          </li>
          <li>
            <Link href="/contact" legacyBehavior>
              <a className="hover:text-gray-400">Contact</a>
            </Link>
          </li>
        </ul>
      </nav>
    </footer>
  );
};

export default Footer;
