import Link from 'next/link';
import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faFacebook, faTwitter, faInstagram, faLinkedinIn} from '@fortawesome/free-brands-svg-icons';

const FooterSection = () => {
  return (
    <footer className='border-t border-gray-200 py-20'>
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
            <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                <div className="mb-4">
                    <Link href="/"  scroll={false} className='text-xl font-bold '>
                        RENTIFUL
                    </Link>
                </div>
                <nav className='mb-4'>
                    <ul className='flex space-x-6'>
                        <li>
                            <Link href="/about" scroll={false} className='text-gray-600 hover:text-gray-900'>
                                About
                            </Link>
                        </li>
                        <li>
                            <Link href="/contact" scroll={false} className='text-gray-600 hover:text-gray-900'>
                                Contact
                            </Link>
                        </li>
                        <li>    
                            <Link href="/privacy" scroll={false} className='text-gray-600 hover:text-gray-900'>
                                Privacy Policy
                            </Link>
                        </li>
                        <li>
                            <Link href="/terms" scroll={false} className='text-gray-600 hover:text-gray-900'>
                                Terms of Service
                            </Link>
                        </li>
                        <li>
                            <Link href="/faq" scroll={false} className='text-gray-600 hover:text-gray-900'>
                                FAQ
                            </Link>
                        </li>
                    </ul>

                </nav>
                <div className="flex space-x-4 mb-4">
                    <Link
                    href="https://www.facebook.com"
                    target="_blank"
                    aria-label='Facebook'
                    className='text-gray-600 hover:text-primary-600'
                    >
                        <FontAwesomeIcon icon={faFacebook} className="h-6 w-6"/>
                    </Link>
                    <Link
                    href="https://www.twitter.com"
                    target="_blank"
                    aria-label='Twitter'
                    className='text-gray-600 hover:text-primary-600'
                    >
                        <FontAwesomeIcon icon={faTwitter} className="h-6 w-6"/>
                    </Link>
                    <Link
                    href="https://www.instagram.com"
                    target="_blank"
                    aria-label='Instagram'
                    className='text-gray-600 hover:text-primary-600'
                    >
                        <FontAwesomeIcon icon={faInstagram} className="h-6 w-6"/>
                    </Link>
                    <Link
                    href="https://www.linkedin.com"
                    target="_blank"
                    aria-label='LinkedIn'
                    className='text-gray-600 hover:text-primary-600'
                    >
                        <FontAwesomeIcon icon={faLinkedinIn} className="h-6 w-6"/>
                    </Link> 
                </div>
            </div>
            <div className="mt-8 text-center text-sm text-gray-500 flex justify-center space-x-4">
                <span>&copy; 2025 MyCompany. All rights reserved.</span>
            </div>
        </div>
    </footer>
  )
}

export default FooterSection;