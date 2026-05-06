const BASE_URL = import.meta.env.VITE_BASE_URL;

export const endpoints = {
    SEND_OTP_API: BASE_URL + "/auth/sendOtp",
    SIGN_UP_API: BASE_URL + "/auth/signUp",
    LOGIN_API: BASE_URL + "/auth/login",
    LOGOUT_API: BASE_URL + "/auth/logout",
    GOOGLE_AUTH_API: BASE_URL + "/auth/google-auth",
    CHANGE_PASSWORD_API: BASE_URL + "/auth/changePassword",

    DELETE_ACCOUNT_API: BASE_URL + "/auth/delete-account",

    FORGOT_PASSWORD_API: BASE_URL + "/auth/forgotPassword",
    RESET_PASSWORD_API: BASE_URL + "/auth/update-password",

    GET_INSTRUCTOR_COURSES: BASE_URL + "/course/getInstructorCourses",
    GET_ENROLLED_COURSES: BASE_URL + "/course/getEnrolledCourses",
    GET_TOP_RATED_COURSES: BASE_URL + "/course/top-rated",
    UPDATE_COURSE_PROGRESS_API: BASE_URL + "/course/update-course-progress",
    SHOW_COURSES_API: BASE_URL + "/course",
    GET_COURSE_DETAILS_API: BASE_URL + "/course",
    GET_FULL_COURSE_DETAILS_API: BASE_URL + "/course/view",
    GET_RECOMMENDED_COURSES_API: BASE_URL + "/course/recommended/:courseId",
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
    VERIFY_PAYMENT: BASE_URL + "/payment/verify",

    // AI Assistant & Notes
    AI_ASK_API: BASE_URL + "/ai/ask",
    AI_SAVE_NOTE_API: BASE_URL + "/ai/notes",
    AI_GET_NOTES_API: BASE_URL + "/ai/notes",
    AI_DELETE_NOTE_API: BASE_URL + "/ai/notes",
    AI_GENERATE_QUIZ_API: BASE_URL + "/ai/generate-quiz",

    // Dhruv — AI course creation agent
    DHRUV_API: BASE_URL + "/ai/dhruv",

    // Chat with Instructor
    CHAT_SEND_MESSAGE: BASE_URL + "/chat/send",
    CHAT_GET_MESSAGES: BASE_URL + "/chat/messages",
    CHAT_STUDENT_CONVERSATIONS: BASE_URL + "/chat/conversations/student",
    CHAT_INSTRUCTOR_CONVERSATIONS: BASE_URL + "/chat/conversations/instructor",
    CHAT_MARK_READ: BASE_URL + "/chat/read",
    CHAT_CHECK_EXISTS: BASE_URL + "/chat/check",
    CHAT_DELETE_MESSAGE: BASE_URL + "/chat/message",
    CHAT_DELETE: BASE_URL + "/chat",
}