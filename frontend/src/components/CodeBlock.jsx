import { Button } from "./Button"
import { FaArrowRight } from "react-icons/fa";
import { TypeAnimation } from 'react-type-animation';
import { useInView } from 'react-intersection-observer';
 
export const CodeBlock = ({position, block1,block2,color}) => {
    const {title,desc,btn1,btn2} = block1;
    const htmlCode = block2;
    const htmlString = htmlCode.join('\n');

    const { ref, inView } = useInView({
        threshold: 0.5,
        triggerOnce: true, 
    });
    
  return (
    <div className={`flex ${position} gap-16 justify-center items-center text-white`} ref={ref}>
        <div className="w-5/6 md:w-2/5 flex flex-col gap-3">
            {title}
            <p className="text-rich-Black-300 font-inter font-medium text-base leading-6 tracking-normal">{desc}</p>

            <div className='flex gap-5 pt-10'>
                <Button active={1}>
                    {btn1}
                    <FaArrowRight />
                </Button>
                <Button active={0}>{btn2}</Button>
            </div>
        </div>

        <div className='relative md:w-2/5 text-gray-200 font-mono text-xs overflow-auto px-4 py-2 rounded-md backdrop-blur-68 bg-gradient-custom
        border border-solid border-transparent border-gradient'>

            <div className="flex">
                <div className="flex flex-col text-right pr-4 text-rich-black-400 z-10">
                    {htmlCode.map((_, index) => (
                        <p key={index}>{index + 1}</p>
                    ))}
                </div>

                <div className={`flex flex-col whitespace-pre z-10 ${color}`}>
                    {inView &&
                    <TypeAnimation
                      sequence={[htmlCode.join('\n'), 2000]}
                      wrapper="span"
                      speed={70}
                      repeat={Infinity}
                      />}
                </div>
            </div>
        </div>


    </div>
  )
}
