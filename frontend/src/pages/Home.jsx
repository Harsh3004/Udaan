import React from 'react'
import { Button } from '../components/Button';
import { FaArrowRight } from "react-icons/fa";
import { HighlightedText } from '../components/HighlightedText';
import VideoComponent from '../components/VideoComponent';
import { CodeBlock } from '../components/CodeBlock';
import { Link } from 'react-router-dom';
import showcase from '../assets/showcase.jpg'
import Footer  from '../components/Footer';
import LightRays from '../assets/preComponents.jsx/LightRays';

 
export const Home = () => {
  return (
    <div>
        <section className='relative mx-auto bg-rich-black-900'>
            {/* <img src="/U.png" alt="" className='absolute opacity-50' width={150}/> */}
            <div style={{ width: '100%', height: '600px', position: 'absolute' }}>
              <LightRays
                raysOrigin="top-center"
                raysColor="#ffffff"
                raysSpeed={1.5}
                lightSpread={0.8}
                rayLength={1.2}
                followMouse={true}
                mouseInfluence={0.1}
                noiseAmount={0.1}
                distortion={0.05}
                className="custom-rays"
              />
            </div>
            <div className='flex flex-col w-9/12 gap-8 mx-auto items-center justify-between text-white'>
    
                <Link to={"/signup"}>
                    <div className='flex items-center gap-2 bg-rich-black-800 text-rich-black-200 max-w-56 h-9 pt-1 pr-4 pb-1 pl-4 mt-16 rounded-3xl border transition-all duration-200 hover:scale-95 hover:bg-rich-black-900'>
                        <span className='font-medium'>Become an Instructor</span>
                        <FaArrowRight />
                    </div>
                </Link>

                <div className='flex flex-col ma gap-3'>
                    <p className='font-semibold text-4xl text-center gap-1 text-rich-black-5'>
                        Empower Your Future with
                        <HighlightedText color='bg-gradient-05 text-transparent bg-clip-text'>
                            Coding Skills 
                        </HighlightedText>
                    </p>

                    <p className='font-medium text-rich-Black-300 leading-6 tracking-normal text-center'>
                        With our online coding courses, you can learn at your own pace, from anywhere in the world, and get access to a wealth of resources, including hands-on projects, quizzes, and personalized feedback from instructors. 
                    </p>
                </div>

                <div className='flex gap-5'>
                    <Button active={1}>Learn More</Button>
                    <Button active={0}>Book a Demo</Button>
                </div>
            </div>

            <div className='bg-rich-black-900 relative w-2/3 p-4 mx-auto mt-20 mb-20 overflow-hidden'>
                <VideoComponent className='h-fit relative'/>
            </div>

            <div className='w-full h-auto py-16 px-6'>
                <CodeBlock
                position={`md:flex-row`}
                 block1={
                    {
                        "title": (
                            <p className='font-inter font-semibold text-4xl leading-[44px] tracking-[-0.02em]'>
                                Unlock your
                                <HighlightedText color='bg-gradient-05 text-transparent bg-clip-text'>
                                    coding potential
                                </HighlightedText>
                                with our online courses.
                            </p>
                        ),
                        "desc": "Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you.",
                        "btn1": "Try it Yourself",
                        "btn2": "Learn More"
                    }
                }
                
                block2={[
                    '<!DOCTYPE html>',
                    '<html>',
                    '<head><title>Example</title>',
                    '<link rel="stylesheet" href="styles.css">',
                    '</head>',
                    '<body>',
                    '<h1><a href="/">Header</a></h1>',
                    '<nav>',
                    '<a href="one">One</a>',
                    '<a href="two">Two</a>',
                    '<a href="three">Three</a>',
                    '</nav>',
                    '</body>',
                    '</html>',
                    ]}
                ></CodeBlock>
            </div>

            <div className='w-full h-auto py-10'>

             <CodeBlock
                 position={'md:flex-row-reverse'}
                 block1={
                    {
                        "title": (
                            <p className='font-inter font-semibold text-4xl leading-[44px] tracking-[-0.02em]'>
                                Start 
                                <HighlightedText color='bg-gradient-05 text-transparent bg-clip-text'>
                                    coding in seconds
                                </HighlightedText>
                            </p>
                        ),
                        "desc": "Go ahead, give it a try. Our hands-on learning environment means you'll be writing real code from your very first lesson.",
                        "btn1": "Continue Lesson",
                        "btn2": "Learn More"
                    }
                }
                
                block2={[
                    '<!DOCTYPE html>',
                    '<html>',
                    '<head><title>Example</title>',
                    '<link rel="stylesheet" href="styles.css">',
                    '</head>',
                    '<body>',
                    '<h1><a href="/">Header</a></h1>',
                    '<nav>',
                    '<a href="one">One</a>',
                    '<a href="two">Two</a>',
                    '<a href="three">Three</a>',
                    '</nav>',
                    '</body>',
                    '</html>',
                    ]}
                ></CodeBlock>
            </div>

        </section>
        
        <section></section>
        <section className='relative mx-auto bg-rich-black-900 text-white py-12'>
            <div className='bg-rich-black-900 relative p-4 mx-auto mt-20 mb-20 flex items-center'>
                <div className='w-3/4 flex justify-center'>
                    <img src={showcase} className='relative z-10 max-h-96 shadow-custom-left'/>
                </div>

                <div className='flex flex-col gap-3 w-2/3 pr-10'>
                    <p className='font-inter font-semibold text-4xl leading-[44px] tracking-[-0.02em]'>
                        Become an 
                        <HighlightedText color='bg-gradient-05 text-transparent bg-clip-text'>
                            Instructor
                        </HighlightedText>
                    </p>

                    <p className="text-rich-Black-300 font-inter font-medium text-base leading-6 tracking-normal pb-12">
                        Instructors from around the world teach millions of students on StudyNotion. We provide the tools and skills to teach what you love.
                    </p>

                    <Button active={1}>
                        Start Teaching Today
                        <FaArrowRight />
                    </Button>
                </div>
            </div>
        </section>
        <Footer/>
    </div>
  )
}
