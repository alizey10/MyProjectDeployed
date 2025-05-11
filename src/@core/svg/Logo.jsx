const Logo = props => {
  return (
    <svg width='160' height='60' viewBox='0 0 160 60' xmlns='http://www.w3.org/2000/svg'>
      <defs>
        <linearGradient id='hubGradient' x1='0%' y1='0%' x2='100%' y2='0%'>
          <stop offset='0%' stop-color='#FFD700' />
          <stop offset='40%' stop-color='#FFC300' />
          <stop offset='60%' stop-color='#00C9FF' />
          <stop offset='100%' stop-color='#12D8FA' />
        </linearGradient>
      </defs>

      <text
        x='10'
        y='45'
        font-family='Poppins, sans-serif'
        font-size='35'
        font-weight='800'
        fill='url(#hubGradient)'
        letter-spacing='-2'
      >
        VSpine
      </text>
    </svg>
  )
}

export default Logo
