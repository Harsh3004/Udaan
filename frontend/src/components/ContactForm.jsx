import React from "react";
import { useForm } from "react-hook-form";

export const ContactForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log("Form Data:", data);
  };

  return (
    <div className="flex items-center justify-center py-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 transition-all duration-200 z-50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Enter first name"
                {...register("firstName", { required: "First name is required" })}
                className="w-full px-4 py-2 rounded-md bg-rich-black-800 text-rich-black-5 placeholder-gray-400 focus:outline-none"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                placeholder="Enter last name"
                {...register("lastName", { required: "Last name is required" })}
                className="w-full px-4 py-2 rounded-md bg-[#141A29] text-white placeholder-gray-400 focus:outline-none"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <input
              type="email"
              placeholder="Enter email address"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                  message: "Enter a valid email",
                },
              })}
              className="w-full px-4 py-2 rounded-md bg-[#141A29] text-white placeholder-gray-400 focus:outline-none"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <select className="px-3 py-2 rounded-l-md bg-[#141A29] text-white">
              <option value="+91">+91</option>
              <option value="+1">+1</option>
              <option value="+44">+44</option>
            </select>
            <input
              type="tel"
              placeholder="12345 67890"
              {...register("phone", {
                required: "Phone number is required",
                minLength: { value: 10, message: "Must be at least 10 digits" },
              })}
              className="flex-1 px-4 py-2 rounded-r-md bg-[#141A29] text-white placeholder-gray-400 focus:outline-none"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm pt-2 px-2">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <textarea
              placeholder="Enter your message"
              rows={4}
              {...register("message", { required: "Message is required" })}
              className="w-full px-4 py-2 rounded-md bg-[#141A29] text-white placeholder-gray-400 focus:outline-none"
            />
            {errors.message && (
              <p className="text-red-500 text-sm">{errors.message.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-50 text-rich-black-900 font-semibold py-3 rounded-md hover:bg-yellow-500 transition"
          >
            Send Message
          </button>
        </form>
    </div>
  );
};