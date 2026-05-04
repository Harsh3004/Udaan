import { FaArrowRight } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { TypeAnimation } from 'react-type-animation';
import { HighlightedText } from '../components/HighlightedText';
import VideoComponent from '../components/VideoComponent';
import { CodeBlock } from '../components/CodeBlock';
import { Button } from '../components/Button';
import { ExploreMore } from '../components/HomeComponent/ExploreMore';
import Footer from '../components/Footer';
import featuresData from '../data/feature';
import showcase from '../assets/show1.png';
import video2 from '../assets/production.mp4';
import card1 from '../assets/Card1.png';
import card2 from '../assets/Card2.png';
import card3 from '../assets/Card3.png';

const FadeUp = ({ children, delay = 0, className = '' }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}>
      {children}
    </motion.div>
  );
};

export const Home = () => {
  return (
    <div className='bg-rich-black-900 text-white'>

      {/* ─── HERO ────────────────────────────────────────────────── */}
      <section className='relative'>
        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-05 opacity-[0.06] blur-[120px] pointer-events-none rounded-full' />
        <div className='relative flex flex-col items-center gap-8 w-11/12 max-w-4xl mx-auto pt-20 pb-10 text-center'>
          <FadeUp delay={0}>
            <Link to='/signup'>
              <div className='inline-flex items-center gap-2 bg-rich-black-800/80 border border-rich-black-600 hover:border-yellow-50/40 text-rich-black-200 hover:text-yellow-50 px-5 py-2 rounded-full transition-all duration-200 backdrop-blur-sm cursor-pointer group'>
                <span className='text-sm font-medium'>
                  <TypeAnimation sequence={['Become an Instructor', 2000, 'Become a Student', 2000]} speed={50} wrapper='span' repeat={Infinity} />
                </span>
                <FaArrowRight size={12} className='group-hover:translate-x-1 transition-transform' />
              </div>
            </Link>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className='text-5xl md:text-7xl font-extrabold leading-tight tracking-tight text-rich-black-5'>
              Empower Your Future with{' '}
              <span className='bg-gradient-05 text-transparent bg-clip-text'>Coding Skills</span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className='text-rich-black-200 text-lg leading-relaxed max-w-2xl'>
              Learn at your own pace, from anywhere in the world. Access hands-on projects, quizzes, and personalized feedback from industry experts.
            </p>
          </FadeUp>

          <FadeUp delay={0.3}>
            <div className='flex flex-wrap gap-4 justify-center'>
              <Link to='/browse'>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button active={1} className='glow-yellow px-8 py-4 text-base font-bold'>Explore Courses <FaArrowRight /></Button>
                </motion.div>
              </Link>
              <Link to='/about'>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button active={0} className='px-8 py-4 text-base font-bold'>Learn More</Button>
                </motion.div>
              </Link>
            </div>
          </FadeUp>
        </div>

        <FadeUp delay={0.4} className='bg-rich-black-900 relative w-11/12 max-w-4xl mx-auto mb-20'>
          <VideoComponent className='h-fit relative' />
        </FadeUp>
      </section>

      {/* ─── CODE BLOCKS ─────────────────────────────────────────── */}
      <section className='bg-rich-black-900'>
        <FadeUp className='w-full py-16 px-6'>
          <CodeBlock
            position='flex-col md:flex-row'
            block1={{ title: (<p className='font-semibold text-4xl leading-tight'>Unlock your <HighlightedText color='bg-gradient-05 text-transparent bg-clip-text'>coding potential</HighlightedText> with our online courses.</p>), desc: 'Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you.', btn1: 'Try it Yourself', btn2: 'Learn More' }}
            block2={['<!DOCTYPE html>', '<html>', '<head><title>Example</title>', '<link rel="stylesheet" href="styles.css">', '</head>', '<body>', '<h1><a href="/">Header</a></h1>', '<nav>', '<a href="one">One</a>', '<a href="two">Two</a>', '<a href="three">Three</a>', '</nav>', '</body>', '</html>']}
            color='text-blue-300'
          />
        </FadeUp>
        <FadeUp className='w-full py-10 px-6'>
          <CodeBlock
            position='flex-col md:flex-row-reverse'
            block1={{ title: (<p className='font-semibold text-4xl leading-tight'>Start <HighlightedText color='bg-gradient-05 text-transparent bg-clip-text'>coding in seconds</HighlightedText></p>), desc: "Go ahead, give it a try. Our hands-on learning environment means you'll be writing real code from your very first lesson.", btn1: 'Continue Lesson', btn2: 'Learn More' }}
            block2={['#include <iostream>', '', 'long long factorial(int n) {', '    if (n == 0 || n == 1) {', '        return 1;', '    }', '    return n * factorial(n - 1);', '}', '', 'int main() {', '    int number = 10;', '    long long result = factorial(number);', '    cout << "Factorial: " << result << endl;', '    return 0;', '}']}
            color='text-rich-black-5'
          />
        </FadeUp>
        <ExploreMore />
      </section>

      {/* ─── FRAME CTA ───────────────────────────────────────────── */}
      <section>
        <div className='frame flex justify-center items-center'>
          <div className='flex flex-row gap-7 z-10'>
            <Link to='/browse'><motion.div whileHover={{ scale: 1.04 }}><Button active={1}>Explore All Courses <FaArrowRight /></Button></motion.div></Link>
            <motion.div whileHover={{ scale: 1.04 }}><Button active={0}>Learn More <FaArrowRight /></Button></motion.div>
          </div>
        </div>

        {/* ─── SKILLS SECTION ─── */}
        <div className='bg-rich-black-800 py-16'>
          <div className='w-11/12 max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-10'>
            <FadeUp className='md:w-1/2'>
              <p className='font-bold text-3xl md:text-4xl text-white leading-tight'>
                Get the skills you need for <HighlightedText color='bg-gradient-05 text-transparent bg-clip-text'>a job that is in demand.</HighlightedText>
              </p>
              <p className='font-medium mt-4 mb-8 text-rich-black-200'>The modern job market dictates its own terms. Being a competitive specialist requires more than professional skills.</p>
              <motion.div whileHover={{ scale: 1.04 }}><Button active={1}>Learn More</Button></motion.div>
            </FadeUp>

            <FadeUp delay={0.15} className='relative md:w-1/2 flex justify-center'>
              <video width='90%' height='auto' autoPlay muted loop className='z-10 rounded-2xl'>
                <source src={video2} type='video/mp4' />
              </video>
              <div className='absolute inset-0 w-full h-full bg-gradient-blue rounded-full blur-2xl opacity-30 pointer-events-none' />
              <div className='absolute -bottom-8 left-1/2 -translate-x-1/2 w-[85%] glass-card rounded-2xl flex z-20 border border-rich-black-600/50 pointer-events-none'>
                <div className='flex flex-col items-center justify-center flex-1 py-4 border-r border-rich-black-700'>
                  <p className='font-bold text-3xl text-white'>10+</p>
                  <p className='text-xs text-rich-black-300 uppercase tracking-wide mt-1'>Years Experience</p>
                </div>
                <div className='flex flex-col items-center justify-center flex-1 py-4'>
                  <p className='font-bold text-3xl text-white'>250+</p>
                  <p className='text-xs text-rich-black-300 uppercase tracking-wide mt-1'>Courses</p>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>

        {/* ─── SWISS KNIFE SECTION ─── */}
        <div className='bg-rich-black-900 py-20'>
          <FadeUp className='flex flex-col mx-auto text-center gap-4 mb-14 px-6'>
            <p className='font-bold text-3xl md:text-4xl text-white'>Your swiss knife for <HighlightedText color='bg-gradient-05 text-transparent bg-clip-text'>learning any language</HighlightedText></p>
            <p className='text-rich-black-300 max-w-xl mx-auto'>With 20+ language tracks, realistic voice-over, progress tracking, custom schedules and more — all in one place.</p>
          </FadeUp>
          <div className='relative flex flex-col lg:flex-row gap-10 w-9/12 mx-auto py-2'>
            <img src={card3} alt="" className='object-contain aspect-square z-30'/>
            <img src={card2} alt="" className='lg:ml-64 object-contain aspect-square lg:absolute z-30'/>
            <img src={card1} alt="" className='lg:ml-20 object-contain aspect-square z-30'/>
          </div>
            
          <div className='flex justify-center mt-12'>
            <motion.div whileHover={{ scale: 1.04 }}><Button active={1} className='glow-yellow'>Learn More</Button></motion.div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────────────── */}
      <section className='bg-rich-black-800 py-16'>
        <div className='w-11/12 max-w-5xl mx-auto'>
          <FadeUp className='text-center mb-12'>
            <p className='text-3xl font-bold text-white'>Why choose <span className='bg-gradient-05 text-transparent bg-clip-text'>Udaan?</span></p>
          </FadeUp>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
            {featuresData.map((feature, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className='glass-card rounded-2xl flex items-start gap-5 p-6 border border-rich-black-700'>
                  <img src={feature.imageUrl} width={48} className='rounded-full object-contain flex-shrink-0 shadow-[0_0_15px_rgba(255,214,10,0.2)]' alt={feature.title} />
                  <div>
                    <p className='text-base font-semibold text-white mb-1'>{feature.title}</p>
                    <p className='text-sm text-rich-black-300 leading-relaxed'>{feature.description}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BECOME INSTRUCTOR ───────────────────────────────────── */}
      <section className='bg-rich-black-900 py-20'>
        <div className='w-11/12 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12'>
          <FadeUp className='md:w-1/2 flex justify-center'>
            <img src={showcase} className='relative z-10 max-h-80 rounded-2xl object-cover shadow-[0_20px_60px_rgba(0,0,0,0.5)]' alt='Become an instructor' />
          </FadeUp>
          <FadeUp delay={0.15} className='flex flex-col items-start gap-5 md:w-1/2'>
            <p className='font-bold text-4xl md:text-5xl leading-tight text-white'>
              Become an <HighlightedText color='bg-gradient-05 text-transparent bg-clip-text'>Instructor</HighlightedText>
            </p>
            <p className='text-rich-black-200 leading-relaxed'>Instructors from around the world teach millions of students on Udaan. We provide the tools and skills to teach what you love.</p>
            <Link to='/signup'>
              <motion.div whileHover={{ scale: 1.04 }}><Button active={1} className='glow-yellow'>Start Teaching Today <FaArrowRight /></Button></motion.div>
            </Link>
          </FadeUp>
        </div>
      </section>

      <Footer />
    </div>
  );
};
