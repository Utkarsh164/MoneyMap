import React from 'react'

const layout = ({children}) => {
  return (
    <div className='container max-w-full mx-auto px-4 mb-5'>
      {children}
    </div>
  )
}

export default layout
