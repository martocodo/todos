class CategoriesController < ApplicationController

  # GET /categories
  def index
    @categories = Category.all
    json_response(@categories)
  end

end