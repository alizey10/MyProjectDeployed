const Logo = props => {
  return (
    <svg width='160' height='60' viewBox='0 0 160 60' xmlns='http://www.w3.org/2000/svg'>
      <defs>
        <linearGradient id='hubGradient' x1='0%' y1='0%' x2='100%' y2='0%'>
          <stop offset='0%' stopColor='#FFD700' />
          <stop offset='40%' stopColor='#FFC300' />
          <stop offset='60%' stopColor='#00C9FF' />
          <stop offset='100%' stopColor='#12D8FA' />
        </linearGradient>
      </defs>

      <text
        x='10'
        y='45'
        fontFamily='Poppins, sans-serif'
        fontSize='35'
        fontWeight='800'
        fill='url(#hubGradient)'
        letterSpacing='-2'
      >
        VSpine
      </text>
    </svg>
  )
}

export default Logo
