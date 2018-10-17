class UsersController < ApplicationController

  # GET /users
  def index
    @users = User.all
    json_response(@users)
  end

end