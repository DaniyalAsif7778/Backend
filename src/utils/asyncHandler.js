// const asyncHandler = (requestHandler) => {
// 	(req, res, next) => {
// 		Promise.resolve(requestHandler(req, res, next)).catch((err) =>
// 			next(err),
// 		);
// 	};
// };

// export { asyncHandler };

const asyncHandler = (fn) => async (req, res, next) => {
	try {
		fn(req, res, next);
	} catch (error) {
		res.status(500).json({
			success: false,
			message: err.message,
		});
	}
};
