'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  // Hooks
  const { isBreakpointReached } = useVerticalNav()

  return (
    <div
      className={classnames(verticalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
    >
      <p>
        <span>{`© ${new Date().getFullYear()},All rights reserved.`}</span>
        <span>{`❤️`}</span>
      </p>
      {!isBreakpointReached && (
        <div className='flex items-center gap-4'>
          <Link href='' target='_blank' className='text-primary'>
            License
          </Link>

          {/* <Link
            href={`https://github.com/themeselection/${process.env.NEXT_PUBLIC_REPO_NAME}/issues`}
            target='_blank'
            className='text-primary'
          >
            Support
          </Link> */}
        </div>
      )}
    </div>
  )
}

export default FooterContent
