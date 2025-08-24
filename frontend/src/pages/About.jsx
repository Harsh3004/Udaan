import React from 'react'
import { HighlightedText } from '../components/HighlightedText'
import About1 from '../assets/About1.jpg'
import About2 from '../assets/About2.jpg'
import About3 from '../assets/About3.png'

export const About = () => {
  return (
    <div className='w-full bg-rich-black-800 '>
        <div className='relative w-9/12 flex flex-col items-center mx-auto py-10 pb-52 '>
            <div className='flex flex-col items-center gap-6 w-4/5 mb-6'>
                <p className='text-rich-black-200'>
                    About Us
                </p>

                <div className='flex flex-col gap-4'>
                    <p className='text-4xl text-rich-black-5 text-center font-semibold'>
                        Driving Innovation in Online Education for a <br />
                        <HighlightedText color='bg-gradient-05 text-transparent bg-clip-text'>
                            Brighter Future
                        </HighlightedText>
                    </p>

                    <p className='text-rich-Black-300 text-center'>
                        Udaan is at the forefront of driving innovation in online education. We're passionate about creating a brighter future by offering cutting-edge courses, leveraging emerging technologies, and nurturing a vibrant learning community.
                    </p>
                </div>

            </div>

            <div className='absolute -bottom-32 flex gap-8 pt-4 z-40'>
                <img src={About2} width={300} height={300} className='aspect-square object-cover rounded-sm'/>
                <img src={About1} width={300} height={300} className='aspect-square object-cover rounded-sm'/>
                <img src={About3} width={300} height={300} className='aspect-square object-cover rounded-sm'/>
            </div>  
        </div>        

        <div className='bg-rich-black-900 text-rich-black-100'>
            <p className='w-9/12 text-center mx-auto pt-52 pb-16 text-3xl font-semibold'>
                We are passionate about revolutionizing the way we learn. Our innovative platform <HighlightedText color='bg-gradient-05 text-transparent bg-clip-text'>
                    combines technology
                </HighlightedText>, 
                <HighlightedText color='bg-gradient-06 text-transparent bg-clip-text'>
                    expertise
                </HighlightedText>, and community to create an 
                <HighlightedText color='bg-gradient-08 text-transparent bg-clip-text'>
                    unparalleled educational experience.
                </HighlightedText>
            </p>
        </div>
    </div>
  )
}
