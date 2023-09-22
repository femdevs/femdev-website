const errorRes = (code) => {
    if (isNaN(code)) throw new Error('Invalid error code provided')
    switch (code) {
        case 1:
            return {
                httpCode: 401,
                code: 1,
                message: 'No API key provided',
            }
        case 2:
            return {
                httpCode: 401,
                code: 2,
                message: 'Invalid API key provided',
            }
        case 3:
            return {
                httpCode: 403,
                code: 3,
                message: 'The provided API key has been disabled',
            }
        case 4:
            return {
                httpCode: 400,
                code: 4,
                message: 'Missing Query Paramater(s)'
            }
        case 5:
            return {
                httpCode: 400,
                code: 5,
                message: 'Invalid Query Paramater(s)'
            }
        case 6:
            return {
                httpCode: 400,
                code: 6,
                message: 'Missing Header Paramater(s)'
            }
        case 7:
            return {
                httpCode: 400,
                code: 7,
                message: 'Invalid Header Paramater(s)'
            }
        case 8:
            return {
                httpCode: 400,
                code: 8,
                message: 'Missing Body Paramater(s)'
            }
        case 9:
            return {
                httpCode: 400,
                code: 9,
                message: 'Invalid Body Paramater(s)'
            }
        case 10:
            return {
                httpCode: 400,
                code: 10,
                message: 'Unable to encrypt data'
            }
        case 11:
            return {
                httpCode: 400,
                code: 11,
                message: 'Unable to decrypt data'
            }
        case 12:
            return {
                httpCode: 403,
                code: 12,
                message: 'You are not authorized to access this resource'
            }
        case 13:
            return {
                httpCode: 404,
                code: 13,
                message: 'Unable to find requested resource'
            }
        case 14:
            return {
                httpCode: 500,
                code: 14,
                message: 'Unable to delete requested user'
            }
        case 15:
            return {
                httpCode: 500,
                code: 15,
                message: 'Unable to delete requested token'
            }
        case 16:
            return {
                httpCode: 403,
                code: 16,
                message: 'The request was denied due to being blacklisted',
            }
        case 17:
            return {
                httpCode: 423,
                code: 17,
                message: 'This endpoint is currently disabled',
            }
        case 18:
            return {
                httpCode: 403,
                code: 18,
                message: 'The license associated with the provided API key has expired',
            }
        case 19:
            return {
                httpCode: 403,
                code: 19,
                message: 'The license associated with the provided API key has been disabled',
            }
        case 20:
            return {
                httpCode: 403,
                code: 20,
                message: 'The license associated with the provided API key has been revoked',
            }
        case 21:
            return {
                httpCode: 501,
                code: 21,
                message: 'This endpoint has not been implemented yet',
            }
        case 22:
            return {
                httpCode: 500,
                code: 22,
                message: 'Unable to create requested user',
            }
        case 23:
            return {
                httpCode: 500,
                code: 23,
                message: 'Unable to update requested user',
            }
        case 24:
            return {
                httpCode: 500,
                code: 24,
                message: 'Unable to create requested user',
            }
        case 25:
        default:
            return {
                httpCode: 500,
                code: 0,
                message: 'Unknown error',
            }
    }
}

module.exports = errorRes;