class ErrorData {
    constructor(httpCode, code, message) {
        this.httpCode = httpCode;
        this.code = code;
        this.message = message;
    }
}

module.exports = new Map()
    .set(0,  new ErrorData(500, 0,  'An unknown error occurred'))
    .set(1,  new ErrorData(403, 1,  'You are not authorized to access this resource'))
    .set(2,  new ErrorData(403, 2,  'You are blacklisted from accessing this resource'))
    .set(3,  new ErrorData(401, 3,  'No API key provided'))
    .set(4,  new ErrorData(401, 4,  'Invalid API key provided'))
    .set(5,  new ErrorData(403, 5,  'The provided API key has been disabled'))
    .set(6,  new ErrorData(400, 6,  'Missing Query Paramater(s)'))
    .set(7,  new ErrorData(400, 7,  'Invalid Query Paramater(s)'))
    .set(8,  new ErrorData(400, 8,  'Missing Header Paramater(s)'))
    .set(9,  new ErrorData(400, 9,  'Invalid Header Paramater(s)'))
    .set(10, new ErrorData(400, 10, 'Missing Body Paramater(s)'))
    .set(11, new ErrorData(400, 11, 'Invalid Body Paramater(s)'))
    .set(12, new ErrorData(400, 12, 'Unable to encrypt data'))
    .set(13, new ErrorData(400, 13, 'Unable to decrypt data'))
    .set(14, new ErrorData(404, 14, 'Unable to locate requested user'))
    .set(15, new ErrorData(500, 15, 'Unable to create requested user'))
    .set(16, new ErrorData(500, 16, 'Unable to update requested user'))
    .set(17, new ErrorData(500, 17, 'Unable to delete requested user'))
    .set(18, new ErrorData(404, 18, 'Unable to locate requested token'))
    .set(19, new ErrorData(500, 19, 'Unable to create requested token'))
    .set(20, new ErrorData(500, 20, 'Unable to update requested token'))
    .set(21, new ErrorData(500, 21, 'Unable to delete requested token'))
    .set(22, new ErrorData(404, 22, 'Unable to retreive requested information'))
    .set(23, new ErrorData(423, 23, 'This endpoint is currently disabled'))
    .set(24, new ErrorData(501, 24, 'This endpoint has not been implemented yet'))