import React from 'react';

const baseProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.8',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
};

function Path({ d, fill = 'none' }) {
  return <path d={d} fill={fill} />;
}

function Circle({ cx, cy, r, fill = 'none' }) {
  return <circle cx={cx} cy={cy} r={r} fill={fill} />;
}

function iconFor(name) {
  switch (name) {
    case 'house':
      return (
        <>
          <Path d="M3 11.5 12 4l9 7.5" />
          <Path d="M5 10.5V20h14v-9.5" />
          <Path d="M9 20v-6h6v6" />
        </>
      );
    case 'user':
      return (
        <>
          <Circle cx="12" cy="8" r="3.25" />
          <Path d="M5.5 19.5c1.3-3.4 4.2-5.1 6.5-5.1s5.2 1.7 6.5 5.1" />
        </>
      );
    case 'users':
    case 'people-group':
      return (
        <>
          <Circle cx="8.5" cy="8.3" r="2.3" />
          <Circle cx="15.5" cy="9.2" r="2.1" />
          <Path d="M4.5 19c.8-2.8 2.9-4.4 4.7-4.4s3.9 1.6 4.7 4.4" />
          <Path d="M12.5 19c.5-2 2-3.2 3.5-3.2s3 .9 3.5 3.2" />
        </>
      );
    case 'search':
      return (
        <>
          <Circle cx="10.5" cy="10.5" r="4.75" />
          <Path d="M14.2 14.2 19 19" />
        </>
      );
    case 'bell':
      return (
        <>
          <Path d="M12 5.5c-2.8 0-5 2.2-5 5v3.1c0 .8-.3 1.6-.8 2.1L5.5 17h13l-.7-1.3c-.5-.5-.8-1.3-.8-2.1V10.5c0-2.8-2.2-5-5-5Z" />
          <Path d="M9.5 17.5c.6 1.1 1.4 1.7 2.5 1.7s1.9-.6 2.5-1.7" />
        </>
      );
    case 'envelope':
      return (
        <>
          <Path d="M4.5 7.5h15v9h-15z" />
          <Path d="m5 8 7 5 7-5" />
        </>
      );
    case 'lock':
      return (
        <>
          <Path d="M7.5 11V9a4.5 4.5 0 0 1 9 0v2" />
          <Path d="M6.5 11h11v8h-11z" />
          <Circle cx="12" cy="15" r="1.2" fill="currentColor" />
        </>
      );
    case 'eye':
      return (
        <>
          <Path d="M2.8 12s3.1-5.5 9.2-5.5S21.2 12 21.2 12s-3.1 5.5-9.2 5.5S2.8 12 2.8 12Z" />
          <Circle cx="12" cy="12" r="2.7" />
        </>
      );
    case 'eye-slash':
      return (
        <>
          <Path d="m4 4 16 16" />
          <Path d="M10 10a3 3 0 0 1 4 4" />
          <Path d="M6.2 8.2C4.8 9.4 3.8 10.8 2.8 12c0 0 3.1 5.5 9.2 5.5 1 0 1.9-.1 2.8-.3" />
          <Path d="M14.8 14.8c.7-.7 1.2-1.7 1.2-2.8 0-2.1-1.7-3.8-3.8-3.8-.8 0-1.5.2-2.1.6" />
        </>
      );
    case 'chevron-down':
      return <Path d="m7 10 5 5 5-5" />;
    case 'chevron-left':
      return <Path d="m14 7-5 5 5 5" />;
    case 'chevron-right':
      return <Path d="m10 7 5 5-5 5" />;
    case 'caret-down':
      return <Path d="m7 10 5 5 5-5" />;
    case 'mug-hot':
      return (
        <>
          <Path d="M7 8h8v5a4 4 0 0 1-4 4H9a2 2 0 0 1-2-2V8Z" />
          <Path d="M15 9h1.5a1.5 1.5 0 0 1 0 3H15" />
          <Path d="M8 6.5c0-.9.7-1.1.7-2" />
          <Path d="M10 6.5c0-.9.7-1.1.7-2" />
        </>
      );
    case 'briefcase':
      return (
        <>
          <Path d="M9 7V6a3 3 0 0 1 6 0v1" />
          <Path d="M4.5 8.5h15v8.5a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V8.5Z" />
          <Path d="M4.5 11h15" />
        </>
      );
    case 'file-lines':
      return (
        <>
          <Path d="M7 4.5h7l3.5 3.5V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 5.5 19V6A1.5 1.5 0 0 1 7 4.5Z" />
          <Path d="M12 4.5V8h3.5" />
          <Path d="M8.5 11h7" />
          <Path d="M8.5 14h7" />
        </>
      );
    case 'circle-check':
      return (
        <>
          <Circle cx="12" cy="12" r="7.5" />
          <Path d="m8.7 12.2 2.2 2.1 4.5-5" />
        </>
      );
    case 'circle-xmark':
      return (
        <>
          <Circle cx="12" cy="12" r="7.5" />
          <Path d="m9 9 6 6" />
          <Path d="m15 9-6 6" />
        </>
      );
    case 'ellipsis':
      return (
        <>
          <Circle cx="6" cy="12" r="1.1" fill="currentColor" />
          <Circle cx="12" cy="12" r="1.1" fill="currentColor" />
          <Circle cx="18" cy="12" r="1.1" fill="currentColor" />
        </>
      );
    case 'list':
      return (
        <>
          <Path d="M8 7h10" />
          <Path d="M8 12h10" />
          <Path d="M8 17h10" />
          <Circle cx="5" cy="7" r="0.9" fill="currentColor" />
          <Circle cx="5" cy="12" r="0.9" fill="currentColor" />
          <Circle cx="5" cy="17" r="0.9" fill="currentColor" />
        </>
      );
    case 'grip':
      return (
        <>
          <Circle cx="8" cy="8" r="1" fill="currentColor" />
          <Circle cx="12" cy="8" r="1" fill="currentColor" />
          <Circle cx="16" cy="8" r="1" fill="currentColor" />
          <Circle cx="8" cy="12" r="1" fill="currentColor" />
          <Circle cx="12" cy="12" r="1" fill="currentColor" />
          <Circle cx="16" cy="12" r="1" fill="currentColor" />
          <Circle cx="8" cy="16" r="1" fill="currentColor" />
          <Circle cx="12" cy="16" r="1" fill="currentColor" />
          <Circle cx="16" cy="16" r="1" fill="currentColor" />
        </>
      );
    case 'calendar':
      return (
        <>
          <Path d="M7 4.5v2" />
          <Path d="M17 4.5v2" />
          <Path d="M4.5 8h15" />
          <Path d="M6 6.5h12a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 18 18H6a1.5 1.5 0 0 1-1.5-1.5V8A1.5 1.5 0 0 1 6 6.5Z" />
        </>
      );
    case 'clock':
      return (
        <>
          <Circle cx="12" cy="12" r="7.5" />
          <Path d="M12 8.5v4l2.8 1.8" />
        </>
      );
    case 'download':
      return (
        <>
          <Path d="M12 4.5v8" />
          <Path d="m8.5 10.5 3.5 3.5 3.5-3.5" />
          <Path d="M5.5 18.5h13" />
        </>
      );
    case 'comments':
      return (
        <>
          <Path d="M5.5 6.5h13v8h-6l-3.5 3v-3H5.5Z" />
          <Path d="M8.2 9.5h7.6" />
          <Path d="M8.2 11.8h4.8" />
        </>
      );
    case 'ghost':
      return (
        <>
          <Path d="M12 4.5a5.5 5.5 0 0 0-5.5 5.5v8l2-1.3 1.8 1.3 1.7-1.3 1.8 1.3 1.7-1.3 2 1.3V10a5.5 5.5 0 0 0-5.5-5.5Z" />
          <Circle cx="10" cy="10.5" r="0.7" fill="currentColor" />
          <Circle cx="14" cy="10.5" r="0.7" fill="currentColor" />
          <Path d="M10 14h4" />
        </>
      );
    case 'bullseye':
      return (
        <>
          <Circle cx="12" cy="12" r="7.2" />
          <Circle cx="12" cy="12" r="3.4" />
          <Circle cx="12" cy="12" r="1" fill="currentColor" />
        </>
      );
    case 'clipboard':
      return (
        <>
          <Path d="M9 5.5h6" />
          <Path d="M10 4.5h4a1 1 0 0 1 1 1V7H9V5.5a1 1 0 0 1 1-1Z" />
          <Path d="M8 7h8a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 16 20H8a1.5 1.5 0 0 1-1.5-1.5v-10A1.5 1.5 0 0 1 8 7Z" />
          <Path d="m9.5 12 1.7 1.7 3.3-3.8" />
        </>
      );
    case 'gallery':
      return (
        <>
          <Path d="M6 5.5h12A1.5 1.5 0 0 1 19.5 7v10A1.5 1.5 0 0 1 18 18.5H6A1.5 1.5 0 0 1 4.5 17V7A1.5 1.5 0 0 1 6 5.5Z" />
          <Path d="M8 14.5 10.8 11l2.2 2.4 1.7-1.8 3.3 4.9" />
          <Circle cx="9.2" cy="9.2" r="1" fill="currentColor" />
        </>
      );
    case 'compass':
      return (
        <>
          <Circle cx="12" cy="12" r="7.2" />
          <Path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
        </>
      );
    case 'chart-line':
      return (
        <>
          <Path d="M5 18.5h14" />
          <Path d="M7.5 15.5 11 12l2.5 2.5 3.5-5" />
          <Circle cx="7.5" cy="15.5" r="0.8" fill="currentColor" />
          <Circle cx="11" cy="12" r="0.8" fill="currentColor" />
          <Circle cx="13.5" cy="14.5" r="0.8" fill="currentColor" />
          <Circle cx="17" cy="9.5" r="0.8" fill="currentColor" />
        </>
      );
    case 'gear':
      return (
        <>
          <Circle cx="12" cy="12" r="2.6" />
          <Path d="M12 5.5v1.2" />
          <Path d="M12 17.3v1.2" />
          <Path d="M5.5 12h1.2" />
          <Path d="M17.3 12h1.2" />
          <Path d="m7.3 7.3.8.8" />
          <Path d="m15.9 15.9.8.8" />
          <Path d="m7.3 16.7.8-.8" />
          <Path d="m15.9 8.1.8-.8" />
        </>
      );
    case 'filter':
      return (
        <>
          <Path d="M4.5 5.5h15L14 12v6.5l-4-2.1V12L4.5 5.5Z" />
        </>
      );
    case 'arrow-down':
      return (
        <>
          <Path d="M12 4.5v10" />
          <Path d="m7.5 11 4.5 4.5 4.5-4.5" />
        </>
      );
    case 'arrow-up':
      return (
        <>
          <Path d="M12 19.5v-10" />
          <Path d="m7.5 13 4.5-4.5 4.5 4.5" />
        </>
      );
    case 'ellipsis-vertical':
      return (
        <>
          <Circle cx="12" cy="6" r="1.1" fill="currentColor" />
          <Circle cx="12" cy="12" r="1.1" fill="currentColor" />
          <Circle cx="12" cy="18" r="1.1" fill="currentColor" />
        </>
      );
    case 'trash':
      return (
        <>
          <Path d="M4.8 7h14.4" />
          <Path d="M9 7V5.8A1.3 1.3 0 0 1 10.3 4.5h3.4A1.3 1.3 0 0 1 15 5.8V7" />
          <Path d="M7.2 7.2 8 19h8l.8-11.8" />
          <Path d="M10.5 10.2v5.8" />
          <Path d="M13.5 10.2v5.8" />
        </>
      );
    case 'calendar-check':
      return (
        <>
          <Path d="M7 4.5v2" />
          <Path d="M17 4.5v2" />
          <Path d="M4.5 8h15" />
          <Path d="M6 6.5h12a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 18 18H6a1.5 1.5 0 0 1-1.5-1.5V8A1.5 1.5 0 0 1 6 6.5Z" />
          <Path d="m8.8 12.1 1.8 1.7 4-4.4" />
        </>
      );
    case 'wallet':
      return (
        <>
          <Path d="M5 8.5h14v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7Z" />
          <Path d="M18 10h-3.5a1.5 1.5 0 0 0 0 3H18" />
          <Circle cx="16.3" cy="11.5" r="0.7" fill="currentColor" />
        </>
      );
    case 'inbox':
      return (
        <>
          <Path d="M4.5 7.5h15v9H4.5Z" />
          <Path d="M4.5 13h5l1.2 2h2.6l1.2-2h5" />
        </>
      );
    case 'right-from-bracket':
      return (
        <>
          <Path d="M10 7.5v-2h7.5v13H10v-2" />
          <Path d="m14 12H4.5" />
          <Path d="m8 8.5 4 3.5-4 3.5" />
        </>
      );
    case 'pen-to-square':
      return (
        <>
          <Path d="M4.5 17.5 5.5 14l7.8-7.8a1.5 1.5 0 0 1 2.1 0l1.4 1.4a1.5 1.5 0 0 1 0 2.1L9 17.5l-4.5.8Z" />
          <Path d="M12.5 7.5 16.5 11.5" />
        </>
      );
    case 'clock-rotate-left':
      return (
        <>
          <Path d="M12 6.5a5.5 5.5 0 1 1-4 9.3" />
          <Path d="M8.5 10.5h3.8V7" />
          <Path d="M6.5 8.5 8.5 6.5" />
        </>
      );
    case 'circle-question':
      return (
        <>
          <Circle cx="12" cy="12" r="7.5" />
          <Path d="M12 16v-.2" />
          <Path d="M10.7 9a1.7 1.7 0 1 1 2.7 1.4c-.8.5-1.4 1-1.4 2v.3" />
        </>
      );
    case 'sparkles':
      return (
        <>
          <Path d="M12 4.8 13.2 8l3.2 1.2-3.2 1.2L12 13.6 10.8 10.4 7.6 9.2 10.8 8 12 4.8Z" />
          <Path d="M18 12.5 18.7 14.3 20.5 15 18.7 15.7 18 17.5 17.3 15.7 15.5 15 17.3 14.3 18 12.5Z" />
          <Path d="M6 13.5 6.5 15 8 15.5 6.5 16 6 17.5 5.5 16 4 15.5 5.5 15 6 13.5Z" />
        </>
      );
    default:
      return (
        <>
          <Circle cx="12" cy="12" r="7.5" />
          <Path d="M12 8.5v4.2" />
          <Path d="M12 15.5v.1" />
        </>
      );
  }
}

export default function Icon({ name, className = '', size = 18, strokeWidth, style }) {
  return (
    <svg
      {...baseProps}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth ?? baseProps.strokeWidth}
      style={{ display: 'inline-block', verticalAlign: 'middle', flex: '0 0 auto', ...style }}
    >
      {iconFor(name)}
    </svg>
  );
}
