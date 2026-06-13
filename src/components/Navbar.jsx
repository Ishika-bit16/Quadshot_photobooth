import { Link } from 'react-router-dom'

const GithubIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482
         0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462
         -.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832
         .092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943
         0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647
         0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337
         c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647
         .64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935
         .359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743
         0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"
      fill="#c0504a"/>
  </svg>
)

export default function Navbar() {
  return (
    <nav id="navbar">
      <div id="logo"><Link to="/">Quadshot</Link></div>
      <div id="links">
        <Link to="/">Home</Link>
        <Link to="/snaps">Snaps</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </div>
      <div id="rightnav">
        <a href="https://github.com/Ishika-bit16/Quadshot_photobooth" target="_blank" rel="noreferrer" id="github-link">
          <GithubIcon />
        </a>
      </div>
    </nav>
  )
}
