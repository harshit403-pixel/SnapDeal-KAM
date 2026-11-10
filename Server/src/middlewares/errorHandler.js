export function notFound(_req, res) {
  res.status(404).json({ error: "Route not found." });
}

export function errorHandler(error, _req, res, _next) {
  console.error(error);
  res.status(500).json({
    error: "The request could not be completed. Check server configuration and API access."
  });
}
