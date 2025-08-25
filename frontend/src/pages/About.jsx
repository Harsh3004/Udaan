import React from 'react'
import { HighlightedText } from '../components/HighlightedText'
import About1 from '../assets/About1.jpg'
import About2 from '../assets/About2.jpg'
import About3 from '../assets/About3.png'
import About4 from '../assets/About4.jpg'
import { ImQuotesLeft } from "react-icons/im";
import { ImQuotesRight } from "react-icons/im";
import { Button } from '../components/Button'
import { ContactForm } from '../components/ContactForm'

const HalfSection = ({title,desc,color}) => {
    return (
        <div className='flex flex-col'>
            <HighlightedText color={`text-3xl font-semibold ${color} text-transparent bg-clip-text`}>
                {title}
            </HighlightedText>
            <p className='text-rich-Black-300'>
                {desc}
            </p>
        </div>
    )
}

const SubBlock = ({value,holder}) => {
    return (
        <div className='flex flex-col gap-3 items-center px-14'>
            <p className='text-rich-black-5 font-bold text-3xl text-center'>{value}</p>
            <p className='text-rich-Black-300 text-center'>{holder}</p>
        </div>
    )
}

const GridBox = ({title,desc,color}) => {
    return (
        <div className={`${color} p-8 flex flex-col gap-5`}>
            <p className='text-rich-black-5 font-semibold'>
                {title}
            </p>
            <p className='text-rich-black-100 font-normal text-sm'>
                {desc}
            </p>
        </div>
    )
}

