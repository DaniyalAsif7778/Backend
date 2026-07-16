const asyncHandler = (requestHandler) => {
	return (req, res, next) => {
		Promise.resolve(requestHandler(req, res, next)).catch((err) =>
			next(err),
		);
	};
};



// const asyncHandler = (fn) => async (req, res, next) => {
// 	try {
// 		fn(req, res, next);
// 	} catch (error) {
// 		res.status(500).json({
// 			success: false,
// 			message: err.message,
// 		});
// 	}
// };
  export { asyncHandler };