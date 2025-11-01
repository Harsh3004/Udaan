const BASE_URL = import.meta.env.VITE_BASE_URL;

export const endpoints = {
    SEND_OTP_API: BASE_URL + "/auth/sendOtp",
    SIGN_UP_API: BASE_URL + "/auth/signUp",
    LOGIN_API: BASE_URL + "/auth/login",
    CHANGE_PASSWORD_API: BASE_URL + "/auth/changePassword",

    FORGOT_PASSWORD_API: BASE_URL + "/auth/forgotPassword",
    RESET_PASSWORD_API: BASE_URL + "/auth/update-password",

    GET_INSTRUCTOR_COURSES: BASE_URL + "/course/getInstructorCourses",
    SHOW_COURSES_API: BASE_URL + "/course",
    GET_COURSE_DETAILS_API: BASE_URL + "/course",
    CREATE_COURSE_API: BASE_URL + "/course/create",
    DELETE_COURSE_API: BASE_URL + "/course/delete/:courseId",
    UPDATE_COURSE_API: BASE_URL + "/course/update/:courseId",
    
    SHOW_SECTIONS_API: BASE_URL + "/course/:courseId/section",
    CREATE_SECTION_API: BASE_URL + "/course/:courseId/section/create",
    UPDATE_SECTION_API: BASE_URL + "/course/:courseId/section/update/:sectionId",
    DELETE_SECTION_API: BASE_URL + "/course/:courseId/section/delete/:sectionId",

    GET_SUBSECTIONS_API: BASE_URL + "/course/:courseId/section/:sectionId/subsection",
    CREATE_SUBSECTION_API: BASE_URL + "/course/:courseId/section/:sectionId/subsection/create",
    UPDATE_SUBSECTION_API: BASE_URL + "/course/:courseId/section/:sectionId/subsection/update/:subsectionId",
    DELETE_SUBSECTION_API: BASE_URL + "/course/:courseId/section/:sectionId/subsection/delete/:subsectionId",
    
    GET_RATINGS_API: BASE_URL + "/course/:courseId/rating",
    ADD_RATING_API: BASE_URL + "/:courseId/rating/create",
    AVERAGE_RATING_API: BASE_URL + "/:courseId/rating/average",
    
    PROFILE_API: BASE_URL + "/profile",
    UPDATE_PROFILE_API: BASE_URL + "/profile/update",
    
    CONTACT_API: BASE_URL + "/contact",
}