export const About = () => {
    return (
        <div className='w-full bg-rich-black-800 '>
            <div className='relative w-9/12 flex flex-col items-center mx-auto py-10 pb-52 '>
                <div className='flex flex-col items-center gap-6 w-4/5 mb-6 z-40'>
                    <p className='text-rich-black-200'>
                        About Us
                    </p>

                    <div className='flex flex-col gap-4'>
                        <p className=' text-4xl text-rich-black-5 text-center font-semibold'>
                            Redefining Online Learning for the  <br />
                            <HighlightedText color='bg-gradient-05 text-transparent bg-clip-text'>
                                Next Generation
                            </HighlightedText>
                        </p>

                        <p className='text-rich-Black-300 text-center'>
                            Udaan is at the forefront of driving innovation in online education. We're passionate about creating a brighter future by offering cutting-edge courses, leveraging emerging technologies, and nurturing a vibrant learning community.
                        </p>
                    </div>

                </div>

                <div className='absolute -bottom-32 flex gap-8 pt-4 z-40'>
                    <div className='relative'>
                        <div className='w-full h-full absolute bg-gradient-06 rounded-full blur-xl -z-10 opacity-50'></div>
                        <img src={About2} width={300} height={300} className='aspect-square object-cover rounded-sm' />
                    </div>
                    <div className='relative'>
                        <div className='w-full h-full absolute bg-gradient-05 rounded-full blur-xl -z-10 opacity-50'></div>
                        <img src={About1} width={300} height={300} className='aspect-square object-cover rounded-sm' />
                    </div>
                    <div className='relative'>
                        <div className='w-full h-full absolute bg-gradient-06 rounded-full blur-xl -z-10 opacity-50'></div>
                        <img src={About3} width={300} height={300} className='aspect-square object-cover rounded-sm' />
                    </div>
                </div>
            </div>

            <div className='bg-rich-black-900 text-rich-black-100 relative border-b border-rich-black-700'>
                <p className='w-9/12 text-center mx-auto pt-52 pb-16 text-3xl font-semibold relative'>
                    <ImQuotesLeft className="relative left-1 top-4 text-rich-black-700" />
                    We are passionate about revolutionizing the way we learn. Our innovative platform <HighlightedText color='bg-gradient-05 text-transparent bg-clip-text'>
                        combines technology
                    </HighlightedText>,
                    <HighlightedText color='bg-gradient-06 text-transparent bg-clip-text'>
                        expertise
                    </HighlightedText>, and community to create an
                    <HighlightedText color='bg-gradient-08 text-transparent bg-clip-text'>
                        unparalleled educational experience.
                    </HighlightedText>
                    <ImQuotesRight className="absolute right-4 bottom-20 text-rich-black-700" />
                </p>
            </div>

            <div className='bg-rich-black-900 text-rich-black-100 flex flex-col'>
                <div className='w-9/12 flex justify-center mx-auto gap-24 items-center py-24'>
                    <div className='flex flex-col gap-6 w-1/2'>
                        <HighlightedText color='text-3xl font-semibold bg-gradient-04 text-transparent bg-clip-text'>
                            Our Founding Story 
                        </HighlightedText>
                        <div className='text-rich-Black-300 flex flex-col gap-4'>
                            <p>Our e-learning platform was born out of a shared vision and passion for transforming education. It all began with a group of educators, technologists, and lifelong learners who recognized the need for accessible, flexible, and high-quality learning opportunities in a rapidly evolving digital world.</p>

                            <p>As experienced educators ourselves, we witnessed firsthand the limitations and challenges of traditional education systems. We believed that education should not be confined to the walls of a classroom or restricted by geographical boundaries. We envisioned a platform that could bridge these gaps and empower individuals from all walks of life to unlock their full potential.</p>
                        </div>
                    </div>
                    <div className='w-1/2'>
                        <img src={About4} className='rounded-sm object-cover' alt="" />
                    </div>
                </div>

                <div className='w-9/12 flex justify-center mx-auto gap-24 items-center py-20'>
                    <HalfSection 
                        title='Our Vision' 
                        desc='With this vision in mind, we set out on a journey to create an e-learning platform that would revolutionize the way people learn. Our team of dedicated experts worked tirelessly to develop a robust and intuitive platform that combines cutting-edge technology with engaging content, fostering a dynamic and interactive learning experience.'
                        color='bg-gradient-06'
                    />

                    <HalfSection 
                        title='Our Mission' 
                        desc='Our mission goes beyond just delivering courses online. We wanted to create a vibrant community of learners, where individuals can connect, collaborate, and learn from one another. We believe that knowledge thrives in an environment of sharing and dialogue, and we foster this spirit of collaboration through forums, live sessions, and networking opportunities.'
                        color='bg-gradient-05'
                    />
                </div>

                <div className='w-full bg-rich-black-800 flex items-center justify-center mx-auto py-20 gap-10'>
                    <SubBlock value='5K' holder='Active Students'/> 
                    <SubBlock value='10+' holder='Mentors'/>     
                    <SubBlock value='200+' holder='Courses'/> 
                    <SubBlock value='50+' holder='Awards'/> 
                </div>

                <div className='bg-rich-black-900 py-20'>
                    <div className='w-9/12 mx-auto grid grid-cols-4 grid-rows-2'>
                        <div className='col-span-2 pr-8'>
                            <div className='pb-10 flex flex-col gap-2'>
                                <p className='text-3xl font-semibold'>
                                    World-Class Learning for <br />
                                    <HighlightedText color='bg-gradient-05 text-transparent bg-clip-text'>
                                        Anyone, Anywhere
                                    </HighlightedText>
                                </p>

                                <p>
                                    Studynotion partners with more than 275+ leading universities and companies to bring flexible, affordable, job-relevant online learning to individuals and organizations worldwide.
                                </p>
                            </div>

                            <Button active={1}>Learn More</Button>
                        </div>

                        <GridBox
                            title={'Industry Based Curriculum'}
                            desc={'Save time and money! The Belajar curriculum is made to be easier to understand and in line with industry needs.'}
                            color = {'bg-rich-black-700'}
                        />

                        <GridBox
                            title={'Certification'}
                            desc={'You will get a certificate that can be used as a certification during job hunting.'}
                            color = {'bg-rich-black-800'}
                        />
                        
                        <div></div>
                        
                        <GridBox
                            title={`Our Learning  Methods`}
                            desc={'The learning process uses the namely online and offline.'}
                            color = {'bg-rich-black-700'}
                        />

                        <GridBox
                            title={'Ready to Work'}
                            desc={'Connected with over 150+ hiring partners, you will have the opportunity to find a job after graduating from our program.'}
                            color = {'bg-rich-black-800'}
                        />

                        <GridBox
                            title={'Rating "Auto-grading"'}
                            desc={'Save time and money! The Belajar curriculum is made to be easier to understand and in line with industry needs.'}
                            color = {'bg-rich-black-700'}
                        />
                        
                    </div>
                </div>

                <div className='flex flex-col gap-3 mx-auto items-center'>
                    <p className='text-3xl font-semibold text-rich-black-5'>Get in Touch</p>
                    
                    <p className='text-rich-black-500'>
                        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Expedita, unde?
                    </p>

                    <ContactForm/>
                </div>
            </div>
        </div>
    )
}
