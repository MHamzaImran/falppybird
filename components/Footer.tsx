
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="text-center py-4 text-sky-200 text-sm bg-sky-900/50">
<p>
  &copy; {new Date().getFullYear()} Built by{' '}
  <a 
    href="https://www.ihamza.online/" 
    target="_blank" 
    rel="noopener noreferrer" 
    className="text-blue-500 hover:underline"
  >
    Hamza Imran
  </a>
  . All Rights Reserved.
</p>


    </footer>
  );
};

export default Footer;
