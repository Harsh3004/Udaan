const BASE_URL = import.meta.env.VITE_BASE_URL;

export const endpoints = {
    SEND_OTP_API: BASE_URL + "/auth/sendOtp",
    SIGN_UP_API: BASE_URL + "/auth/signUp",
    LOGIN_API: BASE_URL + "/auth/login",
    LOGOUT_API: BASE_URL + "/auth/logout",
    CHANGE_PASSWORD_API: BASE_URL + "/auth/changePassword",

    FORGOT_PASSWORD_API: BASE_URL + "/auth/forgotPassword",
    RESET_PASSWORD_API: BASE_URL + "/auth/update-password",

    GET_INSTRUCTOR_COURSES: BASE_URL + "/course/getInstructorCourses",
    GET_ENROLLED_COURSES: BASE_URL + "/course/getEnrolledCourses",
    GET_TOP_RATED_COURSES: BASE_URL + "/course/top-rated",
    SHOW_COURSES_API: BASE_URL + "/course",
    GET_COURSE_DETAILS_API: BASE_URL + "/course",
    CREATE_COURSE_API: BASE_URL + "/course/create",
    DELETE_COURSE_API: BASE_URL + "/course/delete",
    UPDATE_COURSE_API: BASE_URL + "/course/update/:courseId",
    
    SHOW_SECTIONS_API: BASE_URL + "/course/:courseId/section",
    CREATE_SECTION_API: BASE_URL + "/course/:courseId/section/create",
    UPDATE_SECTION_API: BASE_URL + "/course/:courseId/section/update",
    DELETE_SECTION_API: BASE_URL + "/course/:courseId/section/delete",

    GET_SUBSECTIONS_API: BASE_URL + "/course/:courseId/section/:sectionId/subsection",
    CREATE_SUBSECTION_API: BASE_URL + "/course/:courseId/section/:sectionId/subsection/create",
    UPDATE_SUBSECTION_API: BASE_URL + "/course/:courseId/section/:sectionId/subsection/update",
    DELETE_SUBSECTION_API: BASE_URL + "/course/:courseId/section/:sectionId/subsection/delete",
    
    GET_RATINGS_API: BASE_URL + "/course/:courseId/rating",
    ADD_RATING_API: BASE_URL + "/:courseId/rating/create",
    AVERAGE_RATING_API: BASE_URL + "/:courseId/rating/average",
    
    // Categories
    GET_ALL_CATEGORIES_API: BASE_URL + "/category",
    CREATE_CATEGORY_API: BASE_URL + "/category/create",
    GET_CATEGORY_COURSES_API: BASE_URL + "/category/:categoryId/courses",
    
    PROFILE_API: BASE_URL + "/profile",
    UPDATE_PROFILE_API: BASE_URL + "/profile/update",
    
    CONTACT_API: BASE_URL + "/contact",

    // Payments
    CREATE_ORDER_API: BASE_URL + "/payment/create-order",
    VERIFY_PAYMENT: BASE_URL + "/payment/verify"
}