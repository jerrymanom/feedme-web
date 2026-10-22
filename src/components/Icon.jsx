// Line icons drawn for the tab bar; stroke follows the text color.
const PATHS = {
  today: 'M4 13h16a8 8 0 0 1-16 0Z M12 3c2.2 1.6 2.6 4 0 6.6C9.4 7 9.8 4.6 12 3Z',
  pantry: 'M5 4h14v16H5Z M5 10h14 M5 15h14 M9 7h2 M9 12.5h2 M9 17.5h2',
  receipt: 'M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21Z M9 8h6 M9 12h6 M9 16h3',
  home: 'M4 11 12 4l8 7v9h-5v-6H9v6H4Z',
}

export default function Icon({ name }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={PATHS[name]} />
    </svg>
  )
}
