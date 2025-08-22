import React from 'react'
import { Button } from '../components/Button';
import { FaArrowRight } from "react-icons/fa";
import { HighlightedText } from '../components/HighlightedText';
import VideoComponent from '../components/VideoComponent';
import { CodeBlock } from '../components/CodeBlock';
import { Link } from 'react-router-dom';
import showcase from '../assets/show1.png'
import Footer  from '../components/Footer';
import LightRays from '../assets/preComponents.jsx/LightRays';
import featuresData from '../data/feature'
import video2 from '../assets/production.mp4'
import courses from '../data/course'
import {CourseCard} from '../components/CourseCard'
import card1 from '../assets/Card1.png'
import card2 from '../assets/Card2.png'
import card3 from '../assets/Card3.png'
 
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
                    <div className='flex items-center gap-2 bg-rich-black-800 text-rich-black-200 max-w-56 h-9 pt-1 pr-4 pb-1 pl-4 mt-16 rounded-3xl border transition-all duration-200 hover:scale-95 hover:bg-rich-black-900 relative z-40'>
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

            <div className='bg-rich-black-900 relative w-2/3 p-4 mx-auto mt-20 mb-20'>
                <VideoComponent className='h-fit relative'/>
            </div>

            <div className='w-full h-auto py-16 px-6'>
                <CodeBlock
                position={`flex-col md:flex-row`}
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
                 position={'flex-col md:flex-row-reverse'}
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
                    "#include <iostream>",
                    "",
                    "long long factorial(int n) {",
                    "    if (n == 0 || n == 1) {",
                    "        return 1;",
                    "    }",
                    "    return n * factorial(n - 1);",
                    "}",
                    "",
                    "int main() {",
                    "    int number = 10;",
                    "    long long result = factorial(number);",
                    "    cout << \"Factorial: << result << endl;",
                    "    return 0;",
                    "}",
                    ]}
                ></CodeBlock>
            </div>

            <div className='flex flex-col items-center md:pb-56 text-white py-20'>
                <div className='flex flex-col gap-2 items-center'>
                    <p className='text-4xl font-semibold'>
                        Unlock the 
                        <HighlightedText color='bg-gradient-05 text-transparent bg-clip-text'>
                            Power of Code 
                        </HighlightedText>
                    </p>
                    <p className='text-rich-Black-300 font-medium'> 
                        Learn to Build Anything You Can Imagine
                    </p>
                </div>
                
                <div className="lg:absolute flex flex-col lg:flex-row justify-center gap-10 md:mt-28 py-10 w-4/5">
                  {courses.map((course, index) => (
                    <CourseCard
                      key={index}
                      title={course.title}
                      description={course.description}
                      level={course.level}
                      lessons={course.lessons}
                      isFeatured={course.isFeatured}
                    />
                  ))}
                </div>
            </div>

        </section>
        
        <section>
            <div className='frame flex justify-center items-center'>
                <div className='flex flex-row gap-2 md:pt-32 absolute z-10'>  
                    <Button active={1}>
                        Explore Full Catalog
                        <FaArrowRight />
                    </Button>

                    <Button active={0}>
                        Learn More
                        <FaArrowRight />
                    </Button>
                </div>
            </div>

            <div className='bg-pure-greys-5 text-rich-black-800 py-12 flex flex-col gap-12'>
                <div className='flex flex-col md:flex-row w-9/12 mx-auto text-left items-start justify-between gap-3'>
                    <p className='font-semibold text-4xl'>
                        Get the skills you need for 
                        <HighlightedText color='bg-gradient-05 text-transparent bg-clip-text'>
                            a job that is in demand.
                        </HighlightedText>
                    </p>
                    <div>
                        <p className='font-semibold pb-8'>
                            The modern Udaan is the dictates its own terms. Today, to be a competitive specialist requires more than professional skills.</p>

                        <Button active={1}>Learn More</Button>
                    </div>
                </div>

                <div className='relative lg:w-9/12 mx-auto flex flex-col lg:flex-row items-center justify-between'>
                    <div className='flex flex-col gap-8 md:w-1/2 pb-10 lg:pb-0'>
                        {
                            featuresData.map((feature) => {
                                return (
                                <div className='flex items-center gap-5'>
                                    <div>
                                        <img src={feature.imageUrl} width={50} className='rounded-full object-contain shadow-custom-left'/>
                                    </div>
                                    <div>
                                        <p className='text-lg font-semibold text-rich-black-800'>{feature.title}</p>
                                        <p className='text-rich-black-600'>{feature.description}</p>
                                    </div>
                                </div>
                            )})
                        }
                    </div>

                    <div className='relative md:w-2/3 flex justify-center mb-10'>
                        <video width="90%" height="auto" autoPlay muted className='z-10'>
                            <source src={video2} type="video/mp4"/>
                        </video>
                        <div className='absolute inset-0 w-full h-full bg-gradient-blue rounded-full blur-xl opacity-50'></div>
                        <div className='w-3/4 bg-greenish absolute flex flex-row z-20 justify-center -bottom-12 p-6 text-white items-center'>
                            <div className='flex flex-row gap-6 justify-center items-center w-1/2 border-r border-r-greenish-500 pr-6'>
                                <p className='font-bold text-4xl'>10</p>
                                <p className='text-sm text-greenish-300 tracking-wide'> YEARS EXPERIENCES</p>
                            </div>
                            <div className='flex flex-row gap-6 pl-6 justify-center items-center w-1/2'>
                                <p className='font-bold text-4xl'>250</p>
                                <p className='text-sm text-greenish-300 tracking-wide'> TYPES OF COURSES</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className='bg-pure-greys-5 text-rich-black-800 py-12 flex flex-col items-center'>
                <div className='flex flex-col mx-auto text-center justify-between gap-3'>
                    <p className='font-semibold text-4xl'>
                        Your swiss knife for
                        <HighlightedText color='bg-gradient-05 text-transparent bg-clip-text'>
                             learning any language
                        </HighlightedText>
                    </p>
                    <p className='font-semibold w-2/3 mx-auto text-rich-black-700'>
                        Using spin making learning multiple languages easy. with 20+ languages realistic voice-over, progress tracking, custom schedule and more.
                    </p>
                </div>
                <div className='relative flex flex-col lg:flex-row gap-10 w-9/12 mx-auto py-2'>
                    <img src={card3} alt="" className='object-contain aspect-square z-30'/>
                    <img src={card2} alt="" className='lg:ml-64 object-contain aspect-square lg:absolute z-30'/>
                    <img src={card1} alt="" className='lg:ml-20 object-contain aspect-square z-30'/>
                </div>
                <Button active={1}>Learn More</Button>
            </div>
        </section>

        <section className='relative mx-auto bg-rich-black-900 text-white py-12'>
            <div className='bg-rich-black-900 relative md:p-4 mx-auto mt-20 mb-20 flex flex-col md:flex-row items-center'>
                <div className='md:w-3/4 flex justify-center'>
                    <img src={showcase} className='relative z-10 max-h-96 bg-gradient-custom shadow-current border border-solid border-transparent border-gradient'/>
                </div>

                <div className='flex flex-col items-center md:items-start gap-3 md:w-2/3 px-4 md:pr-10 py-8 md:py-0 '>
                    <p className='font-inter font-semibold text-4xl md:leading-[44px] tracking-[-0.02em]'>
                        Become an 
                        <HighlightedText color='bg-gradient-05 text-transparent bg-clip-text'>
                            Instructor
                        </HighlightedText>
                    </p>

                    <p className="text-rich-Black-300 font-inter font-medium text-base leading-6 tracking-normal pb-12 text-center md:text-left">
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
