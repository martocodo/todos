class Task < ActiveRecord::Base
  belongs_to :created_by, class_name: "User", :foreign_key => "created_by"
  belongs_to :category, class_name: "Category", :foreign_key => "category"
  validates_presence_of :created_by, :category
  validates :time_taken,
  presence: { if: "completion_date?", message: 'You have not provided time taken for task completion' }
end