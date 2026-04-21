import { FaGithub, FaTwitter, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import logo from '../assets/U_logo1.ico';

const footerSections = [
  { title: 'Udaan', links: [{ label: 'About Us', to: '/about' }, { label: 'Careers', to: '#' }, { label: 'Contact', to: '/contact' }, { label: 'Affiliates', to: '#' }] },
  { title: 'Resources', links: [{ label: 'Blog', to: '#' }, { label: 'Cheat Sheets', to: '#' }, { label: 'Code Challenges', to: '#' }, { label: 'Projects', to: '#' }, { label: 'Docs', to: '#' }] },
  { title: 'Plans', links: [{ label: 'Paid Memberships', to: '#' }, { label: 'For Students', to: '#' }, { label: 'Business Solutions', to: '#' }, { label: 'Forums', to: '#' }, { label: 'Events', to: '#' }] },
  { title: 'Subjects', links: [{ label: 'Web Development', to: '#' }, { label: 'Data Science', to: '#' }, { label: 'AI / ML', to: '#' }, { label: 'Cloud Computing', to: '#' }, { label: 'Cybersecurity', to: '#' }, { label: 'Mobile Dev', to: '#' }] },
];

const socialLinks = [
  { icon: FaGithub, href: '#', label: 'GitHub' },
  { icon: FaTwitter, href: '#', label: 'Twitter' },
  { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
  { icon: FaYoutube, href: '#', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className='bg-rich-black-800 text-rich-black-300 border-t border-rich-black-700'>
      <div className='h-px w-full bg-gradient-to-r from-transparent via-yellow-50/30 to-transparent' />
      <div className='w-11/12 max-w-7xl mx-auto py-12'>
        <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 pb-10 border-b border-rich-black-700'>
          {/* Brand */}
          <div className='col-span-2 sm:col-span-4 lg:col-span-1 flex flex-col gap-5'>
            <Link to='/' className='flex items-center gap-2'>
              <img src={logo} alt='Udaan' width={44} />
              <span className='text-xl font-extrabold text-white tracking-tight'>Udaan</span>
            </Link>
            <p className='text-sm text-rich-black-400 leading-relaxed'>Empowering learners worldwide with cutting-edge coding skills and career-ready programs.</p>
            <div className='flex gap-3 flex-wrap'>
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label}
                  className='w-9 h-9 rounded-xl bg-rich-black-700 border border-rich-black-600 flex items-center justify-center text-rich-black-300 hover:text-yellow-50 hover:border-yellow-50/40 hover:bg-yellow-50/5 transition-all hover:scale-110'>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title} className='flex flex-col gap-3'>
              <h3 className='text-sm font-bold text-white uppercase tracking-widest'>{section.title}</h3>
              <ul className='space-y-2'>
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className='text-sm text-rich-black-400 hover:text-white transition-colors duration-150'>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className='flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-rich-black-500'>
          <div className='flex items-center gap-4'>
            <a href='#' className='hover:text-rich-black-200 transition-colors'>Privacy Policy</a>
            <span className='text-rich-black-700'>|</span>
            <a href='#' className='hover:text-rich-black-200 transition-colors'>Cookie Policy</a>
            <span className='text-rich-black-700'>|</span>
            <a href='#' className='hover:text-rich-black-200 transition-colors'>Terms of Service</a>
          </div>
          <p>Made with ❤️ &copy; {new Date().getFullYear()} Udaan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
