import { FaFacebook, FaTwitter, FaYoutube, FaGoogle } from "react-icons/fa";
import CircularText from "../assets/preComponents.jsx/CircularText";

export default function Footer() {
  return (
    <footer className="bg-rich-black-800 text-gray-400 py-10 px-6 border-t border-rich-black-600 hidden md:block">
      <div className="mx-auto flex flex-row justify-between gap-8 border-b border-gray-700 pb-8 relative overflow-hidden">
        
        <div>
          <h2 className="text-white text-lg font-semibold mb-4">Udaan</h2>
          <p>Company</p>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white">About</a></li>
            <li><a href="#" className="hover:text-white">Careers</a></li>
            <li><a href="#" className="hover:text-white">Affiliates</a></li>
          </ul>
          <div className="flex mt-4 space-x-4">
            <a href="#"><FaFacebook size={20} /></a>
            <a href="#"><FaGoogle size={20} /></a>
            <a href="#"><FaTwitter size={20} /></a>
            <a href="#"><FaYoutube size={20} /></a>
          </div>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-white font-semibold mb-4">Resources</h3>
          <ul className="space-y-2">
            <li><a href="#">Articles</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Chart Sheet</a></li>
            <li><a href="#">Code challenges</a></li>
            <li><a href="#">Docs</a></li>
            <li><a href="#">Projects</a></li>
            <li><a href="#">Videos</a></li>
            <li><a href="#">Workspaces</a></li>
          </ul>
        </div>

        {/* Plans */}
        <div>
          <h3 className="text-white font-semibold mb-4">Plans</h3>
          <ul className="space-y-2">
            <li><a href="#">Paid memberships</a></li>
            <li><a href="#">For students</a></li>
            <li><a href="#">Business solutions</a></li>
          </ul>

          <h3 className="text-white font-semibold mt-6 mb-4">Community</h3>
          <ul className="space-y-2">
            <li><a href="#">Forums</a></li>
            <li><a href="#">Chapters</a></li>
            <li><a href="#">Events</a></li>
          </ul>
        </div>

        {/* Subjects */}
        <div>
          <h3 className="text-white font-semibold mb-4">Subjects</h3>
          <ul className="space-y-2">
            <li>AI</li>
            <li>Cloud Computing</li>
            <li>Code Foundations</li>
            <li>Computer Science</li>
            <li>Cybersecurity</li>
            <li>Data Analytics</li>
            <li>Data Science</li>
            <li>Data Visualization</li>
            <li>Developer Tools</li>
            <li>DevOps</li>
            <li>Game Development</li>
            <li>IT</li>
            <li>Machine Learning</li>
            <li>Math</li>
            <li>Mobile Development</li>
            <li>Web Design</li>
            <li>Web Development</li>
          </ul>
        </div>

        {/* Languages */}
        <div>
          <h3 className="text-white font-semibold mb-4">Languages</h3>
          <ul className="space-y-2">
            <li>Bash</li>
            <li>C</li>
            <li>C++</li>
            <li>C#</li>
            <li>Go</li>
            <li>HTML & CSS</li>
            <li>Java</li>
            <li>JavaScript</li>
            <li>Kotlin</li>
            <li>PHP</li>
            <li>Python</li>
            <li>R</li>
            <li>Ruby</li>
            <li>SQL</li>
            <li>Swift</li>
          </ul>
        </div>

        {/* Career Building */}
        <div>
          <h3 className="text-white font-semibold mb-4">Career building</h3>
          <ul className="space-y-2">
            <li>Career paths</li>
            <li>Career services</li>
            <li>Interview prep</li>
            <li>Professional certification</li>
            <li>-</li>
            <li>Full Catalog</li>
            <li>Beta Content</li>
          </ul>
          
          <CircularText
              text="AAPKI*UDAAN*AAPKI*UDAAN*"
              onHover="speedUp"
              spinDuration={10}
              className="mt-32 absolute top-10 text-rich-black-400 w-1/2 h-1/2"
            />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 mt-6">
        <div className="space-x-4">
          <a href="#">Privacy Policy</a>
          <span>|</span>
          <a href="#">Cookie Policy</a>
          <span>|</span>
          <a href="#">Terms</a>
        </div>
        <p className="mt-4 md:mt-0">Made with ❤️ © 2025 Udaan</p>
      </div>
    </footer>
  );
}
