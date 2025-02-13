// 6. Helper API to list available endpoints
app.get("/helper", (req, res) => {
  res.json({
    endpoints: {
      "/user_auth": "Authenticate a user and generate a JWT token. Requires query param 'user_email'. Returns serviceNowData and JWT token.",
      "/meter_app/job-dispositions/get": "Fetch a specific job assignment. Requires query params 'user_email' and 'record_sys_id'. **Authorization required with Bearer token in the request header from /user_auth.**",
      "/meter_app/job-dispositions/get/all": "Fetch all job assignments for a user. Requires query param 'user_email'. **Authorization required with Bearer token in the request header from /user_auth.**",
      "/meter_app/update-job-disposition": "Update a job assignment. Requires query params 'user_email' and 'record_sys_id' and a request body with update details. **Authorization required with Bearer token in the request header from /user_auth.**",
      "/meter_app/work-types": "Retrieve all available work types. **Authorization required with Bearer token in the request header from /user_auth.**",
      "/helper": "Provides information about available API endpoints in the system."
    }
  });
});
