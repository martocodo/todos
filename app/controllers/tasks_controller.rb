class TasksController < ActionController::Base
  include Response
  include ExceptionHandler

  before_action :set_task, only: [:show, :update, :destroy]

  # GET /tasks
  def index
    @tasks = Task.all
    json_response(@tasks)
  end

  # POST /tasks
  def create
    reply = Hash.new
    # Filter incoming params based on acceptable params for create
    filteredParams = validate_params("create")
    missingParams = ""

    if !filteredParams.has_key?(:name) then
      missingParams += " name "
    end
    if !filteredParams.has_key?(:due_date) then
      missingParams += " due_date "
    end
    if !filteredParams.has_key?(:created_by) then
      missingParams += " created_by "
    end
    if !filteredParams.has_key?(:category) then
      missingParams += " category "
    end

    if missingParams != "" then
        reply['result'] = "fail";
        reply['message'] = "Missing required parameters"
        reply['request'] = missingParams
    else
      # Check provided ids are valid categories and users
      if !User.exists?(filteredParams[:created_by]) then
        reply['result'] = "fail"
        reply['message'] = "Not created by a valid user"
      elsif !Category.exists?(filteredParams[:category]) then
        reply['result'] = "fail"
        reply['message'] = "Not created with a valid category"
      else
        # Assign models to call
        filteredParams[:category] = Category.find(params[:category])
        filteredParams[:created_by] = User.find(params[:created_by])
        # Create new task record
        @task = Task.create(filteredParams)
        reply['result'] = "success"
        reply['message'] = "Task successfully created"
        reply['data'] = @task
      end
    end
    # Send reply to request
    json_response(reply)
  end

  # GET /tasks/:id
  def show
    json_response(@task)
  end

  # PUT /tasks/:id
  def update
    reply = Hash.new
    # If time taken has not been updated and is now provided then mark completion date as now
    if @task.time_taken == nil && params[:time_taken] then
      params[:completion_date] = Time.now
    end
    # If we receive time taken then check its a valid float
    if params[:time_taken] then
        # If whole number sent add trailing zero
        if !params[:time_taken].include? "." then
          params[:time_taken] = params[:time_taken] + '.00'
        end
        logger.debug params[:time_taken]
        logger.debug is_float(params[:time_taken])
      if is_float(params[:time_taken]) then
        reply['result'] = "success";
        reply['message'] = 'Record updated'
        # Filter valid params and update
        @task.update(validate_params("update"))
        reply['data'] = @task
      else
        reply['result'] = "fail";
        reply['message'] = "Time Taken is not a number!";
      end
    else
      # All other valid field updates
      reply['result'] = "success";
      reply['message'] = 'Record updated'
      # Filter valid params and update
      @task.update(validate_params("update"))
      reply['data'] = @task
    end
    # Reply to request with json result
    json_response(reply);
  end

  # DELETE /tasks/:id
  def destroy
    @task.destroy
    reply = Hash.new
    if @task.destroyed?
      reply['result'] = "success";
    else
      reply['result'] = "fail";
    end
    json_response(reply);
  end

  private
  
  def is_float(val)
    # Validate if sent val is a float
    val = val.to_f
    return val.kind_of? Float
  end 

  def validate_params(type)
    # whitelist params for different actions
    if type == 'create' then
      params.permit(:name, :category, :created_by, :due_date)
    elsif type == 'update' then
      params.permit(:name, :completion_date, :time_taken, :helpflag)
    end
  end

  def set_task
    @task = Task.find(params[:id])
  end

  def 

  def home
  
  end

  def landing
  
  end

end