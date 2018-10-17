class CreateTasks < ActiveRecord::Migration
  def change
    create_table :tasks do |t|
      t.string :name
      t.integer :category
      t.integer :created_by
      t.datetime :due_date
      t.datetime :completion_date
      t.float :time_taken
      t.timestamps
    end
  end
end
