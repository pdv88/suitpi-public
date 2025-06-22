import React from 'react'

function BackToTopBtn() {

  return (
    <>
    <button 
    className='fixed bottom-5 right-5 bg-primary text-white p-2 rounded-full shadow-md z-50 opacity-50 hover:opacity-100 transition-opacity duration-300'
    onClick={() => document.querySelector("section").scroll({ top: 0, left: 0, behavior: 'smooth' })}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
    </button>
    </>
  )
}

export default BackToTopBtn